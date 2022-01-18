"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTemplates = void 0;
const string_prototype_matchall_1 = __importDefault(require("string.prototype.matchall"));
const debug_1 = require("./debug");
const escapeChar = '\\';
const stringOrRegexDelimiter = /['"/]/;
const singleLineCommentStart = /\/\//;
const newLine = /\n/;
const multiLineCommentStart = /\/\*/;
const multiLineCommentEnd = /\*\//;
const templateLiteralStart = /([$a-zA-Z_][0-9a-zA-Z_$]*)?`/;
const templateLiteralEnd = /`/;
const dynamicSegmentStart = /\${/;
const blockStart = /{/;
const dynamicSegmentEnd = /}/;
function isEscaped(template, _offset) {
    let offset = debug_1.expect(_offset, 'Expected an index to check escaping');
    let count = 0;
    while (template[offset - 1] === escapeChar) {
        count++;
        offset--;
    }
    return count % 2 === 1;
}
/**
 * Parses a template to find all possible valid matches for an embedded template.
 * Supported syntaxes are template literals:
 *
 *   hbs`Hello, world!`
 *
 * And template tags
 *
 *   <template></template>
 *
 * The parser excludes any values found within strings recursively, and also
 * excludes any string literals with dynamic segments (e.g `${}`) since these
 * cannot be valid templates.
 *
 * @param template The template to parse
 * @param relativePath Relative file path for the template (for errors)
 * @param templateTag Optional template tag if parsing template tags is enabled
 * @returns
 */
function parseTemplates(template, relativePath, templateTag) {
    const results = [];
    const templateTagStart = new RegExp(`<${templateTag}[^<]*>`);
    const templateTagEnd = new RegExp(`</${templateTag}>`);
    const argumentsMatchRegex = new RegExp(`<${templateTag}[^<]*\\S[^<]*>`);
    const allTokens = new RegExp([
        singleLineCommentStart.source,
        newLine.source,
        multiLineCommentStart.source,
        multiLineCommentEnd.source,
        stringOrRegexDelimiter.source,
        templateLiteralStart.source,
        templateLiteralEnd.source,
        dynamicSegmentStart.source,
        dynamicSegmentEnd.source,
        blockStart.source,
        templateTagStart.source,
        templateTagEnd.source,
    ].join('|'), 'g');
    const tokens = Array.from(string_prototype_matchall_1.default(template, allTokens));
    while (tokens.length > 0) {
        const currentToken = tokens.shift();
        parseToken(results, template, currentToken, tokens, true);
    }
    /**
     * Parse the current token. If top level, then template tags can be parsed.
     * Else, we are nested within a dynamic segment, which is currently unsupported.
     */
    function parseToken(results, template, token, tokens, isTopLevel = false) {
        if (token[0].match(multiLineCommentStart)) {
            parseMultiLineComment(results, template, token, tokens);
        }
        else if (token[0].match(singleLineCommentStart)) {
            parseSingleLineComment(results, template, token, tokens);
        }
        else if (token[0].match(templateLiteralStart)) {
            parseTemplateLiteral(results, template, token, tokens, isTopLevel);
        }
        else if (isTopLevel &&
            templateTag !== undefined &&
            templateTagStart &&
            token[0].match(templateTagStart)) {
            parseTemplateTag(results, template, token, tokens);
        }
        else if (token[0].match(stringOrRegexDelimiter)) {
            parseStringOrRegex(results, template, token, tokens);
        }
    }
    /**
     * Parse a string or a regex. All tokens within a string or regex are ignored
     * since there are no dynamic segments within these.
     */
    function parseStringOrRegex(_results, template, startToken, tokens) {
        while (tokens.length > 0) {
            const currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (currentToken[0] === startToken[0] && !isEscaped(template, currentToken.index)) {
                return;
            }
        }
    }
    /**
     * Parse a string or a regex. All tokens within a string or regex are ignored
     * since there are no dynamic segments within these.
     */
    function parseSingleLineComment(_results, _template, _startToken, tokens) {
        while (tokens.length > 0) {
            const currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (currentToken[0] === '\n') {
                return;
            }
        }
    }
    /**
     * Parse a string or a regex. All tokens within a string or regex are ignored
     * since there are no dynamic segments within these.
     */
    function parseMultiLineComment(_results, _template, _startToken, tokens) {
        while (tokens.length > 0) {
            const currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (currentToken[0] === '*/') {
                return;
            }
        }
    }
    /**
     * Parse a template literal. If a dynamic segment is found, enters the dynamic
     * segment and parses it recursively. If no dynamic segments are found and the
     * literal is top level (e.g. not nested within a dynamic segment) and has a
     * tag, pushes it into the list of results.
     */
    function parseTemplateLiteral(results, template, startToken, tokens, isTopLevel = false) {
        var _a;
        let hasDynamicSegment = false;
        while (tokens.length > 0) {
            let currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (isEscaped(template, currentToken.index))
                continue;
            if (currentToken[0].match(dynamicSegmentStart)) {
                hasDynamicSegment = true;
                parseDynamicSegment(results, template, currentToken, tokens);
            }
            else if (currentToken[0].match(templateLiteralEnd)) {
                if (isTopLevel && !hasDynamicSegment && ((_a = startToken[1]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    // Handle the case where a tag-like was matched, e.g. hbs`hello`
                    if (currentToken[0].length > 1) {
                        const tokenStr = currentToken[0];
                        const index = debug_1.expect(currentToken.index, 'expected index');
                        currentToken = ['`'];
                        currentToken.index = index + tokenStr.length - 1;
                    }
                    results.push({
                        type: 'template-literal',
                        tagName: startToken[1],
                        start: startToken,
                        end: currentToken,
                    });
                }
                return;
            }
        }
    }
    /**
     * Parses a dynamic segment within a template literal. Continues parsing until
     * the dynamic segment has been exited, ignoring all tokens within it.
     * Accounts for nested block statements, strings, and template literals.
     */
    function parseDynamicSegment(results, template, _startToken, tokens) {
        let stack = 1;
        while (tokens.length > 0) {
            const currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (currentToken[0].match(blockStart)) {
                stack++;
            }
            else if (currentToken[0].match(dynamicSegmentEnd)) {
                stack--;
            }
            else {
                parseToken(results, template, currentToken, tokens);
            }
            if (stack === 0) {
                return;
            }
        }
    }
    /**
     * Parses a template tag. Continues parsing until the template tag has closed,
     * accounting for nested template tags.
     */
    function parseTemplateTag(results, _template, startToken, tokens) {
        let stack = 1;
        if (argumentsMatchRegex && startToken[0].match(argumentsMatchRegex)) {
            throw new Error(`embedded template preprocessing currently does not support passing arguments, found args in: ${relativePath}`);
        }
        while (tokens.length > 0) {
            const currentToken = debug_1.expect(tokens.shift(), 'expected token');
            if (currentToken[0].match(templateTagStart)) {
                stack++;
            }
            else if (currentToken[0].match(templateTagEnd)) {
                stack--;
            }
            if (stack === 0) {
                results.push({ type: 'template-tag', start: startToken, end: currentToken });
                return;
            }
        }
    }
    return results;
}
exports.parseTemplates = parseTemplates;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtdGVtcGxhdGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhcnNlLXRlbXBsYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwRkFBaUQ7QUFDakQsbUNBQWlDO0FBaUJqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDeEIsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUM7QUFFdkMsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUM7QUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDO0FBQ3JDLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDO0FBRW5DLE1BQU0sb0JBQW9CLEdBQUcsOEJBQThCLENBQUM7QUFDNUQsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUM7QUFFL0IsTUFBTSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7QUFDbEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0FBRTlCLFNBQVMsU0FBUyxDQUFDLFFBQWdCLEVBQUUsT0FBMkI7SUFDOUQsSUFBSSxNQUFNLEdBQUcsY0FBTSxDQUFDLE9BQU8sRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO0lBRXBFLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVkLE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7UUFDMUMsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLEVBQUUsQ0FBQztLQUNWO0lBRUQsT0FBTyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILFNBQWdCLGNBQWMsQ0FDNUIsUUFBZ0IsRUFDaEIsWUFBb0IsRUFDcEIsV0FBb0I7SUFFcEIsTUFBTSxPQUFPLEdBQW9CLEVBQUUsQ0FB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LENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMzQyxLQUFLLEVBQUUsQ0FBQzthQUNUO2lCQUFNLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDaEQsS0FBSyxFQUFFLENBQUM7YUFDVDtZQUVELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO2dCQUU3RSxPQUFPO2FBQ1I7U0FDRjtJQUNILENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNqQixDQUFDO0FBN09ELHdDQTZPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtYXRjaEFsbCBmcm9tICdzdHJpbmcucHJvdG90eXBlLm1hdGNoYWxsJztcbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJy4vZGVidWcnO1xuXG5leHBvcnQgdHlwZSBUZW1wbGF0ZU1hdGNoID0gVGVtcGxhdGVUYWdNYXRjaCB8IFRlbXBsYXRlTGl0ZXJhbE1hdGNoO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlVGFnTWF0Y2gge1xuICB0eXBlOiAndGVtcGxhdGUtdGFnJztcbiAgc3RhcnQ6IFJlZ0V4cE1hdGNoQXJyYXk7XG4gIGVuZDogUmVnRXhwTWF0Y2hBcnJheTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUZW1wbGF0ZUxpdGVyYWxNYXRjaCB7XG4gIHR5cGU6ICd0ZW1wbGF0ZS1saXRlcmFsJztcbiAgdGFnTmFtZTogc3RyaW5nO1xuICBzdGFydDogUmVnRXhwTWF0Y2hBcnJheTtcbiAgZW5kOiBSZWdFeHBNYXRjaEFycmF5O1xufVxuXG5jb25zdCBlc2NhcGVDaGFyID0gJ1xcXFwnO1xuY29uc3Qgc3RyaW5nT3JSZWdleERlbGltaXRlciA9IC9bJ1wiL10vO1xuXG5jb25zdCBzaW5nbGVMaW5lQ29tbWVudFN0YXJ0ID0gL1xcL1xcLy87XG5jb25zdCBuZXdMaW5lID0gL1xcbi87XG5jb25zdCBtdWx0aUxpbmVDb21tZW50U3RhcnQgPSAvXFwvXFwqLztcbmNvbnN0IG11bHRpTGluZUNvbW1lbnRFbmQgPSAvXFwqXFwvLztcblxuY29uc3QgdGVtcGxhdGVMaXRlcmFsU3RhcnQgPSAvKFskYS16QS1aX11bMC05YS16QS1aXyRdKik/YC87XG5jb25zdCB0ZW1wbGF0ZUxpdGVyYWxFbmQgPSAvYC87XG5cbmNvbnN0IGR5bmFtaWNTZWdtZW50U3RhcnQgPSAvXFwkey87XG5jb25zdCBibG9ja1N0YXJ0ID0gL3svO1xuY29uc3QgZHluYW1pY1NlZ21lbnRFbmQgPSAvfS87XG5cbmZ1bmN0aW9uIGlzRXNjYXBlZCh0ZW1wbGF0ZTogc3RyaW5nLCBfb2Zmc2V0OiBudW1iZXIgfCB1bmRlZmluZWQpIHtcbiAgbGV0IG9mZnNldCA9IGV4cGVjdChfb2Zmc2V0LCAnRXhwZWN0ZWQgYW4gaW5kZXggdG8gY2hlY2sgZXNjYXBpbmcnKTtcblxuICBsZXQgY291bnQgPSAwO1xuXG4gIHdoaWxlICh0ZW1wbGF0ZVtvZmZzZXQgLSAxXSA9PT0gZXNjYXBlQ2hhcikge1xuICAgIGNvdW50Kys7XG4gICAgb2Zmc2V0LS07XG4gIH1cblxuICByZXR1cm4gY291bnQgJSAyID09PSAxO1xufVxuXG4vKipcbiAqIFBhcnNlcyBhIHRlbXBsYXRlIHRvIGZpbmQgYWxsIHBvc3NpYmxlIHZhbGlkIG1hdGNoZXMgZm9yIGFuIGVtYmVkZGVkIHRlbXBsYXRlLlxuICogU3VwcG9ydGVkIHN5bnRheGVzIGFyZSB0ZW1wbGF0ZSBsaXRlcmFsczpcbiAqXG4gKiAgIGhic2BIZWxsbywgd29ybGQhYFxuICpcbiAqIEFuZCB0ZW1wbGF0ZSB0YWdzXG4gKlxuICogICA8dGVtcGxhdGU+PC90ZW1wbGF0ZT5cbiAqXG4gKiBUaGUgcGFyc2VyIGV4Y2x1ZGVzIGFueSB2YWx1ZXMgZm91bmQgd2l0aGluIHN0cmluZ3MgcmVjdXJzaXZlbHksIGFuZCBhbHNvXG4gKiBleGNsdWRlcyBhbnkgc3RyaW5nIGxpdGVyYWxzIHdpdGggZHluYW1pYyBzZWdtZW50cyAoZS5nIGAke31gKSBzaW5jZSB0aGVzZVxuICogY2Fubm90IGJlIHZhbGlkIHRlbXBsYXRlcy5cbiAqXG4gKiBAcGFyYW0gdGVtcGxhdGUgVGhlIHRlbXBsYXRlIHRvIHBhcnNlXG4gKiBAcGFyYW0gcmVsYXRpdmVQYXRoIFJlbGF0aXZlIGZpbGUgcGF0aCBmb3IgdGhlIHRlbXBsYXRlIChmb3IgZXJyb3JzKVxuICogQHBhcmFtIHRlbXBsYXRlVGFnIE9wdGlvbmFsIHRlbXBsYXRlIHRhZyBpZiBwYXJzaW5nIHRlbXBsYXRlIHRhZ3MgaXMgZW5hYmxlZFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGVzKFxuICB0ZW1wbGF0ZTogc3RyaW5nLFxuICByZWxhdGl2ZVBhdGg6IHN0cmluZyxcbiAgdGVtcGxhdGVUYWc/OiBzdHJpbmdcbik6IFRlbXBsYXRlTWF0Y2hbXSB7XG4gIGNvbnN0IHJlc3VsdHM6IFRlbXBsYXRlTWF0Y2hbXSA9IFtdO1xuXG4gIGNvbnN0IHRlbXBsYXRlVGFnU3RhcnQgPSBuZXcgUmVnRXhwKGA8JHt0ZW1wbGF0ZVRhZ31bXjxdKj5gKTtcbiAgY29uc3QgdGVtcGxhdGVUYWdFbmQgPSBuZXcgUmVnRXhwKGA8LyR7dGVtcGxhdGVUYWd9PmApO1xuICBjb25zdCBhcmd1bWVudHNNYXRjaFJlZ2V4ID0gbmV3IFJlZ0V4cChgPCR7dGVtcGxhdGVUYWd9W148XSpcXFxcU1tePF0qPmApO1xuXG4gIGNvbnN0IGFsbFRva2VucyA9IG5ldyBSZWdFeHAoXG4gICAgW1xuICAgICAgc2luZ2xlTGluZUNvbW1lbnRTdGFydC5zb3VyY2UsXG4gICAgICBuZXdMaW5lLnNvdXJjZSxcbiAgICAgIG11bHRpTGluZUNvbW1lbnRTdGFydC5zb3VyY2UsXG4gICAgICBtdWx0aUxpbmVDb21tZW50RW5kLnNvdXJjZSxcbiAgICAgIHN0cmluZ09yUmVnZXhEZWxpbWl0ZXIuc291cmNlLFxuICAgICAgdGVtcGxhdGVMaXRlcmFsU3RhcnQuc291cmNlLFxuICAgICAgdGVtcGxhdGVMaXRlcmFsRW5kLnNvdXJjZSxcbiAgICAgIGR5bmFtaWNTZWdtZW50U3RhcnQuc291cmNlLFxuICAgICAgZHluYW1pY1NlZ21lbnRFbmQuc291cmNlLFxuICAgICAgYmxvY2tTdGFydC5zb3VyY2UsXG4gICAgICB0ZW1wbGF0ZVRhZ1N0YXJ0LnNvdXJjZSxcbiAgICAgIHRlbXBsYXRlVGFnRW5kLnNvdXJjZSxcbiAgICBdLmpvaW4oJ3wnKSxcbiAgICAnZydcbiAgKTtcblxuICBjb25zdCB0b2tlbnMgPSBBcnJheS5mcm9tKG1hdGNoQWxsKHRlbXBsYXRlLCBhbGxUb2tlbnMpKTtcblxuICB3aGlsZSAodG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBjdXJyZW50VG9rZW4gPSB0b2tlbnMuc2hpZnQoKSE7XG5cbiAgICBwYXJzZVRva2VuKHJlc3VsdHMsIHRlbXBsYXRlLCBjdXJyZW50VG9rZW4sIHRva2VucywgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgdGhlIGN1cnJlbnQgdG9rZW4uIElmIHRvcCBsZXZlbCwgdGhlbiB0ZW1wbGF0ZSB0YWdzIGNhbiBiZSBwYXJzZWQuXG4gICAqIEVsc2UsIHdlIGFyZSBuZXN0ZWQgd2l0aGluIGEgZHluYW1pYyBzZWdtZW50LCB3aGljaCBpcyBjdXJyZW50bHkgdW5zdXBwb3J0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVRva2VuKFxuICAgIHJlc3VsdHM6IFRlbXBsYXRlTWF0Y2hbXSxcbiAgICB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgIHRva2VuOiBSZWdFeHBNYXRjaEFycmF5LFxuICAgIHRva2VuczogUmVnRXhwTWF0Y2hBcnJheVtdLFxuICAgIGlzVG9wTGV2ZWwgPSBmYWxzZVxuICApIHtcbiAgICBpZiAodG9rZW5bMF0ubWF0Y2gobXVsdGlMaW5lQ29tbWVudFN0YXJ0KSkge1xuICAgICAgcGFyc2VNdWx0aUxpbmVDb21tZW50KHJlc3VsdHMsIHRlbXBsYXRlLCB0b2tlbiwgdG9rZW5zKTtcbiAgICB9IGVsc2UgaWYgKHRva2VuWzBdLm1hdGNoKHNpbmdsZUxpbmVDb21tZW50U3RhcnQpKSB7XG4gICAgICBwYXJzZVNpbmdsZUxpbmVDb21tZW50KHJlc3VsdHMsIHRlbXBsYXRlLCB0b2tlbiwgdG9rZW5zKTtcbiAgICB9IGVsc2UgaWYgKHRva2VuWzBdLm1hdGNoKHRlbXBsYXRlTGl0ZXJhbFN0YXJ0KSkge1xuICAgICAgcGFyc2VUZW1wbGF0ZUxpdGVyYWwocmVzdWx0cywgdGVtcGxhdGUsIHRva2VuLCB0b2tlbnMsIGlzVG9wTGV2ZWwpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBpc1RvcExldmVsICYmXG4gICAgICB0ZW1wbGF0ZVRhZyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0ZW1wbGF0ZVRhZ1N0YXJ0ICYmXG4gICAgICB0b2tlblswXS5tYXRjaCh0ZW1wbGF0ZVRhZ1N0YXJ0KVxuICAgICkge1xuICAgICAgcGFyc2VUZW1wbGF0ZVRhZyhyZXN1bHRzLCB0ZW1wbGF0ZSwgdG9rZW4sIHRva2Vucyk7XG4gICAgfSBlbHNlIGlmICh0b2tlblswXS5tYXRjaChzdHJpbmdPclJlZ2V4RGVsaW1pdGVyKSkge1xuICAgICAgcGFyc2VTdHJpbmdPclJlZ2V4KHJlc3VsdHMsIHRlbXBsYXRlLCB0b2tlbiwgdG9rZW5zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSBzdHJpbmcgb3IgYSByZWdleC4gQWxsIHRva2VucyB3aXRoaW4gYSBzdHJpbmcgb3IgcmVnZXggYXJlIGlnbm9yZWRcbiAgICogc2luY2UgdGhlcmUgYXJlIG5vIGR5bmFtaWMgc2VnbWVudHMgd2l0aGluIHRoZXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VTdHJpbmdPclJlZ2V4KFxuICAgIF9yZXN1bHRzOiBUZW1wbGF0ZU1hdGNoW10sXG4gICAgdGVtcGxhdGU6IHN0cmluZyxcbiAgICBzdGFydFRva2VuOiBSZWdFeHBNYXRjaEFycmF5LFxuICAgIHRva2VuczogUmVnRXhwTWF0Y2hBcnJheVtdXG4gICkge1xuICAgIHdoaWxlICh0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY3VycmVudFRva2VuID0gZXhwZWN0KHRva2Vucy5zaGlmdCgpLCAnZXhwZWN0ZWQgdG9rZW4nKTtcblxuICAgICAgaWYgKGN1cnJlbnRUb2tlblswXSA9PT0gc3RhcnRUb2tlblswXSAmJiAhaXNFc2NhcGVkKHRlbXBsYXRlLCBjdXJyZW50VG9rZW4uaW5kZXgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSBzdHJpbmcgb3IgYSByZWdleC4gQWxsIHRva2VucyB3aXRoaW4gYSBzdHJpbmcgb3IgcmVnZXggYXJlIGlnbm9yZWRcbiAgICogc2luY2UgdGhlcmUgYXJlIG5vIGR5bmFtaWMgc2VnbWVudHMgd2l0aGluIHRoZXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VTaW5nbGVMaW5lQ29tbWVudChcbiAgICBfcmVzdWx0czogVGVtcGxhdGVNYXRjaFtdLFxuICAgIF90ZW1wbGF0ZTogc3RyaW5nLFxuICAgIF9zdGFydFRva2VuOiBSZWdFeHBNYXRjaEFycmF5LFxuICAgIHRva2VuczogUmVnRXhwTWF0Y2hBcnJheVtdXG4gICkge1xuICAgIHdoaWxlICh0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY3VycmVudFRva2VuID0gZXhwZWN0KHRva2Vucy5zaGlmdCgpLCAnZXhwZWN0ZWQgdG9rZW4nKTtcblxuICAgICAgaWYgKGN1cnJlbnRUb2tlblswXSA9PT0gJ1xcbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHN0cmluZyBvciBhIHJlZ2V4LiBBbGwgdG9rZW5zIHdpdGhpbiBhIHN0cmluZyBvciByZWdleCBhcmUgaWdub3JlZFxuICAgKiBzaW5jZSB0aGVyZSBhcmUgbm8gZHluYW1pYyBzZWdtZW50cyB3aXRoaW4gdGhlc2UuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZU11bHRpTGluZUNvbW1lbnQoXG4gICAgX3Jlc3VsdHM6IFRlbXBsYXRlTWF0Y2hbXSxcbiAgICBfdGVtcGxhdGU6IHN0cmluZyxcbiAgICBfc3RhcnRUb2tlbjogUmVnRXhwTWF0Y2hBcnJheSxcbiAgICB0b2tlbnM6IFJlZ0V4cE1hdGNoQXJyYXlbXVxuICApIHtcbiAgICB3aGlsZSAodG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUb2tlbiA9IGV4cGVjdCh0b2tlbnMuc2hpZnQoKSwgJ2V4cGVjdGVkIHRva2VuJyk7XG5cbiAgICAgIGlmIChjdXJyZW50VG9rZW5bMF0gPT09ICcqLycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIHRlbXBsYXRlIGxpdGVyYWwuIElmIGEgZHluYW1pYyBzZWdtZW50IGlzIGZvdW5kLCBlbnRlcnMgdGhlIGR5bmFtaWNcbiAgICogc2VnbWVudCBhbmQgcGFyc2VzIGl0IHJlY3Vyc2l2ZWx5LiBJZiBubyBkeW5hbWljIHNlZ21lbnRzIGFyZSBmb3VuZCBhbmQgdGhlXG4gICAqIGxpdGVyYWwgaXMgdG9wIGxldmVsIChlLmcuIG5vdCBuZXN0ZWQgd2l0aGluIGEgZHluYW1pYyBzZWdtZW50KSBhbmQgaGFzIGFcbiAgICogdGFnLCBwdXNoZXMgaXQgaW50byB0aGUgbGlzdCBvZiByZXN1bHRzLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZUxpdGVyYWwoXG4gICAgcmVzdWx0czogVGVtcGxhdGVNYXRjaFtdLFxuICAgIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgc3RhcnRUb2tlbjogUmVnRXhwTWF0Y2hBcnJheSxcbiAgICB0b2tlbnM6IFJlZ0V4cE1hdGNoQXJyYXlbXSxcbiAgICBpc1RvcExldmVsID0gZmFsc2VcbiAgKSB7XG4gICAgbGV0IGhhc0R5bmFtaWNTZWdtZW50ID0gZmFsc2U7XG5cbiAgICB3aGlsZSAodG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBjdXJyZW50VG9rZW4gPSBleHBlY3QodG9rZW5zLnNoaWZ0KCksICdleHBlY3RlZCB0b2tlbicpO1xuXG4gICAgICBpZiAoaXNFc2NhcGVkKHRlbXBsYXRlLCBjdXJyZW50VG9rZW4uaW5kZXgpKSBjb250aW51ZTtcblxuICAgICAgaWYgKGN1cnJlbnRUb2tlblswXS5tYXRjaChkeW5hbWljU2VnbWVudFN0YXJ0KSkge1xuICAgICAgICBoYXNEeW5hbWljU2VnbWVudCA9IHRydWU7XG5cbiAgICAgICAgcGFyc2VEeW5hbWljU2VnbWVudChyZXN1bHRzLCB0ZW1wbGF0ZSwgY3VycmVudFRva2VuLCB0b2tlbnMpO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50VG9rZW5bMF0ubWF0Y2godGVtcGxhdGVMaXRlcmFsRW5kKSkge1xuICAgICAgICBpZiAoaXNUb3BMZXZlbCAmJiAhaGFzRHluYW1pY1NlZ21lbnQgJiYgc3RhcnRUb2tlblsxXT8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSBhIHRhZy1saWtlIHdhcyBtYXRjaGVkLCBlLmcuIGhic2BoZWxsb2BcbiAgICAgICAgICBpZiAoY3VycmVudFRva2VuWzBdLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuU3RyID0gY3VycmVudFRva2VuWzBdO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBleHBlY3QoY3VycmVudFRva2VuLmluZGV4LCAnZXhwZWN0ZWQgaW5kZXgnKTtcblxuICAgICAgICAgICAgY3VycmVudFRva2VuID0gWydgJ107XG4gICAgICAgICAgICBjdXJyZW50VG9rZW4uaW5kZXggPSBpbmRleCArIHRva2VuU3RyLmxlbmd0aCAtIDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZW1wbGF0ZS1saXRlcmFsJyxcbiAgICAgICAgICAgIHRhZ05hbWU6IHN0YXJ0VG9rZW5bMV0sXG4gICAgICAgICAgICBzdGFydDogc3RhcnRUb2tlbixcbiAgICAgICAgICAgIGVuZDogY3VycmVudFRva2VuLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYSBkeW5hbWljIHNlZ21lbnQgd2l0aGluIGEgdGVtcGxhdGUgbGl0ZXJhbC4gQ29udGludWVzIHBhcnNpbmcgdW50aWxcbiAgICogdGhlIGR5bmFtaWMgc2VnbWVudCBoYXMgYmVlbiBleGl0ZWQsIGlnbm9yaW5nIGFsbCB0b2tlbnMgd2l0aGluIGl0LlxuICAgKiBBY2NvdW50cyBmb3IgbmVzdGVkIGJsb2NrIHN0YXRlbWVudHMsIHN0cmluZ3MsIGFuZCB0ZW1wbGF0ZSBsaXRlcmFscy5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlRHluYW1pY1NlZ21lbnQoXG4gICAgcmVzdWx0czogVGVtcGxhdGVNYXRjaFtdLFxuICAgIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgX3N0YXJ0VG9rZW46IFJlZ0V4cE1hdGNoQXJyYXksXG4gICAgdG9rZW5zOiBSZWdFeHBNYXRjaEFycmF5W11cbiAgKSB7XG4gICAgbGV0IHN0YWNrID0gMTtcblxuICAgIHdoaWxlICh0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgY3VycmVudFRva2VuID0gZXhwZWN0KHRva2Vucy5zaGlmdCgpLCAnZXhwZWN0ZWQgdG9rZW4nKTtcblxuICAgICAgaWYgKGN1cnJlbnRUb2tlblswXS5tYXRjaChibG9ja1N0YXJ0KSkge1xuICAgICAgICBzdGFjaysrO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50VG9rZW5bMF0ubWF0Y2goZHluYW1pY1NlZ21lbnRFbmQpKSB7XG4gICAgICAgIHN0YWNrLS07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZVRva2VuKHJlc3VsdHMsIHRlbXBsYXRlLCBjdXJyZW50VG9rZW4sIHRva2Vucyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGFjayA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhIHRlbXBsYXRlIHRhZy4gQ29udGludWVzIHBhcnNpbmcgdW50aWwgdGhlIHRlbXBsYXRlIHRhZyBoYXMgY2xvc2VkLFxuICAgKiBhY2NvdW50aW5nIGZvciBuZXN0ZWQgdGVtcGxhdGUgdGFncy5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGVUYWcoXG4gICAgcmVzdWx0czogVGVtcGxhdGVNYXRjaFtdLFxuICAgIF90ZW1wbGF0ZTogc3RyaW5nLFxuICAgIHN0YXJ0VG9rZW46IFJlZ0V4cE1hdGNoQXJyYXksXG4gICAgdG9rZW5zOiBSZWdFeHBNYXRjaEFycmF5W11cbiAgKSB7XG4gICAgbGV0IHN0YWNrID0gMTtcblxuICAgIGlmIChhcmd1bWVudHNNYXRjaFJlZ2V4ICYmIHN0YXJ0VG9rZW5bMF0ubWF0Y2goYXJndW1lbnRzTWF0Y2hSZWdleCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYGVtYmVkZGVkIHRlbXBsYXRlIHByZXByb2Nlc3NpbmcgY3VycmVudGx5IGRvZXMgbm90IHN1cHBvcnQgcGFzc2luZyBhcmd1bWVudHMsIGZvdW5kIGFyZ3MgaW46ICR7cmVsYXRpdmVQYXRofWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBjdXJyZW50VG9rZW4gPSBleHBlY3QodG9rZW5zLnNoaWZ0KCksICdleHBlY3RlZCB0b2tlbicpO1xuXG4gICAgICBpZiAoY3VycmVudFRva2VuWzBdLm1hdGNoKHRlbXBsYXRlVGFnU3RhcnQpKSB7XG4gICAgICAgIHN0YWNrKys7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRUb2tlblswXS5tYXRjaCh0ZW1wbGF0ZVRhZ0VuZCkpIHtcbiAgICAgICAgc3RhY2stLTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YWNrID09PSAwKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh7IHR5cGU6ICd0ZW1wbGF0ZS10YWcnLCBzdGFydDogc3RhcnRUb2tlbiwgZW5kOiBjdXJyZW50VG9rZW4gfSk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIl19