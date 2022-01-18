"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const filesize_1 = __importDefault(require("filesize"));
class MeasureConcat {
    constructor(name, concat, baseDir) {
        this.name = name;
        this.concat = concat;
        this.baseDir = baseDir;
        this.stats = {};
    }
    addFile(filename) {
        this.stats[filename] = fs_1.statSync(path_1.join(this.baseDir, filename)).size;
        return this.concat.addFile(filename);
    }
    addSpace(contents) {
        this.stats['in-memory'] = (this.stats['in-memory'] || 0) + contents.length;
        return this.concat.addSpace(contents);
    }
    async end() {
        console.log(`Concatenated ${this.name}:`);
        console.log(Object.entries(this.stats)
            .sort((a, b) => b[1] - a[1])
            .map(([name, bytes]) => `  ${name}: ${filesize_1.default(bytes)}`)
            .join('\n'));
        return await this.concat.end();
    }
}
exports.default = MeasureConcat;
//# sourceMappingURL=measure-concat.js.map