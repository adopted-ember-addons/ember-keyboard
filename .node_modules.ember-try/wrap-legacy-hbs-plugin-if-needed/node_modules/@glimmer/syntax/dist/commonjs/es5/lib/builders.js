'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SYNTHETIC = undefined;
exports.isLocSexp = isLocSexp;
exports.isParamsSexp = isParamsSexp;
exports.isHashSexp = isHashSexp;
exports.normalizeModifier = normalizeModifier;
exports.normalizeAttr = normalizeAttr;
exports.normalizeHash = normalizeHash;
exports.normalizePath = normalizePath;
exports.normalizeElementOptions = normalizeElementOptions;

var _util = require('@glimmer/util');

function buildMustache(path, params, hash, raw, loc, strip) {
    if (typeof path === 'string') {
        path = buildPath(path);
    }
    return {
        type: 'MustacheStatement',
        path: path,
        params: params || [],
        hash: hash || buildHash([]),
        escaped: !raw,
        loc: buildLoc(loc || null),
        strip: strip || { open: false, close: false }
    };
}
function buildBlock(path, params, hash, _defaultBlock, _elseBlock, loc, openStrip, inverseStrip, closeStrip) {
    var defaultBlock = void 0;
    var elseBlock = void 0;
    if (_defaultBlock.type === 'Template') {
        if (false) {
            false && !false && (0, _util.deprecate)('b.program is deprecated. Use b.blockItself instead.');
        }
        defaultBlock = (0, _util.assign)({}, _defaultBlock, { type: 'Block' });
    } else {
        defaultBlock = _defaultBlock;
    }
    if (_elseBlock !== undefined && _elseBlock !== null && _elseBlock.type === 'Template') {
        if (false) {
            false && !false && (0, _util.deprecate)('b.program is deprecated. Use b.blockItself instead.');
        }
        elseBlock = (0, _util.assign)({}, _elseBlock, { type: 'Block' });
    } else {
        elseBlock = _elseBlock;
    }
    return {
        type: 'BlockStatement',
        path: buildPath(path),
        params: params || [],
        hash: hash || buildHash([]),
        program: defaultBlock || null,
        inverse: elseBlock || null,
        loc: buildLoc(loc || null),
        openStrip: openStrip || { open: false, close: false },
        inverseStrip: inverseStrip || { open: false, close: false },
        closeStrip: closeStrip || { open: false, close: false }
    };
}
function buildElementModifier(path, params, hash, loc) {
    return {
        type: 'ElementModifierStatement',
        path: buildPath(path),
        params: params || [],
        hash: hash || buildHash([]),
        loc: buildLoc(loc || null)
    };
}
function buildPartial(name, params, hash, indent, loc) {
    return {
        type: 'PartialStatement',
        name: name,
        params: params || [],
        hash: hash || buildHash([]),
        indent: indent || '',
        strip: { open: false, close: false },
        loc: buildLoc(loc || null)
    };
}
function buildComment(value, loc) {
    return {
        type: 'CommentStatement',
        value: value,
        loc: buildLoc(loc || null)
    };
}
function buildMustacheComment(value, loc) {
    return {
        type: 'MustacheCommentStatement',
        value: value,
        loc: buildLoc(loc || null)
    };
}
function buildConcat(parts, loc) {
    return {
        type: 'ConcatStatement',
        parts: parts || [],
        loc: buildLoc(loc || null)
    };
}
function isLocSexp(value) {
    return Array.isArray(value) && value.length === 2 && value[0] === 'loc';
}
function isParamsSexp(value) {
    return Array.isArray(value) && !isLocSexp(value);
}
function isHashSexp(value) {
    if (typeof value === 'object' && value && !Array.isArray(value)) {
        expectType(value);
        return true;
    } else {
        return false;
    }
}
function expectType(_input) {
    return;
}
function normalizeModifier(sexp) {
    if (typeof sexp === 'string') {
        return buildElementModifier(sexp);
    }
    var path = normalizePath(sexp[0]);
    var params = void 0;
    var hash = void 0;
    var loc = null;
    var parts = sexp.slice(1);
    var next = parts.shift();
    process: {
        if (isParamsSexp(next)) {
            params = next;
        } else {
            break process;
        }
        next = parts.shift();
        if (isHashSexp(next)) {
            hash = normalizeHash(next);
        } else {
            break process;
        }
    }
    if (isLocSexp(next)) {
        loc = next[1];
    }
    return buildElementModifier(path, params, hash, loc);
}
function normalizeAttr(sexp) {
    var name = sexp[0];
    var value = void 0;
    if (typeof sexp[1] === 'string') {
        value = buildText(sexp[1]);
    } else {
        value = sexp[1];
    }
    var loc = sexp[2] ? sexp[2][1] : undefined;
    return buildAttr(name, value, loc);
}
function normalizeHash(hash, loc) {
    var pairs = [];
    Object.keys(hash).forEach(function (key) {
        pairs.push(buildPair(key, hash[key]));
    });
    return buildHash(pairs, loc);
}
function normalizePath(path) {
    if (typeof path === 'string') {
        return buildPath(path);
    } else {
        return buildPath(path[1], path[2] && path[2][1]);
    }
}
function normalizeElementOptions() {
    var out = {};

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    for (var _iterator = args, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var arg = _ref;

        switch (arg[0]) {
            case 'attrs':
                {
                    var rest = arg.slice(1);

                    out.attrs = rest.map(normalizeAttr);
                    break;
                }
            case 'modifiers':
                {
                    var _rest = arg.slice(1);

                    out.modifiers = _rest.map(normalizeModifier);
                    break;
                }
            case 'body':
                {
                    var _rest2 = arg.slice(1);

                    out.children = _rest2;
                    break;
                }
            case 'comments':
                {
                    var _rest3 = arg.slice(1);

                    out.comments = _rest3;
                    break;
                }
            case 'as':
                {
                    var _rest4 = arg.slice(1);

                    out.blockParams = _rest4;
                    break;
                }
            case 'loc':
                {
                    var _rest5 = arg[1];

                    out.loc = _rest5;
                    break;
                }
        }
    }
    return out;
}
function buildElement(tag, options) {
    var normalized = void 0;
    if (Array.isArray(options)) {
        for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            rest[_key2 - 2] = arguments[_key2];
        }

        normalized = normalizeElementOptions.apply(undefined, [options].concat(rest));
    } else {
        normalized = options || {};
    }
    var _normalized = normalized,
        attrs = _normalized.attrs,
        blockParams = _normalized.blockParams,
        modifiers = _normalized.modifiers,
        comments = _normalized.comments,
        children = _normalized.children,
        loc = _normalized.loc;
    // this is used for backwards compat, prior to `selfClosing` being part of the ElementNode AST

    var selfClosing = false;
    if (typeof tag === 'object') {
        selfClosing = tag.selfClosing;
        tag = tag.name;
    } else {
        if (tag.slice(-1) === '/') {
            tag = tag.slice(0, -1);
            selfClosing = true;
        }
    }
    return {
        type: 'ElementNode',
        tag: tag || '',
        selfClosing: selfClosing,
        attributes: attrs || [],
        blockParams: blockParams || [],
        modifiers: modifiers || [],
        comments: comments || [],
        children: children || [],
        loc: buildLoc(loc || null)
    };
}
function buildAttr(name, value, loc) {
    return {
        type: 'AttrNode',
        name: name,
        value: value,
        loc: buildLoc(loc || null)
    };
}
function buildText(chars, loc) {
    return {
        type: 'TextNode',
        chars: chars || '',
        loc: buildLoc(loc || null)
    };
}
// Expressions
function buildSexpr(path, params, hash, loc) {
    return {
        type: 'SubExpression',
        path: buildPath(path),
        params: params || [],
        hash: hash || buildHash([]),
        loc: buildLoc(loc || null)
    };
}
function buildPath(original, loc) {
    if (typeof original !== 'string') return original;
    var parts = original.split('.');
    var thisHead = false;
    if (parts[0] === 'this') {
        thisHead = true;
        parts = parts.slice(1);
    }
    return {
        type: 'PathExpression',
        original: original,
        this: thisHead,
        parts: parts,
        data: false,
        loc: buildLoc(loc || null)
    };
}
function buildLiteral(type, value, loc) {
    return {
        type: type,
        value: value,
        original: value,
        loc: buildLoc(loc || null)
    };
}
// Miscellaneous
function buildHash(pairs, loc) {
    return {
        type: 'Hash',
        pairs: pairs || [],
        loc: buildLoc(loc || null)
    };
}
function buildPair(key, value, loc) {
    return {
        type: 'HashPair',
        key: key,
        value: value,
        loc: buildLoc(loc || null)
    };
}
function buildProgram(body, blockParams, loc) {
    return {
        type: 'Template',
        body: body || [],
        blockParams: blockParams || [],
        loc: buildLoc(loc || null)
    };
}
function buildBlockItself(body, blockParams) {
    var chained = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var loc = arguments[3];

    return {
        type: 'Block',
        body: body || [],
        blockParams: blockParams || [],
        chained: chained,
        loc: buildLoc(loc || null)
    };
}
function buildTemplate(body, blockParams, loc) {
    return {
        type: 'Template',
        body: body || [],
        blockParams: blockParams || [],
        loc: buildLoc(loc || null)
    };
}
function buildSource(source) {
    return source || null;
}
function buildPosition(line, column) {
    return {
        line: line,
        column: column
    };
}
var SYNTHETIC = exports.SYNTHETIC = {
    source: '(synthetic)',
    start: { line: 1, column: 0 },
    end: { line: 1, column: 0 }
};
function buildLoc() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    if (args.length === 1) {
        var loc = args[0];
        if (loc && typeof loc === 'object') {
            return {
                source: buildSource(loc.source),
                start: buildPosition(loc.start.line, loc.start.column),
                end: buildPosition(loc.end.line, loc.end.column)
            };
        } else {
            return SYNTHETIC;
        }
    } else {
        var startLine = args[0],
            startColumn = args[1],
            endLine = args[2],
            endColumn = args[3],
            source = args[4];

        return {
            source: buildSource(source),
            start: buildPosition(startLine, startColumn),
            end: buildPosition(endLine, endColumn)
        };
    }
}
exports.default = {
    mustache: buildMustache,
    block: buildBlock,
    partial: buildPartial,
    comment: buildComment,
    mustacheComment: buildMustacheComment,
    element: buildElement,
    elementModifier: buildElementModifier,
    attr: buildAttr,
    text: buildText,
    sexpr: buildSexpr,
    path: buildPath,
    concat: buildConcat,
    hash: buildHash,
    pair: buildPair,
    literal: buildLiteral,
    program: buildProgram,
    blockItself: buildBlockItself,
    template: buildTemplate,
    loc: buildLoc,
    pos: buildPosition,
    string: literal('StringLiteral'),
    boolean: literal('BooleanLiteral'),
    number: literal('NumberLiteral'),
    undefined: function (_undefined) {
        function undefined() {
            return _undefined.apply(this, arguments);
        }

        undefined.toString = function () {
            return _undefined.toString();
        };

        return undefined;
    }(function () {
        return buildLiteral('UndefinedLiteral', undefined);
    }),
    null: function _null() {
        return buildLiteral('NullLiteral', null);
    }
};

