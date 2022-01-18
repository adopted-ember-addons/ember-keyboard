"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const ProgressBar = require("progress");
class ProgressBarController {
    constructor() {
        this.bar = null;
    }
    init(title, total) {
        if (this.bar) {
            this.terminate();
        }
        if (!process.stdout.isTTY) {
            return;
        }
        this.bar = new ProgressBar(`:bar ${title} (:percent)`, {
            total,
            complete: chalk_1.default.hex("#0366d6")("█"),
            incomplete: chalk_1.default.enabled ? chalk_1.default.gray("█") : "░",
            clear: true,
            width: 20,
        });
    }
    tick() {
        if (this.bar) {
            this.bar.tick(1);
        }
    }
    clear() {
        if (this.bar) {
            this.bar.terminate();
        }
    }
    terminate() {
        this.clear();
        this.bar = null;
    }
}
exports.default = new ProgressBarController();
