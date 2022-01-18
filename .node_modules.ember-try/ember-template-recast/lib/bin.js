#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const commander_1 = __importDefault(require("commander"));
const runner_1 = __importDefault(require("./runner"));
commander_1.default
    .version(require('../package').version)
    .usage('<files> -t transform-plugin.js')
    .option('-t, --transform <file>', 'path to the transform file. Can be either a local path or url', './transform.js')
    .option('-c, --cpus <count>', 'determines the number of processes started.', (n) => parseInt(n, 10), Math.max(os.cpus().length - 1, 1))
    .option('-d, --dry', 'dry run: no changes are made to files', false)
    .option('-s, --silent', 'no output', false)
    .parse(process.argv);
if (commander_1.default.args.length < 1 || !commander_1.default.transform) {
    commander_1.default.help();
}
else {
    const options = {
        cpus: commander_1.default.cpus,
        dry: commander_1.default.dry,
        silent: commander_1.default.silent,
    };
    runner_1.default(commander_1.default.transform, commander_1.default.args, options);
}
//# sourceMappingURL=bin.js.map