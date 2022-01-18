"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pMap = require("p-map");
const progress_bar_1 = require("./progress-bar");
const find_pull_request_id_1 = require("./find-pull-request-id");
const Git = require("./git");
const github_api_1 = require("./github-api");
const markdown_renderer_1 = require("./markdown-renderer");
const UNRELEASED_TAG = "___unreleased___";
class Changelog {
    constructor(config) {
        this.config = config;
        this.github = new github_api_1.default(this.config);
        this.renderer = new markdown_renderer_1.default({
            categories: Object.keys(this.config.labels).map(key => this.config.labels[key]),
            baseIssueUrl: this.github.getBaseIssueUrl(this.config.repo),
            unreleasedName: this.config.nextVersion || "Unreleased",
        });
    }
    createMarkdown(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = options.tagFrom || (yield Git.lastTag());
            const to = options.tagTo || "HEAD";
            const releases = yield this.listReleases(from, to);
            return this.renderer.renderMarkdown(releases);
        });
    }
    getCommitInfos(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const commits = this.getListOfCommits(from, to);
            const commitInfos = this.toCommitInfos(commits);
            yield this.downloadIssueData(commitInfos);
            this.fillInCategories(commitInfos);
            yield this.fillInPackages(commitInfos);
            return commitInfos;
        });
    }
    listReleases(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const commits = yield this.getCommitInfos(from, to);
            let releases = this.groupByRelease(commits);
            yield this.fillInContributors(releases);
            return releases;
        });
    }
    getListOfUniquePackages(sha) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Git.changedPaths(sha))
                .map(path => this.packageFromPath(path))
                .filter(Boolean)
                .filter(onlyUnique);
        });
    }
    packageFromPath(path) {
        const parts = path.split("/");
        if (parts[0] !== "packages" || parts.length < 3) {
            return "";
        }
        if (parts.length >= 4 && parts[1][0] === "@") {
            return `${parts[1]}/${parts[2]}`;
        }
        return parts[1];
    }
    getListOfCommits(from, to) {
        return Git.listCommits(from, to);
    }
    getCommitters(commits) {
        return __awaiter(this, void 0, void 0, function* () {
            const committers = {};
            for (const commit of commits) {
                const issue = commit.githubIssue;
                const login = issue && issue.user && issue.user.login;
                const shouldKeepCommiter = login && !this.ignoreCommitter(login);
                if (login && shouldKeepCommiter && !committers[login]) {
                    committers[login] = yield this.github.getUserData(login);
                }
            }
            return Object.keys(committers).map(k => committers[k]);
        });
    }
    ignoreCommitter(login) {
        return this.config.ignoreCommitters.some((c) => c === login || login.indexOf(c) > -1);
    }
    toCommitInfos(commits) {
        return commits.map(commit => {
            const { sha, refName, summary: message, date } = commit;
            let tagsInCommit;
            if (refName.length > 1) {
                const TAG_PREFIX = "tag: ";
                tagsInCommit = refName
                    .split(", ")
                    .filter(ref => ref.startsWith(TAG_PREFIX))
                    .map(ref => ref.substr(TAG_PREFIX.length));
            }
            const issueNumber = find_pull_request_id_1.default(message);
            return {
                commitSHA: sha,
                message,
                tags: tagsInCommit,
                issueNumber,
                date,
            };
        });
    }
    downloadIssueData(commitInfos) {
        return __awaiter(this, void 0, void 0, function* () {
            progress_bar_1.default.init("Downloading issue information…", commitInfos.length);
            yield pMap(commitInfos, (commitInfo) => __awaiter(this, void 0, void 0, function* () {
                if (commitInfo.issueNumber) {
                    commitInfo.githubIssue = yield this.github.getIssueData(this.config.repo, commitInfo.issueNumber);
                }
                progress_bar_1.default.tick();
            }), { concurrency: 5 });
            progress_bar_1.default.terminate();
        });
    }
    groupByRelease(commits) {
        let releaseMap = {};
        let currentTags = [UNRELEASED_TAG];
        for (const commit of commits) {
            if (commit.tags && commit.tags.length > 0) {
                currentTags = commit.tags;
            }
            for (const currentTag of currentTags) {
                if (!releaseMap[currentTag]) {
                    let date = currentTag === UNRELEASED_TAG ? this.getToday() : commit.date;
                    releaseMap[currentTag] = { name: currentTag, date, commits: [] };
                }
                releaseMap[currentTag].commits.push(commit);
            }
        }
        return Object.keys(releaseMap).map(tag => releaseMap[tag]);
    }
    getToday() {
        const date = new Date().toISOString();
        return date.slice(0, date.indexOf("T"));
    }
    fillInCategories(commits) {
        for (const commit of commits) {
            if (!commit.githubIssue || !commit.githubIssue.labels)
                continue;
            const labels = commit.githubIssue.labels.map(label => label.name.toLowerCase());
            commit.categories = Object.keys(this.config.labels)
                .filter(label => labels.indexOf(label.toLowerCase()) !== -1)
                .map(label => this.config.labels[label]);
        }
    }
    fillInPackages(commits) {
        return __awaiter(this, void 0, void 0, function* () {
            progress_bar_1.default.init("Mapping commits to packages…", commits.length);
            try {
                yield pMap(commits, (commit) => __awaiter(this, void 0, void 0, function* () {
                    commit.packages = yield this.getListOfUniquePackages(commit.commitSHA);
                    progress_bar_1.default.tick();
                }), { concurrency: 5 });
            }
            finally {
                progress_bar_1.default.terminate();
            }
        });
    }
    fillInContributors(releases) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const release of releases) {
                release.contributors = yield this.getCommitters(release.commits);
            }
        });
    }
}
exports.default = Changelog;
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
