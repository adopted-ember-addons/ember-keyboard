define('@glimmer/di/container', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Container = function () {
        function Container(registry) {
            var resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            _classCallCheck(this, Container);

            this._registry = registry;
            this._resolver = resolver;
            this._lookups = {};
            this._factoryDefinitionLookups = {};
        }

        Container.prototype.factoryFor = function factoryFor(specifier) {
            var factoryDefinition = this._factoryDefinitionLookups[specifier];
            if (!factoryDefinition) {
                if (this._resolver) {
                    factoryDefinition = this._resolver.retrieve(specifier);
                }
                if (!factoryDefinition) {
                    factoryDefinition = this._registry.registration(specifier);
                }
                if (factoryDefinition) {
                    this._factoryDefinitionLookups[specifier] = factoryDefinition;
                }
            }
            if (!factoryDefinition) {
                return;
            }
            return this.buildFactory(specifier, factoryDefinition);
        };

        Container.prototype.lookup = function lookup(specifier) {
            var singleton = this._registry.registeredOption(specifier, 'singleton') !== false;
            if (singleton && this._lookups[specifier]) {
                return this._lookups[specifier];
            }
            var factory = this.factoryFor(specifier);
            if (!factory) {
                return;
            }
            if (this._registry.registeredOption(specifier, 'instantiate') === false) {
                return factory.class;
            }
            var object = factory.create();
            if (singleton && object) {
                this._lookups[specifier] = object;
            }
            return object;
        };

        Container.prototype.defaultInjections = function defaultInjections(specifier) {
            return {};
        };

        Container.prototype.buildInjections = function buildInjections(specifier) {
            var hash = this.defaultInjections(specifier);
            var injections = this._registry.registeredInjections(specifier);
            var injection = void 0;
            for (var i = 0; i < injections.length; i++) {
                injection = injections[i];
                hash[injection.property] = this.lookup(injection.source);
            }
            return hash;
        };

        Container.prototype.buildFactory = function buildFactory(specifier, factoryDefinition) {
            var injections = this.buildInjections(specifier);
            return {
                class: factoryDefinition,
                create: function (options) {
                    var mergedOptions = Object.assign({}, injections, options);
                    return factoryDefinition.create(mergedOptions);
                }
            };
        };

        return Container;
    }();

    exports.default = Container;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL2NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Z0NBV0U7MkJBQVksQUFBd0I7Z0JBQUUsK0VBQXFCLEFBQUk7O2tDQUM3RCxBQUFJOztpQkFBQyxBQUFTLFlBQUcsQUFBUSxBQUFDLEFBQzFCLEFBQUk7aUJBQUMsQUFBUyxZQUFHLEFBQVEsQUFBQyxBQUMxQixBQUFJO2lCQUFDLEFBQVEsV0FBRyxBQUFFLEFBQUMsQUFDbkIsQUFBSTtpQkFBQyxBQUF5Qiw0QkFBRyxBQUFFLEFBQUMsQUFDdEMsQUFBQzs7OzRCQUVELEFBQVUsaUNBQUMsQUFBaUIsV0FDMUI7Z0JBQUksQUFBaUIsb0JBQTJCLEFBQUksS0FBQyxBQUF5QiwwQkFBQyxBQUFTLEFBQUMsQUFBQyxBQUUxRixBQUFFLEFBQUM7Z0JBQUMsQ0FBQyxBQUFpQixBQUFDLG1CQUFDLEFBQUMsQUFDdkIsQUFBRSxBQUFDO29CQUFDLEFBQUksS0FBQyxBQUFTLEFBQUMsV0FBQyxBQUFDLEFBQ25CLEFBQWlCO3dDQUFHLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBUSxTQUFDLEFBQVMsQUFBQyxBQUFDLEFBQ3pELEFBQUM7QUFFRCxBQUFFLEFBQUM7b0JBQUMsQ0FBQyxBQUFpQixBQUFDLG1CQUFDLEFBQUMsQUFDdkIsQUFBaUI7d0NBQUcsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFZLGFBQUMsQUFBUyxBQUFDLEFBQUMsQUFDN0QsQUFBQztBQUVELEFBQUUsQUFBQztvQkFBQyxBQUFpQixBQUFDLG1CQUFDLEFBQUMsQUFDdEIsQUFBSTt5QkFBQyxBQUF5QiwwQkFBQyxBQUFTLEFBQUMsYUFBRyxBQUFpQixBQUFDLEFBQ2hFLEFBQUMsQUFDSDtBQUFDO0FBRUQsQUFBRSxBQUFDO2dCQUFDLENBQUMsQUFBaUIsQUFBQyxtQkFBQyxBQUFDLEFBQ3ZCLEFBQU0sQUFBQyxBQUNUO0FBQUM7QUFFRCxBQUFNO21CQUFDLEFBQUksS0FBQyxBQUFZLGFBQUMsQUFBUyxXQUFFLEFBQWlCLEFBQUMsQUFBQyxBQUN6RCxBQUFDOzs7NEJBRUQsQUFBTSx5QkFBQyxBQUFpQixXQUN0QjtnQkFBSSxBQUFTLEFBQUcsWUFBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQWdCLGlCQUFDLEFBQVMsV0FBRSxBQUFXLEFBQUMsaUJBQUssQUFBSyxBQUFDLEFBQUMsQUFFcEYsQUFBRSxBQUFDO2dCQUFDLEFBQVMsYUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVMsQUFBQyxBQUFDLFlBQUMsQUFBQyxBQUMxQyxBQUFNO3VCQUFDLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUyxBQUFDLEFBQUMsQUFDbEMsQUFBQztBQUVEO2dCQUFJLEFBQU8sVUFBRyxBQUFJLEtBQUMsQUFBVSxXQUFDLEFBQVMsQUFBQyxBQUFDLEFBQ3pDLEFBQUUsQUFBQztnQkFBQyxDQUFDLEFBQU8sQUFBQyxTQUFDLEFBQUMsQUFBQyxBQUFNLEFBQUMsQUFBQztBQUFDO0FBRXpCLEFBQUUsQUFBQztnQkFBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQWdCLGlCQUFDLEFBQVMsV0FBRSxBQUFhLEFBQUMsbUJBQUssQUFBSyxBQUFDLE9BQUMsQUFBQyxBQUN4RSxBQUFNO3VCQUFDLEFBQU8sUUFBQyxBQUFLLEFBQUMsQUFDdkIsQUFBQztBQUVEO2dCQUFJLEFBQU0sU0FBRyxBQUFPLFFBQUMsQUFBTSxBQUFFLEFBQUMsQUFFOUIsQUFBRSxBQUFDO2dCQUFDLEFBQVMsYUFBSSxBQUFNLEFBQUMsUUFBQyxBQUFDLEFBQ3hCLEFBQUk7cUJBQUMsQUFBUSxTQUFDLEFBQVMsQUFBQyxhQUFHLEFBQU0sQUFBQyxBQUNwQyxBQUFDO0FBRUQsQUFBTTttQkFBQyxBQUFNLEFBQUMsQUFDaEIsQUFBQzs7OzRCQUVELEFBQWlCLCtDQUFDLEFBQWlCLFdBQ2pDLEFBQU07bUJBQUMsQUFBRSxBQUFDLEFBQ1osQUFBQzs7OzRCQUVPLEFBQWUsMkNBQUMsQUFBaUIsV0FDdkM7Z0JBQUksQUFBSSxPQUFHLEFBQUksS0FBQyxBQUFpQixrQkFBQyxBQUFTLEFBQUMsQUFBQyxBQUM3QztnQkFBSSxBQUFVLGFBQWdCLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBb0IscUJBQUMsQUFBUyxBQUFDLEFBQUMsQUFDN0U7Z0JBQUksQUFBb0IsQUFBQyxpQkFFekIsQUFBRyxBQUFDO2lCQUFDLElBQUksQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFDLElBQUcsQUFBVSxXQUFDLEFBQU0sUUFBRSxBQUFDLEFBQUUsS0FBRSxBQUFDLEFBQzNDLEFBQVM7NEJBQUcsQUFBVSxXQUFDLEFBQUMsQUFBQyxBQUFDLEFBQzFCLEFBQUk7cUJBQUMsQUFBUyxVQUFDLEFBQVEsQUFBQyxZQUFHLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBUyxVQUFDLEFBQU0sQUFBQyxBQUFDLEFBQzNELEFBQUM7QUFFRCxBQUFNO21CQUFDLEFBQUksQUFBQyxBQUNkLEFBQUM7Ozs0QkFFTyxBQUFZLHFDQUFDLEFBQWlCLFdBQUUsQUFBeUMsbUJBQy9FO2dCQUFJLEFBQVUsYUFBRyxBQUFJLEtBQUMsQUFBZSxnQkFBQyxBQUFTLEFBQUMsQUFBQyxBQUVqRCxBQUFNOzt1QkFDRyxBQUFpQixBQUN4QixBQUFNO2tDQUFDLEFBQU8sU0FDWjt3QkFBSSxBQUFhLGdCQUFHLEFBQU0sT0FBQyxBQUFNLE9BQUMsQUFBRSxJQUFFLEFBQVUsWUFBRSxBQUFPLEFBQUMsQUFBQyxBQUUzRCxBQUFNOzJCQUFDLEFBQWlCLGtCQUFDLEFBQU0sT0FBQyxBQUFhLEFBQUMsQUFBQyxBQUNqRCxBQUFDLEFBQ0YsQUFDSDtBQVJTLEFBUVIsQUFDRjtBQVJLLEFBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBGYWN0b3J5LCBGYWN0b3J5RGVmaW5pdGlvbiB9IGZyb20gJy4vZmFjdG9yeSc7XG5pbXBvcnQgeyBSZWdpc3RyeVJlYWRlciwgSW5qZWN0aW9uIH0gZnJvbSAnLi9yZWdpc3RyeSc7XG5pbXBvcnQgeyBSZXNvbHZlciB9IGZyb20gJy4vcmVzb2x2ZXInO1xuaW1wb3J0IHsgRGljdCB9IGZyb20gJy4vZGljdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRhaW5lciB7XG4gIHByaXZhdGUgX3JlZ2lzdHJ5OiBSZWdpc3RyeVJlYWRlcjtcbiAgcHJpdmF0ZSBfcmVzb2x2ZXI6IFJlc29sdmVyO1xuICBwcml2YXRlIF9sb29rdXBzOiBEaWN0PGFueT47XG4gIHByaXZhdGUgX2ZhY3RvcnlEZWZpbml0aW9uTG9va3VwczogRGljdDxGYWN0b3J5RGVmaW5pdGlvbjxhbnk+PjtcblxuICBjb25zdHJ1Y3RvcihyZWdpc3RyeTogUmVnaXN0cnlSZWFkZXIsIHJlc29sdmVyOiBSZXNvbHZlciA9IG51bGwpIHtcbiAgICB0aGlzLl9yZWdpc3RyeSA9IHJlZ2lzdHJ5O1xuICAgIHRoaXMuX3Jlc29sdmVyID0gcmVzb2x2ZXI7XG4gICAgdGhpcy5fbG9va3VwcyA9IHt9O1xuICAgIHRoaXMuX2ZhY3RvcnlEZWZpbml0aW9uTG9va3VwcyA9IHt9O1xuICB9XG5cbiAgZmFjdG9yeUZvcihzcGVjaWZpZXI6IHN0cmluZyk6IEZhY3Rvcnk8YW55PiB7XG4gICAgbGV0IGZhY3RvcnlEZWZpbml0aW9uOiBGYWN0b3J5RGVmaW5pdGlvbjxhbnk+ID0gdGhpcy5fZmFjdG9yeURlZmluaXRpb25Mb29rdXBzW3NwZWNpZmllcl07XG5cbiAgICBpZiAoIWZhY3RvcnlEZWZpbml0aW9uKSB7XG4gICAgICBpZiAodGhpcy5fcmVzb2x2ZXIpIHtcbiAgICAgICAgZmFjdG9yeURlZmluaXRpb24gPSB0aGlzLl9yZXNvbHZlci5yZXRyaWV2ZShzcGVjaWZpZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWZhY3RvcnlEZWZpbml0aW9uKSB7XG4gICAgICAgIGZhY3RvcnlEZWZpbml0aW9uID0gdGhpcy5fcmVnaXN0cnkucmVnaXN0cmF0aW9uKHNwZWNpZmllcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChmYWN0b3J5RGVmaW5pdGlvbikge1xuICAgICAgICB0aGlzLl9mYWN0b3J5RGVmaW5pdGlvbkxvb2t1cHNbc3BlY2lmaWVyXSA9IGZhY3RvcnlEZWZpbml0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZmFjdG9yeURlZmluaXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5idWlsZEZhY3Rvcnkoc3BlY2lmaWVyLCBmYWN0b3J5RGVmaW5pdGlvbik7XG4gIH1cblxuICBsb29rdXAoc3BlY2lmaWVyOiBzdHJpbmcpOiBhbnkge1xuICAgIGxldCBzaW5nbGV0b24gPSAodGhpcy5fcmVnaXN0cnkucmVnaXN0ZXJlZE9wdGlvbihzcGVjaWZpZXIsICdzaW5nbGV0b24nKSAhPT0gZmFsc2UpO1xuXG4gICAgaWYgKHNpbmdsZXRvbiAmJiB0aGlzLl9sb29rdXBzW3NwZWNpZmllcl0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9sb29rdXBzW3NwZWNpZmllcl07XG4gICAgfVxuXG4gICAgbGV0IGZhY3RvcnkgPSB0aGlzLmZhY3RvcnlGb3Ioc3BlY2lmaWVyKTtcbiAgICBpZiAoIWZhY3RvcnkpIHsgcmV0dXJuOyB9XG5cbiAgICBpZiAodGhpcy5fcmVnaXN0cnkucmVnaXN0ZXJlZE9wdGlvbihzcGVjaWZpZXIsICdpbnN0YW50aWF0ZScpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkuY2xhc3M7XG4gICAgfVxuXG4gICAgbGV0IG9iamVjdCA9IGZhY3RvcnkuY3JlYXRlKCk7XG5cbiAgICBpZiAoc2luZ2xldG9uICYmIG9iamVjdCkge1xuICAgICAgdGhpcy5fbG9va3Vwc1tzcGVjaWZpZXJdID0gb2JqZWN0O1xuICAgIH1cblxuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICBkZWZhdWx0SW5qZWN0aW9ucyhzcGVjaWZpZXI6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZEluamVjdGlvbnMoc3BlY2lmaWVyOiBzdHJpbmcpOiBPYmplY3Qge1xuICAgIGxldCBoYXNoID0gdGhpcy5kZWZhdWx0SW5qZWN0aW9ucyhzcGVjaWZpZXIpO1xuICAgIGxldCBpbmplY3Rpb25zOiBJbmplY3Rpb25bXSA9IHRoaXMuX3JlZ2lzdHJ5LnJlZ2lzdGVyZWRJbmplY3Rpb25zKHNwZWNpZmllcik7XG4gICAgbGV0IGluamVjdGlvbjogSW5qZWN0aW9uO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmplY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpbmplY3Rpb24gPSBpbmplY3Rpb25zW2ldO1xuICAgICAgaGFzaFtpbmplY3Rpb24ucHJvcGVydHldID0gdGhpcy5sb29rdXAoaW5qZWN0aW9uLnNvdXJjZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc2g7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkRmFjdG9yeShzcGVjaWZpZXI6IHN0cmluZywgZmFjdG9yeURlZmluaXRpb246IEZhY3RvcnlEZWZpbml0aW9uPGFueT4pOiBGYWN0b3J5PGFueT4ge1xuICAgIGxldCBpbmplY3Rpb25zID0gdGhpcy5idWlsZEluamVjdGlvbnMoc3BlY2lmaWVyKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjbGFzczogZmFjdG9yeURlZmluaXRpb24sXG4gICAgICBjcmVhdGUob3B0aW9ucykge1xuICAgICAgICBsZXQgbWVyZ2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGluamVjdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiBmYWN0b3J5RGVmaW5pdGlvbi5jcmVhdGUobWVyZ2VkT3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=