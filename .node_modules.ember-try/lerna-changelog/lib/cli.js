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
const chalk_1 = require("chalk");
const cli_highlight_1 = require("cli-highlight");
const changelog_1 = require("./changelog");
const configuration_1 = require("./configuration");
const configuration_error_1 = require("./configuration-error");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const yargs = require("yargs");
        const argv = yargs
            .usage("lerna-changelog [options]")
            .options({
            from: {
                type: "string",
                desc: "A git tag or commit hash that determines the lower bound of the range of commits",
                defaultDescription: "latest tagged commit",
            },
            to: {
                type: "string",
                desc: "A git tag or commit hash that determines the upper bound of the range of commits",
            },
            "tag-from": {
                hidden: true,
                type: "string",
                desc: "A git tag that determines the lower bound of the range of commits (defaults to last available)",
            },
            "tag-to": {
                hidden: true,
                type: "string",
                desc: "A git tag that determines the upper bound of the range of commits",
            },
            "next-version": {
                type: "string",
                desc: "The name of the next version",
                default: "Unreleased",
            },
            "next-version-from-metadata": {
                type: "boolean",
                desc: "Infer the name of the next version from package metadata",
                default: false,
            },
        })
            .example("lerna-changelog", 'create a changelog for the changes after the latest available tag, under "Unreleased" section')
            .example("lerna-changelog --from=0.1.0 --to=0.3.0", "create a changelog for the changes in all tags within the given range")
            .epilog("For more information, see https://github.com/lerna/lerna-changelog")
            .wrap(Math.min(100, yargs.terminalWidth()))
            .parse();
        let options = {
            tagFrom: argv["from"] || argv["tag-from"],
            tagTo: argv["to"] || argv["tag-to"],
        };
        try {
            let config = configuration_1.load({
                nextVersionFromMetadata: argv["next-version-from-metadata"],
            });
            if (argv["next-version"]) {
                config.nextVersion = argv["next-version"];
            }
            let result = yield new changelog_1.default(config).createMarkdown(options);
            let highlighted = cli_highlight_1.highlight(result, {
                language: "Markdown",
                theme: {
                    section: chalk_1.default.bold,
                    string: chalk_1.default.hex("#0366d6"),
                    link: chalk_1.default.dim,
                },
            });
            console.log(highlighted);
        }
        catch (e) {
            if (e instanceof configuration_error_1.default) {
                console.log(chalk_1.default.red(e.message));
            }
            else {
                console.log(chalk_1.default.red(e.stack));
            }
            process.exitCode = 1;
        }
    });
}
exports.run = run;
