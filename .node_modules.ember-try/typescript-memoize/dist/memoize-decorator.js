(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Memoize(hashFunction) {
        return function (target, propertyKey, descriptor) {
            if (descriptor.value != null) {
                descriptor.value = getNewFunction(descriptor.value, hashFunction);
            }
            else if (descriptor.get != null) {
                descriptor.get = getNewFunction(descriptor.get, hashFunction);
            }
            else {
                throw 'Only put a Memoize() decorator on a method or get accessor.';
            }
        };
    }
    exports.Memoize = Memoize;
    var counter = 0;
    function getNewFunction(originalMethod, hashFunction) {
        var identifier = ++counter;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var propValName = "__memoized_value_" + identifier;
            var propMapName = "__memoized_map_" + identifier;
            var returnedValue;
            if (hashFunction || args.length > 0) {
                if (!this.hasOwnProperty(propMapName)) {
                    Object.defineProperty(this, propMapName, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: new Map()
                    });
                }
                var myMap = this[propMapName];
                var hashKey = void 0;
                if (hashFunction) {
                    hashKey = hashFunction.apply(this, args);
                }
                else {
                    hashKey = args[0];
                }
                if (myMap.has(hashKey)) {
                    returnedValue = myMap.get(hashKey);
                }
                else {
                    returnedValue = originalMethod.apply(this, args);
                    myMap.set(hashKey, returnedValue);
                }
            }
            else {
                if (this.hasOwnProperty(propValName)) {
                    returnedValue = this[propValName];
                }
                else {
                    returnedValue = originalMethod.apply(this, args);
                    Object.defineProperty(this, propValName, {
                        configurable: false,
                        enumerable: false,
                        writable: false,
                        value: returnedValue
                    });
                }
            }
            return returnedValue;
        };
    }
});
//# sourceMappingURL=memoize-decorator.js.map