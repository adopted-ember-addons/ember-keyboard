"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
// This is handlebars plus helpers specifically for generating Javascript.
const handlebars_1 = require("handlebars");
Object.defineProperty(exports, "compile", { enumerable: true, get: function () { return handlebars_1.compile; } });
const js_string_escape_1 = __importDefault(require("js-string-escape"));
handlebars_1.registerHelper('js-string-escape', js_string_escape_1.default);
handlebars_1.registerHelper('json-stringify', function (input, indent) {
    return JSON.stringify(input, null, indent);
});
handlebars_1.registerHelper('eq', function (a, b) {
    return a === b;
});
//# sourceMappingURL=js-handlebars.js.map