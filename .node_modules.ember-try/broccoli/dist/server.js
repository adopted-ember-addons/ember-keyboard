"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const messages_1 = __importDefault(require("./messages"));
const middleware_1 = __importDefault(require("./middleware"));
const events_1 = __importDefault(require("events"));
class Server extends events_1.default {
    constructor(watcher, host, port, connect = require('connect'), ui, ssl, sslKey, sslCert) {
        super();
        this._watcher = watcher;
        this._builder = watcher.builder;
        this._host = host;
        this._port = parseInt(port, 10);
        this._ssl = ssl;
        this._sslKey = sslKey;
        this._sslCert = sslCert;
        this._connect = connect;
        this._url = `http${this._ssl ? 's' : ''}://${this._host}:${this._port}`;
        this.app = this.instance = null;
        this._boundStop = this.stop.bind(this);
        this._started = false;
        this.ui = ui;
        if (watcher.constructor.name !== 'Watcher') {
            throw new Error('Expected Watcher instance');
        }
        if (typeof host !== 'string') {
            throw new Error('Expected host to bind to (e.g. "localhost")');
        }
        if (typeof port !== 'number' || port !== port) {
            throw new Error('Expected port to bind to (e.g. 4200)');
        }
    }
    async start() {
        if (this._started) {
            throw new Error('Watcher.prototype.start() must not be called more than once');
        }
        const promise = new Promise((resolve, reject) => {
            this.app = this._connect().use(middleware_1.default(this._watcher));
            if (this._ssl) {
                let sslOptions;
                try {
                    sslOptions = {
                        key: fs_1.default.readFileSync(this._sslKey),
                        cert: fs_1.default.readFileSync(this._sslCert),
                    };
                }
                catch (err) {
                    throw new Error(`SSL key and certificate files should be present at ${path_1.default.join(process.cwd(), this._sslKey)} and ${path_1.default.join(process.cwd(), this._sslCert)} respectively.`);
                }
                this.instance = https_1.default.createServer(sslOptions, this.app);
            }
            else {
                this.instance = http_1.default.createServer(this.app);
            }
            this.instance.listen(this._port, this._host);
            this.instance.on('listening', () => {
                this.ui.writeLine(`Serving on ${this._url}\n`);
                resolve(this._watcher.start());
            });
            this.instance.on('error', (error) => {
                if (error.code !== 'EADDRINUSE') {
                    throw error;
                }
                let message = `Oh snap 😫. It appears a server is already running on ${this._url}\n`;
                message += `Are you perhaps already running serve in another terminal window?\n`;
                reject(new Error(message));
            });
            process.addListener('SIGINT', this._boundStop);
            process.addListener('SIGTERM', this._boundStop);
            this._watcher.on('buildSuccess', () => {
                this.emit('buildSuccess');
                messages_1.default.onBuildSuccess(this._builder, this.ui);
            });
            this._watcher.on('buildFailure', (err) => {
                this.emit('buildFailure');
                this.ui.writeLine('build failure', 'ERROR');
                this.ui.writeError(err);
            });
        });
        try {
            await promise;
        }
        finally {
            await this.stop();
        }
    }
    _detachListeners() {
        process.removeListener('SIGINT', this._boundStop);
        process.removeListener('SIGTERM', this._boundStop);
    }
    async stop() {
        this._detachListeners();
        if (this.instance) {
            this.instance.close();
        }
        await this._watcher.quit();
        await this._builder.cleanup();
    }
}
function serve(watcher, host, port, _connect = require('connect'), _process = process, ui, ssl, sslKey, sslCert) {
    const server = new Server(watcher, host, port, _connect, ui, ssl, sslKey, sslCert);
    return server
        .start()
        .then(() => _process.exit(0))
        .catch(err => {
        ui.writeLine('Broccoli Cleanup error:', 'ERROR');
        ui.writeError(err);
        _process.exit(1);
    });
}
module.exports = {
    Server,
    serve,
};
//# sourceMappingURL=server.js.map