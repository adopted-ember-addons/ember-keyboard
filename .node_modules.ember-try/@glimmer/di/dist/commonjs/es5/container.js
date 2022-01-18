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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL2NvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs0QkFXRTt1QkFBWSxBQUF3QjtZQUFFLCtFQUFxQixBQUFJOzs4QkFDN0QsQUFBSTs7YUFBQyxBQUFTLFlBQUcsQUFBUSxBQUFDLEFBQzFCLEFBQUk7YUFBQyxBQUFTLFlBQUcsQUFBUSxBQUFDLEFBQzFCLEFBQUk7YUFBQyxBQUFRLFdBQUcsQUFBRSxBQUFDLEFBQ25CLEFBQUk7YUFBQyxBQUF5Qiw0QkFBRyxBQUFFLEFBQUMsQUFDdEMsQUFBQzs7O3dCQUVELEFBQVUsaUNBQUMsQUFBaUIsV0FDMUI7WUFBSSxBQUFpQixvQkFBMkIsQUFBSSxLQUFDLEFBQXlCLDBCQUFDLEFBQVMsQUFBQyxBQUFDLEFBRTFGLEFBQUUsQUFBQztZQUFDLENBQUMsQUFBaUIsQUFBQyxtQkFBQyxBQUFDLEFBQ3ZCLEFBQUUsQUFBQztnQkFBQyxBQUFJLEtBQUMsQUFBUyxBQUFDLFdBQUMsQUFBQyxBQUNuQixBQUFpQjtvQ0FBRyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQVEsU0FBQyxBQUFTLEFBQUMsQUFBQyxBQUN6RCxBQUFDO0FBRUQsQUFBRSxBQUFDO2dCQUFDLENBQUMsQUFBaUIsQUFBQyxtQkFBQyxBQUFDLEFBQ3ZCLEFBQWlCO29DQUFHLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBWSxhQUFDLEFBQVMsQUFBQyxBQUFDLEFBQzdELEFBQUM7QUFFRCxBQUFFLEFBQUM7Z0JBQUMsQUFBaUIsQUFBQyxtQkFBQyxBQUFDLEFBQ3RCLEFBQUk7cUJBQUMsQUFBeUIsMEJBQUMsQUFBUyxBQUFDLGFBQUcsQUFBaUIsQUFBQyxBQUNoRSxBQUFDLEFBQ0g7QUFBQztBQUVELEFBQUUsQUFBQztZQUFDLENBQUMsQUFBaUIsQUFBQyxtQkFBQyxBQUFDLEFBQ3ZCLEFBQU0sQUFBQyxBQUNUO0FBQUM7QUFFRCxBQUFNO2VBQUMsQUFBSSxLQUFDLEFBQVksYUFBQyxBQUFTLFdBQUUsQUFBaUIsQUFBQyxBQUFDLEFBQ3pELEFBQUM7Ozt3QkFFRCxBQUFNLHlCQUFDLEFBQWlCLFdBQ3RCO1lBQUksQUFBUyxBQUFHLFlBQUMsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFnQixpQkFBQyxBQUFTLFdBQUUsQUFBVyxBQUFDLGlCQUFLLEFBQUssQUFBQyxBQUFDLEFBRXBGLEFBQUUsQUFBQztZQUFDLEFBQVMsYUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVMsQUFBQyxBQUFDLFlBQUMsQUFBQyxBQUMxQyxBQUFNO21CQUFDLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUyxBQUFDLEFBQUMsQUFDbEMsQUFBQztBQUVEO1lBQUksQUFBTyxVQUFHLEFBQUksS0FBQyxBQUFVLFdBQUMsQUFBUyxBQUFDLEFBQUMsQUFDekMsQUFBRSxBQUFDO1lBQUMsQ0FBQyxBQUFPLEFBQUMsU0FBQyxBQUFDLEFBQUMsQUFBTSxBQUFDLEFBQUM7QUFBQztBQUV6QixBQUFFLEFBQUM7WUFBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQWdCLGlCQUFDLEFBQVMsV0FBRSxBQUFhLEFBQUMsbUJBQUssQUFBSyxBQUFDLE9BQUMsQUFBQyxBQUN4RSxBQUFNO21CQUFDLEFBQU8sUUFBQyxBQUFLLEFBQUMsQUFDdkIsQUFBQztBQUVEO1lBQUksQUFBTSxTQUFHLEFBQU8sUUFBQyxBQUFNLEFBQUUsQUFBQyxBQUU5QixBQUFFLEFBQUM7WUFBQyxBQUFTLGFBQUksQUFBTSxBQUFDLFFBQUMsQUFBQyxBQUN4QixBQUFJO2lCQUFDLEFBQVEsU0FBQyxBQUFTLEFBQUMsYUFBRyxBQUFNLEFBQUMsQUFDcEMsQUFBQztBQUVELEFBQU07ZUFBQyxBQUFNLEFBQUMsQUFDaEIsQUFBQzs7O3dCQUVELEFBQWlCLCtDQUFDLEFBQWlCLFdBQ2pDLEFBQU07ZUFBQyxBQUFFLEFBQUMsQUFDWixBQUFDOzs7d0JBRU8sQUFBZSwyQ0FBQyxBQUFpQixXQUN2QztZQUFJLEFBQUksT0FBRyxBQUFJLEtBQUMsQUFBaUIsa0JBQUMsQUFBUyxBQUFDLEFBQUMsQUFDN0M7WUFBSSxBQUFVLGFBQWdCLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFBb0IscUJBQUMsQUFBUyxBQUFDLEFBQUMsQUFDN0U7WUFBSSxBQUFvQixBQUFDLGlCQUV6QixBQUFHLEFBQUM7YUFBQyxJQUFJLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBQyxJQUFHLEFBQVUsV0FBQyxBQUFNLFFBQUUsQUFBQyxBQUFFLEtBQUUsQUFBQyxBQUMzQyxBQUFTO3dCQUFHLEFBQVUsV0FBQyxBQUFDLEFBQUMsQUFBQyxBQUMxQixBQUFJO2lCQUFDLEFBQVMsVUFBQyxBQUFRLEFBQUMsWUFBRyxBQUFJLEtBQUMsQUFBTSxPQUFDLEFBQVMsVUFBQyxBQUFNLEFBQUMsQUFBQyxBQUMzRCxBQUFDO0FBRUQsQUFBTTtlQUFDLEFBQUksQUFBQyxBQUNkLEFBQUM7Ozt3QkFFTyxBQUFZLHFDQUFDLEFBQWlCLFdBQUUsQUFBeUMsbUJBQy9FO1lBQUksQUFBVSxhQUFHLEFBQUksS0FBQyxBQUFlLGdCQUFDLEFBQVMsQUFBQyxBQUFDLEFBRWpELEFBQU07O21CQUNHLEFBQWlCLEFBQ3hCLEFBQU07OEJBQUMsQUFBTyxTQUNaO29CQUFJLEFBQWEsZ0JBQUcsQUFBTSxPQUFDLEFBQU0sT0FBQyxBQUFFLElBQUUsQUFBVSxZQUFFLEFBQU8sQUFBQyxBQUFDLEFBRTNELEFBQU07dUJBQUMsQUFBaUIsa0JBQUMsQUFBTSxPQUFDLEFBQWEsQUFBQyxBQUFDLEFBQ2pELEFBQUMsQUFDRixBQUNIO0FBUlMsQUFRUixBQUNGO0FBUkssQUFBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZhY3RvcnksIEZhY3RvcnlEZWZpbml0aW9uIH0gZnJvbSAnLi9mYWN0b3J5JztcbmltcG9ydCB7IFJlZ2lzdHJ5UmVhZGVyLCBJbmplY3Rpb24gfSBmcm9tICcuL3JlZ2lzdHJ5JztcbmltcG9ydCB7IFJlc29sdmVyIH0gZnJvbSAnLi9yZXNvbHZlcic7XG5pbXBvcnQgeyBEaWN0IH0gZnJvbSAnLi9kaWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGFpbmVyIHtcbiAgcHJpdmF0ZSBfcmVnaXN0cnk6IFJlZ2lzdHJ5UmVhZGVyO1xuICBwcml2YXRlIF9yZXNvbHZlcjogUmVzb2x2ZXI7XG4gIHByaXZhdGUgX2xvb2t1cHM6IERpY3Q8YW55PjtcbiAgcHJpdmF0ZSBfZmFjdG9yeURlZmluaXRpb25Mb29rdXBzOiBEaWN0PEZhY3RvcnlEZWZpbml0aW9uPGFueT4+O1xuXG4gIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5OiBSZWdpc3RyeVJlYWRlciwgcmVzb2x2ZXI6IFJlc29sdmVyID0gbnVsbCkge1xuICAgIHRoaXMuX3JlZ2lzdHJ5ID0gcmVnaXN0cnk7XG4gICAgdGhpcy5fcmVzb2x2ZXIgPSByZXNvbHZlcjtcbiAgICB0aGlzLl9sb29rdXBzID0ge307XG4gICAgdGhpcy5fZmFjdG9yeURlZmluaXRpb25Mb29rdXBzID0ge307XG4gIH1cblxuICBmYWN0b3J5Rm9yKHNwZWNpZmllcjogc3RyaW5nKTogRmFjdG9yeTxhbnk+IHtcbiAgICBsZXQgZmFjdG9yeURlZmluaXRpb246IEZhY3RvcnlEZWZpbml0aW9uPGFueT4gPSB0aGlzLl9mYWN0b3J5RGVmaW5pdGlvbkxvb2t1cHNbc3BlY2lmaWVyXTtcblxuICAgIGlmICghZmFjdG9yeURlZmluaXRpb24pIHtcbiAgICAgIGlmICh0aGlzLl9yZXNvbHZlcikge1xuICAgICAgICBmYWN0b3J5RGVmaW5pdGlvbiA9IHRoaXMuX3Jlc29sdmVyLnJldHJpZXZlKHNwZWNpZmllcik7XG4gICAgICB9XG5cbiAgICAgIGlmICghZmFjdG9yeURlZmluaXRpb24pIHtcbiAgICAgICAgZmFjdG9yeURlZmluaXRpb24gPSB0aGlzLl9yZWdpc3RyeS5yZWdpc3RyYXRpb24oc3BlY2lmaWVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZhY3RvcnlEZWZpbml0aW9uKSB7XG4gICAgICAgIHRoaXMuX2ZhY3RvcnlEZWZpbml0aW9uTG9va3Vwc1tzcGVjaWZpZXJdID0gZmFjdG9yeURlZmluaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmYWN0b3J5RGVmaW5pdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmJ1aWxkRmFjdG9yeShzcGVjaWZpZXIsIGZhY3RvcnlEZWZpbml0aW9uKTtcbiAgfVxuXG4gIGxvb2t1cChzcGVjaWZpZXI6IHN0cmluZyk6IGFueSB7XG4gICAgbGV0IHNpbmdsZXRvbiA9ICh0aGlzLl9yZWdpc3RyeS5yZWdpc3RlcmVkT3B0aW9uKHNwZWNpZmllciwgJ3NpbmdsZXRvbicpICE9PSBmYWxzZSk7XG5cbiAgICBpZiAoc2luZ2xldG9uICYmIHRoaXMuX2xvb2t1cHNbc3BlY2lmaWVyXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2xvb2t1cHNbc3BlY2lmaWVyXTtcbiAgICB9XG5cbiAgICBsZXQgZmFjdG9yeSA9IHRoaXMuZmFjdG9yeUZvcihzcGVjaWZpZXIpO1xuICAgIGlmICghZmFjdG9yeSkgeyByZXR1cm47IH1cblxuICAgIGlmICh0aGlzLl9yZWdpc3RyeS5yZWdpc3RlcmVkT3B0aW9uKHNwZWNpZmllciwgJ2luc3RhbnRpYXRlJykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeS5jbGFzcztcbiAgICB9XG5cbiAgICBsZXQgb2JqZWN0ID0gZmFjdG9yeS5jcmVhdGUoKTtcblxuICAgIGlmIChzaW5nbGV0b24gJiYgb2JqZWN0KSB7XG4gICAgICB0aGlzLl9sb29rdXBzW3NwZWNpZmllcl0gPSBvYmplY3Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIGRlZmF1bHRJbmplY3Rpb25zKHNwZWNpZmllcjogc3RyaW5nKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkSW5qZWN0aW9ucyhzcGVjaWZpZXI6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgbGV0IGhhc2ggPSB0aGlzLmRlZmF1bHRJbmplY3Rpb25zKHNwZWNpZmllcik7XG4gICAgbGV0IGluamVjdGlvbnM6IEluamVjdGlvbltdID0gdGhpcy5fcmVnaXN0cnkucmVnaXN0ZXJlZEluamVjdGlvbnMoc3BlY2lmaWVyKTtcbiAgICBsZXQgaW5qZWN0aW9uOiBJbmplY3Rpb247XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluamVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGluamVjdGlvbiA9IGluamVjdGlvbnNbaV07XG4gICAgICBoYXNoW2luamVjdGlvbi5wcm9wZXJ0eV0gPSB0aGlzLmxvb2t1cChpbmplY3Rpb24uc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaDtcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRGYWN0b3J5KHNwZWNpZmllcjogc3RyaW5nLCBmYWN0b3J5RGVmaW5pdGlvbjogRmFjdG9yeURlZmluaXRpb248YW55Pik6IEZhY3Rvcnk8YW55PiB7XG4gICAgbGV0IGluamVjdGlvbnMgPSB0aGlzLmJ1aWxkSW5qZWN0aW9ucyhzcGVjaWZpZXIpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsYXNzOiBmYWN0b3J5RGVmaW5pdGlvbixcbiAgICAgIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgICAgIGxldCBtZXJnZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgaW5qZWN0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIGZhY3RvcnlEZWZpbml0aW9uLmNyZWF0ZShtZXJnZWRPcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==