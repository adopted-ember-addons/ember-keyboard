"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const render_error_page_1 = __importDefault(require("./render-error-page"));
exports.LIVE_RELOAD_PATH = '/ember-cli-live-reload.js';
class TypecheckMiddleware {
    constructor(project, workerPromise) {
        this.project = project;
        this.workerPromise = workerPromise;
    }
    register(app) {
        app.use((...params) => this.handleRequest(...params));
    }
    async handleRequest(request, response, next) {
        if (!request.accepts('html') || request.path === exports.LIVE_RELOAD_PATH) {
            next();
            return;
        }
        let worker = await this.workerPromise;
        let { errors, failed } = await worker.getStatus();
        if (failed) {
            response.type('html');
            response.end(render_error_page_1.default(errors, this.environmentInfo()));
        }
        else {
            next();
        }
    }
    environmentInfo() {
        let tsVersion = this.project.require('typescript/package.json').version;
        let ectsVersion = require(`${__dirname}/../../../../package`).version;
        return `typescript@${tsVersion}, ember-cli-typescript@${ectsVersion}`;
    }
}
exports.default = TypecheckMiddleware;
