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
exports.parse = exports.parseWithoutProcessing = void 0;
var parser_1 = __importDefault(require("./parser"));
var whitespace_control_1 = __importDefault(require("./whitespace-control"));
var Helpers = __importStar(require("./helpers"));
var baseHelpers = {};
for (var helper in Helpers) {
    if (Object.prototype.hasOwnProperty.call(Helpers, helper)) {
        baseHelpers[helper] = Helpers[helper];
    }
}
function parseWithoutProcessing(input, options) {
    // Just return if an already-compiled AST was passed in.
    if (input.type === 'Program') {
        return input;
    }
    parser_1.default.yy = baseHelpers;
    // Altering the shared object here, but this is ok as parser is a sync operation
    parser_1.default.yy.locInfo = function (locInfo) {
        return new Helpers.SourceLocation(options && options.srcName, locInfo);
    };
    var ast = parser_1.default.parse(input);
    return ast;
}
exports.parseWithoutProcessing = parseWithoutProcessing;
function parse(input, options) {
    var ast = parseWithoutProcessing(input, options);
    var strip = new whitespace_control_1.default(options);
    return strip.accept(ast);
}
exports.parse = parse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvcGFyc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG9EQUE4QjtBQUM5Qiw0RUFBcUQ7QUFDckQsaURBQXFDO0FBRXJDLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUVyQixLQUFLLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRTtJQUMxQixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDekQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN2QztDQUNGO0FBRUQsU0FBZ0Isc0JBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU87SUFDbkQsd0RBQXdEO0lBQ3hELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDNUIsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELGdCQUFNLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQztJQUV4QixnRkFBZ0Y7SUFDaEYsZ0JBQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxHQUFHLFVBQVMsT0FBTztRQUNsQyxPQUFPLElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6RSxDQUFDLENBQUM7SUFFRixJQUFJLEdBQUcsR0FBRyxnQkFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUU5QixPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFoQkQsd0RBZ0JDO0FBRUQsU0FBZ0IsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPO0lBQ2xDLElBQUksR0FBRyxHQUFHLHNCQUFzQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRCxJQUFJLEtBQUssR0FBRyxJQUFJLDRCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTNDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBTEQsc0JBS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFyc2VyIGZyb20gJy4vcGFyc2VyJztcbmltcG9ydCBXaGl0ZXNwYWNlQ29udHJvbCBmcm9tICcuL3doaXRlc3BhY2UtY29udHJvbCc7XG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4vaGVscGVycyc7XG5cbmxldCBiYXNlSGVscGVycyA9IHt9O1xuXG5mb3IgKGxldCBoZWxwZXIgaW4gSGVscGVycykge1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKEhlbHBlcnMsIGhlbHBlcikpIHtcbiAgICBiYXNlSGVscGVyc1toZWxwZXJdID0gSGVscGVyc1toZWxwZXJdO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVdpdGhvdXRQcm9jZXNzaW5nKGlucHV0LCBvcHRpb25zKSB7XG4gIC8vIEp1c3QgcmV0dXJuIGlmIGFuIGFscmVhZHktY29tcGlsZWQgQVNUIHdhcyBwYXNzZWQgaW4uXG4gIGlmIChpbnB1dC50eXBlID09PSAnUHJvZ3JhbScpIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICBwYXJzZXIueXkgPSBiYXNlSGVscGVycztcblxuICAvLyBBbHRlcmluZyB0aGUgc2hhcmVkIG9iamVjdCBoZXJlLCBidXQgdGhpcyBpcyBvayBhcyBwYXJzZXIgaXMgYSBzeW5jIG9wZXJhdGlvblxuICBwYXJzZXIueXkubG9jSW5mbyA9IGZ1bmN0aW9uKGxvY0luZm8pIHtcbiAgICByZXR1cm4gbmV3IEhlbHBlcnMuU291cmNlTG9jYXRpb24ob3B0aW9ucyAmJiBvcHRpb25zLnNyY05hbWUsIGxvY0luZm8pO1xuICB9O1xuXG4gIGxldCBhc3QgPSBwYXJzZXIucGFyc2UoaW5wdXQpO1xuXG4gIHJldHVybiBhc3Q7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuICBsZXQgYXN0ID0gcGFyc2VXaXRob3V0UHJvY2Vzc2luZyhpbnB1dCwgb3B0aW9ucyk7XG4gIGxldCBzdHJpcCA9IG5ldyBXaGl0ZXNwYWNlQ29udHJvbChvcHRpb25zKTtcblxuICByZXR1cm4gc3RyaXAuYWNjZXB0KGFzdCk7XG59XG4iXX0=