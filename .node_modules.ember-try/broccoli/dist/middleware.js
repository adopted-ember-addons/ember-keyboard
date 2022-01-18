"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const handlebars_1 = __importDefault(require("handlebars"));
const resolve_path_1 = __importDefault(require("resolve-path"));
// @ts-ignore
const ansi_html_1 = __importDefault(require("ansi-html"));
// Resets foreground and background colors to black
// and white respectively
ansi_html_1.default.setColors({
    reset: ['#000', '#fff'],
});
const errorTemplate = handlebars_1.default.compile(fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'templates/error.html')).toString());
const dirTemplate = handlebars_1.default.compile(fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'templates/dir.html')).toString());
// You must call watcher.start() before you call `getMiddleware`
//
// This middleware is for development use only. It hasn't been reviewed
// carefully enough to run on a production server.
//
// Supported options:
//   autoIndex (default: true) - set to false to disable directory listings
//   liveReloadPath - LiveReload script URL for error pages
function handleRequest(outputPath, request, response, next, options) {
    // eslint-disable-next-line node/no-deprecated-api
    const urlObj = url_1.default.parse(request.url);
    const pathname = urlObj.pathname || '';
    let filename, stat;
    try {
        filename = decodeURIComponent(pathname);
        if (!filename) {
            response.writeHead(400);
            response.end();
            return;
        }
        filename = resolve_path_1.default(outputPath, filename.substr(1));
    }
    catch (err) {
        response.writeHead(err.status || 500);
        response.end();
        return;
    }
    try {
        stat = fs_1.default.statSync(filename);
    }
    catch (e) {
        // not found
        next();
        return;
    }
    if (stat.isDirectory()) {
        const indexFilename = path_1.default.join(filename, 'index.html');
        const hasIndex = fs_1.default.existsSync(indexFilename);
        if (!hasIndex && !options.autoIndex) {
            next();
            return;
        }
        if (pathname[pathname.length - 1] !== '/') {
            urlObj.pathname += '/';
            urlObj.host = request.headers['host'];
            urlObj.protocol = request.socket.encrypted ? 'https' : 'http';
            response.setHeader('Location', url_1.default.format(urlObj));
            response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
            response.writeHead(301);
            response.end();
            return;
        }
        if (!hasIndex) {
            // implied: options.autoIndex is true
            const context = {
                url: request.url,
                files: fs_1.default
                    .readdirSync(filename)
                    .sort()
                    .map(child => {
                    const stat = fs_1.default.statSync(path_1.default.join(filename, child)), isDir = stat.isDirectory();
                    return {
                        href: child + (isDir ? '/' : ''),
                        type: isDir
                            ? 'dir'
                            : path_1.default
                                .extname(child)
                                .replace('.', '')
                                .toLowerCase(),
                    };
                }),
                liveReloadPath: options.liveReloadPath,
            };
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
            response.writeHead(200);
            response.end(dirTemplate(context));
            return;
        }
        // otherwise serve index.html
        filename = indexFilename;
        stat = fs_1.default.statSync(filename);
    }
    const lastModified = stat.mtime.toUTCString();
    response.setHeader('Last-Modified', lastModified);
    // nginx style treat last-modified as a tag since browsers echo it back
    if (request.headers['if-modified-since'] === lastModified) {
        response.writeHead(304);
        response.end();
        return;
    }
    response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Content-Type', mime_types_1.default.contentType(path_1.default.extname(filename)));
    // read file sync so we don't hold open the file creating a race with
    // the builder (Windows does not allow us to delete while the file is open).
    const buffer = fs_1.default.readFileSync(filename);
    response.writeHead(200);
    response.end(buffer);
}
module.exports = function getMiddleware(watcher, options = {}) {
    if (options.autoIndex == null)
        options.autoIndex = true;
    const outputPath = path_1.default.resolve(watcher.builder.outputPath);
    return async function broccoliMiddleware(request, response, next) {
        if (watcher.currentBuild == null) {
            throw new Error('Waiting for initial build to start');
        }
        try {
            await watcher.currentBuild;
            handleRequest(outputPath, request, response, next, options);
        }
        catch (error) {
            // All errors thrown from builder.build() are guaranteed to be
            // Builder.BuildError instances.
            const context = {
                stack: ansi_html_1.default(error.stack || ''),
                liveReloadPath: options.liveReloadPath,
                payload: error.broccoliPayload,
            };
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.writeHead(500);
            response.end(errorTemplate(context));
            return error.stack;
        }
    };
};
//# sourceMappingURL=middleware.js.map