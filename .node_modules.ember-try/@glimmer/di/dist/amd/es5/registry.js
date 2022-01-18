define('@glimmer/di/registry', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Registry = function () {
        function Registry(options) {
            _classCallCheck(this, Registry);

            this._registrations = {};
            this._registeredOptions = {};
            this._registeredInjections = {};
            if (options && options.fallback) {
                this._fallback = options.fallback;
            }
        }

        Registry.prototype.register = function register(specifier, factoryDefinition, options) {
            this._registrations[specifier] = factoryDefinition;
            if (options) {
                this._registeredOptions[specifier] = options;
            }
        };

        Registry.prototype.registration = function registration(specifier) {
            var registration = this._registrations[specifier];
            if (registration === undefined && this._fallback) {
                registration = this._fallback.registration(specifier);
            }
            return registration;
        };

        Registry.prototype.unregister = function unregister(specifier) {
            delete this._registrations[specifier];
            delete this._registeredOptions[specifier];
            delete this._registeredInjections[specifier];
        };

        Registry.prototype.registerOption = function registerOption(specifier, option, value) {
            var options = this._registeredOptions[specifier];
            if (!options) {
                options = {};
                this._registeredOptions[specifier] = options;
            }
            options[option] = value;
        };

        Registry.prototype.registeredOption = function registeredOption(specifier, option) {
            var result = void 0;
            var options = this.registeredOptions(specifier);
            if (options) {
                result = options[option];
            }
            if (result === undefined && this._fallback !== undefined) {
                result = this._fallback.registeredOption(specifier, option);
            }
            return result;
        };

        Registry.prototype.registeredOptions = function registeredOptions(specifier) {
            var options = this._registeredOptions[specifier];
            if (options === undefined) {
                var _specifier$split = specifier.split(':'),
                    type = _specifier$split[0];

                options = this._registeredOptions[type];
            }
            return options;
        };

        Registry.prototype.unregisterOption = function unregisterOption(specifier, option) {
            var options = this._registeredOptions[specifier];
            if (options) {
                delete options[option];
            }
        };

        Registry.prototype.registerInjection = function registerInjection(specifier, property, source) {
            var injections = this._registeredInjections[specifier];
            if (injections === undefined) {
                this._registeredInjections[specifier] = injections = [];
            }
            injections.push({
                property: property,
                source: source
            });
        };

        Registry.prototype.registeredInjections = function registeredInjections(specifier) {
            var _specifier$split2 = specifier.split(':'),
                type = _specifier$split2[0];

            var injections = this._fallback ? this._fallback.registeredInjections(specifier) : [];
            Array.prototype.push.apply(injections, this._registeredInjections[type]);
            Array.prototype.push.apply(injections, this._registeredInjections[specifier]);
            return injections;
        };

        return Registry;
    }();

    exports.default = Registry;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OytCQXdDRTswQkFBWSxBQUF5QjtrQ0FDbkMsQUFBSTs7aUJBQUMsQUFBYyxpQkFBRyxBQUFFLEFBQUMsQUFDekIsQUFBSTtpQkFBQyxBQUFrQixxQkFBRyxBQUFFLEFBQUMsQUFDN0IsQUFBSTtpQkFBQyxBQUFxQix3QkFBRyxBQUFFLEFBQUMsQUFDaEMsQUFBRSxBQUFDO2dCQUFDLEFBQU8sV0FBSSxBQUFPLFFBQUMsQUFBUSxBQUFDLFVBQUMsQUFBQyxBQUNoQyxBQUFJO3FCQUFDLEFBQVMsWUFBRyxBQUFPLFFBQUMsQUFBUSxBQUFDLEFBQ3BDLEFBQUMsQUFDSDtBQUFDOzs7MkJBRUQsQUFBUSw2QkFBQyxBQUFpQixXQUFFLEFBQXlDLG1CQUFFLEFBQTZCLFNBQ2xHLEFBQUk7aUJBQUMsQUFBYyxlQUFDLEFBQVMsQUFBQyxhQUFHLEFBQWlCLEFBQUMsQUFDbkQsQUFBRSxBQUFDO2dCQUFDLEFBQU8sQUFBQyxTQUFDLEFBQUMsQUFDWixBQUFJO3FCQUFDLEFBQWtCLG1CQUFDLEFBQVMsQUFBQyxhQUFHLEFBQU8sQUFBQyxBQUMvQyxBQUFDLEFBQ0g7QUFBQzs7OzJCQUVELEFBQVkscUNBQUMsQUFBaUIsV0FDNUI7Z0JBQUksQUFBWSxlQUFHLEFBQUksS0FBQyxBQUFjLGVBQUMsQUFBUyxBQUFDLEFBQUMsQUFDbEQsQUFBRSxBQUFDO2dCQUFDLEFBQVksaUJBQUssQUFBUyxhQUFJLEFBQUksS0FBQyxBQUFTLEFBQUMsV0FBQyxBQUFDLEFBQ2pELEFBQVk7K0JBQUcsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFZLGFBQUMsQUFBUyxBQUFDLEFBQUMsQUFDeEQsQUFBQztBQUNELEFBQU07bUJBQUMsQUFBWSxBQUFDLEFBQ3RCLEFBQUM7OzsyQkFFRCxBQUFVLGlDQUFDLEFBQWlCLFdBQzFCO21CQUFP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RyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQW9CLHFCQUFDLEFBQVMsQUFBQyxhQUFHLEFBQUUsQUFBQyxBQUNuRyxBQUFLO2tCQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVUsWUFBRSxBQUFJLEtBQUMsQUFBcUIsc0JBQUMsQUFBSSxBQUFDLEFBQUMsQUFBQyxBQUN6RSxBQUFLO2tCQUFDLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVUsWUFBRSxBQUFJLEtBQUMsQUFBcUIsc0JBQUMsQUFBUyxBQUFDLEFBQUMsQUFBQyxBQUM5RSxBQUFNO21CQUFDLEFBQVUsQUFBQyxBQUNwQixBQUFDLEFBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaWN0IH0gZnJvbSAnLi9kaWN0JztcbmltcG9ydCB7IEZhY3RvcnksIEZhY3RvcnlEZWZpbml0aW9uIH0gZnJvbSAnLi9mYWN0b3J5JztcblxuZXhwb3J0IGludGVyZmFjZSBSZWdpc3RyYXRpb25PcHRpb25zIHtcbiAgc2luZ2xldG9uPzogYm9vbGVhbjtcbiAgaW5zdGFudGlhdGU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluamVjdGlvbiB7XG4gIHByb3BlcnR5OiBzdHJpbmcsXG4gIHNvdXJjZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0cnlXcml0ZXIge1xuICByZWdpc3RlcihzcGVjaWZpZXI6IHN0cmluZywgZmFjdG9yeTogYW55LCBvcHRpb25zPzogUmVnaXN0cmF0aW9uT3B0aW9ucyk6IHZvaWQ7XG4gIHVucmVnaXN0ZXIoc3BlY2lmaWVyOiBzdHJpbmcpOiB2b2lkO1xuICByZWdpc3Rlck9wdGlvbihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkO1xuICB1bnJlZ2lzdGVyT3B0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBvcHRpb246IHN0cmluZyk6IHZvaWQ7XG4gIHJlZ2lzdGVySW5qZWN0aW9uKHNwZWNpZmllcjogc3RyaW5nLCBwcm9wZXJ0eTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVnaXN0cnlSZWFkZXIge1xuICByZWdpc3RyYXRpb24oc3BlY2lmaWVyOiBzdHJpbmcpOiBhbnk7XG4gIHJlZ2lzdGVyZWRPcHRpb24oc3BlY2lmaWVyOiBzdHJpbmcsIG9wdGlvbjogc3RyaW5nKTogYW55O1xuICByZWdpc3RlcmVkT3B0aW9ucyhzcGVjaWZpZXI6IHN0cmluZyk6IGFueTtcbiAgcmVnaXN0ZXJlZEluamVjdGlvbnMoc3BlY2lmaWVyOiBzdHJpbmcpOiBJbmplY3Rpb25bXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWdpc3RyeU9wdGlvbnMge1xuICBmYWxsYmFjaz86IFJlZ2lzdHJ5UmVhZGVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZ2lzdHJ5QWNjZXNzb3IgZXh0ZW5kcyBSZWdpc3RyeVJlYWRlciwgUmVnaXN0cnlXcml0ZXIge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cnkgaW1wbGVtZW50cyBSZWdpc3RyeUFjY2Vzc29yIHtcbiAgcHJpdmF0ZSBfcmVnaXN0cmF0aW9uczogRGljdDxGYWN0b3J5RGVmaW5pdGlvbjxhbnk+PjtcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJlZE9wdGlvbnM6IERpY3Q8YW55PjtcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJlZEluamVjdGlvbnM6IERpY3Q8SW5qZWN0aW9uW10+O1xuICBwcml2YXRlIF9mYWxsYmFjazogUmVnaXN0cnlSZWFkZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFJlZ2lzdHJ5T3B0aW9ucykge1xuICAgIHRoaXMuX3JlZ2lzdHJhdGlvbnMgPSB7fTtcbiAgICB0aGlzLl9yZWdpc3RlcmVkT3B0aW9ucyA9IHt9O1xuICAgIHRoaXMuX3JlZ2lzdGVyZWRJbmplY3Rpb25zID0ge307XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5mYWxsYmFjaykge1xuICAgICAgdGhpcy5fZmFsbGJhY2sgPSBvcHRpb25zLmZhbGxiYWNrO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyKHNwZWNpZmllcjogc3RyaW5nLCBmYWN0b3J5RGVmaW5pdGlvbjogRmFjdG9yeURlZmluaXRpb248YW55Piwgb3B0aW9ucz86IFJlZ2lzdHJhdGlvbk9wdGlvbnMpOiB2b2lkIHtcbiAgICB0aGlzLl9yZWdpc3RyYXRpb25zW3NwZWNpZmllcl0gPSBmYWN0b3J5RGVmaW5pdGlvbjtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5fcmVnaXN0ZXJlZE9wdGlvbnNbc3BlY2lmaWVyXSA9IG9wdGlvbnM7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0cmF0aW9uKHNwZWNpZmllcjogc3RyaW5nKTogRmFjdG9yeURlZmluaXRpb248YW55PiB7XG4gICAgbGV0IHJlZ2lzdHJhdGlvbiA9IHRoaXMuX3JlZ2lzdHJhdGlvbnNbc3BlY2lmaWVyXTtcbiAgICBpZiAocmVnaXN0cmF0aW9uID09PSB1bmRlZmluZWQgJiYgdGhpcy5fZmFsbGJhY2spIHtcbiAgICAgIHJlZ2lzdHJhdGlvbiA9IHRoaXMuX2ZhbGxiYWNrLnJlZ2lzdHJhdGlvbihzcGVjaWZpZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcmVnaXN0cmF0aW9uO1xuICB9XG5cbiAgdW5yZWdpc3RlcihzcGVjaWZpZXI6IHN0cmluZyk6IHZvaWQge1xuICAgIGRlbGV0ZSB0aGlzLl9yZWdpc3RyYXRpb25zW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuX3JlZ2lzdGVyZWRPcHRpb25zW3NwZWNpZmllcl07XG4gICAgZGVsZXRlIHRoaXMuX3JlZ2lzdGVyZWRJbmplY3Rpb25zW3NwZWNpZmllcl07XG4gIH1cblxuICByZWdpc3Rlck9wdGlvbihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuX3JlZ2lzdGVyZWRPcHRpb25zW3NwZWNpZmllcl07XG5cbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIHRoaXMuX3JlZ2lzdGVyZWRPcHRpb25zW3NwZWNpZmllcl0gPSBvcHRpb25zO1xuICAgIH1cblxuICAgIG9wdGlvbnNbb3B0aW9uXSA9IHZhbHVlO1xuICB9XG5cbiAgcmVnaXN0ZXJlZE9wdGlvbihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCByZXN1bHQ6IEJvb2xlYW47XG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLnJlZ2lzdGVyZWRPcHRpb25zKHNwZWNpZmllcik7XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgcmVzdWx0ID0gb3B0aW9uc1tvcHRpb25dO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCAmJiB0aGlzLl9mYWxsYmFjayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9mYWxsYmFjay5yZWdpc3RlcmVkT3B0aW9uKHNwZWNpZmllciwgb3B0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcmVnaXN0ZXJlZE9wdGlvbnMoc3BlY2lmaWVyOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBvcHRpb25zID0gdGhpcy5fcmVnaXN0ZXJlZE9wdGlvbnNbc3BlY2lmaWVyXTtcbiAgICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgW3R5cGVdID0gc3BlY2lmaWVyLnNwbGl0KCc6Jyk7XG4gICAgICBvcHRpb25zID0gdGhpcy5fcmVnaXN0ZXJlZE9wdGlvbnNbdHlwZV07XG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xuICB9XG5cbiAgdW5yZWdpc3Rlck9wdGlvbihzcGVjaWZpZXI6IHN0cmluZywgb3B0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuX3JlZ2lzdGVyZWRPcHRpb25zW3NwZWNpZmllcl07XG5cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgZGVsZXRlIG9wdGlvbnNbb3B0aW9uXTtcbiAgICB9XG4gIH1cblxuICByZWdpc3RlckluamVjdGlvbihzcGVjaWZpZXI6IHN0cmluZywgcHJvcGVydHk6IHN0cmluZywgc291cmNlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgaW5qZWN0aW9ucyA9IHRoaXMuX3JlZ2lzdGVyZWRJbmplY3Rpb25zW3NwZWNpZmllcl07XG4gICAgaWYgKGluamVjdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVnaXN0ZXJlZEluamVjdGlvbnNbc3BlY2lmaWVyXSA9IGluamVjdGlvbnMgPSBbXTtcbiAgICB9XG4gICAgaW5qZWN0aW9ucy5wdXNoKHtcbiAgICAgIHByb3BlcnR5LFxuICAgICAgc291cmNlXG4gICAgfSk7XG4gIH1cblxuICByZWdpc3RlcmVkSW5qZWN0aW9ucyhzcGVjaWZpZXI6IHN0cmluZyk6IEluamVjdGlvbltdIHtcbiAgICBsZXQgW3R5cGVdID0gc3BlY2lmaWVyLnNwbGl0KCc6Jyk7XG4gICAgbGV0IGluamVjdGlvbnM6IEluamVjdGlvbltdID0gdGhpcy5fZmFsbGJhY2sgPyB0aGlzLl9mYWxsYmFjay5yZWdpc3RlcmVkSW5qZWN0aW9ucyhzcGVjaWZpZXIpIDogW107XG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoaW5qZWN0aW9ucywgdGhpcy5fcmVnaXN0ZXJlZEluamVjdGlvbnNbdHlwZV0pO1xuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGluamVjdGlvbnMsIHRoaXMuX3JlZ2lzdGVyZWRJbmplY3Rpb25zW3NwZWNpZmllcl0pO1xuICAgIHJldHVybiBpbmplY3Rpb25zO1xuICB9XG59XG4iXX0=