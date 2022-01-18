"use strict";
const fixturify = require("fixturify");
const tmp = require("tmp");
const fs = require("fs");
const path = require("path");
tmp.setGracefulCleanup();
function keys(object) {
    if (object !== null && (typeof object === 'object' || Array.isArray(object))) {
        return Object.keys(object);
    }
    else {
        return [];
    }
}
class Project {
    constructor(name, version = '0.0.0', cb, root) {
        this.files = {
            'index.js': `
'use strict';
module.exports = {};`
        };
        this.isDependency = true;
        this._dependencies = {};
        this._devDependencies = {};
        this.pkg = {
            name,
            version,
            keywords: []
        };
        this.validate();
        if (root) {
            this._root = root;
        }
        else {
            this._tmp = tmp.dirSync({ unsafeCleanup: true });
            this._root = fs.realpathSync(this._tmp.name);
        }
        if (typeof cb === 'function') {
            cb(this);
        }
    }
    get root() {
        return this._root;
    }
    get baseDir() {
        return path.join(this._root, this.name);
    }
    get name() {
        return this.pkg.name;
    }
    set name(value) {
        this.pkg.name = value;
    }
    get version() {
        return this.pkg.version;
    }
    set version(value) {
        this.pkg.version = value;
    }
    static fromJSON(json, name) {
        if (json[name] === undefined) {
            throw new Error(`${name} was expected, but not found`);
        }
        let files = JSON.parse(JSON.stringify(json[name]));
        let pkg = JSON.parse(files['package.json']);
        let nodeModules = files['node_modules'];
        // drop "special files"
        delete files['node_modules'];
        delete files['package.json'];
        let project = new this(pkg.name, pkg.version);
        keys(pkg.dependencies).forEach(dependency => {
            project.addDependency(this.fromJSON(nodeModules, dependency));
        });
        keys(pkg.devDependencies).forEach(dependency => {
            project.addDevDependency(this.fromJSON(nodeModules, dependency));
        });
        delete pkg.dependencies;
        delete pkg.devDependencies;
        project.pkg = pkg;
        project.files = files;
        return project;
    }
    static fromDir(root, name) {
        if (arguments.length === 1) {
            const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'UTF8'));
            let project = new this(pkg.name, pkg.version, undefined, path.dirname(root));
            project.readSync();
            return project;
        }
        else if (name !== undefined) {
            // TODO: consider deprecating this branch
            let project = new this(name, 'x.x.x');
            project.readSync(root);
            return project;
        }
        else {
            throw new TypeError(`fromDir's second optional argument, when provided, must not be undefined.`);
        }
    }
    writeSync(root = this.root) {
        fixturify.writeSync(root, this.toJSON());
    }
    readSync(root = this.root) {
        let files = unwrapPackageName(fixturify.readSync(root), this.name);
        this.pkg = JSON.parse(files['package.json']);
        let nodeModules = files['node_modules'];
        // drop "special files"
        delete files['node_modules'];
        delete files['package.json'];
        this._dependencies = {};
        this._devDependencies = {};
        this.files = files;
        keys(this.pkg.dependencies).forEach(dependency => {
            this.addDependency(this.constructor.fromJSON(nodeModules, dependency));
        });
        keys(this.pkg.devDependencies).forEach(dependency => {
            this.addDevDependency(this.constructor.fromJSON(nodeModules, dependency));
        });
    }
    addDependency(name, version, cb) {
        let dep;
        if (typeof name === 'string') {
            dep = this._dependencies[name] = new this.constructor(name, version, undefined, path.join(this.root, this.name, 'node_modules'));
        }
        else if (name.isDependency) {
            dep = this._dependencies[name.name] = name;
        }
        else {
            throw new TypeError('WTF');
        }
        if (typeof cb === 'function') {
            cb(dep);
        }
        return dep;
    }
    removeDependency(name) {
        delete this._dependencies[name];
    }
    removeDevDependency(name) {
        delete this._devDependencies[name];
    }
    addDevDependency(name, version, cb) {
        let dep;
        if (typeof name === 'string') {
            dep = this._devDependencies[name] = new this.constructor(name, version, undefined, path.join(this.root, this.name, 'node_modules'));
        }
        else if (name.isDependency) {
            dep = this._devDependencies[name.name] = name;
        }
        else {
            throw new TypeError('WTF');
        }
        if (typeof cb === 'function') {
            cb(dep);
        }
        return dep;
    }
    dependencies() {
        return Object.keys(this._dependencies).map(dependency => this._dependencies[dependency]);
    }
    devDependencies() {
        return Object.keys(this._devDependencies).map(dependency => this._devDependencies[dependency]);
    }
    validate() {
        if (typeof this.name !== 'string') {
            throw new TypeError('Missing name');
        }
        if (typeof this.version !== 'string') {
            throw new TypeError(`${this.name} is missing a version`);
        }
        this.dependencies().forEach(dep => dep.validate());
        this.devDependencies().forEach(dep => dep.validate());
    }
    toJSON(key) {
        if (key) {
            return unwrapPackageName(this.toJSON(), this.name)[key];
        }
        else {
            return wrapPackageName(this.name, Object.assign({}, this.files, {
                'node_modules': depsAsObject([
                    ...this.devDependencies(),
                    ...this.dependencies()
                ]),
                'package.json': JSON.stringify(Object.assign(this.pkg, {
                    dependencies: depsToObject(this.dependencies()),
                    devDependencies: depsToObject(this.devDependencies()),
                }), null, 2),
            }));
        }
    }
    clone() {
        return this.constructor.fromJSON(this.toJSON(), this.name);
    }
    dispose() {
        if (this._tmp) {
            this._tmp.removeCallback();
        }
    }
}
function parseScoped(name) {
    let matched = name.match(/(@[^@\/]+)\/(.*)/);
    if (matched) {
        return {
            scope: matched[1],
            name: matched[2],
        };
    }
    return null;
}
function depsAsObject(modules) {
    let obj = {};
    modules.forEach(dep => {
        Object.assign(obj, dep.toJSON());
    });
    return obj;
}
function depsToObject(deps) {
    let obj = {};
    deps.forEach(dep => obj[dep.name] = dep.version);
    return obj;
}
function unwrapPackageName(obj, packageName) {
    let scoped = parseScoped(packageName);
    if (scoped) {
        return obj[scoped.scope][scoped.name];
    }
    return obj[packageName];
}
function wrapPackageName(packageName, value) {
    let scoped = parseScoped(packageName);
    if (scoped) {
        return { [scoped.scope]: { [scoped.name]: value } };
    }
    else {
        return {
            [packageName]: value
        };
    }
}
module.exports = Project;
//# sourceMappingURL=index.js.map