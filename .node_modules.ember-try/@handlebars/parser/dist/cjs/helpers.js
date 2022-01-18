"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preparePartialBlock = exports.prepareProgram = exports.prepareBlock = exports.prepareRawBlock = exports.prepareMustache = exports.preparePath = exports.stripComment = exports.stripFlags = exports.id = exports.SourceLocation = void 0;
var exception_1 = __importDefault(require("./exception"));
function validateClose(open, close) {
    close = close.path ? close.path.original : close;
    if (open.path.original !== close) {
        var errorNode = { loc: open.path.loc };
        throw new exception_1.default(open.path.original + " doesn't match " + close, errorNode);
    }
}
function SourceLocation(source, locInfo) {
    this.source = source;
    this.start = {
        line: locInfo.first_line,
        column: locInfo.first_column
    };
    this.end = {
        line: locInfo.last_line,
        column: locInfo.last_column
    };
}
exports.SourceLocation = SourceLocation;
function id(token) {
    if (/^\[.*\]$/.test(token)) {
        return token.substring(1, token.length - 1);
    }
    else {
        return token;
    }
}
exports.id = id;
function stripFlags(open, close) {
    return {
        open: open.charAt(2) === '~',
        close: close.charAt(close.length - 3) === '~'
    };
}
exports.stripFlags = stripFlags;
function stripComment(comment) {
    return comment.replace(/^\{\{~?!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}
exports.stripComment = stripComment;
function preparePath(data, parts, loc) {
    loc = this.locInfo(loc);
    var original = data ? '@' : '', dig = [], depth = 0;
    for (var i = 0, l = parts.length; i < l; i++) {
        var part = parts[i].part, 
        // If we have [] syntax then we do not treat path references as operators,
        // i.e. foo.[this] resolves to approximately context.foo['this']
        isLiteral = parts[i].original !== part;
        original += (parts[i].separator || '') + part;
        if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
            if (dig.length > 0) {
                throw new exception_1.default('Invalid path: ' + original, { loc: loc });
            }
            else if (part === '..') {
                depth++;
            }
        }
        else {
            dig.push(part);
        }
    }
    return {
        type: 'PathExpression',
        data: data,
        depth: depth,
        parts: dig,
        original: original,
        loc: loc
    };
}
exports.preparePath = preparePath;
function prepareMustache(path, params, hash, open, strip, locInfo) {
    // Must use charAt to support IE pre-10
    var escapeFlag = open.charAt(3) || open.charAt(2), escaped = escapeFlag !== '{' && escapeFlag !== '&';
    var decorator = /\*/.test(open);
    return {
        type: decorator ? 'Decorator' : 'MustacheStatement',
        path: path,
        params: params,
        hash: hash,
        escaped: escaped,
        strip: strip,
        loc: this.locInfo(locInfo)
    };
}
exports.prepareMustache = prepareMustache;
function prepareRawBlock(openRawBlock, contents, close, locInfo) {
    validateClose(openRawBlock, close);
    locInfo = this.locInfo(locInfo);
    var program = {
        type: 'Program',
        body: contents,
        strip: {},
        loc: locInfo
    };
    return {
        type: 'BlockStatement',
        path: openRawBlock.path,
        params: openRawBlock.params,
        hash: openRawBlock.hash,
        program: program,
        openStrip: {},
        inverseStrip: {},
        closeStrip: {},
        loc: locInfo
    };
}
exports.prepareRawBlock = prepareRawBlock;
function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
    if (close && close.path) {
        validateClose(openBlock, close);
    }
    var decorator = /\*/.test(openBlock.open);
    program.blockParams = openBlock.blockParams;
    var inverse, inverseStrip;
    if (inverseAndProgram) {
        if (decorator) {
            throw new exception_1.default('Unexpected inverse block on decorator', inverseAndProgram);
        }
        if (inverseAndProgram.chain) {
            inverseAndProgram.program.body[0].closeStrip = close.strip;
        }
        inverseStrip = inverseAndProgram.strip;
        inverse = inverseAndProgram.program;
    }
    if (inverted) {
        inverted = inverse;
        inverse = program;
        program = inverted;
    }
    return {
        type: decorator ? 'DecoratorBlock' : 'BlockStatement',
        path: openBlock.path,
        params: openBlock.params,
        hash: openBlock.hash,
        program: program,
        inverse: inverse,
        openStrip: openBlock.strip,
        inverseStrip: inverseStrip,
        closeStrip: close && close.strip,
        loc: this.locInfo(locInfo)
    };
}
exports.prepareBlock = prepareBlock;
function prepareProgram(statements, loc) {
    if (!loc && statements.length) {
        var firstLoc = statements[0].loc, lastLoc = statements[statements.length - 1].loc;
        /* istanbul ignore else */
        if (firstLoc && lastLoc) {
            loc = {
                source: firstLoc.source,
                start: {
                    line: firstLoc.start.line,
                    column: firstLoc.start.column
                },
                end: {
                    line: lastLoc.end.line,
                    column: lastLoc.end.column
                }
            };
        }
    }
    return {
        type: 'Program',
        body: statements,
        strip: {},
        loc: loc
    };
}
exports.prepareProgram = prepareProgram;
function preparePartialBlock(open, program, close, locInfo) {
    validateClose(open, close);
    return {
        type: 'PartialBlockStatement',
        name: open.path,
        params: open.params,
        hash: open.hash,
        program: program,
        openStrip: open.strip,
        closeStrip: close && close.strip,
        loc: this.locInfo(locInfo)
    };
}
exports.preparePartialBlock = preparePartialBlock;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDBEQUFvQztBQUVwQyxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSztJQUNoQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUVqRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssRUFBRTtRQUNoQyxJQUFJLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXZDLE1BQU0sSUFBSSxtQkFBUyxDQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBaUIsR0FBRyxLQUFLLEVBQzlDLFNBQVMsQ0FDVixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLE1BQU0sRUFBRSxPQUFPO0lBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDWCxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVU7UUFDeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZO0tBQzdCLENBQUM7SUFDRixJQUFJLENBQUMsR0FBRyxHQUFHO1FBQ1QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTO1FBQ3ZCLE1BQU0sRUFBRSxPQUFPLENBQUMsV0FBVztLQUM1QixDQUFDO0FBQ0osQ0FBQztBQVZELHdDQVVDO0FBRUQsU0FBZ0IsRUFBRSxDQUFDLEtBQUs7SUFDdEIsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzFCLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFD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SyxJQUFJLEtBQUssQ0FBQyxLQUFLO1FBQ2hDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztLQUMzQixDQUFDO0FBQ0osQ0FBQztBQWJELGtEQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4Y2VwdGlvbiBmcm9tICcuL2V4Y2VwdGlvbic7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQ2xvc2Uob3BlbiwgY2xvc2UpIHtcbiAgY2xvc2UgPSBjbG9zZS5wYXRoID8gY2xvc2UucGF0aC5vcmlnaW5hbCA6IGNsb3NlO1xuXG4gIGlmIChvcGVuLnBhdGgub3JpZ2luYWwgIT09IGNsb3NlKSB7XG4gICAgbGV0IGVycm9yTm9kZSA9IHsgbG9jOiBvcGVuLnBhdGgubG9jIH07XG5cbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFxuICAgICAgb3Blbi5wYXRoLm9yaWdpbmFsICsgXCIgZG9lc24ndCBtYXRjaCBcIiArIGNsb3NlLFxuICAgICAgZXJyb3JOb2RlXG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU291cmNlTG9jYXRpb24oc291cmNlLCBsb2NJbmZvKSB7XG4gIHRoaXMuc291cmNlID0gc291cmNlO1xuICB0aGlzLnN0YXJ0ID0ge1xuICAgIGxpbmU6IGxvY0luZm8uZmlyc3RfbGluZSxcbiAgICBjb2x1bW46IGxvY0luZm8uZmlyc3RfY29sdW1uXG4gIH07XG4gIHRoaXMuZW5kID0ge1xuICAgIGxpbmU6IGxvY0luZm8ubGFzdF9saW5lLFxuICAgIGNvbHVtbjogbG9jSW5mby5sYXN0X2NvbHVtblxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaWQodG9rZW4pIHtcbiAgaWYgKC9eXFxbLipcXF0kLy50ZXN0KHRva2VuKSkge1xuICAgIHJldHVybiB0b2tlbi5zdWJzdHJpbmcoMSwgdG9rZW4ubGVuZ3RoIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpcEZsYWdzKG9wZW4sIGNsb3NlKSB7XG4gIHJldHVybiB7XG4gICAgb3Blbjogb3Blbi5jaGFyQXQoMikgPT09ICd+JyxcbiAgICBjbG9zZTogY2xvc2UuY2hhckF0KGNsb3NlLmxlbmd0aCAtIDMpID09PSAnfidcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwQ29tbWVudChjb21tZW50KSB7XG4gIHJldHVybiBjb21tZW50LnJlcGxhY2UoL15cXHtcXHt+PyEtPy0/LywgJycpLnJlcGxhY2UoLy0/LT9+P1xcfVxcfSQvLCAnJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlUGF0aChkYXRhLCBwYXJ0cywgbG9jKSB7XG4gIGxvYyA9IHRoaXMubG9jSW5mbyhsb2MpO1xuXG4gIGxldCBvcmlnaW5hbCA9IGRhdGEgPyAnQCcgOiAnJyxcbiAgICBkaWcgPSBbXSxcbiAgICBkZXB0aCA9IDA7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSBwYXJ0cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBsZXQgcGFydCA9IHBhcnRzW2ldLnBhcnQsXG4gICAgICAvLyBJZiB3ZSBoYXZlIFtdIHN5bnRheCB0aGVuIHdlIGRvIG5vdCB0cmVhdCBwYXRoIHJlZmVyZW5jZXMgYXMgb3BlcmF0b3JzLFxuICAgICAgLy8gaS5lLiBmb28uW3RoaXNdIHJlc29sdmVzIHRvIGFwcHJveGltYXRlbHkgY29udGV4dC5mb29bJ3RoaXMnXVxuICAgICAgaXNMaXRlcmFsID0gcGFydHNbaV0ub3JpZ2luYWwgIT09IHBhcnQ7XG4gICAgb3JpZ2luYWwgKz0gKHBhcnRzW2ldLnNlcGFyYXRvciB8fCAnJykgKyBwYXJ0O1xuXG4gICAgaWYgKCFpc0xpdGVyYWwgJiYgKHBhcnQgPT09ICcuLicgfHwgcGFydCA9PT0gJy4nIHx8IHBhcnQgPT09ICd0aGlzJykpIHtcbiAgICAgIGlmIChkaWcubGVuZ3RoID4gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKCdJbnZhbGlkIHBhdGg6ICcgKyBvcmlnaW5hbCwgeyBsb2MgfSk7XG4gICAgICB9IGVsc2UgaWYgKHBhcnQgPT09ICcuLicpIHtcbiAgICAgICAgZGVwdGgrKztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGlnLnB1c2gocGFydCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgIGRhdGEsXG4gICAgZGVwdGgsXG4gICAgcGFydHM6IGRpZyxcbiAgICBvcmlnaW5hbCxcbiAgICBsb2NcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVNdXN0YWNoZShwYXRoLCBwYXJhbXMsIGhhc2gsIG9wZW4sIHN0cmlwLCBsb2NJbmZvKSB7XG4gIC8vIE11c3QgdXNlIGNoYXJBdCB0byBzdXBwb3J0IElFIHByZS0xMFxuICBsZXQgZXNjYXBlRmxhZyA9IG9wZW4uY2hhckF0KDMpIHx8IG9wZW4uY2hhckF0KDIpLFxuICAgIGVzY2FwZWQgPSBlc2NhcGVGbGFnICE9PSAneycgJiYgZXNjYXBlRmxhZyAhPT0gJyYnO1xuXG4gIGxldCBkZWNvcmF0b3IgPSAvXFwqLy50ZXN0KG9wZW4pO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IGRlY29yYXRvciA/ICdEZWNvcmF0b3InIDogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICBwYXRoLFxuICAgIHBhcmFtcyxcbiAgICBoYXNoLFxuICAgIGVzY2FwZWQsXG4gICAgc3RyaXAsXG4gICAgbG9jOiB0aGlzLmxvY0luZm8obG9jSW5mbylcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVSYXdCbG9jayhvcGVuUmF3QmxvY2ssIGNvbnRlbnRzLCBjbG9zZSwgbG9jSW5mbykge1xuICB2YWxpZGF0ZUNsb3NlKG9wZW5SYXdCbG9jaywgY2xvc2UpO1xuXG4gIGxvY0luZm8gPSB0aGlzLmxvY0luZm8obG9jSW5mbyk7XG4gIGxldCBwcm9ncmFtID0ge1xuICAgIHR5cGU6ICdQcm9ncmFtJyxcbiAgICBib2R5OiBjb250ZW50cyxcbiAgICBzdHJpcDoge30sXG4gICAgbG9jOiBsb2NJbmZvXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQmxvY2tTdGF0ZW1lbnQnLFxuICAgIHBhdGg6IG9wZW5SYXdCbG9jay5wYXRoLFxuICAgIHBhcmFtczogb3BlblJhd0Jsb2NrLnBhcmFtcyxcbiAgICBoYXNoOiBvcGVuUmF3QmxvY2suaGFzaCxcbiAgICBwcm9ncmFtLFxuICAgIG9wZW5TdHJpcDoge30sXG4gICAgaW52ZXJzZVN0cmlwOiB7fSxcbiAgICBjbG9zZVN0cmlwOiB7fSxcbiAgICBsb2M6IGxvY0luZm9cbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVCbG9jayhcbiAgb3BlbkJsb2NrLFxuICBwcm9ncmFtLFxuICBpbnZlcnNlQW5kUHJvZ3JhbSxcbiAgY2xvc2UsXG4gIGludmVydGVkLFxuICBsb2NJbmZvXG4pIHtcbiAgaWYgKGNsb3NlICYmIGNsb3NlLnBhdGgpIHtcbiAgICB2YWxpZGF0ZUNsb3NlKG9wZW5CbG9jaywgY2xvc2UpO1xuICB9XG5cbiAgbGV0IGRlY29yYXRvciA9IC9cXCovLnRlc3Qob3BlbkJsb2NrLm9wZW4pO1xuXG4gIHByb2dyYW0uYmxvY2tQYXJhbXMgPSBvcGVuQmxvY2suYmxvY2tQYXJhbXM7XG5cbiAgbGV0IGludmVyc2UsIGludmVyc2VTdHJpcDtcblxuICBpZiAoaW52ZXJzZUFuZFByb2dyYW0pIHtcbiAgICBpZiAoZGVjb3JhdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFxuICAgICAgICAnVW5leHBlY3RlZCBpbnZlcnNlIGJsb2NrIG9uIGRlY29yYXRvcicsXG4gICAgICAgIGludmVyc2VBbmRQcm9ncmFtXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChpbnZlcnNlQW5kUHJvZ3JhbS5jaGFpbikge1xuICAgICAgaW52ZXJzZUFuZFByb2dyYW0ucHJvZ3JhbS5ib2R5WzBdLmNsb3NlU3RyaXAgPSBjbG9zZS5zdHJpcDtcbiAgICB9XG5cbiAgICBpbnZlcnNlU3RyaXAgPSBpbnZlcnNlQW5kUHJvZ3JhbS5zdHJpcDtcbiAgICBpbnZlcnNlID0gaW52ZXJzZUFuZFByb2dyYW0ucHJvZ3JhbTtcbiAgfVxuXG4gIGlmIChpbnZlcnRlZCkge1xuICAgIGludmVydGVkID0gaW52ZXJzZTtcbiAgICBpbnZlcnNlID0gcHJvZ3JhbTtcbiAgICBwcm9ncmFtID0gaW52ZXJ0ZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IGRlY29yYXRvciA/ICdEZWNvcmF0b3JCbG9jaycgOiAnQmxvY2tTdGF0ZW1lbnQnLFxuICAgIHBhdGg6IG9wZW5CbG9jay5wYXRoLFxuICAgIHBhcmFtczogb3BlbkJsb2NrLnBhcmFtcyxcbiAgICBoYXNoOiBvcGVuQmxvY2suaGFzaCxcbiAgICBwcm9ncmFtLFxuICAgIGludmVyc2UsXG4gICAgb3BlblN0cmlwOiBvcGVuQmxvY2suc3RyaXAsXG4gICAgaW52ZXJzZVN0cmlwLFxuICAgIGNsb3NlU3RyaXA6IGNsb3NlICYmIGNsb3NlLnN0cmlwLFxuICAgIGxvYzogdGhpcy5sb2NJbmZvKGxvY0luZm8pXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlUHJvZ3JhbShzdGF0ZW1lbnRzLCBsb2MpIHtcbiAgaWYgKCFsb2MgJiYgc3RhdGVtZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCBmaXJzdExvYyA9IHN0YXRlbWVudHNbMF0ubG9jLFxuICAgICAgbGFzdExvYyA9IHN0YXRlbWVudHNbc3RhdGVtZW50cy5sZW5ndGggLSAxXS5sb2M7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChmaXJzdExvYyAmJiBsYXN0TG9jKSB7XG4gICAgICBsb2MgPSB7XG4gICAgICAgIHNvdXJjZTogZmlyc3RMb2Muc291cmNlLFxuICAgICAgICBzdGFydDoge1xuICAgICAgICAgIGxpbmU6IGZpcnN0TG9jLnN0YXJ0LmxpbmUsXG4gICAgICAgICAgY29sdW1uOiBmaXJzdExvYy5zdGFydC5jb2x1bW5cbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiB7XG4gICAgICAgICAgbGluZTogbGFzdExvYy5lbmQubGluZSxcbiAgICAgICAgICBjb2x1bW46IGxhc3RMb2MuZW5kLmNvbHVtblxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1Byb2dyYW0nLFxuICAgIGJvZHk6IHN0YXRlbWVudHMsXG4gICAgc3RyaXA6IHt9LFxuICAgIGxvYzogbG9jXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlUGFydGlhbEJsb2NrKG9wZW4sIHByb2dyYW0sIGNsb3NlLCBsb2NJbmZvKSB7XG4gIHZhbGlkYXRlQ2xvc2Uob3BlbiwgY2xvc2UpO1xuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1BhcnRpYWxCbG9ja1N0YXRlbWVudCcsXG4gICAgbmFtZTogb3Blbi5wYXRoLFxuICAgIHBhcmFtczogb3Blbi5wYXJhbXMsXG4gICAgaGFzaDogb3Blbi5oYXNoLFxuICAgIHByb2dyYW0sXG4gICAgb3BlblN0cmlwOiBvcGVuLnN0cmlwLFxuICAgIGNsb3NlU3RyaXA6IGNsb3NlICYmIGNsb3NlLnN0cmlwLFxuICAgIGxvYzogdGhpcy5sb2NJbmZvKGxvY0luZm8pXG4gIH07XG59XG4iXX0=