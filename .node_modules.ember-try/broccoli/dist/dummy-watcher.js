"use strict";
const events_1 = require("events");
class Watcher extends events_1.EventEmitter {
    constructor(builder) {
        super();
        this.builder = builder;
        this.currentBuild = null;
        this._lifetimeDeferred = {};
        const lifetime = this._lifetimeDeferred;
        lifetime.promise = new Promise((resolve, reject) => {
            lifetime.resolve = resolve;
            lifetime.reject = reject;
        });
    }
    start() {
        this.currentBuild = this.builder.build();
        this.currentBuild
            .then(() => this.emit('buildSuccess'))
            .catch((err) => this.emit('buildFailure', err));
        return this._lifetimeDeferred.promise;
    }
    quit() {
        if (this._lifetimeDeferred.resolve) {
            this._lifetimeDeferred.resolve();
        }
    }
}
module.exports = Watcher;
//# sourceMappingURL=dummy-watcher.js.map