"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const tree_sync_1 = __importDefault(require("tree-sync"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_1 = __importDefault(require("./errors/cli"));
const index_1 = __importDefault(require("./index"));
const messages_1 = __importDefault(require("./messages"));
const watch_detector_1 = __importDefault(require("watch-detector"));
const console_ui_1 = __importDefault(require("console-ui"));
function buildBrocfileOptions(options) {
    return {
        env: options.environment,
    };
}
function getBuilder(options) {
    const brocfile = index_1.default.loadBrocfile(options);
    return new index_1.default.Builder(brocfile(buildBrocfileOptions(options)));
}
function getWatcher(options) {
    return options.watch ? index_1.default.Watcher : require('./dummy-watcher');
}
function buildWatcherOptions(options, ui) {
    if (!options) {
        options = {};
    }
    const detector = new watch_detector_1.default({
        ui,
        childProcess: child_process_1.default,
        fs: fs_1.default,
        watchmanSupportsPlatform: /^win/.test(process.platform),
        root: process.cwd(),
    });
    const watchPreference = detector.findBestWatcherOption({
        watcher: options.watcher,
    });
    const watcher = watchPreference.watcher;
    return {
        saneOptions: {
            poll: watcher === 'polling',
            watchman: watcher === 'watchman',
            node: watcher === 'node' || !watcher,
        },
    };
}
function isParentDirectory(outputPath) {
    if (!fs_1.default.existsSync(outputPath)) {
        return false;
    }
    outputPath = fs_1.default.realpathSync(outputPath);
    const rootPath = process.cwd();
    const rootPathParents = [rootPath];
    let dir = path_1.default.dirname(rootPath);
    rootPathParents.push(dir);
    while (dir !== path_1.default.dirname(dir)) {
        dir = path_1.default.dirname(dir);
        rootPathParents.push(dir);
    }
    return rootPathParents.indexOf(outputPath) !== -1;
}
function guardOutputDir(outputDir) {
    if (isParentDirectory(outputDir)) {
        throw new cli_1.default(`build directory can not be the current or direct parent directory: ${outputDir}`);
    }
}
module.exports = function broccoliCLI(args, ui = new console_ui_1.default()) {
    // always require a fresh commander, as it keeps state at module scope
    delete require.cache[require.resolve('commander')];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const program = require('commander');
    let actionPromise;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    program.version(require('../package.json').version).usage('<command> [options] [<args ...>]');
    program
        .command('serve')
        .alias('s')
        .description('start a broccoli server')
        .option('--port <port>', 'the port to bind to [4200]', 4200)
        .option('--host <host>', 'the host to bind to [localhost]', 'localhost')
        .option('--ssl', 'serve via HTTPS', false)
        .option('--ssl-key <path>', 'path to SSL key file [ssl/server.key]', 'ssl/server.key')
        .option('--ssl-cert <path>', 'path to SSL cert file [ssl/server.crt]', 'ssl/server.crt')
        .option('--brocfile-path <path>', 'the path to brocfile')
        .option('--output-path <path>', 'the path to target output folder')
        .option('--cwd <path>', 'the path to working folder')
        .option('--no-watch', 'turn off the watcher')
        .option('--watcher <watcher>', 'select sane watcher mode')
        .option('-e, --environment <environment>', 'build environment [development]', 'development')
        .option('--prod', 'alias for --environment=production')
        .option('--dev', 'alias for --environment=development')
        .action((options) => {
        if (options.prod) {
            options.environment = 'production';
        }
        else if (options.dev) {
            options.environment = 'development';
        }
        const builder = getBuilder(options);
        const Watcher = getWatcher(options);
        const outputDir = options.outputPath;
        const watcher = new Watcher(builder, builder.watchedSourceNodeWrappers, buildWatcherOptions(options, ui));
        if (outputDir) {
            try {
                guardOutputDir(outputDir);
            }
            catch (e) {
                if (e instanceof cli_1.default) {
                    ui.writeError(e);
                    return process.exit(1);
                }
                throw e;
            }
            const outputTree = new tree_sync_1.default(builder.outputPath, outputDir);
            watcher.on('buildSuccess', () => outputTree.sync());
        }
        actionPromise = index_1.default.server.serve(watcher, options.host, parseInt(options.port, 10), undefined, undefined, ui, options.ssl, options.sslKey, options.sslCert);
    });
    program
        .command('build [target]')
        .alias('b')
        .description('output files to target directory')
        .option('--brocfile-path <path>', 'the path to brocfile')
        .option('--output-path <path>', 'the path to target output folder')
        .option('--cwd <path>', 'the path to working folder')
        .option('--watch', 'turn on the watcher')
        .option('--watcher <watcher>', 'select sane watcher mode')
        .option('-e, --environment <environment>', 'build environment [development]', 'development')
        .option('--prod', 'alias for --environment=production')
        .option('--dev', 'alias for --environment=development')
        .action((outputDir, options) => {
        if (outputDir && options.outputPath) {
            ui.writeLine('option --output-path and [target] cannot be passed at same time', 'ERROR');
            return process.exit(1);
        }
        if (options.outputPath) {
            outputDir = options.outputPath;
        }
        if (!outputDir) {
            outputDir = 'dist';
        }
        if (options.prod) {
            options.environment = 'production';
        }
        else if (options.dev) {
            options.environment = 'development';
        }
        try {
            guardOutputDir(outputDir);
        }
        catch (e) {
            if (e instanceof cli_1.default) {
                ui.writeError(e);
                return process.exit(1);
            }
            throw e;
        }
        const builder = getBuilder(options);
        const Watcher = getWatcher(options);
        const outputTree = new tree_sync_1.default(builder.outputPath, outputDir);
        const watcher = new Watcher(builder, builder.watchedSourceNodeWrappers, buildWatcherOptions(options, ui));
        watcher.on('buildSuccess', () => {
            outputTree.sync();
            messages_1.default.onBuildSuccess(builder, ui);
            if (!options.watch) {
                watcher.quit();
            }
        });
        watcher.on('buildFailure', (err) => {
            ui.writeLine('build failure', 'ERROR');
            ui.writeError(err);
        });
        function cleanupAndExit() {
            return watcher.quit();
        }
        process.on('SIGINT', cleanupAndExit);
        process.on('SIGTERM', cleanupAndExit);
        actionPromise = (async () => {
            try {
                await watcher.start();
            }
            catch (e) {
                ui.writeError(e);
            }
            finally {
                try {
                    builder.cleanup();
                    process.exit(0);
                }
                catch (e) {
                    ui.writeLine('Cleanup error:', 'ERROR');
                    ui.writeError(e);
                    process.exit(1);
                }
            }
        })();
    });
    program.parse(args || process.argv);
    if (actionPromise) {
        return actionPromise;
    }
    else {
        program.outputHelp();
        process.exit(1);
    }
};
//# sourceMappingURL=cli.js.map