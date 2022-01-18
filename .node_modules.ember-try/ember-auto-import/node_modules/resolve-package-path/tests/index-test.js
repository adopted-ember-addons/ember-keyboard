'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var resolvePackagePath = require("../index");
var Project = require("fixturify-project");
var Cache = require("../lib/cache");
var fixturify = require("fixturify");
var fs = require("fs-extra");
var chai = require("chai");
var path = require("path");
var os = require("os");
var expect = chai.expect;
var findUpPackagePath = resolvePackagePath.findUpPackagePath;
var FIXTURE_ROOT = __dirname + "/tmp/fixtures/";
describe('resolve-package-path', function () {
    beforeEach(function () {
        fs.removeSync(FIXTURE_ROOT);
    });
    afterEach(function () {
        fs.removeSync(FIXTURE_ROOT);
    });
    it('exposes its cache', function () {
        expect(resolvePackagePath._CACHE).to.be.ok;
        expect(resolvePackagePath._resetCache).to.be.a('function');
    });
    it('exposes helper methods', function () {
        expect(resolvePackagePath.getRealFilePath).to.be.a('function');
        expect(resolvePackagePath.getRealDirectoryPath).to.be.a('function');
        // smoke tests, real tests are unit tests of the underlying utilities
        expect(resolvePackagePath.getRealFilePath(__filename)).to.eql(__filename);
        expect(resolvePackagePath.getRealDirectoryPath(__dirname)).to.eql(__dirname);
    });
    it('appears to reset cache', function () {
        resolvePackagePath._CACHE.PATH.set('hi', 1);
        expect(resolvePackagePath._CACHE.PATH.has('hi')).eql(true);
        resolvePackagePath._resetCache();
        expect(resolvePackagePath._CACHE.PATH.has('hi')).eql(false);
    });
    describe('npm usage', function () {
        var app, rsvp, a, orange, apple;
        beforeEach(function () {
            app = new Project('app', '3.1.1', function (app) {
                rsvp = app.addDependency('rsvp', '3.2.2', function (rsvp) {
                    a = rsvp.addDependency('a', '1.1.1');
                });
                orange = app.addDependency('orange', '1.0.0');
                apple = app.addDependency('apple', '1.0.0');
            });
        });
        it('smoke test', function () {
            app.writeSync();
            expect(resolvePackagePath('app', app.root)).to.eql(null);
            expect(resolvePackagePath('rsvp', app.baseDir)).to.eql(path.normalize(app.root + "/app/node_modules/rsvp/package.json"));
            expect(resolvePackagePath('orange', app.baseDir)).to.eql(path.normalize(app.root + "/app/node_modules/orange/package.json"));
            expect(resolvePackagePath('apple', app.baseDir)).to.eql(path.normalize(app.root + "/app/node_modules/apple/package.json"));
            expect(resolvePackagePath('a', app.baseDir)).to.eql(null);
            expect(resolvePackagePath('a', rsvp.baseDir)).to.eql(path.normalize(rsvp.baseDir + "/node_modules/a/package.json"));
            expect(resolvePackagePath('rsvp', a.baseDir)).to.eql(path.normalize(rsvp.baseDir + "/package.json"));
            expect(resolvePackagePath('orange', a.baseDir)).to.eql(path.normalize(orange.baseDir + "/package.json"));
            expect(resolvePackagePath('apple', a.baseDir)).to.eql(path.normalize(apple.baseDir + "/package.json"));
            expect(resolvePackagePath('app', a.baseDir)).to.eql(null);
        });
    });
    if (require('os').platform() !== 'win32') {
        describe('yarn pnp usage', function () {
            this.timeout(30000); // in-case the network IO is slow
            var app;
            var execa = require('execa');
            beforeEach(function () {
                app = new Project('dummy', '1.0.0', function (app) {
                    app.pkg.private = true;
                    app.pkg.name;
                    app.pkg.scripts = {
                        test: 'node ./test.js',
                    };
                    app.pkg.installConfig = {
                        pnp: true,
                    };
                    app.addDependency('ember-source-channel-url', '1.1.0');
                    app.addDependency('resolve-package-path', 'link:' + path.join(__dirname, '..'));
                    app.files = {
                        'test.js': 'require("resolve-package-path")(process.argv[2], __dirname); console.log("success!");',
                    };
                });
                app.writeSync();
                execa.sync('yarn', {
                    cwd: app.baseDir,
                });
            });
            afterEach(function () {
                app.dispose();
            });
            it('handles yarn pnp usage - package exists', function () {
                var result = execa.sync('yarn', ['test', 'ember-source-channel-url'], {
                    cwd: app.baseDir,
                });
                expect(result.stdout.toString()).includes('success!');
            });
            it('handles yarn pnp usage - package missing', function () {
                var result = execa.sync('yarn', ['test', 'some-non-existent-package'], {
                    cwd: app.baseDir,
                });
                expect(result.stdout.toString()).includes('success!');
            });
        });
    }
    describe('findUpPackagePath', function () {
        var tmpDir;
        var cache;
        beforeEach(function () {
            resolvePackagePath._resetCache();
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'findUpPackagePath'));
            cache = resolvePackagePath._FIND_UP_CACHE;
        });
        it('returns null if no package.json exists on the path to root', function () {
            fixturify.writeSync(tmpDir, {
                foo: {
                    bar: {
                        baz: 'hello',
                    },
                },
            });
            // test against dir
            var testPath = path.join(tmpDir, 'foo/bar');
            expect(fs.existsSync(testPath)).to.equal(true);
            expect(findUpPackagePath(testPath)).to.equal(null);
            // tests against file
            testPath = path.join(tmpDir, 'foo/bar/baz');
            expect(fs.existsSync(testPath)).to.equal(true);
            expect(findUpPackagePath(testPath)).to.equal(null);
        });
        it('returns the nearest package.json, caching results', function () {
            fixturify.writeSync(tmpDir, {
                foo: {
                    bar: {
                        'package.json': JSON.stringify({ name: 'foo' }),
                        baz: {
                            qux: 'hello',
                            'package.json': JSON.stringify({ name: 'baz' }),
                        },
                        a: {
                            b: {
                                c: {
                                    d: 'hello again',
                                },
                            },
                        },
                    },
                },
            });
            expect(findUpPackagePath(path.join(tmpDir, 'foo/bar/baz'))).to.equal(path.join(tmpDir, 'foo/bar/baz/package.json'));
            expect(cache.size).to.equal(1);
            expect(cache.get(path.join(tmpDir, 'foo/bar/baz'))).to.equal(path.join(tmpDir, 'foo/bar/baz/package.json'));
            expect(findUpPackagePath(path.join(tmpDir, 'foo/bar'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(cache.size).to.equal(2);
            expect(cache.get(path.join(tmpDir, 'foo/bar'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(findUpPackagePath(path.join(tmpDir, 'foo/bar/a/b/c'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(cache.size).to.equal(3);
            expect(cache.get(path.join(tmpDir, 'foo/bar/a/b/c'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(findUpPackagePath(path.join(tmpDir, 'foo/bar/a/b/c/d'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(cache.size).to.equal(4);
            expect(cache.get(path.join(tmpDir, 'foo/bar/a/b/c/d'))).to.equal(path.join(tmpDir, 'foo/bar/package.json'));
            expect(findUpPackagePath(path.join(tmpDir, 'foo'))).to.equal(null);
            expect(cache.size).to.equal(5);
            expect(cache.get(path.join(tmpDir, 'foo'))).to.equal(null);
            expect(findUpPackagePath(path.join(tmpDir, 'foo/'))).to.equal(null);
            // foo and foo/ should have same entry in the cache as cache is normalized
            expect(cache.size).to.equal(5);
        });
        it('accepts a custom cache', function () {
            var customCache = new Cache();
            fixturify.writeSync(tmpDir, {
                foo: {
                    'package.json': JSON.stringify({ name: 'foo' }),
                },
            });
            expect(findUpPackagePath(path.join(tmpDir, 'foo'), customCache)).to.equal(path.join(tmpDir, 'foo/package.json'));
            expect(cache.size).to.equal(0);
            expect(customCache.size).to.equal(1);
            expect(customCache.get(path.join(tmpDir, 'foo'))).to.equal(path.join(tmpDir, 'foo/package.json'));
        });
        it('accepts cache=true', function () {
            fixturify.writeSync(tmpDir, {
                foo: {
                    'package.json': JSON.stringify({ name: 'foo' }),
                },
            });
            expect(findUpPackagePath(path.join(tmpDir, 'foo'), true)).to.equal(path.join(tmpDir, 'foo/package.json'));
            expect(cache.size).to.equal(1);
            expect(cache.get(path.join(tmpDir, 'foo'))).to.equal(path.join(tmpDir, 'foo/package.json'));
        });
        it('accepts cache=false', function () {
            fixturify.writeSync(tmpDir, {
                foo: {
                    'package.json': JSON.stringify({ name: 'foo' }),
                },
            });
            expect(findUpPackagePath(path.join(tmpDir, 'foo'), false)).to.equal(path.join(tmpDir, 'foo/package.json'));
            expect(cache.size).to.equal(0);
        });
        it('resetCache resets the findUpPackagePath cache', function () {
            fixturify.writeSync(tmpDir, {
                foo: {
                    'package.json': JSON.stringify({ name: 'foo' }),
                },
            });
            expect(findUpPackagePath(path.join(tmpDir, 'foo'), true)).to.equal(path.join(tmpDir, 'foo/package.json'));
            expect(resolvePackagePath._FIND_UP_CACHE.size).to.equal(1);
            expect(resolvePackagePath._FIND_UP_CACHE.get(path.join(tmpDir, 'foo'))).to.equal(path.join(tmpDir, 'foo/package.json'));
            resolvePackagePath._resetCache();
            expect(resolvePackagePath._FIND_UP_CACHE.size).to.equal(0);
        });
    });
});
