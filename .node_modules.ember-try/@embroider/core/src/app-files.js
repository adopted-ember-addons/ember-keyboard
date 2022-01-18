"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppFiles = void 0;
const path_1 = require("path");
class AppFiles {
    constructor(appDiffer, resolvableExtensions, podModulePrefix) {
        let tests = [];
        let components = [];
        let helpers = [];
        let otherAppFiles = [];
        this.perRoute = { children: new Map() };
        for (let relativePath of appDiffer.files.keys()) {
            relativePath = relativePath.split(path_1.sep).join('/');
            if (!resolvableExtensions.test(relativePath)) {
                continue;
            }
            if (/\.d\.ts$/.test(relativePath)) {
                // .d.ts files are technically "*.ts" files but aren't really and we
                // don't want to include them when we crawl through the app.
                continue;
            }
            if (relativePath.startsWith('tests/')) {
                if (/-test\.\w+$/.test(relativePath)) {
                    tests.push(relativePath);
                }
                continue;
            }
            // hbs files are resolvable, but not when they're inside the components
            // directory (where they are used for colocation only)
            if (relativePath.startsWith('components/')) {
                if (!relativePath.endsWith('.hbs')) {
                    components.push(relativePath);
                }
                continue;
            }
            if (relativePath.startsWith('templates/components/')) {
                components.push(relativePath);
                continue;
            }
            if (relativePath.startsWith('helpers/')) {
                helpers.push(relativePath);
                continue;
            }
            if (this.handleClassicRouteFile(relativePath) ||
                (podModulePrefix !== undefined && this.handlePodsRouteFile(relativePath, podModulePrefix))) {
                continue;
            }
            otherAppFiles.push(relativePath);
        }
        this.tests = tests;
        this.components = components;
        this.helpers = helpers;
        this.otherAppFiles = otherAppFiles;
        let relocatedFiles = new Map();
        for (let [relativePath, owningPath] of appDiffer.files) {
            if (owningPath) {
                relocatedFiles.set(relativePath, owningPath);
            }
        }
        this.relocatedFiles = relocatedFiles;
        this.isFastbootOnly = appDiffer.isFastbootOnly;
    }
    handleClassicRouteFile(relativePath) {
        let [prefix, ...rest] = relativePath.replace(/\.\w{1,3}$/, '').split('/');
        if (!['controllers', 'templates', 'routes'].includes(prefix)) {
            return false;
        }
        let type = prefix.slice(0, -1);
        let cursor = this.perRoute;
        for (let part of rest) {
            let child = cursor.children.get(part);
            if (child) {
                cursor = child;
            }
            else {
                let newEntry = { children: new Map() };
                cursor.children.set(part, newEntry);
                cursor = newEntry;
            }
        }
        cursor[type] = relativePath;
        return true;
    }
    handlePodsRouteFile(relativePath, podModulePrefix) {
        let parts = relativePath.replace(/\.\w{1,3}$/, '').split('/');
        let type = parts.pop();
        if (!type || !['controller', 'template', 'route'].includes(type)) {
            return false;
        }
        let podParts = podModulePrefix.split('/');
        // The first part of podModulePrefix is the app's package name
        podParts.shift();
        for (let podPart of podParts) {
            if (parts.shift() !== podPart) {
                return false;
            }
        }
        let cursor = this.perRoute;
        for (let part of parts) {
            let child = cursor.children.get(part);
            if (child) {
                cursor = child;
            }
            else {
                let newEntry = { children: new Map() };
                cursor.children.set(part, newEntry);
                cursor = newEntry;
            }
        }
        cursor[type] = relativePath;
        return true;
    }
    get routeFiles() {
        return this.perRoute;
    }
}
exports.AppFiles = AppFiles;
//# sourceMappingURL=app-files.js.map