function literal(type) {
    return function (value) {
        return buildLiteral(type, value);
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvYnVpbGRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O1FBaUxNLFMsR0FBQSxTO1FBSUEsWSxHQUFBLFk7UUFJQSxVLEdBQUEsVTtRQWFBLGlCLEdBQUEsaUI7UUFvQ0EsYSxHQUFBLGE7UUFlQSxhLEdBQUEsYTtRQVVBLGEsR0FBQSxhO1FBUUEsdUIsR0FBQSx1Qjs7OztBQWhRTixTQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFNd0I7QUFFdEIsUUFBSSxPQUFBLElBQUEsS0FBSixRQUFBLEVBQThCO0FBQzVCLGVBQU8sVUFBUCxJQUFPLENBQVA7QUFDRDtBQUVELFdBQU87QUFDTCxjQURLLG1CQUFBO0FBQUEsY0FBQSxJQUFBO0FBR0wsZ0JBQVEsVUFISCxFQUFBO0FBSUwsY0FBTSxRQUFRLFVBSlQsRUFJUyxDQUpUO0FBS0wsaUJBQVMsQ0FMSixHQUFBO0FBTUwsYUFBSyxTQUFTLE9BTlQsSUFNQSxDQU5BO0FBT0wsZUFBTyxTQUFTLEVBQUUsTUFBRixLQUFBLEVBQWUsT0FBZixLQUFBO0FBUFgsS0FBUDtBQVNEO0FBRUQsU0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSxVQUFBLEVBUzZCO0FBRTNCLFFBQUEsZUFBQSxLQUFBLENBQUE7QUFDQSxRQUFBLFlBQUEsS0FBQSxDQUFBO0FBRUEsUUFBSSxjQUFBLElBQUEsS0FBSixVQUFBLEVBQXVDO0FBQ3JDLFlBQUEsS0FBQSxFQUFhO0FBQUEscUJBQUEsQ0FBQSxLQUFBLElBQUEscUJBQUEscURBQUEsQ0FBQTtBQUVaO0FBRUQsdUJBQWdCLGtCQUFBLEVBQUEsRUFBQSxhQUFBLEVBQTBCLEVBQUUsTUFBNUMsT0FBMEMsRUFBMUIsQ0FBaEI7QUFMRixLQUFBLE1BTU87QUFDTCx1QkFBQSxhQUFBO0FBQ0Q7QUFFRCxRQUFJLGVBQUEsU0FBQSxJQUE0QixlQUE1QixJQUFBLElBQW1ELFdBQUEsSUFBQSxLQUF2RCxVQUFBLEVBQXVGO0FBQ3JGLFlBQUEsS0FBQSxFQUFhO0FBQUEscUJBQUEsQ0FBQSxLQUFBLElBQUEscUJBQUEscURBQUEsQ0FBQTtBQUVaO0FBRUQsb0JBQWEsa0JBQUEsRUFBQSxFQUFBLFVBQUEsRUFBdUIsRUFBRSxNQUF0QyxPQUFvQyxFQUF2QixDQUFiO0FBTEYsS0FBQSxNQU1PO0FBQ0wsb0JBQUEsVUFBQTtBQUNEO0FBRUQsV0FBTztBQUNMLGNBREssZ0JBQUE7QUFFTCxjQUFNLFVBRkQsSUFFQyxDQUZEO0FBR0wsZ0JBQVEsVUFISCxFQUFBO0FBSUwsY0FBTSxRQUFRLFVBSlQsRUFJUyxDQUpUO0FBS0wsaUJBQVMsZ0JBTEosSUFBQTtBQU1MLGlCQUFTLGFBTkosSUFBQTtBQU9MLGFBQUssU0FBUyxPQVBULElBT0EsQ0FQQTtBQVFMLG1CQUFXLGFBQWEsRUFBRSxNQUFGLEtBQUEsRUFBZSxPQVJsQyxLQVFtQixFQVJuQjtBQVNMLHNCQUFjLGdCQUFnQixFQUFFLE1BQUYsS0FBQSxFQUFlLE9BVHhDLEtBU3lCLEVBVHpCO0FBVUwsb0JBQVksY0FBYyxFQUFFLE1BQUYsS0FBQSxFQUFlLE9BQWYsS0FBQTtBQVZyQixLQUFQO0FBWUQ7QUFFRCxTQUFBLG9CQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUlrQztBQUVoQyxXQUFPO0FBQ0wsY0FESywwQkFBQTtBQUVMLGNBQU0sVUFGRCxJQUVDLENBRkQ7QUFHTCxnQkFBUSxVQUhILEVBQUE7QUFJTCxjQUFNLFFBQVEsVUFKVCxFQUlTLENBSlQ7QUFLTCxhQUFLLFNBQVMsT0FBVCxJQUFBO0FBTEEsS0FBUDtBQU9EO0FBRUQsU0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFLMEI7QUFFeEIsV0FBTztBQUNMLGNBREssa0JBQUE7QUFFTCxjQUZLLElBQUE7QUFHTCxnQkFBUSxVQUhILEVBQUE7QUFJTCxjQUFNLFFBQVEsVUFKVCxFQUlTLENBSlQ7QUFLTCxnQkFBUSxVQUxILEVBQUE7QUFNTCxlQUFPLEVBQUUsTUFBRixLQUFBLEVBQWUsT0FOakIsS0FNRSxFQU5GO0FBT0wsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQVBBLEtBQVA7QUFTRDtBQUVELFNBQUEsWUFBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLEVBQTZEO0FBQzNELFdBQU87QUFDTCxjQURLLGtCQUFBO0FBRUwsZUFGSyxLQUFBO0FBR0wsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQUhBLEtBQVA7QUFLRDtBQUVELFNBQUEsb0JBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxFQUUwQjtBQUV4QixXQUFPO0FBQ0wsY0FESywwQkFBQTtBQUVMLGVBRkssS0FBQTtBQUdMLGFBQUssU0FBUyxPQUFULElBQUE7QUFIQSxLQUFQO0FBS0Q7QUFFRCxTQUFBLFdBQUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxFQUUwQjtBQUV4QixXQUFPO0FBQ0wsY0FESyxpQkFBQTtBQUVMLGVBQU8sU0FGRixFQUFBO0FBR0wsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQUhBLEtBQVA7QUFLRDtBQWtDSyxTQUFBLFNBQUEsQ0FBQSxLQUFBLEVBQW9DO0FBQ3hDLFdBQU8sTUFBQSxPQUFBLENBQUEsS0FBQSxLQUF3QixNQUFBLE1BQUEsS0FBeEIsQ0FBQSxJQUE4QyxNQUFBLENBQUEsTUFBckQsS0FBQTtBQUNEO0FBRUssU0FBQSxZQUFBLENBQUEsS0FBQSxFQUF1QztBQUMzQyxXQUFPLE1BQUEsT0FBQSxDQUFBLEtBQUEsS0FBd0IsQ0FBQyxVQUFoQyxLQUFnQyxDQUFoQztBQUNEO0FBRUssU0FBQSxVQUFBLENBQUEsS0FBQSxFQUFxQztBQUN6QyxRQUFJLE9BQUEsS0FBQSxLQUFBLFFBQUEsSUFBQSxLQUFBLElBQXNDLENBQUMsTUFBQSxPQUFBLENBQTNDLEtBQTJDLENBQTNDLEVBQWlFO0FBQy9ELG1CQUFBLEtBQUE7QUFDQSxlQUFBLElBQUE7QUFGRixLQUFBLE1BR087QUFDTCxlQUFBLEtBQUE7QUFDRDtBQUNGO0FBRUQsU0FBQSxVQUFBLENBQUEsTUFBQSxFQUFnQztBQUM5QjtBQUNEO0FBRUssU0FBQSxpQkFBQSxDQUFBLElBQUEsRUFBOEM7QUFDbEQsUUFBSSxPQUFBLElBQUEsS0FBSixRQUFBLEVBQThCO0FBQzVCLGVBQU8scUJBQVAsSUFBTyxDQUFQO0FBQ0Q7QUFFRCxRQUFJLE9BQTJCLGNBQWMsS0FBN0MsQ0FBNkMsQ0FBZCxDQUEvQjtBQUNBLFFBQUEsU0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsS0FBQSxDQUFBO0FBQ0EsUUFBSSxNQUFKLElBQUE7QUFFQSxRQUFJLFFBQVEsS0FBQSxLQUFBLENBQVosQ0FBWSxDQUFaO0FBQ0EsUUFBSSxPQUFPLE1BQVgsS0FBVyxFQUFYO0FBRUEsYUFBUztBQUNQLFlBQUksYUFBSixJQUFJLENBQUosRUFBd0I7QUFDdEIscUJBQUEsSUFBQTtBQURGLFNBQUEsTUFFTztBQUNMLGtCQUFBLE9BQUE7QUFDRDtBQUVELGVBQU8sTUFBUCxLQUFPLEVBQVA7QUFFQSxZQUFJLFdBQUosSUFBSSxDQUFKLEVBQXNCO0FBQ3BCLG1CQUFPLGNBQVAsSUFBTyxDQUFQO0FBREYsU0FBQSxNQUVPO0FBQ0wsa0JBQUEsT0FBQTtBQUNEO0FBQ0Y7QUFFRCxRQUFJLFVBQUosSUFBSSxDQUFKLEVBQXFCO0FBQ25CLGNBQU0sS0FBTixDQUFNLENBQU47QUFDRDtBQUVELFdBQU8scUJBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQVAsR0FBTyxDQUFQO0FBQ0Q7QUFFSyxTQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQXNDO0FBQzFDLFFBQUksT0FBTyxLQUFYLENBQVcsQ0FBWDtBQUNBLFFBQUEsUUFBQSxLQUFBLENBQUE7QUFFQSxRQUFJLE9BQU8sS0FBUCxDQUFPLENBQVAsS0FBSixRQUFBLEVBQWlDO0FBQy9CLGdCQUFRLFVBQVUsS0FBbEIsQ0FBa0IsQ0FBVixDQUFSO0FBREYsS0FBQSxNQUVPO0FBQ0wsZ0JBQVEsS0FBUixDQUFRLENBQVI7QUFDRDtBQUVELFFBQUksTUFBTSxLQUFBLENBQUEsSUFBVSxLQUFBLENBQUEsRUFBVixDQUFVLENBQVYsR0FBVixTQUFBO0FBRUEsV0FBTyxVQUFBLElBQUEsRUFBQSxLQUFBLEVBQVAsR0FBTyxDQUFQO0FBQ0Q7QUFFSyxTQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQUEsR0FBQSxFQUE0RTtBQUNoRixRQUFJLFFBQUosRUFBQTtBQUVBLFdBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxPQUFBLENBQTBCLFVBQUEsR0FBQSxFQUFNO0FBQzlCLGNBQUEsSUFBQSxDQUFXLFVBQUEsR0FBQSxFQUFlLEtBQTFCLEdBQTBCLENBQWYsQ0FBWDtBQURGLEtBQUE7QUFJQSxXQUFPLFVBQUEsS0FBQSxFQUFQLEdBQU8sQ0FBUDtBQUNEO0FBRUssU0FBQSxhQUFBLENBQUEsSUFBQSxFQUFzQztBQUMxQyxRQUFJLE9BQUEsSUFBQSxLQUFKLFFBQUEsRUFBOEI7QUFDNUIsZUFBTyxVQUFQLElBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLGVBQU8sVUFBVSxLQUFWLENBQVUsQ0FBVixFQUFtQixLQUFBLENBQUEsS0FBVyxLQUFBLENBQUEsRUFBckMsQ0FBcUMsQ0FBOUIsQ0FBUDtBQUNEO0FBQ0Y7QUFFSyxTQUFBLHVCQUFBLEdBQXdEO0FBQzVELFFBQUksTUFBSixFQUFBOztBQUQ0RCxTQUFBLElBQUEsT0FBQSxVQUFBLE1BQUEsRUFBeEQsT0FBd0QsTUFBQSxJQUFBLENBQUEsRUFBQSxPQUFBLENBQUEsRUFBQSxPQUFBLElBQUEsRUFBQSxNQUFBLEVBQUE7QUFBeEQsYUFBd0QsSUFBeEQsSUFBd0QsVUFBQSxJQUFBLENBQXhEO0FBQXdEOztBQUc1RCxTQUFBLElBQUEsWUFBQSxJQUFBLEVBQUEsV0FBQSxNQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsRUFBQSxZQUFBLFdBQUEsU0FBQSxHQUFBLFVBQUEsT0FBQSxRQUFBLEdBQUEsSUFBc0I7QUFBQSxZQUFBLElBQUE7O0FBQUEsWUFBQSxRQUFBLEVBQUE7QUFBQSxnQkFBQSxNQUFBLFVBQUEsTUFBQSxFQUFBO0FBQUEsbUJBQUEsVUFBQSxJQUFBLENBQUE7QUFBQSxTQUFBLE1BQUE7QUFBQSxpQkFBQSxVQUFBLElBQUEsRUFBQTtBQUFBLGdCQUFBLEdBQUEsSUFBQSxFQUFBO0FBQUEsbUJBQUEsR0FBQSxLQUFBO0FBQUE7O0FBQUEsWUFBdEIsTUFBc0IsSUFBQTs7QUFDcEIsZ0JBQVEsSUFBUixDQUFRLENBQVI7QUFDRSxpQkFBQSxPQUFBO0FBQWM7QUFBQSx3QkFBQSxPQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFWix3QkFBQSxLQUFBLEdBQVksS0FBQSxHQUFBLENBQVosYUFBWSxDQUFaO0FBQ0E7QUFDRDtBQUNELGlCQUFBLFdBQUE7QUFBa0I7QUFBQSx3QkFBQSxRQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFaEIsd0JBQUEsU0FBQSxHQUFnQixNQUFBLEdBQUEsQ0FBaEIsaUJBQWdCLENBQWhCO0FBQ0E7QUFDRDtBQUNELGlCQUFBLE1BQUE7QUFBYTtBQUFBLHdCQUFBLFNBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVYLHdCQUFBLFFBQUEsR0FBQSxNQUFBO0FBQ0E7QUFDRDtBQUNELGlCQUFBLFVBQUE7QUFBaUI7QUFBQSx3QkFBQSxTQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFHZix3QkFBQSxRQUFBLEdBQUEsTUFBQTtBQUNBO0FBQ0Q7QUFDRCxpQkFBQSxJQUFBO0FBQVc7QUFBQSx3QkFBQSxTQUFBLElBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFVCx3QkFBQSxXQUFBLEdBQUEsTUFBQTtBQUNBO0FBQ0Q7QUFDRCxpQkFBQSxLQUFBO0FBQVk7QUFBQSx3QkFBQSxTQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVWLHdCQUFBLEdBQUEsR0FBQSxNQUFBO0FBQ0E7QUFDRDtBQS9CSDtBQWlDRDtBQUVELFdBQUEsR0FBQTtBQUNEO0FBYUQsU0FBQSxZQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsRUFHd0I7QUFFdEIsUUFBQSxhQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUksTUFBQSxPQUFBLENBQUosT0FBSSxDQUFKLEVBQTRCO0FBQUEsYUFBQSxJQUFBLFFBQUEsVUFBQSxNQUFBLEVBTjlCLE9BTThCLE1BQUEsUUFBQSxDQUFBLEdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLEVBQUEsUUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0FBTjlCLGlCQU04QixRQUFBLENBTjlCLElBTThCLFVBQUEsS0FBQSxDQU45QjtBQU04Qjs7QUFDMUIscUJBQWEsd0JBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLENBQWIsSUFBYSxDQUFBLENBQWI7QUFERixLQUFBLE1BRU87QUFDTCxxQkFBYSxXQUFiLEVBQUE7QUFDRDtBQVBxQixRQUFBLGNBQUEsVUFBQTtBQUFBLFFBQUEsUUFBQSxZQUFBLEtBQUE7QUFBQSxRQUFBLGNBQUEsWUFBQSxXQUFBO0FBQUEsUUFBQSxZQUFBLFlBQUEsU0FBQTtBQUFBLFFBQUEsV0FBQSxZQUFBLFFBQUE7QUFBQSxRQUFBLFdBQUEsWUFBQSxRQUFBO0FBQUEsUUFBQSxNQUFBLFlBQUEsR0FBQTtBQVd0Qjs7QUFDQSxRQUFJLGNBQUosS0FBQTtBQUNBLFFBQUksT0FBQSxHQUFBLEtBQUosUUFBQSxFQUE2QjtBQUMzQixzQkFBYyxJQUFkLFdBQUE7QUFDQSxjQUFNLElBQU4sSUFBQTtBQUZGLEtBQUEsTUFHTztBQUNMLFlBQUksSUFBQSxLQUFBLENBQVUsQ0FBVixDQUFBLE1BQUosR0FBQSxFQUEyQjtBQUN6QixrQkFBTSxJQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQWEsQ0FBbkIsQ0FBTSxDQUFOO0FBQ0EsMEJBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxXQUFPO0FBQ0wsY0FESyxhQUFBO0FBRUwsYUFBSyxPQUZBLEVBQUE7QUFHTCxxQkFISyxXQUFBO0FBSUwsb0JBQVksU0FKUCxFQUFBO0FBS0wscUJBQWEsZUFMUixFQUFBO0FBTUwsbUJBQVcsYUFOTixFQUFBO0FBT0wsa0JBQVcsWUFQTixFQUFBO0FBUUwsa0JBQVUsWUFSTCxFQUFBO0FBU0wsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQVRBLEtBQVA7QUFXRDtBQUVELFNBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUcwQjtBQUV4QixXQUFPO0FBQ0wsY0FESyxVQUFBO0FBRUwsY0FGSyxJQUFBO0FBR0wsZUFISyxLQUFBO0FBSUwsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQUpBLEtBQVA7QUFNRDtBQUVELFNBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLEVBQTJEO0FBQ3pELFdBQU87QUFDTCxjQURLLFVBQUE7QUFFTCxlQUFPLFNBRkYsRUFBQTtBQUdMLGFBQUssU0FBUyxPQUFULElBQUE7QUFIQSxLQUFQO0FBS0Q7QUFFRDtBQUVBLFNBQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFJMEI7QUFFeEIsV0FBTztBQUNMLGNBREssZUFBQTtBQUVMLGNBQU0sVUFGRCxJQUVDLENBRkQ7QUFHTCxnQkFBUSxVQUhILEVBQUE7QUFJTCxjQUFNLFFBQVEsVUFKVCxFQUlTLENBSlQ7QUFLTCxhQUFLLFNBQVMsT0FBVCxJQUFBO0FBTEEsS0FBUDtBQU9EO0FBRUQsU0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsRUFBa0U7QUFDaEUsUUFBSSxPQUFBLFFBQUEsS0FBSixRQUFBLEVBQWtDLE9BQUEsUUFBQTtBQUVsQyxRQUFJLFFBQVEsU0FBQSxLQUFBLENBQVosR0FBWSxDQUFaO0FBQ0EsUUFBSSxXQUFKLEtBQUE7QUFFQSxRQUFJLE1BQUEsQ0FBQSxNQUFKLE1BQUEsRUFBeUI7QUFDdkIsbUJBQUEsSUFBQTtBQUNBLGdCQUFRLE1BQUEsS0FBQSxDQUFSLENBQVEsQ0FBUjtBQUNEO0FBRUQsV0FBTztBQUNMLGNBREssZ0JBQUE7QUFBQSxrQkFBQSxRQUFBO0FBR0wsY0FISyxRQUFBO0FBQUEsZUFBQSxLQUFBO0FBS0wsY0FMSyxLQUFBO0FBTUwsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQU5BLEtBQVA7QUFRRDtBQUVELFNBQUEsWUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsR0FBQSxFQUcwQjtBQUV4QixXQUFPO0FBQUEsY0FBQSxJQUFBO0FBQUEsZUFBQSxLQUFBO0FBR0wsa0JBSEssS0FBQTtBQUlMLGFBQUssU0FBUyxPQUFULElBQUE7QUFKQSxLQUFQO0FBTUQ7QUFFRDtBQUVBLFNBQUEsU0FBQSxDQUFBLEtBQUEsRUFBQSxHQUFBLEVBQW1FO0FBQ2pFLFdBQU87QUFDTCxjQURLLE1BQUE7QUFFTCxlQUFPLFNBRkYsRUFBQTtBQUdMLGFBQUssU0FBUyxPQUFULElBQUE7QUFIQSxLQUFQO0FBS0Q7QUFFRCxTQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBK0U7QUFDN0UsV0FBTztBQUNMLGNBREssVUFBQTtBQUVMLGFBRkssR0FBQTtBQUFBLGVBQUEsS0FBQTtBQUlMLGFBQUssU0FBUyxPQUFULElBQUE7QUFKQSxLQUFQO0FBTUQ7QUFFRCxTQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFHMEI7QUFFeEIsV0FBTztBQUNMLGNBREssVUFBQTtBQUVMLGNBQU0sUUFGRCxFQUFBO0FBR0wscUJBQWEsZUFIUixFQUFBO0FBSUwsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQUpBLEtBQVA7QUFNRDtBQUVELFNBQUEsZ0JBQUEsQ0FBQSxJQUFBLEVBQUEsV0FBQSxFQUkwQjtBQUFBLFFBRHhCLFVBQ3dCLFVBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxVQUFBLENBQUEsTUFBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLENBQUEsR0FKMUIsS0FJMEI7QUFBQSxRQUoxQixNQUkwQixVQUFBLENBQUEsQ0FBQTs7QUFFeEIsV0FBTztBQUNMLGNBREssT0FBQTtBQUVMLGNBQU0sUUFGRCxFQUFBO0FBR0wscUJBQWEsZUFIUixFQUFBO0FBQUEsaUJBQUEsT0FBQTtBQUtMLGFBQUssU0FBUyxPQUFULElBQUE7QUFMQSxLQUFQO0FBT0Q7QUFFRCxTQUFBLGFBQUEsQ0FBQSxJQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFHMEI7QUFFeEIsV0FBTztBQUNMLGNBREssVUFBQTtBQUVMLGNBQU0sUUFGRCxFQUFBO0FBR0wscUJBQWEsZUFIUixFQUFBO0FBSUwsYUFBSyxTQUFTLE9BQVQsSUFBQTtBQUpBLEtBQVA7QUFNRDtBQUVELFNBQUEsV0FBQSxDQUFBLE1BQUEsRUFBb0M7QUFDbEMsV0FBTyxVQUFQLElBQUE7QUFDRDtBQUVELFNBQUEsYUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLEVBQW1EO0FBQ2pELFdBQU87QUFBQSxjQUFBLElBQUE7QUFFTCxnQkFBQTtBQUZLLEtBQVA7QUFJRDtBQUVNLElBQU0sZ0NBQWdDO0FBQzNDLFlBRDJDLGFBQUE7QUFFM0MsV0FBTyxFQUFFLE1BQUYsQ0FBQSxFQUFXLFFBRnlCLENBRXBDLEVBRm9DO0FBRzNDLFNBQUssRUFBRSxNQUFGLENBQUEsRUFBVyxRQUFYLENBQUE7QUFIc0MsQ0FBdEM7QUFlUCxTQUFBLFFBQUEsR0FBZ0M7QUFBQSxTQUFBLElBQUEsUUFBQSxVQUFBLE1BQUEsRUFBaEMsT0FBZ0MsTUFBQSxLQUFBLENBQUEsRUFBQSxRQUFBLENBQUEsRUFBQSxRQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7QUFBaEMsYUFBZ0MsS0FBaEMsSUFBZ0MsVUFBQSxLQUFBLENBQWhDO0FBQWdDOztBQUM5QixRQUFJLEtBQUEsTUFBQSxLQUFKLENBQUEsRUFBdUI7QUFDckIsWUFBSSxNQUFNLEtBQVYsQ0FBVSxDQUFWO0FBRUEsWUFBSSxPQUFPLE9BQUEsR0FBQSxLQUFYLFFBQUEsRUFBb0M7QUFDbEMsbUJBQU87QUFDTCx3QkFBUSxZQUFZLElBRGYsTUFDRyxDQURIO0FBRUwsdUJBQU8sY0FBYyxJQUFBLEtBQUEsQ0FBZCxJQUFBLEVBQThCLElBQUEsS0FBQSxDQUZoQyxNQUVFLENBRkY7QUFHTCxxQkFBSyxjQUFjLElBQUEsR0FBQSxDQUFkLElBQUEsRUFBNEIsSUFBQSxHQUFBLENBQTVCLE1BQUE7QUFIQSxhQUFQO0FBREYsU0FBQSxNQU1PO0FBQ0wsbUJBQUEsU0FBQTtBQUNEO0FBWEgsS0FBQSxNQVlPO0FBQUEsWUFBQSxZQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxjQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxVQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxZQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQUEsWUFBQSxTQUFBLEtBQUEsQ0FBQSxDQUFBOztBQUVMLGVBQU87QUFDTCxvQkFBUSxZQURILE1BQ0csQ0FESDtBQUVMLG1CQUFPLGNBQUEsU0FBQSxFQUZGLFdBRUUsQ0FGRjtBQUdMLGlCQUFLLGNBQUEsT0FBQSxFQUFBLFNBQUE7QUFIQSxTQUFQO0FBS0Q7QUFDRjtrQkFFYztBQUNiLGNBRGEsYUFBQTtBQUViLFdBRmEsVUFBQTtBQUdiLGFBSGEsWUFBQTtBQUliLGFBSmEsWUFBQTtBQUtiLHFCQUxhLG9CQUFBO0FBTWIsYUFOYSxZQUFBO0FBT2IscUJBUGEsb0JBQUE7QUFRYixVQVJhLFNBQUE7QUFTYixVQVRhLFNBQUE7QUFVYixXQVZhLFVBQUE7QUFXYixVQVhhLFNBQUE7QUFZYixZQVphLFdBQUE7QUFhYixVQWJhLFNBQUE7QUFjYixVQWRhLFNBQUE7QUFlYixhQWZhLFlBQUE7QUFnQmIsYUFoQmEsWUFBQTtBQWlCYixpQkFqQmEsZ0JBQUE7QUFrQmIsY0FsQmEsYUFBQTtBQW1CYixTQW5CYSxRQUFBO0FBb0JiLFNBcEJhLGFBQUE7QUFzQmIsWUFBUSxRQXRCSyxlQXNCTCxDQXRCSztBQXVCYixhQUFTLFFBdkJJLGdCQXVCSixDQXZCSTtBQXdCYixZQUFRLFFBeEJLLGVBd0JMLENBeEJLO0FBQUEsZUFBQSxVQUFBLFVBQUEsRUFBQTtBQUFBLGlCQUFBLFNBQUEsR0FBQTtBQUFBLG1CQUFBLFdBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLENBQUE7QUFBQTs7QUFBQSxrQkFBQSxRQUFBLEdBQUEsWUFBQTtBQUFBLG1CQUFBLFdBQUEsUUFBQSxFQUFBO0FBQUEsU0FBQTs7QUFBQSxlQUFBLFNBQUE7QUFBQSxLQUFBLENBQUEsWUF5Qko7QUFDUCxlQUFPLGFBQUEsa0JBQUEsRUFBUCxTQUFPLENBQVA7QUExQlcsS0FBQSxDQUFBO0FBQUEsVUFBQSxTQUFBLEtBQUEsR0E0QlQ7QUFDRixlQUFPLGFBQUEsYUFBQSxFQUFQLElBQU8sQ0FBUDtBQUNEO0FBOUJZLEM7O0FBbUNmLFNBQUEsT0FBQSxDQUFBLElBQUEsRUFBdUQ7QUFDckQsV0FBTyxVQUFBLEtBQUEsRUFBMEI7QUFDL0IsZUFBTyxhQUFBLElBQUEsRUFBUCxLQUFPLENBQVA7QUFERixLQUFBO0FBR0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgeyBPcHRpb24sIERpY3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGRlcHJlY2F0ZSwgYXNzaWduIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBERVZNT0RFIH0gZnJvbSAnQGdsaW1tZXIvbG9jYWwtZGVidWctZmxhZ3MnO1xuaW1wb3J0IHsgU3RyaW5nTGl0ZXJhbCwgQm9vbGVhbkxpdGVyYWwsIE51bWJlckxpdGVyYWwgfSBmcm9tICcuL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcblxuLy8gU3RhdGVtZW50c1xuXG5leHBvcnQgdHlwZSBCdWlsZGVyUGF0aCA9IHN0cmluZyB8IEFTVC5QYXRoRXhwcmVzc2lvbjtcbmV4cG9ydCB0eXBlIFRhZ0Rlc2NyaXB0b3IgPSBzdHJpbmcgfCB7IG5hbWU6IHN0cmluZzsgc2VsZkNsb3Npbmc6IGJvb2xlYW4gfTtcblxuZnVuY3Rpb24gYnVpbGRNdXN0YWNoZShcbiAgcGF0aDogQnVpbGRlclBhdGggfCBBU1QuTGl0ZXJhbCxcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICByYXc/OiBib29sZWFuLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24sXG4gIHN0cmlwPzogQVNULlN0cmlwRmxhZ3Ncbik6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBwYXRoID0gYnVpbGRQYXRoKHBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnTXVzdGFjaGVTdGF0ZW1lbnQnLFxuICAgIHBhdGgsXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIGVzY2FwZWQ6ICFyYXcsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gICAgc3RyaXA6IHN0cmlwIHx8IHsgb3BlbjogZmFsc2UsIGNsb3NlOiBmYWxzZSB9LFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZEJsb2NrKFxuICBwYXRoOiBCdWlsZGVyUGF0aCxcbiAgcGFyYW1zOiBPcHRpb248QVNULkV4cHJlc3Npb25bXT4sXG4gIGhhc2g6IE9wdGlvbjxBU1QuSGFzaD4sXG4gIF9kZWZhdWx0QmxvY2s6IEFTVC5Qb3NzaWJseURlcHJlY2F0ZWRCbG9jayxcbiAgX2Vsc2VCbG9jaz86IE9wdGlvbjxBU1QuUG9zc2libHlEZXByZWNhdGVkQmxvY2s+LFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24sXG4gIG9wZW5TdHJpcD86IEFTVC5TdHJpcEZsYWdzLFxuICBpbnZlcnNlU3RyaXA/OiBBU1QuU3RyaXBGbGFncyxcbiAgY2xvc2VTdHJpcD86IEFTVC5TdHJpcEZsYWdzXG4pOiBBU1QuQmxvY2tTdGF0ZW1lbnQge1xuICBsZXQgZGVmYXVsdEJsb2NrOiBBU1QuQmxvY2s7XG4gIGxldCBlbHNlQmxvY2s6IE9wdGlvbjxBU1QuQmxvY2s+IHwgdW5kZWZpbmVkO1xuXG4gIGlmIChfZGVmYXVsdEJsb2NrLnR5cGUgPT09ICdUZW1wbGF0ZScpIHtcbiAgICBpZiAoREVWTU9ERSkge1xuICAgICAgZGVwcmVjYXRlKGBiLnByb2dyYW0gaXMgZGVwcmVjYXRlZC4gVXNlIGIuYmxvY2tJdHNlbGYgaW5zdGVhZC5gKTtcbiAgICB9XG5cbiAgICBkZWZhdWx0QmxvY2sgPSAoYXNzaWduKHt9LCBfZGVmYXVsdEJsb2NrLCB7IHR5cGU6ICdCbG9jaycgfSkgYXMgdW5rbm93bikgYXMgQVNULkJsb2NrO1xuICB9IGVsc2Uge1xuICAgIGRlZmF1bHRCbG9jayA9IF9kZWZhdWx0QmxvY2s7XG4gIH1cblxuICBpZiAoX2Vsc2VCbG9jayAhPT0gdW5kZWZpbmVkICYmIF9lbHNlQmxvY2sgIT09IG51bGwgJiYgX2Vsc2VCbG9jay50eXBlID09PSAnVGVtcGxhdGUnKSB7XG4gICAgaWYgKERFVk1PREUpIHtcbiAgICAgIGRlcHJlY2F0ZShgYi5wcm9ncmFtIGlzIGRlcHJlY2F0ZWQuIFVzZSBiLmJsb2NrSXRzZWxmIGluc3RlYWQuYCk7XG4gICAgfVxuXG4gICAgZWxzZUJsb2NrID0gKGFzc2lnbih7fSwgX2Vsc2VCbG9jaywgeyB0eXBlOiAnQmxvY2snIH0pIGFzIHVua25vd24pIGFzIEFTVC5CbG9jaztcbiAgfSBlbHNlIHtcbiAgICBlbHNlQmxvY2sgPSBfZWxzZUJsb2NrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQmxvY2tTdGF0ZW1lbnQnLFxuICAgIHBhdGg6IGJ1aWxkUGF0aChwYXRoKSxcbiAgICBwYXJhbXM6IHBhcmFtcyB8fCBbXSxcbiAgICBoYXNoOiBoYXNoIHx8IGJ1aWxkSGFzaChbXSksXG4gICAgcHJvZ3JhbTogZGVmYXVsdEJsb2NrIHx8IG51bGwsXG4gICAgaW52ZXJzZTogZWxzZUJsb2NrIHx8IG51bGwsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gICAgb3BlblN0cmlwOiBvcGVuU3RyaXAgfHwgeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgaW52ZXJzZVN0cmlwOiBpbnZlcnNlU3RyaXAgfHwgeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgY2xvc2VTdHJpcDogY2xvc2VTdHJpcCB8fCB7IG9wZW46IGZhbHNlLCBjbG9zZTogZmFsc2UgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50TW9kaWZpZXIoXG4gIHBhdGg6IEJ1aWxkZXJQYXRoLFxuICBwYXJhbXM/OiBBU1QuRXhwcmVzc2lvbltdLFxuICBoYXNoPzogQVNULkhhc2gsXG4gIGxvYz86IE9wdGlvbjxBU1QuU291cmNlTG9jYXRpb24+XG4pOiBBU1QuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50JyxcbiAgICBwYXRoOiBidWlsZFBhdGgocGF0aCksXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFBhcnRpYWwoXG4gIG5hbWU6IEFTVC5QYXRoRXhwcmVzc2lvbixcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICBpbmRlbnQ/OiBzdHJpbmcsXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULlBhcnRpYWxTdGF0ZW1lbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdQYXJ0aWFsU3RhdGVtZW50JyxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBpbmRlbnQ6IGluZGVudCB8fCAnJyxcbiAgICBzdHJpcDogeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29tbWVudCh2YWx1ZTogc3RyaW5nLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuQ29tbWVudFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0NvbW1lbnRTdGF0ZW1lbnQnLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRNdXN0YWNoZUNvbW1lbnQoXG4gIHZhbHVlOiBzdHJpbmcsXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ011c3RhY2hlQ29tbWVudFN0YXRlbWVudCcsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZENvbmNhdChcbiAgcGFydHM6IChBU1QuVGV4dE5vZGUgfCBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpW10sXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULkNvbmNhdFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0NvbmNhdFN0YXRlbWVudCcsXG4gICAgcGFydHM6IHBhcnRzIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG4vLyBOb2Rlc1xuXG5leHBvcnQgdHlwZSBFbGVtZW50QXJncyA9XG4gIHwgWydhdHRycycsIC4uLkF0dHJTZXhwW11dXG4gIHwgWydtb2RpZmllcnMnLCAuLi5Nb2RpZmllclNleHBbXV1cbiAgfCBbJ2JvZHknLCAuLi5BU1QuU3RhdGVtZW50W11dXG4gIHwgWydjb21tZW50cycsIC4uLkVsZW1lbnRDb21tZW50W11dXG4gIHwgWydhcycsIC4uLnN0cmluZ1tdXVxuICB8IFsnbG9jJywgQVNULlNvdXJjZUxvY2F0aW9uXTtcblxuZXhwb3J0IHR5cGUgUGF0aFNleHAgPSBzdHJpbmcgfCBbJ3BhdGgnLCBzdHJpbmcsIExvY1NleHA/XTtcblxuZXhwb3J0IHR5cGUgTW9kaWZpZXJTZXhwID1cbiAgfCBzdHJpbmdcbiAgfCBbUGF0aFNleHAsIExvY1NleHA/XVxuICB8IFtQYXRoU2V4cCwgQVNULkV4cHJlc3Npb25bXSwgTG9jU2V4cD9dXG4gIHwgW1BhdGhTZXhwLCBBU1QuRXhwcmVzc2lvbltdLCBEaWN0PEFTVC5FeHByZXNzaW9uPiwgTG9jU2V4cD9dO1xuXG5leHBvcnQgdHlwZSBBdHRyU2V4cCA9IFtzdHJpbmcsIEFTVC5BdHRyTm9kZVsndmFsdWUnXSB8IHN0cmluZywgTG9jU2V4cD9dO1xuXG5leHBvcnQgdHlwZSBMb2NTZXhwID0gWydsb2MnLCBBU1QuU291cmNlTG9jYXRpb25dO1xuXG5leHBvcnQgdHlwZSBFbGVtZW50Q29tbWVudCA9IEFTVC5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQgfCBBU1QuU291cmNlTG9jYXRpb24gfCBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIFNleHBWYWx1ZSA9XG4gIHwgc3RyaW5nXG4gIHwgQVNULkV4cHJlc3Npb25bXVxuICB8IERpY3Q8QVNULkV4cHJlc3Npb24+XG4gIHwgTG9jU2V4cFxuICB8IFBhdGhTZXhwXG4gIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNMb2NTZXhwKHZhbHVlOiBTZXhwVmFsdWUpOiB2YWx1ZSBpcyBMb2NTZXhwIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMiAmJiB2YWx1ZVswXSA9PT0gJ2xvYyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcmFtc1NleHAodmFsdWU6IFNleHBWYWx1ZSk6IHZhbHVlIGlzIEFTVC5FeHByZXNzaW9uW10ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgIWlzTG9jU2V4cCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hhc2hTZXhwKHZhbHVlOiBTZXhwVmFsdWUpOiB2YWx1ZSBpcyBEaWN0PEFTVC5FeHByZXNzaW9uPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGV4cGVjdFR5cGU8RGljdDxBU1QuRXhwcmVzc2lvbj4+KHZhbHVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXhwZWN0VHlwZTxUPihfaW5wdXQ6IFQpOiB2b2lkIHtcbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTW9kaWZpZXIoc2V4cDogTW9kaWZpZXJTZXhwKTogQVNULkVsZW1lbnRNb2RpZmllclN0YXRlbWVudCB7XG4gIGlmICh0eXBlb2Ygc2V4cCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYnVpbGRFbGVtZW50TW9kaWZpZXIoc2V4cCk7XG4gIH1cblxuICBsZXQgcGF0aDogQVNULlBhdGhFeHByZXNzaW9uID0gbm9ybWFsaXplUGF0aChzZXhwWzBdKTtcbiAgbGV0IHBhcmFtczogQVNULkV4cHJlc3Npb25bXSB8IHVuZGVmaW5lZDtcbiAgbGV0IGhhc2g6IEFTVC5IYXNoIHwgdW5kZWZpbmVkO1xuICBsZXQgbG9jOiBBU1QuU291cmNlTG9jYXRpb24gfCBudWxsID0gbnVsbDtcblxuICBsZXQgcGFydHMgPSBzZXhwLnNsaWNlKDEpO1xuICBsZXQgbmV4dCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgcHJvY2Vzczoge1xuICAgIGlmIChpc1BhcmFtc1NleHAobmV4dCkpIHtcbiAgICAgIHBhcmFtcyA9IG5leHQgYXMgQVNULkV4cHJlc3Npb25bXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWsgcHJvY2VzcztcbiAgICB9XG5cbiAgICBuZXh0ID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChpc0hhc2hTZXhwKG5leHQpKSB7XG4gICAgICBoYXNoID0gbm9ybWFsaXplSGFzaChuZXh0IGFzIERpY3Q8QVNULkV4cHJlc3Npb24+KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWsgcHJvY2VzcztcbiAgICB9XG4gIH1cblxuICBpZiAoaXNMb2NTZXhwKG5leHQpKSB7XG4gICAgbG9jID0gbmV4dFsxXTtcbiAgfVxuXG4gIHJldHVybiBidWlsZEVsZW1lbnRNb2RpZmllcihwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBdHRyKHNleHA6IEF0dHJTZXhwKTogQVNULkF0dHJOb2RlIHtcbiAgbGV0IG5hbWUgPSBzZXhwWzBdO1xuICBsZXQgdmFsdWU7XG5cbiAgaWYgKHR5cGVvZiBzZXhwWzFdID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gYnVpbGRUZXh0KHNleHBbMV0pO1xuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gc2V4cFsxXTtcbiAgfVxuXG4gIGxldCBsb2MgPSBzZXhwWzJdID8gc2V4cFsyXVsxXSA6IHVuZGVmaW5lZDtcblxuICByZXR1cm4gYnVpbGRBdHRyKG5hbWUsIHZhbHVlLCBsb2MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplSGFzaChoYXNoOiBEaWN0PEFTVC5FeHByZXNzaW9uPiwgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULkhhc2gge1xuICBsZXQgcGFpcnM6IEFTVC5IYXNoUGFpcltdID0gW107XG5cbiAgT2JqZWN0LmtleXMoaGFzaCkuZm9yRWFjaChrZXkgPT4ge1xuICAgIHBhaXJzLnB1c2goYnVpbGRQYWlyKGtleSwgaGFzaFtrZXldKSk7XG4gIH0pO1xuXG4gIHJldHVybiBidWlsZEhhc2gocGFpcnMsIGxvYyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHBhdGg6IFBhdGhTZXhwKTogQVNULlBhdGhFeHByZXNzaW9uIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBidWlsZFBhdGgocGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJ1aWxkUGF0aChwYXRoWzFdLCBwYXRoWzJdICYmIHBhdGhbMl1bMV0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVFbGVtZW50T3B0aW9ucyguLi5hcmdzOiBFbGVtZW50QXJnc1tdKTogQnVpbGRFbGVtZW50T3B0aW9ucyB7XG4gIGxldCBvdXQ6IEJ1aWxkRWxlbWVudE9wdGlvbnMgPSB7fTtcblxuICBmb3IgKGxldCBhcmcgb2YgYXJncykge1xuICAgIHN3aXRjaCAoYXJnWzBdKSB7XG4gICAgICBjYXNlICdhdHRycyc6IHtcbiAgICAgICAgbGV0IFssIC4uLnJlc3RdID0gYXJnO1xuICAgICAgICBvdXQuYXR0cnMgPSByZXN0Lm1hcChub3JtYWxpemVBdHRyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdtb2RpZmllcnMnOiB7XG4gICAgICAgIGxldCBbLCAuLi5yZXN0XSA9IGFyZztcbiAgICAgICAgb3V0Lm1vZGlmaWVycyA9IHJlc3QubWFwKG5vcm1hbGl6ZU1vZGlmaWVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdib2R5Jzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5jaGlsZHJlbiA9IHJlc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY29tbWVudHMnOiB7XG4gICAgICAgIGxldCBbLCAuLi5yZXN0XSA9IGFyZztcblxuICAgICAgICBvdXQuY29tbWVudHMgPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2FzJzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5ibG9ja1BhcmFtcyA9IHJlc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnbG9jJzoge1xuICAgICAgICBsZXQgWywgcmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5sb2MgPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkRWxlbWVudE9wdGlvbnMge1xuICBhdHRycz86IEFTVC5BdHRyTm9kZVtdO1xuICBtb2RpZmllcnM/OiBBU1QuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50W107XG4gIGNoaWxkcmVuPzogQVNULlN0YXRlbWVudFtdO1xuICBjb21tZW50cz86IEVsZW1lbnRDb21tZW50W107XG4gIGJsb2NrUGFyYW1zPzogc3RyaW5nW107XG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50KHRhZzogVGFnRGVzY3JpcHRvciwgb3B0aW9ucz86IEJ1aWxkRWxlbWVudE9wdGlvbnMpOiBBU1QuRWxlbWVudE5vZGU7XG5mdW5jdGlvbiBidWlsZEVsZW1lbnQodGFnOiBUYWdEZXNjcmlwdG9yLCAuLi5vcHRpb25zOiBFbGVtZW50QXJnc1tdKTogQVNULkVsZW1lbnROb2RlO1xuZnVuY3Rpb24gYnVpbGRFbGVtZW50KFxuICB0YWc6IFRhZ0Rlc2NyaXB0b3IsXG4gIG9wdGlvbnM/OiBCdWlsZEVsZW1lbnRPcHRpb25zIHwgRWxlbWVudEFyZ3MsXG4gIC4uLnJlc3Q6IEVsZW1lbnRBcmdzW11cbik6IEFTVC5FbGVtZW50Tm9kZSB7XG4gIGxldCBub3JtYWxpemVkOiBCdWlsZEVsZW1lbnRPcHRpb25zO1xuICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgIG5vcm1hbGl6ZWQgPSBub3JtYWxpemVFbGVtZW50T3B0aW9ucyhvcHRpb25zLCAuLi5yZXN0KTtcbiAgfSBlbHNlIHtcbiAgICBub3JtYWxpemVkID0gb3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIGxldCB7IGF0dHJzLCBibG9ja1BhcmFtcywgbW9kaWZpZXJzLCBjb21tZW50cywgY2hpbGRyZW4sIGxvYyB9ID0gbm9ybWFsaXplZDtcblxuICAvLyB0aGlzIGlzIHVzZWQgZm9yIGJhY2t3YXJkcyBjb21wYXQsIHByaW9yIHRvIGBzZWxmQ2xvc2luZ2AgYmVpbmcgcGFydCBvZiB0aGUgRWxlbWVudE5vZGUgQVNUXG4gIGxldCBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICBpZiAodHlwZW9mIHRhZyA9PT0gJ29iamVjdCcpIHtcbiAgICBzZWxmQ2xvc2luZyA9IHRhZy5zZWxmQ2xvc2luZztcbiAgICB0YWcgPSB0YWcubmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGFnLnNsaWNlKC0xKSA9PT0gJy8nKSB7XG4gICAgICB0YWcgPSB0YWcuc2xpY2UoMCwgLTEpO1xuICAgICAgc2VsZkNsb3NpbmcgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0VsZW1lbnROb2RlJyxcbiAgICB0YWc6IHRhZyB8fCAnJyxcbiAgICBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsXG4gICAgYXR0cmlidXRlczogYXR0cnMgfHwgW10sXG4gICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zIHx8IFtdLFxuICAgIG1vZGlmaWVyczogbW9kaWZpZXJzIHx8IFtdLFxuICAgIGNvbW1lbnRzOiAoY29tbWVudHMgYXMgQVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudFtdKSB8fCBbXSxcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4gfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXR0cihcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogQVNULkF0dHJOb2RlWyd2YWx1ZSddLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5BdHRyTm9kZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0F0dHJOb2RlJyxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRUZXh0KGNoYXJzPzogc3RyaW5nLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuVGV4dE5vZGUge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUZXh0Tm9kZScsXG4gICAgY2hhcnM6IGNoYXJzIHx8ICcnLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG4vLyBFeHByZXNzaW9uc1xuXG5mdW5jdGlvbiBidWlsZFNleHByKFxuICBwYXRoOiBCdWlsZGVyUGF0aCxcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5TdWJFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnU3ViRXhwcmVzc2lvbicsXG4gICAgcGF0aDogYnVpbGRQYXRoKHBhdGgpLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRQYXRoKG9yaWdpbmFsOiBCdWlsZGVyUGF0aCwgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULlBhdGhFeHByZXNzaW9uIHtcbiAgaWYgKHR5cGVvZiBvcmlnaW5hbCAhPT0gJ3N0cmluZycpIHJldHVybiBvcmlnaW5hbDtcblxuICBsZXQgcGFydHMgPSBvcmlnaW5hbC5zcGxpdCgnLicpO1xuICBsZXQgdGhpc0hlYWQgPSBmYWxzZTtcblxuICBpZiAocGFydHNbMF0gPT09ICd0aGlzJykge1xuICAgIHRoaXNIZWFkID0gdHJ1ZTtcbiAgICBwYXJ0cyA9IHBhcnRzLnNsaWNlKDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgIG9yaWdpbmFsLFxuICAgIHRoaXM6IHRoaXNIZWFkLFxuICAgIHBhcnRzLFxuICAgIGRhdGE6IGZhbHNlLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZExpdGVyYWw8VCBleHRlbmRzIEFTVC5MaXRlcmFsPihcbiAgdHlwZTogVFsndHlwZSddLFxuICB2YWx1ZTogVFsndmFsdWUnXSxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBUIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlLFxuICAgIHZhbHVlLFxuICAgIG9yaWdpbmFsOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfSBhcyBUO1xufVxuXG4vLyBNaXNjZWxsYW5lb3VzXG5cbmZ1bmN0aW9uIGJ1aWxkSGFzaChwYWlycz86IEFTVC5IYXNoUGFpcltdLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuSGFzaCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0hhc2gnLFxuICAgIHBhaXJzOiBwYWlycyB8fCBbXSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRQYWlyKGtleTogc3RyaW5nLCB2YWx1ZTogQVNULkV4cHJlc3Npb24sIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbik6IEFTVC5IYXNoUGFpciB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0hhc2hQYWlyJyxcbiAgICBrZXk6IGtleSxcbiAgICB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRQcm9ncmFtKFxuICBib2R5PzogQVNULlN0YXRlbWVudFtdLFxuICBibG9ja1BhcmFtcz86IHN0cmluZ1tdLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5UZW1wbGF0ZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1RlbXBsYXRlJyxcbiAgICBib2R5OiBib2R5IHx8IFtdLFxuICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyB8fCBbXSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRCbG9ja0l0c2VsZihcbiAgYm9keT86IEFTVC5TdGF0ZW1lbnRbXSxcbiAgYmxvY2tQYXJhbXM/OiBzdHJpbmdbXSxcbiAgY2hhaW5lZCA9IGZhbHNlLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5CbG9jayB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0Jsb2NrJyxcbiAgICBib2R5OiBib2R5IHx8IFtdLFxuICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyB8fCBbXSxcbiAgICBjaGFpbmVkLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFRlbXBsYXRlKFxuICBib2R5PzogQVNULlN0YXRlbWVudFtdLFxuICBibG9ja1BhcmFtcz86IHN0cmluZ1tdLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5UZW1wbGF0ZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1RlbXBsYXRlJyxcbiAgICBib2R5OiBib2R5IHx8IFtdLFxuICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyB8fCBbXSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRTb3VyY2Uoc291cmNlPzogc3RyaW5nKSB7XG4gIHJldHVybiBzb3VyY2UgfHwgbnVsbDtcbn1cblxuZnVuY3Rpb24gYnVpbGRQb3NpdGlvbihsaW5lOiBudW1iZXIsIGNvbHVtbjogbnVtYmVyKSB7XG4gIHJldHVybiB7XG4gICAgbGluZSxcbiAgICBjb2x1bW4sXG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBTWU5USEVUSUM6IEFTVC5Tb3VyY2VMb2NhdGlvbiA9IHtcbiAgc291cmNlOiAnKHN5bnRoZXRpYyknLFxuICBzdGFydDogeyBsaW5lOiAxLCBjb2x1bW46IDAgfSxcbiAgZW5kOiB7IGxpbmU6IDEsIGNvbHVtbjogMCB9LFxufTtcblxuZnVuY3Rpb24gYnVpbGRMb2MobG9jOiBPcHRpb248QVNULlNvdXJjZUxvY2F0aW9uPik6IEFTVC5Tb3VyY2VMb2NhdGlvbjtcbmZ1bmN0aW9uIGJ1aWxkTG9jKFxuICBzdGFydExpbmU6IG51bWJlcixcbiAgc3RhcnRDb2x1bW46IG51bWJlcixcbiAgZW5kTGluZT86IG51bWJlcixcbiAgZW5kQ29sdW1uPzogbnVtYmVyLFxuICBzb3VyY2U/OiBzdHJpbmdcbik6IEFTVC5Tb3VyY2VMb2NhdGlvbjtcblxuZnVuY3Rpb24gYnVpbGRMb2MoLi4uYXJnczogYW55W10pOiBBU1QuU291cmNlTG9jYXRpb24ge1xuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICBsZXQgbG9jID0gYXJnc1swXTtcblxuICAgIGlmIChsb2MgJiYgdHlwZW9mIGxvYyA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogYnVpbGRTb3VyY2UobG9jLnNvdXJjZSksXG4gICAgICAgIHN0YXJ0OiBidWlsZFBvc2l0aW9uKGxvYy5zdGFydC5saW5lLCBsb2Muc3RhcnQuY29sdW1uKSxcbiAgICAgICAgZW5kOiBidWlsZFBvc2l0aW9uKGxvYy5lbmQubGluZSwgbG9jLmVuZC5jb2x1bW4pLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFNZTlRIRVRJQztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IFtzdGFydExpbmUsIHN0YXJ0Q29sdW1uLCBlbmRMaW5lLCBlbmRDb2x1bW4sIHNvdXJjZV0gPSBhcmdzO1xuICAgIHJldHVybiB7XG4gICAgICBzb3VyY2U6IGJ1aWxkU291cmNlKHNvdXJjZSksXG4gICAgICBzdGFydDogYnVpbGRQb3NpdGlvbihzdGFydExpbmUsIHN0YXJ0Q29sdW1uKSxcbiAgICAgIGVuZDogYnVpbGRQb3NpdGlvbihlbmRMaW5lLCBlbmRDb2x1bW4pLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBtdXN0YWNoZTogYnVpbGRNdXN0YWNoZSxcbiAgYmxvY2s6IGJ1aWxkQmxvY2ssXG4gIHBhcnRpYWw6IGJ1aWxkUGFydGlhbCxcbiAgY29tbWVudDogYnVpbGRDb21tZW50LFxuICBtdXN0YWNoZUNvbW1lbnQ6IGJ1aWxkTXVzdGFjaGVDb21tZW50LFxuICBlbGVtZW50OiBidWlsZEVsZW1lbnQsXG4gIGVsZW1lbnRNb2RpZmllcjogYnVpbGRFbGVtZW50TW9kaWZpZXIsXG4gIGF0dHI6IGJ1aWxkQXR0cixcbiAgdGV4dDogYnVpbGRUZXh0LFxuICBzZXhwcjogYnVpbGRTZXhwcixcbiAgcGF0aDogYnVpbGRQYXRoLFxuICBjb25jYXQ6IGJ1aWxkQ29uY2F0LFxuICBoYXNoOiBidWlsZEhhc2gsXG4gIHBhaXI6IGJ1aWxkUGFpcixcbiAgbGl0ZXJhbDogYnVpbGRMaXRlcmFsLFxuICBwcm9ncmFtOiBidWlsZFByb2dyYW0sXG4gIGJsb2NrSXRzZWxmOiBidWlsZEJsb2NrSXRzZWxmLFxuICB0ZW1wbGF0ZTogYnVpbGRUZW1wbGF0ZSxcbiAgbG9jOiBidWlsZExvYyxcbiAgcG9zOiBidWlsZFBvc2l0aW9uLFxuXG4gIHN0cmluZzogbGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcpIGFzICh2YWx1ZTogc3RyaW5nKSA9PiBTdHJpbmdMaXRlcmFsLFxuICBib29sZWFuOiBsaXRlcmFsKCdCb29sZWFuTGl0ZXJhbCcpIGFzICh2YWx1ZTogYm9vbGVhbikgPT4gQm9vbGVhbkxpdGVyYWwsXG4gIG51bWJlcjogbGl0ZXJhbCgnTnVtYmVyTGl0ZXJhbCcpIGFzICh2YWx1ZTogbnVtYmVyKSA9PiBOdW1iZXJMaXRlcmFsLFxuICB1bmRlZmluZWQoKSB7XG4gICAgcmV0dXJuIGJ1aWxkTGl0ZXJhbCgnVW5kZWZpbmVkTGl0ZXJhbCcsIHVuZGVmaW5lZCk7XG4gIH0sXG4gIG51bGwoKSB7XG4gICAgcmV0dXJuIGJ1aWxkTGl0ZXJhbCgnTnVsbExpdGVyYWwnLCBudWxsKTtcbiAgfSxcbn07XG5cbnR5cGUgQnVpbGRMaXRlcmFsPFQgZXh0ZW5kcyBBU1QuTGl0ZXJhbD4gPSAodmFsdWU6IFRbJ3ZhbHVlJ10pID0+IFQ7XG5cbmZ1bmN0aW9uIGxpdGVyYWw8VCBleHRlbmRzIEFTVC5MaXRlcmFsPih0eXBlOiBUWyd0eXBlJ10pOiBCdWlsZExpdGVyYWw8VD4ge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWU6IFRbJ3ZhbHVlJ10pOiBUIHtcbiAgICByZXR1cm4gYnVpbGRMaXRlcmFsKHR5cGUsIHZhbHVlKTtcbiAgfTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=