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
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const fs_1 = require("fs");
const path_1 = require("path");
const safe_1 = __importDefault(require("colors/safe"));
const slash_1 = __importDefault(require("slash"));
const globby_1 = __importDefault(require("globby"));
const ora_1 = __importDefault(require("ora"));
const async_promise_queue_1 = __importDefault(require("async-promise-queue"));
const tmp_1 = __importDefault(require("tmp"));
const workerpool_1 = __importDefault(require("workerpool"));
tmp_1.default.setGracefulCleanup();
class NoFilesError extends Error {
}
class SilentLogger {
    info() { }
    warning() { }
    error() { }
    spin() { }
    updateSpinner() { }
    stopSpinner() { }
}
/* eslint-disable no-console */
class VerboseLogger {
    info(message) {
        console.log(message);
    }
    warning(message) {
        console.log(`${safe_1.default.white.bgYellow(' WARN ')} ${message}`);
    }
    error(message) {
        console.log(`${safe_1.default.white.bgRed(' ERR ')} ${message}`);
    }
    spin(message) {
        this.spinner = ora_1.default(message).start();
    }
    updateSpinner(message) {
        if (this.spinner) {
            this.spinner.text = message;
        }
    }
    stopSpinner(persistentMessage) {
        if (persistentMessage) {
            this.spinner && this.spinner.stopAndPersist(persistentMessage);
        }
        else {
            this.spinner && this.spinner.stop();
        }
    }
}
class StatsCollector {
    constructor(logger) {
        this.changed = 0;
        this.unchanged = 0;
        this.skipped = 0;
        this.errors = [];
        this.logger = logger;
    }
    update(message) {
        switch (message.type) {
            case 'update':
                switch (message.status) {
                    case 'ok':
                        this.changed++;
                        break;
                    case 'skipped':
                        this.skipped++;
                        break;
                    default:
                        this.unchanged++;
                        break;
                }
                break;
            case 'error':
                this.errors.push(message);
                break;
        }
    }
    print() {
        this.logger.info(`Ok:        ${this.changed}`);
        this.logger.info(`Unchanged: ${this.unchanged}`);
        if (this.skipped) {
            this.logger.info(`Skipped:   ${this.skipped}`);
        }
        if (this.errors.length) {
            this.logger.info(`Errored:   ${this.errors.length}`);
            this.errors.slice(0, 5).forEach(({ file, error }) => {
                this.logger.error(`${file}`);
                handleError(error, this.logger);
            });
            if (this.errors.length > 5) {
                const more = this.errors.length - 5;
                this.logger.error(`And ${more} more error${more !== 1 ? 's' : ''}`);
            }
        }
    }
}
async function run(transformFile, filePaths, options) {
    const logger = options.silent ? new SilentLogger() : new VerboseLogger();
    const stats = new StatsCollector(logger);
    try {
        const [transformPath, files] = await Promise.all([
            loadTransform(transformFile),
            getAllFiles(filePaths),
        ]);
        await spawnWorkers(transformPath, files, options, stats, logger);
        logger.stopSpinner({
            symbol: '🎉',
            text: 'Complete!',
        });
        stats.print();
    }
    catch (err) {
        logger.stopSpinner();
        process.exitCode = 1;
        handleError(err, logger);
    }
}
exports.default = run;
/**
 * Returns the location of the transform module on disk.
 */
async function loadTransform(transformFile) {
    const isRemote = transformFile.startsWith('http');
    if (!isRemote) {
        return path_1.resolve(process.cwd(), transformFile);
    }
    const contents = await downloadFile(transformFile);
    const filePath = tmp_1.default.fileSync();
    fs_1.writeFileSync(filePath.name, contents, 'utf8');
    return filePath.name;
}
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const transport = url.startsWith('https') ? https : http;
        let contents = '';
        transport
            .get(url, (res) => res.on('data', (data) => (contents += data.toString())).on('end', () => resolve(contents)))
            .on('error', (err) => reject(err));
    });
}
/**
 * Convert array of paths into an array of absolute file paths. Uses globby
 * under the hood so it respects .gitignore files.
 */
async function getAllFiles(paths) {
    const files = await globby_1.default(paths, {
        // must specify a properly escaped `cwd` because globby infers from
        // process.cwd() directly and without correcting back to posix paths
        // asserts if the individual file path isn't "in" the cwd
        // https://github.com/sindresorhus/globby/pull/137
        cwd: slash_1.default(process.cwd()),
        expandDirectories: {
            extensions: ['hbs', 'handlebars'],
        },
        absolute: true,
        gitignore: true,
    });
    if (files.length < 1) {
        throw new NoFilesError();
    }
    return files;
}
/**
 * Divides files into chunks and distributes them across worker processes.
 */
async function spawnWorkers(transformPath, files, { cpus, dry = false }, stats, logger) {
    const processCount = Math.min(files.length, cpus);
    logger.info(`Processing ${files.length} file${files.length !== 1 ? 's' : ''}…`);
    logger.info(`Spawning ${processCount} worker${processCount !== 1 ? 's' : ''}…`);
    logger.spin('Processed 0 files');
    const pool = workerpool_1.default.pool(require.resolve('./worker'), { maxWorkers: cpus });
    let i = 0;
    const worker = async_promise_queue_1.default.async.asyncify(async (file) => {
        const message = await pool.exec('run', [transformPath, file, { dry }]);
        stats.update(message);
        logger.updateSpinner(`Processed ${i++} files`);
    });
    try {
        await async_promise_queue_1.default(worker, files, cpus);
    }
    finally {
        pool.terminate();
    }
}
function handleError(err, logger) {
    if (err.code === 'MODULE_NOT_FOUND') {
        logger.error('Transform plugin not found');
    }
    else if (err instanceof NoFilesError) {
        logger.error('No files matched');
    }
    else {
        logger.error(err);
        if (err.stack) {
            logger.error(err.stack);
        }
    }
}
//# sourceMappingURL=runner.js.map