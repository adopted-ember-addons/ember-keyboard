'use strict';

const { EOL } = require('os');
const fs = require('fs');
const which = require('which');
const { Plugin } = require('release-it');
const { format } = require('release-it/lib/util');
const tmp = require('tmp');
const execa = require('execa');
const parse = require('mdast-util-from-markdown');

require('validate-peer-dependencies')(__dirname);

const LERNA_PATH = require.resolve('lerna-changelog/bin/cli');

// using a const here, because we may need to change this value in the future
// and this makes it much simpler
const UNRELEASED = 'Unreleased';

function getToday() {
  const date = new Date().toISOString();

  return date.slice(0, date.indexOf('T'));
}

module.exports = class LernaChangelogGeneratorPlugin extends Plugin {
  async init() {
    let from = (await this.getTagForHEAD()) || (await this.getFirstCommit());
    this.changelog = await this._execLernaChangelog(from);

    // this supports release-it < 13.5.3
    this.setContext({ changelog: this.changelog });
  }

  get nextVersion() {
    let { version } = this.config.getContext();

    let tagName = this.config.getContext('git.tagName');
    let nextVersion = tagName ? format(tagName, { version }) : version;

    return nextVersion;
  }

  // this hook is supported by release-it@13.5.5+
  getChangelog() {
    return this.changelog;
  }

  async getTagForHEAD() {
    try {
      return await this.exec('git describe --tags --abbrev=0', { options: { write: false } });
    } catch (error) {
      return null;
    }
  }

  async getFirstCommit() {
    if (this._firstCommit) {
      return this._firstCommit;
    }

    this._firstCommit = await this.exec(`git rev-list --max-parents=0 HEAD`, {
      options: { write: false },
    });

    return this._firstCommit;
  }

  async _execLernaChangelog(from) {
    let changelog = await this.exec(`${LERNA_PATH} --next-version=${UNRELEASED} --from=${from}`, {
      options: { write: false },
    });

    return changelog;
  }

  async processChangelog() {
    // this is populated in `init`
    let changelog = this.changelog
      ? this.changelog.replace(UNRELEASED, this.nextVersion)
      : `## ${this.nextVersion} (${getToday()})`;

    let finalChangelog = await this.reviewChangelog(changelog);

    return finalChangelog;
  }

  async _launchEditor(tmpFile) {
    // do not launch the editor for dry runs
    if (this.config.isDryRun) {
      return;
    }

    let editorCommand;

    if (typeof this.options.launchEditor === 'boolean') {
      let EDITOR = process.env.EDITOR;

      if (!EDITOR) {
        EDITOR = which.sync('editor', { nothrow: true });
      }

      if (!EDITOR) {
        let error = new Error(
          `release-it-lerna-changelog configured to launch your editor but no editor was found (tried $EDITOR and searching $PATH for \`editor\`).`
        );
        this.log.error(error.message);

        throw error;
      }

      // `${file}` is interpolated just below
      editorCommand = EDITOR + ' ${file}';
    } else {
      editorCommand = this.options.launchEditor;
    }

    editorCommand = editorCommand.replace('${file}', tmpFile);

    await execa.command(editorCommand, { stdio: 'inherit' });
  }

  async reviewChangelog(changelog) {
    if (!this.options.launchEditor) {
      return changelog;
    }

    let tmpFile = tmp.fileSync().name;
    fs.writeFileSync(tmpFile, changelog, { encoding: 'utf-8' });

    await this._launchEditor(tmpFile);

    let finalChangelog = fs.readFileSync(tmpFile, { encoding: 'utf-8' });

    return finalChangelog;
  }

  async writeChangelog(changelog) {
    const { infile } = this.options;

    let hasInfile = false;
    try {
      fs.accessSync(infile);
      hasInfile = true;
    } catch (err) {
      this.debug(err);
    }

    if (!hasInfile) {
      // generate an initial CHANGELOG.md with all of the versions
      let firstCommit = await this.getFirstCommit();

      if (firstCommit) {
        changelog = await this._execLernaChangelog(firstCommit, this.nextVersion);
        changelog = changelog.replace(UNRELEASED, this.nextVersion);

        this.debug({ changelog });
      } else {
        // do something when there is no commit? not sure what our options are...
      }
    }

    if (this.config.isDryRun) {
      this.log.log(`! Prepending ${infile} with release notes.`);
    } else {
      let currentFileData = hasInfile ? fs.readFileSync(infile, { encoding: 'utf8' }) : '';
      let newContent = this._insertContent(changelog, currentFileData);
      fs.writeFileSync(infile, newContent, { encoding: 'utf8' });
    }

    if (!hasInfile) {
      await this.exec(`git add ${infile}`);
    }
  }

  _insertContent(newContent, oldContent) {
    let insertOffset = this._findInsertOffset(oldContent);
    let before = oldContent.slice(0, insertOffset);
    let after = oldContent.slice(insertOffset);
    return before + newContent + EOL + EOL + after;
  }

  _findInsertOffset(oldContent) {
    let ast = parse(oldContent);
    let firstH2 = ast.children.find((it) => it.type === 'heading' && it.depth === 2);
    return firstH2 ? firstH2.position.start.offset : 0;
  }

  async beforeRelease() {
    let processedChangelog = await this.processChangelog();

    this.debug({ changelog: processedChangelog });

    // remove first two lines to prevent release notes
    // from including the version number/date (it looks odd
    // in the Github/Gitlab UIs)
    let changelogWithoutVersion = processedChangelog.split(EOL).slice(2).join(EOL);

    this.config.setContext({ changelog: changelogWithoutVersion });

    if (this.options.infile) {
      await this.writeChangelog(processedChangelog);
    }
  }
};
