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
const execa = require("execa");
function changedPaths(sha) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield execa("git", ["show", "-m", "--name-only", "--pretty=format:", "--first-parent", sha]);
        return result.stdout.split("\n");
    });
}
exports.changedPaths = changedPaths;
function listTagNames() {
    return execa
        .sync("git", ["tag"])
        .stdout.split("\n")
        .filter(Boolean);
}
exports.listTagNames = listTagNames;
function lastTag() {
    return execa.sync("git", ["describe", "--abbrev=0", "--tags"]).stdout;
}
exports.lastTag = lastTag;
function parseLogMessage(commit) {
    const parts = commit.match(/hash<(.+)> ref<(.*)> message<(.*)> date<(.*)>/) || [];
    if (!parts || parts.length === 0) {
        return null;
    }
    return {
        sha: parts[1],
        refName: parts[2],
        summary: parts[3],
        date: parts[4],
    };
}
exports.parseLogMessage = parseLogMessage;
function listCommits(from, to = "") {
    return execa
        .sync("git", [
        "log",
        "--oneline",
        "--pretty=hash<%h> ref<%D> message<%s> date<%cd>",
        "--date=short",
        `${from}..${to}`,
    ])
        .stdout.split("\n")
        .filter(Boolean)
        .map(parseLogMessage)
        .filter(Boolean);
}
exports.listCommits = listCommits;
