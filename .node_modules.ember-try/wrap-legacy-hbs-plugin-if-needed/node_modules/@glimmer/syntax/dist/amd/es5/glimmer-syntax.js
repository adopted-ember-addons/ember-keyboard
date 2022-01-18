define('@glimmer/syntax', ['exports', '@glimmer/util', 'simple-html-tokenizer', 'handlebars'], function (exports, util, simpleHtmlTokenizer, handlebars) { 'use strict';

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
            defaultBlock = util.assign({}, _defaultBlock, { type: 'Block' });
        } else {
            defaultBlock = _defaultBlock;
        }
        if (_elseBlock !== undefined && _elseBlock !== null && _elseBlock.type === 'Template') {
            elseBlock = util.assign({}, _elseBlock, { type: 'Block' });
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
            return true;
        } else {
            return false;
        }
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
    var SYNTHETIC = {
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
    var b = {
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

    /**
     * Subclass of `Error` with additional information
     * about location of incorrect markup.
     */
    var SyntaxError = function () {
        SyntaxError.prototype = Object.create(Error.prototype);
        SyntaxError.prototype.constructor = SyntaxError;
        function SyntaxError(message, location) {
            var error = Error.call(this, message);
            this.message = message;
            this.stack = error.stack;
            this.location = location;
        }
        return SyntaxError;
    }();

    // Regex to validate the identifier for block parameters.
    // Based on the ID validation regex in Handlebars.
    var ID_INVERSE_PATTERN = /[!"#%-,\.\/;->@\[-\^`\{-~]/;
    // Checks the element's attributes to see if it uses block params.
    // If it does, registers the block params with the program and
    // removes the corresponding attributes from the element.
    function parseElementBlockParams(element) {
        var params = parseBlockParams(element);
        if (params) element.blockParams = params;
    }
    function parseBlockParams(element) {
        var l = element.attributes.length;
        var attrNames = [];
        for (var i = 0; i < l; i++) {
            attrNames.push(element.attributes[i].name);
        }
        var asIndex = attrNames.indexOf('as');
        if (asIndex !== -1 && l > asIndex && attrNames[asIndex + 1].charAt(0) === '|') {
            // Some basic validation, since we're doing the parsing ourselves
            var paramsString = attrNames.slice(asIndex).join(' ');
            if (paramsString.charAt(paramsString.length - 1) !== '|' || paramsString.match(/\|/g).length !== 2) {
                throw new SyntaxError("Invalid block parameters syntax: '" + paramsString + "'", element.loc);
            }
            var params = [];
            for (var _i = asIndex + 1; _i < l; _i++) {
                var param = attrNames[_i].replace(/\|/g, '');
                if (param !== '') {
                    if (ID_INVERSE_PATTERN.test(param)) {
                        throw new SyntaxError("Invalid identifier for block parameters: '" + param + "' in '" + paramsString + "'", element.loc);
                    }
                    params.push(param);
                }
            }
            if (params.length === 0) {
                throw new SyntaxError("Cannot use zero block parameters: '" + paramsString + "'", element.loc);
            }
            element.attributes = element.attributes.slice(0, asIndex);
            return params;
        }
        return null;
    }
    function childrenFor(node) {
        switch (node.type) {
            case 'Block':
            case 'Template':
                return node.body;
            case 'ElementNode':
                return node.children;
        }
    }
    function appendChild(parent, node) {
        childrenFor(parent).push(node);
    }
    function isLiteral(path) {
        return path.type === 'StringLiteral' || path.type === 'BooleanLiteral' || path.type === 'NumberLiteral' || path.type === 'NullLiteral' || path.type === 'UndefinedLiteral';
    }
    function printLiteral(literal) {
        if (literal.type === 'UndefinedLiteral') {
            return 'undefined';
        } else {
            return JSON.stringify(literal.value);
        }
    }

    var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
    var Parser = function () {
        function Parser(source) {
            var entityParser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new simpleHtmlTokenizer.EntityParser(simpleHtmlTokenizer.HTML5NamedCharRefs);

            _classCallCheck(this, Parser);

            this.elementStack = [];
            this.currentAttribute = null;
            this.currentNode = null;
            this.source = source.split(/(?:\r\n?|\n)/g);
            this.tokenizer = new simpleHtmlTokenizer.EventedTokenizer(this, entityParser);
        }

        Parser.prototype.acceptTemplate = function acceptTemplate(node) {
            return this[node.type](node);
        };

        Parser.prototype.acceptNode = function acceptNode(node) {
            return this[node.type](node);
        };

        Parser.prototype.currentElement = function currentElement() {
            return this.elementStack[this.elementStack.length - 1];
        };

        Parser.prototype.sourceForNode = function sourceForNode(node, endNode) {
            var firstLine = node.loc.start.line - 1;
            var currentLine = firstLine - 1;
            var firstColumn = node.loc.start.column;
            var string = [];
            var line = void 0;
            var lastLine = void 0;
            var lastColumn = void 0;
            if (endNode) {
                lastLine = endNode.loc.end.line - 1;
                lastColumn = endNode.loc.end.column;
            } else {
                lastLine = node.loc.end.line - 1;
                lastColumn = node.loc.end.column;
            }
            while (currentLine < lastLine) {
                currentLine++;
                line = this.source[currentLine];
                if (currentLine === firstLine) {
                    if (firstLine === lastLine) {
                        string.push(line.slice(firstColumn, lastColumn));
                    } else {
                        string.push(line.slice(firstColumn));
                    }
                } else if (currentLine === lastLine) {
                    string.push(line.slice(0, lastColumn));
                } else {
                    string.push(line);
                }
            }
            return string.join('\n');
        };

        _createClass(Parser, [{
            key: 'currentAttr',
            get: function get() {
                return this.currentAttribute;
            }
        }, {
            key: 'currentTag',
            get: function get() {
                var node = this.currentNode;

                return node;
            }
        }, {
            key: 'currentStartTag',
            get: function get() {
                var node = this.currentNode;

                return node;
            }
        }, {
            key: 'currentEndTag',
            get: function get() {
                var node = this.currentNode;

                return node;
            }
        }, {
            key: 'currentComment',
            get: function get() {
                var node = this.currentNode;

                return node;
            }
        }, {
            key: 'currentData',
            get: function get() {
                var node = this.currentNode;

                return node;
            }
        }]);

        return Parser;
    }();

    var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

    function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
    var HandlebarsNodeVisitors = function (_Parser) {
        _inherits(HandlebarsNodeVisitors, _Parser);

        function HandlebarsNodeVisitors() {
            _classCallCheck$1(this, HandlebarsNodeVisitors);

            var _this = _possibleConstructorReturn(this, _Parser.apply(this, arguments));

            _this.cursorCount = 0;
            return _this;
        }

        HandlebarsNodeVisitors.prototype.cursor = function cursor() {
            return '%cursor:' + this.cursorCount++ + '%';
        };

        HandlebarsNodeVisitors.prototype.Program = function Program(program) {
            var body = [];
            this.cursorCount = 0;
            var node = void 0;
            if (this.isTopLevel) {
                node = b.template(body, program.blockParams, program.loc);
            } else {
                node = b.blockItself(body, program.blockParams, program.chained, program.loc);
            }
            var i = void 0,
                l = program.body.length;
            this.elementStack.push(node);
            if (l === 0) {
                return this.elementStack.pop();
            }
            for (i = 0; i < l; i++) {
                this.acceptNode(program.body[i]);
            }
            // Ensure that that the element stack is balanced properly.
            var poppedNode = this.elementStack.pop();
            if (poppedNode !== node) {
                var elementNode = poppedNode;
                throw new SyntaxError('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
            }
            return node;
        };

        HandlebarsNodeVisitors.prototype.BlockStatement = function BlockStatement(block) {
            if (this.tokenizer['state'] === 'comment') {
                this.appendToCommentData(this.sourceForNode(block));
                return;
            }
            if (this.tokenizer['state'] !== 'comment' && this.tokenizer['state'] !== 'data' && this.tokenizer['state'] !== 'beforeData') {
                throw new SyntaxError('A block may only be used inside an HTML element or another block.', block.loc);
            }

            var _acceptCallNodes = acceptCallNodes(this, block),
                path = _acceptCallNodes.path,
                params = _acceptCallNodes.params,
                hash = _acceptCallNodes.hash;

            var program = this.Program(block.program);
            var inverse = block.inverse ? this.Program(block.inverse) : null;
            if (path.original === 'in-element') {
                hash = addInElementHash(this.cursor(), hash, block.loc);
            }
            var node = b.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);
            var parentProgram = this.currentElement();
            appendChild(parentProgram, node);
        };

        HandlebarsNodeVisitors.prototype.MustacheStatement = function MustacheStatement(rawMustache) {
            var tokenizer = this.tokenizer;

            if (tokenizer.state === 'comment') {
                this.appendToCommentData(this.sourceForNode(rawMustache));
                return;
            }
            var mustache = void 0;
            var escaped = rawMustache.escaped,
                loc = rawMustache.loc,
                strip = rawMustache.strip;

            if (isLiteral(rawMustache.path)) {
                mustache = {
                    type: 'MustacheStatement',
                    path: this.acceptNode(rawMustache.path),
                    params: [],
                    hash: b.hash(),
                    escaped: escaped,
                    loc: loc,
                    strip: strip
                };
            } else {
                var _acceptCallNodes2 = acceptCallNodes(this, rawMustache),
                    path = _acceptCallNodes2.path,
                    params = _acceptCallNodes2.params,
                    hash = _acceptCallNodes2.hash;

                mustache = b.mustache(path, params, hash, !escaped, loc, strip);
            }
            switch (tokenizer.state) {
                // Tag helpers
                case "tagOpen" /* tagOpen */:
                case "tagName" /* tagName */:
                    throw new SyntaxError('Cannot use mustaches in an elements tagname: `' + this.sourceForNode(rawMustache, rawMustache.path) + '` at L' + loc.start.line + ':C' + loc.start.column, mustache.loc);
                case "beforeAttributeName" /* beforeAttributeName */:
                    addElementModifier(this.currentStartTag, mustache);
                    break;
                case "attributeName" /* attributeName */:
                case "afterAttributeName" /* afterAttributeName */:
                    this.beginAttributeValue(false);
                    this.finishAttributeValue();
                    addElementModifier(this.currentStartTag, mustache);
                    tokenizer.transitionTo("beforeAttributeName" /* beforeAttributeName */);
                    break;
                case "afterAttributeValueQuoted" /* afterAttributeValueQuoted */:
                    addElementModifier(this.currentStartTag, mustache);
                    tokenizer.transitionTo("beforeAttributeName" /* beforeAttributeName */);
                    break;
                // Attribute values
                case "beforeAttributeValue" /* beforeAttributeValue */:
                    this.beginAttributeValue(false);
                    appendDynamicAttributeValuePart(this.currentAttribute, mustache);
                    tokenizer.transitionTo("attributeValueUnquoted" /* attributeValueUnquoted */);
                    break;
                case "attributeValueDoubleQuoted" /* attributeValueDoubleQuoted */:
                case "attributeValueSingleQuoted" /* attributeValueSingleQuoted */:
                case "attributeValueUnquoted" /* attributeValueUnquoted */:
                    appendDynamicAttributeValuePart(this.currentAttribute, mustache);
                    break;
                // TODO: Only append child when the tokenizer state makes
                // sense to do so, otherwise throw an error.
                default:
                    appendChild(this.currentElement(), mustache);
            }
            return mustache;
        };

        HandlebarsNodeVisitors.prototype.ContentStatement = function ContentStatement(content) {
            updateTokenizerLocation(this.tokenizer, content);
            this.tokenizer.tokenizePart(content.value);
            this.tokenizer.flushData();
        };

        HandlebarsNodeVisitors.prototype.CommentStatement = function CommentStatement(rawComment) {
            var tokenizer = this.tokenizer;

            if (tokenizer.state === "comment" /* comment */) {
                    this.appendToCommentData(this.sourceForNode(rawComment));
                    return null;
                }
            var value = rawComment.value,
                loc = rawComment.loc;

            var comment = b.mustacheComment(value, loc);
            switch (tokenizer.state) {
                case "beforeAttributeName" /* beforeAttributeName */:
                    this.currentStartTag.comments.push(comment);
                    break;
                case "beforeData" /* beforeData */:
                case "data" /* data */:
                    appendChild(this.currentElement(), comment);
                    break;
                default:
                    throw new SyntaxError('Using a Handlebars comment when in the `' + tokenizer['state'] + '` state is not supported: "' + comment.value + '" on line ' + loc.start.line + ':' + loc.start.column, rawComment.loc);
            }
            return comment;
        };

        HandlebarsNodeVisitors.prototype.PartialStatement = function PartialStatement(partial) {
            var loc = partial.loc;

            throw new SyntaxError('Handlebars partials are not supported: "' + this.sourceForNode(partial, partial.name) + '" at L' + loc.start.line + ':C' + loc.start.column, partial.loc);
        };

        HandlebarsNodeVisitors.prototype.PartialBlockStatement = function PartialBlockStatement(partialBlock) {
            var loc = partialBlock.loc;

            throw new SyntaxError('Handlebars partial blocks are not supported: "' + this.sourceForNode(partialBlock, partialBlock.name) + '" at L' + loc.start.line + ':C' + loc.start.column, partialBlock.loc);
        };

        HandlebarsNodeVisitors.prototype.Decorator = function Decorator(decorator) {
            var loc = decorator.loc;

            throw new SyntaxError('Handlebars decorators are not supported: "' + this.sourceForNode(decorator, decorator.path) + '" at L' + loc.start.line + ':C' + loc.start.column, decorator.loc);
        };

        HandlebarsNodeVisitors.prototype.DecoratorBlock = function DecoratorBlock(decoratorBlock) {
            var loc = decoratorBlock.loc;

            throw new SyntaxError('Handlebars decorator blocks are not supported: "' + this.sourceForNode(decoratorBlock, decoratorBlock.path) + '" at L' + loc.start.line + ':C' + loc.start.column, decoratorBlock.loc);
        };

        HandlebarsNodeVisitors.prototype.SubExpression = function SubExpression(sexpr) {
            var _acceptCallNodes3 = acceptCallNodes(this, sexpr),
                path = _acceptCallNodes3.path,
                params = _acceptCallNodes3.params,
                hash = _acceptCallNodes3.hash;

            return b.sexpr(path, params, hash, sexpr.loc);
        };

        HandlebarsNodeVisitors.prototype.PathExpression = function PathExpression(path) {
            var original = path.original,
                loc = path.loc;

            var parts = void 0;
            if (original.indexOf('/') !== -1) {
                if (original.slice(0, 2) === './') {
                    throw new SyntaxError('Using "./" is not supported in Glimmer and unnecessary: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
                }
                if (original.slice(0, 3) === '../') {
                    throw new SyntaxError('Changing context using "../" is not supported in Glimmer: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
                }
                if (original.indexOf('.') !== -1) {
                    throw new SyntaxError('Mixing \'.\' and \'/\' in paths is not supported in Glimmer; use only \'.\' to separate property paths: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
                }
                parts = [path.parts.join('/')];
            } else if (original === '.') {
                var locationInfo = 'L' + loc.start.line + ':C' + loc.start.column;
                throw new SyntaxError('\'.\' is not a supported path in Glimmer; check for a path with a trailing \'.\' at ' + locationInfo + '.', path.loc);
            } else {
                parts = path.parts;
            }
            var thisHead = false;
            // This is to fix a bug in the Handlebars AST where the path expressions in
            // `{{this.foo}}` (and similarly `{{foo-bar this.foo named=this.foo}}` etc)
            // are simply turned into `{{foo}}`. The fix is to push it back onto the
            // parts array and let the runtime see the difference. However, we cannot
            // simply use the string `this` as it means literally the property called
            // "this" in the current context (it can be expressed in the syntax as
            // `{{[this]}}`, where the square bracket are generally for this kind of
            // escaping – such as `{{foo.["bar.baz"]}}` would mean lookup a property
            // named literally "bar.baz" on `this.foo`). By convention, we use `null`
            // for this purpose.
            if (original.match(/^this(\..+)?$/)) {
                thisHead = true;
            }
            return {
                type: 'PathExpression',
                original: path.original,
                this: thisHead,
                parts: parts,
                data: path.data,
                loc: path.loc
            };
        };

        HandlebarsNodeVisitors.prototype.Hash = function Hash(hash) {
            var pairs = [];
            for (var i = 0; i < hash.pairs.length; i++) {
                var pair = hash.pairs[i];
                pairs.push(b.pair(pair.key, this.acceptNode(pair.value), pair.loc));
            }
            return b.hash(pairs, hash.loc);
        };

        HandlebarsNodeVisitors.prototype.StringLiteral = function StringLiteral(string) {
            return b.literal('StringLiteral', string.value, string.loc);
        };

        HandlebarsNodeVisitors.prototype.BooleanLiteral = function BooleanLiteral(boolean) {
            return b.literal('BooleanLiteral', boolean.value, boolean.loc);
        };

        HandlebarsNodeVisitors.prototype.NumberLiteral = function NumberLiteral(number) {
            return b.literal('NumberLiteral', number.value, number.loc);
        };

        HandlebarsNodeVisitors.prototype.UndefinedLiteral = function UndefinedLiteral(undef) {
            return b.literal('UndefinedLiteral', undefined, undef.loc);
        };

        HandlebarsNodeVisitors.prototype.NullLiteral = function NullLiteral(nul) {
            return b.literal('NullLiteral', null, nul.loc);
        };

        _createClass$1(HandlebarsNodeVisitors, [{
            key: 'isTopLevel',
            get: function get() {
                return this.elementStack.length === 0;
            }
        }]);

        return HandlebarsNodeVisitors;
    }(Parser);
    function calculateRightStrippedOffsets(original, value) {
        if (value === '') {
            // if it is empty, just return the count of newlines
            // in original
            return {
                lines: original.split('\n').length - 1,
                columns: 0
            };
        }
        // otherwise, return the number of newlines prior to
        // `value`
        var difference = original.split(value)[0];
        var lines = difference.split(/\n/);
        var lineCount = lines.length - 1;
        return {
            lines: lineCount,
            columns: lines[lineCount].length
        };
    }
    function updateTokenizerLocation(tokenizer, content) {
        var line = content.loc.start.line;
        var column = content.loc.start.column;
        var offsets = calculateRightStrippedOffsets(content.original, content.value);
        line = line + offsets.lines;
        if (offsets.lines) {
            column = offsets.columns;
        } else {
            column = column + offsets.columns;
        }
        tokenizer.line = line;
        tokenizer.column = column;
    }
    function acceptCallNodes(compiler, node) {
        var path = compiler.PathExpression(node.path);
        var params = node.params ? node.params.map(function (e) {
            return compiler.acceptNode(e);
        }) : [];
        var hash = node.hash ? compiler.Hash(node.hash) : b.hash();
        return { path: path, params: params, hash: hash };
    }
    function addElementModifier(element, mustache) {
        var path = mustache.path,
            params = mustache.params,
            hash = mustache.hash,
            loc = mustache.loc;

        if (isLiteral(path)) {
            var _modifier = '{{' + printLiteral(path) + '}}';
            var tag = '<' + element.name + ' ... ' + _modifier + ' ...';
            throw new SyntaxError('In ' + tag + ', ' + _modifier + ' is not a valid modifier: "' + path.original + '" on line ' + (loc && loc.start.line) + '.', mustache.loc);
        }
        var modifier = b.elementModifier(path, params, hash, loc);
        element.modifiers.push(modifier);
    }
    function addInElementHash(cursor, hash, loc) {
        var hasInsertBefore = false;
        hash.pairs.forEach(function (pair) {
            if (pair.key === 'guid') {
                throw new SyntaxError('Cannot pass `guid` from user space', loc);
            }
            if (pair.key === 'insertBefore') {
                hasInsertBefore = true;
            }
        });
        var guid = b.literal('StringLiteral', cursor);
        var guidPair = b.pair('guid', guid);
        hash.pairs.unshift(guidPair);
        if (!hasInsertBefore) {
            var undefinedLiteral = b.literal('UndefinedLiteral', undefined);
            var beforeSibling = b.pair('insertBefore', undefinedLiteral);
            hash.pairs.push(beforeSibling);
        }
        return hash;
    }
    function appendDynamicAttributeValuePart(attribute, part) {
        attribute.isDynamic = true;
        attribute.parts.push(part);
    }

    // ensure stays in sync with typing
    // ParentNode and ChildKey types are derived from VisitorKeysMap
    var visitorKeys = {
        Program: util.tuple('body'),
        Template: util.tuple('body'),
        Block: util.tuple('body'),
        MustacheStatement: util.tuple('path', 'params', 'hash'),
        BlockStatement: util.tuple('path', 'params', 'hash', 'program', 'inverse'),
        ElementModifierStatement: util.tuple('path', 'params', 'hash'),
        PartialStatement: util.tuple('name', 'params', 'hash'),
        CommentStatement: util.tuple(),
        MustacheCommentStatement: util.tuple(),
        ElementNode: util.tuple('attributes', 'modifiers', 'children', 'comments'),
        AttrNode: util.tuple('value'),
        TextNode: util.tuple(),
        ConcatStatement: util.tuple('parts'),
        SubExpression: util.tuple('path', 'params', 'hash'),
        PathExpression: util.tuple(),
        StringLiteral: util.tuple(),
        BooleanLiteral: util.tuple(),
        NumberLiteral: util.tuple(),
        NullLiteral: util.tuple(),
        UndefinedLiteral: util.tuple(),
        Hash: util.tuple('pairs'),
        HashPair: util.tuple('value')
    };

    var TraversalError = function () {
        TraversalError.prototype = Object.create(Error.prototype);
        TraversalError.prototype.constructor = TraversalError;
        function TraversalError(message, node, parent, key) {
            var error = Error.call(this, message);
            this.key = key;
            this.message = message;
            this.node = node;
            this.parent = parent;
            this.stack = error.stack;
        }
        return TraversalError;
    }();
    function cannotRemoveNode(node, parent, key) {
        return new TraversalError('Cannot remove a node unless it is part of an array', node, parent, key);
    }
    function cannotReplaceNode(node, parent, key) {
        return new TraversalError('Cannot replace a node with multiple nodes unless it is part of an array', node, parent, key);
    }
    function cannotReplaceOrRemoveInKeyHandlerYet(node, key) {
        return new TraversalError('Replacing and removing in key handlers is not yet supported.', node, null, key);
    }

    function getEnterFunction(handler) {
        if (typeof handler === 'function') {
            return handler;
        } else {
            return handler.enter;
        }
    }
    function getExitFunction(handler) {
        if (typeof handler === 'function') {
            return undefined;
        } else {
            return handler.exit;
        }
    }
    function getKeyHandler(handler, key) {
        var keyVisitor = typeof handler !== 'function' ? handler.keys : undefined;
        if (keyVisitor === undefined) return;
        var keyHandler = keyVisitor[key];
        if (keyHandler !== undefined) {
            return keyHandler;
        }
        return keyVisitor.All;
    }
    function getNodeHandler(visitor, nodeType) {
        if (nodeType === 'Template' || nodeType === 'Block') {
            if (visitor.Program) {
                return visitor.Program;
            }
        }
        var handler = visitor[nodeType];
        if (handler !== undefined) {
            return handler;
        }
        return visitor.All;
    }
    function visitNode(visitor, node) {
        var handler = getNodeHandler(visitor, node.type);
        var enter = void 0;
        var exit = void 0;
        if (handler !== undefined) {
            enter = getEnterFunction(handler);
            exit = getExitFunction(handler);
        }
        var result = void 0;
        if (enter !== undefined) {
            result = enter(node);
        }
        if (result !== undefined && result !== null) {
            if (JSON.stringify(node) === JSON.stringify(result)) {
                result = undefined;
            } else if (Array.isArray(result)) {
                visitArray(visitor, result);
                return result;
            } else {
                return visitNode(visitor, result) || result;
            }
        }
        if (result === undefined) {
            var keys = visitorKeys[node.type];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                // we know if it has child keys we can widen to a ParentNode
                visitKey(visitor, handler, node, key);
            }
            if (exit !== undefined) {
                result = exit(node);
            }
        }
        return result;
    }
    function get(node, key) {
        return node[key];
    }
    function set(node, key, value) {
        node[key] = value;
    }
    function visitKey(visitor, handler, node, key) {
        var value = get(node, key);
        if (!value) {
            return;
        }
        var keyEnter = void 0;
        var keyExit = void 0;
        if (handler !== undefined) {
            var keyHandler = getKeyHandler(handler, key);
            if (keyHandler !== undefined) {
                keyEnter = getEnterFunction(keyHandler);
                keyExit = getExitFunction(keyHandler);
            }
        }
        if (keyEnter !== undefined) {
            if (keyEnter(node, key) !== undefined) {
                throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
            }
        }
        if (Array.isArray(value)) {
            visitArray(visitor, value);
        } else {
            var result = visitNode(visitor, value);
            if (result !== undefined) {
                // TODO: dynamically check the results by having a table of
                // expected node types in value space, not just type space
                assignKey(node, key, value, result);
            }
        }
        if (keyExit !== undefined) {
            if (keyExit(node, key) !== undefined) {
                throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
            }
        }
    }
    function visitArray(visitor, array) {
        for (var i = 0; i < array.length; i++) {
            var result = visitNode(visitor, array[i]);
            if (result !== undefined) {
                i += spliceArray(array, i, result) - 1;
            }
        }
    }
    function assignKey(node, key, value, result) {
        if (result === null) {
            throw cannotRemoveNode(value, node, key);
        } else if (Array.isArray(result)) {
            if (result.length === 1) {
                set(node, key, result[0]);
            } else {
                if (result.length === 0) {
                    throw cannotRemoveNode(value, node, key);
                } else {
                    throw cannotReplaceNode(value, node, key);
                }
            }
        } else {
            set(node, key, result);
        }
    }
    function spliceArray(array, index, result) {
        if (result === null) {
            array.splice(index, 1);
            return 0;
        } else if (Array.isArray(result)) {
            array.splice.apply(array, [index, 1].concat(result));
            return result.length;
        } else {
            array.splice(index, 1, result);
            return 1;
        }
    }
    function traverse(node, visitor) {
        visitNode(visitor, node);
    }

    var ATTR_VALUE_REGEX_TEST = /[\xA0"&]/;
    var ATTR_VALUE_REGEX_REPLACE = new RegExp(ATTR_VALUE_REGEX_TEST.source, 'g');
    var TEXT_REGEX_TEST = /[\xA0&<>]/;
    var TEXT_REGEX_REPLACE = new RegExp(TEXT_REGEX_TEST.source, 'g');
    function attrValueReplacer(char) {
        switch (char.charCodeAt(0)) {
            case 160 /* NBSP */:
                return '&nbsp;';
            case 34 /* QUOT */:
                return '&quot;';
            case 38 /* AMP */:
                return '&amp;';
            default:
                return char;
        }
    }
    function textReplacer(char) {
        switch (char.charCodeAt(0)) {
            case 160 /* NBSP */:
                return '&nbsp;';
            case 38 /* AMP */:
                return '&amp;';
            case 60 /* LT */:
                return '&lt;';
            case 62 /* GT */:
                return '&gt;';
            default:
                return char;
        }
    }
    function escapeAttrValue(attrValue) {
        if (ATTR_VALUE_REGEX_TEST.test(attrValue)) {
            return attrValue.replace(ATTR_VALUE_REGEX_REPLACE, attrValueReplacer);
        }
        return attrValue;
    }
    function escapeText(text) {
        if (TEXT_REGEX_TEST.test(text)) {
            return text.replace(TEXT_REGEX_REPLACE, textReplacer);
        }
        return text;
    }

    function unreachable() {
        throw new Error('unreachable');
    }
    function build(ast) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { entityEncoding: 'transformed' };

        if (!ast) {
            return '';
        }
        if (options.override) {
            var result = options.override(ast, options);
            if (result !== undefined) {
                return result;
            }
        }
        function buildEach(asts) {
            return asts.map(function (node) {
                return build(node, options);
            });
        }
        function pathParams(ast) {
            var path = void 0;
            switch (ast.type) {
                case 'MustacheStatement':
                case 'SubExpression':
                case 'ElementModifierStatement':
                case 'BlockStatement':
                    path = build(ast.path, options);
                    break;
                case 'PartialStatement':
                    path = build(ast.name, options);
                    break;
                default:
                    return unreachable();
            }
            return compactJoin([path, buildEach(ast.params).join(' '), build(ast.hash, options)], ' ');
        }
        function compactJoin(array, delimiter) {
            return compact(array).join(delimiter || '');
        }
        function blockParams(block) {
            var params = block.program.blockParams;
            if (params.length) {
                return ' as |' + params.join(' ') + '|';
            }
            return null;
        }
        function openBlock(block) {
            return compactJoin(['{{', block.openStrip.open ? '~' : null, '#', pathParams(block), blockParams(block), block.openStrip.close ? '~' : null, '}}']);
        }
        function closeBlock(block) {
            return compactJoin(['{{', block.closeStrip.open ? '~' : null, '/', build(block.path, options), block.closeStrip.close ? '~' : null, '}}']);
        }
        var output = [];
        switch (ast.type) {
            case 'Program':
            case 'Block':
            case 'Template':
                {
                    var chainBlock = ast.chained && ast.body[0];
                    if (chainBlock) {
                        chainBlock.chained = true;
                    }
                    var body = buildEach(ast.body).join('');
                    output.push(body);
                }
                break;
            case 'ElementNode':
                output.push('<', ast.tag);
                if (ast.attributes.length) {
                    output.push(' ', buildEach(ast.attributes).join(' '));
                }
                if (ast.modifiers.length) {
                    output.push(' ', buildEach(ast.modifiers).join(' '));
                }
                if (ast.comments.length) {
                    output.push(' ', buildEach(ast.comments).join(' '));
                }
                if (ast.blockParams.length) {
                    output.push(' ', 'as', ' ', '|' + ast.blockParams.join(' ') + '|');
                }
                if (voidMap[ast.tag]) {
                    if (ast.selfClosing) {
                        output.push(' /');
                    }
                    output.push('>');
                } else if (ast.selfClosing) {
                    output.push(' />');
                } else {
                    output.push('>');
                    output.push.apply(output, buildEach(ast.children));
                    output.push('</', ast.tag, '>');
                }
                break;
            case 'AttrNode':
                if (ast.value.type === 'TextNode') {
                    if (ast.value.chars !== '') {
                        output.push(ast.name, '=');
                        output.push('"', options.entityEncoding === 'raw' ? ast.value.chars : escapeAttrValue(ast.value.chars), '"');
                    } else {
                        output.push(ast.name);
                    }
                } else {
                    output.push(ast.name, '=');
                    // ast.value is mustache or concat
                    output.push(build(ast.value, options));
                }
                break;
            case 'ConcatStatement':
                output.push('"');
                ast.parts.forEach(function (node) {
                    if (node.type === 'TextNode') {
                        output.push(options.entityEncoding === 'raw' ? node.chars : escapeAttrValue(node.chars));
                    } else {
                        output.push(build(node, options));
                    }
                });
                output.push('"');
                break;
            case 'TextNode':
                output.push(options.entityEncoding === 'raw' ? ast.chars : escapeText(ast.chars));
                break;
            case 'MustacheStatement':
                {
                    output.push(compactJoin([ast.escaped ? '{{' : '{{{', ast.strip.open ? '~' : null, pathParams(ast), ast.strip.close ? '~' : null, ast.escaped ? '}}' : '}}}']));
                }
                break;
            case 'MustacheCommentStatement':
                {
                    output.push(compactJoin(['{{!--', ast.value, '--}}']));
                }
                break;
            case 'ElementModifierStatement':
                {
                    output.push(compactJoin(['{{', pathParams(ast), '}}']));
                }
                break;
            case 'PathExpression':
                output.push(ast.original);
                break;
            case 'SubExpression':
                {
                    output.push('(', pathParams(ast), ')');
                }
                break;
            case 'BooleanLiteral':
                output.push(ast.value ? 'true' : 'false');
                break;
            case 'BlockStatement':
                {
                    var lines = [];
                    if (ast.chained) {
                        lines.push(compactJoin(['{{', ast.inverseStrip.open ? '~' : null, 'else ', pathParams(ast), ast.inverseStrip.close ? '~' : null, '}}']));
                    } else {
                        lines.push(openBlock(ast));
                    }
                    lines.push(build(ast.program, options));
                    if (ast.inverse) {
                        if (!ast.inverse.chained) {
                            lines.push(compactJoin(['{{', ast.inverseStrip.open ? '~' : null, 'else', ast.inverseStrip.close ? '~' : null, '}}']));
                        }
                        lines.push(build(ast.inverse, options));
                    }
                    if (!ast.chained) {
                        lines.push(closeBlock(ast));
                    }
                    output.push(lines.join(''));
                }
                break;
            case 'PartialStatement':
                {
                    output.push(compactJoin(['{{>', pathParams(ast), '}}']));
                }
                break;
            case 'CommentStatement':
                {
                    output.push(compactJoin(['<!--', ast.value, '-->']));
                }
                break;
            case 'StringLiteral':
                {
                    output.push('"' + ast.value + '"');
                }
                break;
            case 'NumberLiteral':
                {
                    output.push(String(ast.value));
                }
                break;
            case 'UndefinedLiteral':
                {
                    output.push('undefined');
                }
                break;
            case 'NullLiteral':
                {
                    output.push('null');
                }
                break;
            case 'Hash':
                {
                    output.push(ast.pairs.map(function (pair) {
                        return build(pair, options);
                    }).join(' '));
                }
                break;
            case 'HashPair':
                {
                    output.push(ast.key + '=' + build(ast.value, options));
                }
                break;
        }
        return output.join('');
    }
    function compact(array) {
        var newArray = [];
        array.forEach(function (a) {
            if (typeof a !== 'undefined' && a !== null && a !== '') {
                newArray.push(a);
            }
        });
        return newArray;
    }

    function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var Walker = function () {
        function Walker(order) {
            _classCallCheck$2(this, Walker);

            this.order = order;
            this.stack = [];
        }

        Walker.prototype.visit = function visit(node, callback) {
            if (!node) {
                return;
            }
            this.stack.push(node);
            if (this.order === 'post') {
                this.children(node, callback);
                callback(node, this);
            } else {
                callback(node, this);
                this.children(node, callback);
            }
            this.stack.pop();
        };

        Walker.prototype.children = function children(node, callback) {
            var type = void 0;
            if (node.type === 'Block' || node.type === 'Template' && visitors.Program) {
                type = 'Program';
            } else {
                type = node.type;
            }
            var visitor = visitors[type];
            if (visitor) {
                visitor(this, node, callback);
            }
        };

        return Walker;
    }();

    var visitors = {
        Program: function Program(walker, node, callback) {
            for (var i = 0; i < node.body.length; i++) {
                walker.visit(node.body[i], callback);
            }
        },
        Template: function Template(walker, node, callback) {
            for (var i = 0; i < node.body.length; i++) {
                walker.visit(node.body[i], callback);
            }
        },
        Block: function Block(walker, node, callback) {
            for (var i = 0; i < node.body.length; i++) {
                walker.visit(node.body[i], callback);
            }
        },
        ElementNode: function ElementNode(walker, node, callback) {
            for (var i = 0; i < node.children.length; i++) {
                walker.visit(node.children[i], callback);
            }
        },
        BlockStatement: function BlockStatement(walker, node, callback) {
            walker.visit(node.program, callback);
            walker.visit(node.inverse || null, callback);
        }
    };

    function _defaults$1(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

    function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

    function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults$1(subClass, superClass); }
    var voidMap = Object.create(null);
    var voidTagNames = 'area base br col command embed hr img input keygen link meta param source track wbr';
    voidTagNames.split(' ').forEach(function (tagName) {
        voidMap[tagName] = true;
    });
    var TokenizerEventHandlers = function (_HandlebarsNodeVisito) {
        _inherits$1(TokenizerEventHandlers, _HandlebarsNodeVisito);

        function TokenizerEventHandlers() {
            _classCallCheck$3(this, TokenizerEventHandlers);

            var _this = _possibleConstructorReturn$1(this, _HandlebarsNodeVisito.apply(this, arguments));

            _this.tagOpenLine = 0;
            _this.tagOpenColumn = 0;
            return _this;
        }

        TokenizerEventHandlers.prototype.reset = function reset() {
            this.currentNode = null;
        };
        // Comment


        TokenizerEventHandlers.prototype.beginComment = function beginComment() {
            this.currentNode = b.comment('');
            this.currentNode.loc = {
                source: null,
                start: b.pos(this.tagOpenLine, this.tagOpenColumn),
                end: null
            };
        };

        TokenizerEventHandlers.prototype.appendToCommentData = function appendToCommentData(char) {
            this.currentComment.value += char;
        };

        TokenizerEventHandlers.prototype.finishComment = function finishComment() {
            this.currentComment.loc.end = b.pos(this.tokenizer.line, this.tokenizer.column);
            appendChild(this.currentElement(), this.currentComment);
        };
        // Data


        TokenizerEventHandlers.prototype.beginData = function beginData() {
            this.currentNode = b.text();
            this.currentNode.loc = {
                source: null,
                start: b.pos(this.tokenizer.line, this.tokenizer.column),
                end: null
            };
        };

        TokenizerEventHandlers.prototype.appendToData = function appendToData(char) {
            this.currentData.chars += char;
        };

        TokenizerEventHandlers.prototype.finishData = function finishData() {
            this.currentData.loc.end = b.pos(this.tokenizer.line, this.tokenizer.column);
            appendChild(this.currentElement(), this.currentData);
        };
        // Tags - basic


        TokenizerEventHandlers.prototype.tagOpen = function tagOpen() {
            this.tagOpenLine = this.tokenizer.line;
            this.tagOpenColumn = this.tokenizer.column;
        };

        TokenizerEventHandlers.prototype.beginStartTag = function beginStartTag() {
            this.currentNode = {
                type: 'StartTag',
                name: '',
                attributes: [],
                modifiers: [],
                comments: [],
                selfClosing: false,
                loc: SYNTHETIC
            };
        };

        TokenizerEventHandlers.prototype.beginEndTag = function beginEndTag() {
            this.currentNode = {
                type: 'EndTag',
                name: '',
                attributes: [],
                modifiers: [],
                comments: [],
                selfClosing: false,
                loc: SYNTHETIC
            };
        };

        TokenizerEventHandlers.prototype.finishTag = function finishTag() {
            var _tokenizer = this.tokenizer,
                line = _tokenizer.line,
                column = _tokenizer.column;

            var tag = this.currentTag;
            tag.loc = b.loc(this.tagOpenLine, this.tagOpenColumn, line, column);
            if (tag.type === 'StartTag') {
                this.finishStartTag();
                if (voidMap[tag.name] || tag.selfClosing) {
                    this.finishEndTag(true);
                }
            } else if (tag.type === 'EndTag') {
                this.finishEndTag(false);
            }
        };

        TokenizerEventHandlers.prototype.finishStartTag = function finishStartTag() {
            var _currentStartTag = this.currentStartTag,
                name = _currentStartTag.name,
                attrs = _currentStartTag.attributes,
                modifiers = _currentStartTag.modifiers,
                comments = _currentStartTag.comments,
                selfClosing = _currentStartTag.selfClosing;

            var loc = b.loc(this.tagOpenLine, this.tagOpenColumn);
            var element = b.element({ name: name, selfClosing: selfClosing }, { attrs: attrs, modifiers: modifiers, comments: comments, loc: loc });
            this.elementStack.push(element);
        };

        TokenizerEventHandlers.prototype.finishEndTag = function finishEndTag(isVoid) {
            var tag = this.currentTag;
            var element = this.elementStack.pop();
            var parent = this.currentElement();
            validateEndTag(tag, element, isVoid);
            element.loc.end.line = this.tokenizer.line;
            element.loc.end.column = this.tokenizer.column;
            parseElementBlockParams(element);
            appendChild(parent, element);
        };

        TokenizerEventHandlers.prototype.markTagAsSelfClosing = function markTagAsSelfClosing() {
            this.currentTag.selfClosing = true;
        };
        // Tags - name


        TokenizerEventHandlers.prototype.appendToTagName = function appendToTagName(char) {
            this.currentTag.name += char;
        };
        // Tags - attributes


        TokenizerEventHandlers.prototype.beginAttribute = function beginAttribute() {
            var tag = this.currentTag;
            if (tag.type === 'EndTag') {
                throw new SyntaxError('Invalid end tag: closing tag must not have attributes, ' + ('in `' + tag.name + '` (on line ' + this.tokenizer.line + ').'), tag.loc);
            }
            this.currentAttribute = {
                name: '',
                parts: [],
                isQuoted: false,
                isDynamic: false,
                start: b.pos(this.tokenizer.line, this.tokenizer.column),
                valueStartLine: 0,
                valueStartColumn: 0
            };
        };

        TokenizerEventHandlers.prototype.appendToAttributeName = function appendToAttributeName(char) {
            this.currentAttr.name += char;
        };

        TokenizerEventHandlers.prototype.beginAttributeValue = function beginAttributeValue(isQuoted) {
            this.currentAttr.isQuoted = isQuoted;
            this.currentAttr.valueStartLine = this.tokenizer.line;
            this.currentAttr.valueStartColumn = this.tokenizer.column;
        };

        TokenizerEventHandlers.prototype.appendToAttributeValue = function appendToAttributeValue(char) {
            var parts = this.currentAttr.parts;
            var lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.type === 'TextNode') {
                lastPart.chars += char;
                // update end location for each added char
                lastPart.loc.end.line = this.tokenizer.line;
                lastPart.loc.end.column = this.tokenizer.column;
            } else {
                // initially assume the text node is a single char
                var loc = b.loc(this.tokenizer.line, this.tokenizer.column, this.tokenizer.line, this.tokenizer.column);
                // the tokenizer line/column have already been advanced, correct location info
                if (char === '\n') {
                    loc.start.line -= 1;
                    loc.start.column = lastPart ? lastPart.loc.end.column : this.currentAttr.valueStartColumn;
                } else {
                    loc.start.column -= 1;
                }
                var text = b.text(char, loc);
                parts.push(text);
            }
        };

        TokenizerEventHandlers.prototype.finishAttributeValue = function finishAttributeValue() {
            var _currentAttr = this.currentAttr,
                name = _currentAttr.name,
                parts = _currentAttr.parts,
                isQuoted = _currentAttr.isQuoted,
                isDynamic = _currentAttr.isDynamic,
                valueStartLine = _currentAttr.valueStartLine,
                valueStartColumn = _currentAttr.valueStartColumn;

            var value = assembleAttributeValue(parts, isQuoted, isDynamic, this.tokenizer.line);
            value.loc = b.loc(valueStartLine, valueStartColumn, this.tokenizer.line, this.tokenizer.column);
            var loc = b.loc(this.currentAttr.start.line, this.currentAttr.start.column, this.tokenizer.line, this.tokenizer.column);
            var attribute = b.attr(name, value, loc);
            this.currentStartTag.attributes.push(attribute);
        };

        TokenizerEventHandlers.prototype.reportSyntaxError = function reportSyntaxError(message) {
            throw new SyntaxError('Syntax error at line ' + this.tokenizer.line + ' col ' + this.tokenizer.column + ': ' + message, b.loc(this.tokenizer.line, this.tokenizer.column));
        };

        return TokenizerEventHandlers;
    }(HandlebarsNodeVisitors);
    function assembleAttributeValue(parts, isQuoted, isDynamic, line) {
        if (isDynamic) {
            if (isQuoted) {
                return assembleConcatenatedValue(parts);
            } else {
                if (parts.length === 1 || parts.length === 2 && parts[1].type === 'TextNode' && parts[1].chars === '/') {
                    return parts[0];
                } else {
                    throw new SyntaxError('An unquoted attribute value must be a string or a mustache, ' + 'preceeded by whitespace or a \'=\' character, and ' + ('followed by whitespace, a \'>\' character, or \'/>\' (on line ' + line + ')'), b.loc(line, 0));
                }
            }
        } else {
            return parts.length > 0 ? parts[0] : b.text('');
        }
    }
    function assembleConcatenatedValue(parts) {
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
                throw new SyntaxError('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
            }
        }
        return b.concat(parts);
    }
    function validateEndTag(tag, element, selfClosing) {
        var error = void 0;
        if (voidMap[tag.name] && !selfClosing) {
            // EngTag is also called by StartTag for void and self-closing tags (i.e.
            // <input> or <br />, so we need to check for that here. Otherwise, we would
            // throw an error for those cases.
            error = 'Invalid end tag ' + formatEndTagInfo(tag) + ' (void elements cannot have end tags).';
        } else if (element.tag === undefined) {
            error = 'Closing tag ' + formatEndTagInfo(tag) + ' without an open tag.';
        } else if (element.tag !== tag.name) {
            error = 'Closing tag ' + formatEndTagInfo(tag) + ' did not match last open tag `' + element.tag + '` (on line ' + element.loc.start.line + ').';
        }
        if (error) {
            throw new SyntaxError(error, element.loc);
        }
    }
    function formatEndTagInfo(tag) {
        return '`' + tag.name + '` (on line ' + tag.loc.end.line + ')';
    }
    var syntax = {
        parse: preprocess,
        builders: b,
        print: build,
        traverse: traverse,
        Walker: Walker
    };
    function preprocess(html) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var mode = options.mode || 'precompile';
        var ast = void 0;
        if (typeof html === 'object') {
            ast = html;
        } else {
            var parseOptions = options.parseOptions || {};
            if (mode === 'codemod') {
                parseOptions.ignoreStandalone = true;
            }
            ast = handlebars.parse(html, parseOptions);
        }
        var entityParser = undefined;
        if (mode === 'codemod') {
            entityParser = new simpleHtmlTokenizer.EntityParser({});
        }
        var program = new TokenizerEventHandlers(html, entityParser).acceptTemplate(ast);
        if (options && options.plugins && options.plugins.ast) {
            for (var i = 0, l = options.plugins.ast.length; i < l; i++) {
                var transform = options.plugins.ast[i];
                var env = util.assign({}, options, { syntax: syntax }, { plugins: undefined });
                var pluginResult = transform(env);
                traverse(program, pluginResult.visitor);
            }
        }
        return program;
    }



    var nodes = /*#__PURE__*/Object.freeze({

    });

    // used by ember-compiler

    exports.AST = nodes;
    exports.preprocess = preprocess;
    exports.builders = b;
    exports.TraversalError = TraversalError;
    exports.cannotRemoveNode = cannotRemoveNode;
    exports.cannotReplaceNode = cannotReplaceNode;
    exports.cannotReplaceOrRemoveInKeyHandlerYet = cannotReplaceOrRemoveInKeyHandlerYet;
    exports.traverse = traverse;
    exports.Walker = Walker;
    exports.print = build;
    exports.SyntaxError = SyntaxError;
    exports.isLiteral = isLiteral;
    exports.printLiteral = printLiteral;

    Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1zeW50YXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvYnVpbGRlcnMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL2Vycm9ycy9zeW50YXgtZXJyb3IudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3V0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvc3ludGF4L2xpYi9wYXJzZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3BhcnNlci9oYW5kbGViYXJzLW5vZGUtdmlzaXRvcnMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3R5cGVzL3Zpc2l0b3Ita2V5cy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL2Vycm9ycy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3RyYXZlcnNlLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvc3ludGF4L2xpYi9nZW5lcmF0aW9uL3V0aWwudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL2dlbmVyYXRpb24vcHJpbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3RyYXZlcnNhbC93YWxrZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3BhcnNlci90b2tlbml6ZXItZXZlbnQtaGFuZGxlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVNUIGZyb20gJy4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBkZXByZWNhdGUsIGFzc2lnbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgREVWTU9ERSB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IFN0cmluZ0xpdGVyYWwsIEJvb2xlYW5MaXRlcmFsLCBOdW1iZXJMaXRlcmFsIH0gZnJvbSAnLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5cbi8vIFN0YXRlbWVudHNcblxuZXhwb3J0IHR5cGUgQnVpbGRlclBhdGggPSBzdHJpbmcgfCBBU1QuUGF0aEV4cHJlc3Npb247XG5leHBvcnQgdHlwZSBUYWdEZXNjcmlwdG9yID0gc3RyaW5nIHwgeyBuYW1lOiBzdHJpbmc7IHNlbGZDbG9zaW5nOiBib29sZWFuIH07XG5cbmZ1bmN0aW9uIGJ1aWxkTXVzdGFjaGUoXG4gIHBhdGg6IEJ1aWxkZXJQYXRoIHwgQVNULkxpdGVyYWwsXG4gIHBhcmFtcz86IEFTVC5FeHByZXNzaW9uW10sXG4gIGhhc2g/OiBBU1QuSGFzaCxcbiAgcmF3PzogYm9vbGVhbixcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uLFxuICBzdHJpcD86IEFTVC5TdHJpcEZsYWdzXG4pOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQge1xuICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgcGF0aCA9IGJ1aWxkUGF0aChwYXRoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICBwYXRoLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBlc2NhcGVkOiAhcmF3LFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICAgIHN0cmlwOiBzdHJpcCB8fCB7IG9wZW46IGZhbHNlLCBjbG9zZTogZmFsc2UgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRCbG9jayhcbiAgcGF0aDogQnVpbGRlclBhdGgsXG4gIHBhcmFtczogT3B0aW9uPEFTVC5FeHByZXNzaW9uW10+LFxuICBoYXNoOiBPcHRpb248QVNULkhhc2g+LFxuICBfZGVmYXVsdEJsb2NrOiBBU1QuUG9zc2libHlEZXByZWNhdGVkQmxvY2ssXG4gIF9lbHNlQmxvY2s/OiBPcHRpb248QVNULlBvc3NpYmx5RGVwcmVjYXRlZEJsb2NrPixcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uLFxuICBvcGVuU3RyaXA/OiBBU1QuU3RyaXBGbGFncyxcbiAgaW52ZXJzZVN0cmlwPzogQVNULlN0cmlwRmxhZ3MsXG4gIGNsb3NlU3RyaXA/OiBBU1QuU3RyaXBGbGFnc1xuKTogQVNULkJsb2NrU3RhdGVtZW50IHtcbiAgbGV0IGRlZmF1bHRCbG9jazogQVNULkJsb2NrO1xuICBsZXQgZWxzZUJsb2NrOiBPcHRpb248QVNULkJsb2NrPiB8IHVuZGVmaW5lZDtcblxuICBpZiAoX2RlZmF1bHRCbG9jay50eXBlID09PSAnVGVtcGxhdGUnKSB7XG4gICAgaWYgKERFVk1PREUpIHtcbiAgICAgIGRlcHJlY2F0ZShgYi5wcm9ncmFtIGlzIGRlcHJlY2F0ZWQuIFVzZSBiLmJsb2NrSXRzZWxmIGluc3RlYWQuYCk7XG4gICAgfVxuXG4gICAgZGVmYXVsdEJsb2NrID0gKGFzc2lnbih7fSwgX2RlZmF1bHRCbG9jaywgeyB0eXBlOiAnQmxvY2snIH0pIGFzIHVua25vd24pIGFzIEFTVC5CbG9jaztcbiAgfSBlbHNlIHtcbiAgICBkZWZhdWx0QmxvY2sgPSBfZGVmYXVsdEJsb2NrO1xuICB9XG5cbiAgaWYgKF9lbHNlQmxvY2sgIT09IHVuZGVmaW5lZCAmJiBfZWxzZUJsb2NrICE9PSBudWxsICYmIF9lbHNlQmxvY2sudHlwZSA9PT0gJ1RlbXBsYXRlJykge1xuICAgIGlmIChERVZNT0RFKSB7XG4gICAgICBkZXByZWNhdGUoYGIucHJvZ3JhbSBpcyBkZXByZWNhdGVkLiBVc2UgYi5ibG9ja0l0c2VsZiBpbnN0ZWFkLmApO1xuICAgIH1cblxuICAgIGVsc2VCbG9jayA9IChhc3NpZ24oe30sIF9lbHNlQmxvY2ssIHsgdHlwZTogJ0Jsb2NrJyB9KSBhcyB1bmtub3duKSBhcyBBU1QuQmxvY2s7XG4gIH0gZWxzZSB7XG4gICAgZWxzZUJsb2NrID0gX2Vsc2VCbG9jaztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0Jsb2NrU3RhdGVtZW50JyxcbiAgICBwYXRoOiBidWlsZFBhdGgocGF0aCksXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIHByb2dyYW06IGRlZmF1bHRCbG9jayB8fCBudWxsLFxuICAgIGludmVyc2U6IGVsc2VCbG9jayB8fCBudWxsLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICAgIG9wZW5TdHJpcDogb3BlblN0cmlwIHx8IHsgb3BlbjogZmFsc2UsIGNsb3NlOiBmYWxzZSB9LFxuICAgIGludmVyc2VTdHJpcDogaW52ZXJzZVN0cmlwIHx8IHsgb3BlbjogZmFsc2UsIGNsb3NlOiBmYWxzZSB9LFxuICAgIGNsb3NlU3RyaXA6IGNsb3NlU3RyaXAgfHwgeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbWVudE1vZGlmaWVyKFxuICBwYXRoOiBCdWlsZGVyUGF0aCxcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICBsb2M/OiBPcHRpb248QVNULlNvdXJjZUxvY2F0aW9uPlxuKTogQVNULkVsZW1lbnRNb2RpZmllclN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0VsZW1lbnRNb2RpZmllclN0YXRlbWVudCcsXG4gICAgcGF0aDogYnVpbGRQYXRoKHBhdGgpLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRQYXJ0aWFsKFxuICBuYW1lOiBBU1QuUGF0aEV4cHJlc3Npb24sXG4gIHBhcmFtcz86IEFTVC5FeHByZXNzaW9uW10sXG4gIGhhc2g/OiBBU1QuSGFzaCxcbiAgaW5kZW50Pzogc3RyaW5nLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5QYXJ0aWFsU3RhdGVtZW50IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnUGFydGlhbFN0YXRlbWVudCcsXG4gICAgbmFtZTogbmFtZSxcbiAgICBwYXJhbXM6IHBhcmFtcyB8fCBbXSxcbiAgICBoYXNoOiBoYXNoIHx8IGJ1aWxkSGFzaChbXSksXG4gICAgaW5kZW50OiBpbmRlbnQgfHwgJycsXG4gICAgc3RyaXA6IHsgb3BlbjogZmFsc2UsIGNsb3NlOiBmYWxzZSB9LFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZENvbW1lbnQodmFsdWU6IHN0cmluZywgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULkNvbW1lbnRTdGF0ZW1lbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdDb21tZW50U3RhdGVtZW50JyxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTXVzdGFjaGVDb21tZW50KFxuICB2YWx1ZTogc3RyaW5nLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQnLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRDb25jYXQoXG4gIHBhcnRzOiAoQVNULlRleHROb2RlIHwgQVNULk11c3RhY2hlU3RhdGVtZW50KVtdLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5Db25jYXRTdGF0ZW1lbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdDb25jYXRTdGF0ZW1lbnQnLFxuICAgIHBhcnRzOiBwYXJ0cyB8fCBbXSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuLy8gTm9kZXNcblxuZXhwb3J0IHR5cGUgRWxlbWVudEFyZ3MgPVxuICB8IFsnYXR0cnMnLCAuLi5BdHRyU2V4cFtdXVxuICB8IFsnbW9kaWZpZXJzJywgLi4uTW9kaWZpZXJTZXhwW11dXG4gIHwgWydib2R5JywgLi4uQVNULlN0YXRlbWVudFtdXVxuICB8IFsnY29tbWVudHMnLCAuLi5FbGVtZW50Q29tbWVudFtdXVxuICB8IFsnYXMnLCAuLi5zdHJpbmdbXV1cbiAgfCBbJ2xvYycsIEFTVC5Tb3VyY2VMb2NhdGlvbl07XG5cbmV4cG9ydCB0eXBlIFBhdGhTZXhwID0gc3RyaW5nIHwgWydwYXRoJywgc3RyaW5nLCBMb2NTZXhwP107XG5cbmV4cG9ydCB0eXBlIE1vZGlmaWVyU2V4cCA9XG4gIHwgc3RyaW5nXG4gIHwgW1BhdGhTZXhwLCBMb2NTZXhwP11cbiAgfCBbUGF0aFNleHAsIEFTVC5FeHByZXNzaW9uW10sIExvY1NleHA/XVxuICB8IFtQYXRoU2V4cCwgQVNULkV4cHJlc3Npb25bXSwgRGljdDxBU1QuRXhwcmVzc2lvbj4sIExvY1NleHA/XTtcblxuZXhwb3J0IHR5cGUgQXR0clNleHAgPSBbc3RyaW5nLCBBU1QuQXR0ck5vZGVbJ3ZhbHVlJ10gfCBzdHJpbmcsIExvY1NleHA/XTtcblxuZXhwb3J0IHR5cGUgTG9jU2V4cCA9IFsnbG9jJywgQVNULlNvdXJjZUxvY2F0aW9uXTtcblxuZXhwb3J0IHR5cGUgRWxlbWVudENvbW1lbnQgPSBBU1QuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50IHwgQVNULlNvdXJjZUxvY2F0aW9uIHwgc3RyaW5nO1xuXG5leHBvcnQgdHlwZSBTZXhwVmFsdWUgPVxuICB8IHN0cmluZ1xuICB8IEFTVC5FeHByZXNzaW9uW11cbiAgfCBEaWN0PEFTVC5FeHByZXNzaW9uPlxuICB8IExvY1NleHBcbiAgfCBQYXRoU2V4cFxuICB8IHVuZGVmaW5lZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9jU2V4cCh2YWx1ZTogU2V4cFZhbHVlKTogdmFsdWUgaXMgTG9jU2V4cCB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDIgJiYgdmFsdWVbMF0gPT09ICdsb2MnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQYXJhbXNTZXhwKHZhbHVlOiBTZXhwVmFsdWUpOiB2YWx1ZSBpcyBBU1QuRXhwcmVzc2lvbltdIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmICFpc0xvY1NleHAodmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNIYXNoU2V4cCh2YWx1ZTogU2V4cFZhbHVlKTogdmFsdWUgaXMgRGljdDxBU1QuRXhwcmVzc2lvbj4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBleHBlY3RUeXBlPERpY3Q8QVNULkV4cHJlc3Npb24+Pih2YWx1ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV4cGVjdFR5cGU8VD4oX2lucHV0OiBUKTogdm9pZCB7XG4gIHJldHVybjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZU1vZGlmaWVyKHNleHA6IE1vZGlmaWVyU2V4cCk6IEFTVC5FbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQge1xuICBpZiAodHlwZW9mIHNleHAgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGJ1aWxkRWxlbWVudE1vZGlmaWVyKHNleHApO1xuICB9XG5cbiAgbGV0IHBhdGg6IEFTVC5QYXRoRXhwcmVzc2lvbiA9IG5vcm1hbGl6ZVBhdGgoc2V4cFswXSk7XG4gIGxldCBwYXJhbXM6IEFTVC5FeHByZXNzaW9uW10gfCB1bmRlZmluZWQ7XG4gIGxldCBoYXNoOiBBU1QuSGFzaCB8IHVuZGVmaW5lZDtcbiAgbGV0IGxvYzogQVNULlNvdXJjZUxvY2F0aW9uIHwgbnVsbCA9IG51bGw7XG5cbiAgbGV0IHBhcnRzID0gc2V4cC5zbGljZSgxKTtcbiAgbGV0IG5leHQgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gIHByb2Nlc3M6IHtcbiAgICBpZiAoaXNQYXJhbXNTZXhwKG5leHQpKSB7XG4gICAgICBwYXJhbXMgPSBuZXh0IGFzIEFTVC5FeHByZXNzaW9uW107XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrIHByb2Nlc3M7XG4gICAgfVxuXG4gICAgbmV4dCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoaXNIYXNoU2V4cChuZXh0KSkge1xuICAgICAgaGFzaCA9IG5vcm1hbGl6ZUhhc2gobmV4dCBhcyBEaWN0PEFTVC5FeHByZXNzaW9uPik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrIHByb2Nlc3M7XG4gICAgfVxuICB9XG5cbiAgaWYgKGlzTG9jU2V4cChuZXh0KSkge1xuICAgIGxvYyA9IG5leHRbMV07XG4gIH1cblxuICByZXR1cm4gYnVpbGRFbGVtZW50TW9kaWZpZXIocGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQXR0cihzZXhwOiBBdHRyU2V4cCk6IEFTVC5BdHRyTm9kZSB7XG4gIGxldCBuYW1lID0gc2V4cFswXTtcbiAgbGV0IHZhbHVlO1xuXG4gIGlmICh0eXBlb2Ygc2V4cFsxXSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IGJ1aWxkVGV4dChzZXhwWzFdKTtcbiAgfSBlbHNlIHtcbiAgICB2YWx1ZSA9IHNleHBbMV07XG4gIH1cblxuICBsZXQgbG9jID0gc2V4cFsyXSA/IHNleHBbMl1bMV0gOiB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIGJ1aWxkQXR0cihuYW1lLCB2YWx1ZSwgbG9jKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUhhc2goaGFzaDogRGljdDxBU1QuRXhwcmVzc2lvbj4sIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbik6IEFTVC5IYXNoIHtcbiAgbGV0IHBhaXJzOiBBU1QuSGFzaFBhaXJbXSA9IFtdO1xuXG4gIE9iamVjdC5rZXlzKGhhc2gpLmZvckVhY2goa2V5ID0+IHtcbiAgICBwYWlycy5wdXNoKGJ1aWxkUGFpcihrZXksIGhhc2hba2V5XSkpO1xuICB9KTtcblxuICByZXR1cm4gYnVpbGRIYXNoKHBhaXJzLCBsb2MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGF0aChwYXRoOiBQYXRoU2V4cCk6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYnVpbGRQYXRoKHBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBidWlsZFBhdGgocGF0aFsxXSwgcGF0aFsyXSAmJiBwYXRoWzJdWzFdKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplRWxlbWVudE9wdGlvbnMoLi4uYXJnczogRWxlbWVudEFyZ3NbXSk6IEJ1aWxkRWxlbWVudE9wdGlvbnMge1xuICBsZXQgb3V0OiBCdWlsZEVsZW1lbnRPcHRpb25zID0ge307XG5cbiAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcbiAgICBzd2l0Y2ggKGFyZ1swXSkge1xuICAgICAgY2FzZSAnYXR0cnMnOiB7XG4gICAgICAgIGxldCBbLCAuLi5yZXN0XSA9IGFyZztcbiAgICAgICAgb3V0LmF0dHJzID0gcmVzdC5tYXAobm9ybWFsaXplQXR0cik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnbW9kaWZpZXJzJzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5tb2RpZmllcnMgPSByZXN0Lm1hcChub3JtYWxpemVNb2RpZmllcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnYm9keSc6IHtcbiAgICAgICAgbGV0IFssIC4uLnJlc3RdID0gYXJnO1xuICAgICAgICBvdXQuY2hpbGRyZW4gPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2NvbW1lbnRzJzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG5cbiAgICAgICAgb3V0LmNvbW1lbnRzID0gcmVzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdhcyc6IHtcbiAgICAgICAgbGV0IFssIC4uLnJlc3RdID0gYXJnO1xuICAgICAgICBvdXQuYmxvY2tQYXJhbXMgPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2xvYyc6IHtcbiAgICAgICAgbGV0IFssIHJlc3RdID0gYXJnO1xuICAgICAgICBvdXQubG9jID0gcmVzdDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdWlsZEVsZW1lbnRPcHRpb25zIHtcbiAgYXR0cnM/OiBBU1QuQXR0ck5vZGVbXTtcbiAgbW9kaWZpZXJzPzogQVNULkVsZW1lbnRNb2RpZmllclN0YXRlbWVudFtdO1xuICBjaGlsZHJlbj86IEFTVC5TdGF0ZW1lbnRbXTtcbiAgY29tbWVudHM/OiBFbGVtZW50Q29tbWVudFtdO1xuICBibG9ja1BhcmFtcz86IHN0cmluZ1tdO1xuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb247XG59XG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbWVudCh0YWc6IFRhZ0Rlc2NyaXB0b3IsIG9wdGlvbnM/OiBCdWlsZEVsZW1lbnRPcHRpb25zKTogQVNULkVsZW1lbnROb2RlO1xuZnVuY3Rpb24gYnVpbGRFbGVtZW50KHRhZzogVGFnRGVzY3JpcHRvciwgLi4ub3B0aW9uczogRWxlbWVudEFyZ3NbXSk6IEFTVC5FbGVtZW50Tm9kZTtcbmZ1bmN0aW9uIGJ1aWxkRWxlbWVudChcbiAgdGFnOiBUYWdEZXNjcmlwdG9yLFxuICBvcHRpb25zPzogQnVpbGRFbGVtZW50T3B0aW9ucyB8IEVsZW1lbnRBcmdzLFxuICAuLi5yZXN0OiBFbGVtZW50QXJnc1tdXG4pOiBBU1QuRWxlbWVudE5vZGUge1xuICBsZXQgbm9ybWFsaXplZDogQnVpbGRFbGVtZW50T3B0aW9ucztcbiAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICBub3JtYWxpemVkID0gbm9ybWFsaXplRWxlbWVudE9wdGlvbnMob3B0aW9ucywgLi4ucmVzdCk7XG4gIH0gZWxzZSB7XG4gICAgbm9ybWFsaXplZCA9IG9wdGlvbnMgfHwge307XG4gIH1cblxuICBsZXQgeyBhdHRycywgYmxvY2tQYXJhbXMsIG1vZGlmaWVycywgY29tbWVudHMsIGNoaWxkcmVuLCBsb2MgfSA9IG5vcm1hbGl6ZWQ7XG5cbiAgLy8gdGhpcyBpcyB1c2VkIGZvciBiYWNrd2FyZHMgY29tcGF0LCBwcmlvciB0byBgc2VsZkNsb3NpbmdgIGJlaW5nIHBhcnQgb2YgdGhlIEVsZW1lbnROb2RlIEFTVFxuICBsZXQgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiB0YWcgPT09ICdvYmplY3QnKSB7XG4gICAgc2VsZkNsb3NpbmcgPSB0YWcuc2VsZkNsb3Npbmc7XG4gICAgdGFnID0gdGFnLm5hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHRhZy5zbGljZSgtMSkgPT09ICcvJykge1xuICAgICAgdGFnID0gdGFnLnNsaWNlKDAsIC0xKTtcbiAgICAgIHNlbGZDbG9zaW5nID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdFbGVtZW50Tm9kZScsXG4gICAgdGFnOiB0YWcgfHwgJycsXG4gICAgc2VsZkNsb3Npbmc6IHNlbGZDbG9zaW5nLFxuICAgIGF0dHJpYnV0ZXM6IGF0dHJzIHx8IFtdLFxuICAgIGJsb2NrUGFyYW1zOiBibG9ja1BhcmFtcyB8fCBbXSxcbiAgICBtb2RpZmllcnM6IG1vZGlmaWVycyB8fCBbXSxcbiAgICBjb21tZW50czogKGNvbW1lbnRzIGFzIEFTVC5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnRbXSkgfHwgW10sXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZEF0dHIoXG4gIG5hbWU6IHN0cmluZyxcbiAgdmFsdWU6IEFTVC5BdHRyTm9kZVsndmFsdWUnXSxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBBU1QuQXR0ck5vZGUge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdBdHRyTm9kZScsXG4gICAgbmFtZTogbmFtZSxcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGV4dChjaGFycz86IHN0cmluZywgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULlRleHROb2RlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnVGV4dE5vZGUnLFxuICAgIGNoYXJzOiBjaGFycyB8fCAnJyxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuLy8gRXhwcmVzc2lvbnNcblxuZnVuY3Rpb24gYnVpbGRTZXhwcihcbiAgcGF0aDogQnVpbGRlclBhdGgsXG4gIHBhcmFtcz86IEFTVC5FeHByZXNzaW9uW10sXG4gIGhhc2g/OiBBU1QuSGFzaCxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBBU1QuU3ViRXhwcmVzc2lvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1N1YkV4cHJlc3Npb24nLFxuICAgIHBhdGg6IGJ1aWxkUGF0aChwYXRoKSxcbiAgICBwYXJhbXM6IHBhcmFtcyB8fCBbXSxcbiAgICBoYXNoOiBoYXNoIHx8IGJ1aWxkSGFzaChbXSksXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUGF0aChvcmlnaW5hbDogQnVpbGRlclBhdGgsIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbik6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gIGlmICh0eXBlb2Ygb3JpZ2luYWwgIT09ICdzdHJpbmcnKSByZXR1cm4gb3JpZ2luYWw7XG5cbiAgbGV0IHBhcnRzID0gb3JpZ2luYWwuc3BsaXQoJy4nKTtcbiAgbGV0IHRoaXNIZWFkID0gZmFsc2U7XG5cbiAgaWYgKHBhcnRzWzBdID09PSAndGhpcycpIHtcbiAgICB0aGlzSGVhZCA9IHRydWU7XG4gICAgcGFydHMgPSBwYXJ0cy5zbGljZSgxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1BhdGhFeHByZXNzaW9uJyxcbiAgICBvcmlnaW5hbCxcbiAgICB0aGlzOiB0aGlzSGVhZCxcbiAgICBwYXJ0cyxcbiAgICBkYXRhOiBmYWxzZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRMaXRlcmFsPFQgZXh0ZW5kcyBBU1QuTGl0ZXJhbD4oXG4gIHR5cGU6IFRbJ3R5cGUnXSxcbiAgdmFsdWU6IFRbJ3ZhbHVlJ10sXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogVCB7XG4gIHJldHVybiB7XG4gICAgdHlwZSxcbiAgICB2YWx1ZSxcbiAgICBvcmlnaW5hbDogdmFsdWUsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH0gYXMgVDtcbn1cblxuLy8gTWlzY2VsbGFuZW91c1xuXG5mdW5jdGlvbiBidWlsZEhhc2gocGFpcnM/OiBBU1QuSGFzaFBhaXJbXSwgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULkhhc2gge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdIYXNoJyxcbiAgICBwYWlyczogcGFpcnMgfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUGFpcihrZXk6IHN0cmluZywgdmFsdWU6IEFTVC5FeHByZXNzaW9uLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuSGFzaFBhaXIge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdIYXNoUGFpcicsXG4gICAga2V5OiBrZXksXG4gICAgdmFsdWUsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUHJvZ3JhbShcbiAgYm9keT86IEFTVC5TdGF0ZW1lbnRbXSxcbiAgYmxvY2tQYXJhbXM/OiBzdHJpbmdbXSxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBBU1QuVGVtcGxhdGUge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUZW1wbGF0ZScsXG4gICAgYm9keTogYm9keSB8fCBbXSxcbiAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMgfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQmxvY2tJdHNlbGYoXG4gIGJvZHk/OiBBU1QuU3RhdGVtZW50W10sXG4gIGJsb2NrUGFyYW1zPzogc3RyaW5nW10sXG4gIGNoYWluZWQgPSBmYWxzZSxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBBU1QuQmxvY2sge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCbG9jaycsXG4gICAgYm9keTogYm9keSB8fCBbXSxcbiAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMgfHwgW10sXG4gICAgY2hhaW5lZCxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRUZW1wbGF0ZShcbiAgYm9keT86IEFTVC5TdGF0ZW1lbnRbXSxcbiAgYmxvY2tQYXJhbXM/OiBzdHJpbmdbXSxcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uXG4pOiBBU1QuVGVtcGxhdGUge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUZW1wbGF0ZScsXG4gICAgYm9keTogYm9keSB8fCBbXSxcbiAgICBibG9ja1BhcmFtczogYmxvY2tQYXJhbXMgfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkU291cmNlKHNvdXJjZT86IHN0cmluZykge1xuICByZXR1cm4gc291cmNlIHx8IG51bGw7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkUG9zaXRpb24obGluZTogbnVtYmVyLCBjb2x1bW46IG51bWJlcikge1xuICByZXR1cm4ge1xuICAgIGxpbmUsXG4gICAgY29sdW1uLFxuICB9O1xufVxuXG5leHBvcnQgY29uc3QgU1lOVEhFVElDOiBBU1QuU291cmNlTG9jYXRpb24gPSB7XG4gIHNvdXJjZTogJyhzeW50aGV0aWMpJyxcbiAgc3RhcnQ6IHsgbGluZTogMSwgY29sdW1uOiAwIH0sXG4gIGVuZDogeyBsaW5lOiAxLCBjb2x1bW46IDAgfSxcbn07XG5cbmZ1bmN0aW9uIGJ1aWxkTG9jKGxvYzogT3B0aW9uPEFTVC5Tb3VyY2VMb2NhdGlvbj4pOiBBU1QuU291cmNlTG9jYXRpb247XG5mdW5jdGlvbiBidWlsZExvYyhcbiAgc3RhcnRMaW5lOiBudW1iZXIsXG4gIHN0YXJ0Q29sdW1uOiBudW1iZXIsXG4gIGVuZExpbmU/OiBudW1iZXIsXG4gIGVuZENvbHVtbj86IG51bWJlcixcbiAgc291cmNlPzogc3RyaW5nXG4pOiBBU1QuU291cmNlTG9jYXRpb247XG5cbmZ1bmN0aW9uIGJ1aWxkTG9jKC4uLmFyZ3M6IGFueVtdKTogQVNULlNvdXJjZUxvY2F0aW9uIHtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgbGV0IGxvYyA9IGFyZ3NbMF07XG5cbiAgICBpZiAobG9jICYmIHR5cGVvZiBsb2MgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzb3VyY2U6IGJ1aWxkU291cmNlKGxvYy5zb3VyY2UpLFxuICAgICAgICBzdGFydDogYnVpbGRQb3NpdGlvbihsb2Muc3RhcnQubGluZSwgbG9jLnN0YXJ0LmNvbHVtbiksXG4gICAgICAgIGVuZDogYnVpbGRQb3NpdGlvbihsb2MuZW5kLmxpbmUsIGxvYy5lbmQuY29sdW1uKSxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBTWU5USEVUSUM7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBbc3RhcnRMaW5lLCBzdGFydENvbHVtbiwgZW5kTGluZSwgZW5kQ29sdW1uLCBzb3VyY2VdID0gYXJncztcbiAgICByZXR1cm4ge1xuICAgICAgc291cmNlOiBidWlsZFNvdXJjZShzb3VyY2UpLFxuICAgICAgc3RhcnQ6IGJ1aWxkUG9zaXRpb24oc3RhcnRMaW5lLCBzdGFydENvbHVtbiksXG4gICAgICBlbmQ6IGJ1aWxkUG9zaXRpb24oZW5kTGluZSwgZW5kQ29sdW1uKSxcbiAgICB9O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbXVzdGFjaGU6IGJ1aWxkTXVzdGFjaGUsXG4gIGJsb2NrOiBidWlsZEJsb2NrLFxuICBwYXJ0aWFsOiBidWlsZFBhcnRpYWwsXG4gIGNvbW1lbnQ6IGJ1aWxkQ29tbWVudCxcbiAgbXVzdGFjaGVDb21tZW50OiBidWlsZE11c3RhY2hlQ29tbWVudCxcbiAgZWxlbWVudDogYnVpbGRFbGVtZW50LFxuICBlbGVtZW50TW9kaWZpZXI6IGJ1aWxkRWxlbWVudE1vZGlmaWVyLFxuICBhdHRyOiBidWlsZEF0dHIsXG4gIHRleHQ6IGJ1aWxkVGV4dCxcbiAgc2V4cHI6IGJ1aWxkU2V4cHIsXG4gIHBhdGg6IGJ1aWxkUGF0aCxcbiAgY29uY2F0OiBidWlsZENvbmNhdCxcbiAgaGFzaDogYnVpbGRIYXNoLFxuICBwYWlyOiBidWlsZFBhaXIsXG4gIGxpdGVyYWw6IGJ1aWxkTGl0ZXJhbCxcbiAgcHJvZ3JhbTogYnVpbGRQcm9ncmFtLFxuICBibG9ja0l0c2VsZjogYnVpbGRCbG9ja0l0c2VsZixcbiAgdGVtcGxhdGU6IGJ1aWxkVGVtcGxhdGUsXG4gIGxvYzogYnVpbGRMb2MsXG4gIHBvczogYnVpbGRQb3NpdGlvbixcblxuICBzdHJpbmc6IGxpdGVyYWwoJ1N0cmluZ0xpdGVyYWwnKSBhcyAodmFsdWU6IHN0cmluZykgPT4gU3RyaW5nTGl0ZXJhbCxcbiAgYm9vbGVhbjogbGl0ZXJhbCgnQm9vbGVhbkxpdGVyYWwnKSBhcyAodmFsdWU6IGJvb2xlYW4pID0+IEJvb2xlYW5MaXRlcmFsLFxuICBudW1iZXI6IGxpdGVyYWwoJ051bWJlckxpdGVyYWwnKSBhcyAodmFsdWU6IG51bWJlcikgPT4gTnVtYmVyTGl0ZXJhbCxcbiAgdW5kZWZpbmVkKCkge1xuICAgIHJldHVybiBidWlsZExpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQpO1xuICB9LFxuICBudWxsKCkge1xuICAgIHJldHVybiBidWlsZExpdGVyYWwoJ051bGxMaXRlcmFsJywgbnVsbCk7XG4gIH0sXG59O1xuXG50eXBlIEJ1aWxkTGl0ZXJhbDxUIGV4dGVuZHMgQVNULkxpdGVyYWw+ID0gKHZhbHVlOiBUWyd2YWx1ZSddKSA9PiBUO1xuXG5mdW5jdGlvbiBsaXRlcmFsPFQgZXh0ZW5kcyBBU1QuTGl0ZXJhbD4odHlwZTogVFsndHlwZSddKTogQnVpbGRMaXRlcmFsPFQ+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlOiBUWyd2YWx1ZSddKTogVCB7XG4gICAgcmV0dXJuIGJ1aWxkTGl0ZXJhbCh0eXBlLCB2YWx1ZSk7XG4gIH07XG59XG4iLCJpbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN5bnRheEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBsb2NhdGlvbjogQVNULlNvdXJjZUxvY2F0aW9uO1xuICBjb25zdHJ1Y3RvcjogU3ludGF4RXJyb3JDb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTeW50YXhFcnJvckNvbnN0cnVjdG9yIHtcbiAgbmV3IChtZXNzYWdlOiBzdHJpbmcsIGxvY2F0aW9uOiBBU1QuU291cmNlTG9jYXRpb24pOiBTeW50YXhFcnJvcjtcbiAgcmVhZG9ubHkgcHJvdG90eXBlOiBTeW50YXhFcnJvcjtcbn1cblxuLyoqXG4gKiBTdWJjbGFzcyBvZiBgRXJyb3JgIHdpdGggYWRkaXRpb25hbCBpbmZvcm1hdGlvblxuICogYWJvdXQgbG9jYXRpb24gb2YgaW5jb3JyZWN0IG1hcmt1cC5cbiAqL1xuY29uc3QgU3ludGF4RXJyb3I6IFN5bnRheEVycm9yQ29uc3RydWN0b3IgPSAoZnVuY3Rpb24oKSB7XG4gIFN5bnRheEVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbiAgU3ludGF4RXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ludGF4RXJyb3I7XG5cbiAgZnVuY3Rpb24gU3ludGF4RXJyb3IodGhpczogU3ludGF4RXJyb3IsIG1lc3NhZ2U6IHN0cmluZywgbG9jYXRpb246IEFTVC5Tb3VyY2VMb2NhdGlvbikge1xuICAgIGxldCBlcnJvciA9IEVycm9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gIH1cblxuICByZXR1cm4gU3ludGF4RXJyb3IgYXMgYW55O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgU3ludGF4RXJyb3I7XG4iLCJpbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCBTeW50YXhFcnJvciBmcm9tICcuL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuXG4vLyBSZWdleCB0byB2YWxpZGF0ZSB0aGUgaWRlbnRpZmllciBmb3IgYmxvY2sgcGFyYW1ldGVycy5cbi8vIEJhc2VkIG9uIHRoZSBJRCB2YWxpZGF0aW9uIHJlZ2V4IGluIEhhbmRsZWJhcnMuXG5cbmxldCBJRF9JTlZFUlNFX1BBVFRFUk4gPSAvWyFcIiMlLSxcXC5cXC87LT5AXFxbLVxcXmBcXHstfl0vO1xuXG4vLyBDaGVja3MgdGhlIGVsZW1lbnQncyBhdHRyaWJ1dGVzIHRvIHNlZSBpZiBpdCB1c2VzIGJsb2NrIHBhcmFtcy5cbi8vIElmIGl0IGRvZXMsIHJlZ2lzdGVycyB0aGUgYmxvY2sgcGFyYW1zIHdpdGggdGhlIHByb2dyYW0gYW5kXG4vLyByZW1vdmVzIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZXMgZnJvbSB0aGUgZWxlbWVudC5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQ6IEFTVC5FbGVtZW50Tm9kZSkge1xuICBsZXQgcGFyYW1zID0gcGFyc2VCbG9ja1BhcmFtcyhlbGVtZW50KTtcbiAgaWYgKHBhcmFtcykgZWxlbWVudC5ibG9ja1BhcmFtcyA9IHBhcmFtcztcbn1cblxuZnVuY3Rpb24gcGFyc2VCbG9ja1BhcmFtcyhlbGVtZW50OiBBU1QuRWxlbWVudE5vZGUpOiBPcHRpb248c3RyaW5nW10+IHtcbiAgbGV0IGwgPSBlbGVtZW50LmF0dHJpYnV0ZXMubGVuZ3RoO1xuICBsZXQgYXR0ck5hbWVzID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBhdHRyTmFtZXMucHVzaChlbGVtZW50LmF0dHJpYnV0ZXNbaV0ubmFtZSk7XG4gIH1cblxuICBsZXQgYXNJbmRleCA9IGF0dHJOYW1lcy5pbmRleE9mKCdhcycpO1xuXG4gIGlmIChhc0luZGV4ICE9PSAtMSAmJiBsID4gYXNJbmRleCAmJiBhdHRyTmFtZXNbYXNJbmRleCArIDFdLmNoYXJBdCgwKSA9PT0gJ3wnKSB7XG4gICAgLy8gU29tZSBiYXNpYyB2YWxpZGF0aW9uLCBzaW5jZSB3ZSdyZSBkb2luZyB0aGUgcGFyc2luZyBvdXJzZWx2ZXNcbiAgICBsZXQgcGFyYW1zU3RyaW5nID0gYXR0ck5hbWVzLnNsaWNlKGFzSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBpZiAoXG4gICAgICBwYXJhbXNTdHJpbmcuY2hhckF0KHBhcmFtc1N0cmluZy5sZW5ndGggLSAxKSAhPT0gJ3wnIHx8XG4gICAgICBwYXJhbXNTdHJpbmcubWF0Y2goL1xcfC9nKSEubGVuZ3RoICE9PSAyXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJJbnZhbGlkIGJsb2NrIHBhcmFtZXRlcnMgc3ludGF4OiAnXCIgKyBwYXJhbXNTdHJpbmcgKyBcIidcIiwgZWxlbWVudC5sb2MpO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gYXNJbmRleCArIDE7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxldCBwYXJhbSA9IGF0dHJOYW1lc1tpXS5yZXBsYWNlKC9cXHwvZywgJycpO1xuICAgICAgaWYgKHBhcmFtICE9PSAnJykge1xuICAgICAgICBpZiAoSURfSU5WRVJTRV9QQVRURVJOLnRlc3QocGFyYW0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgICAgXCJJbnZhbGlkIGlkZW50aWZpZXIgZm9yIGJsb2NrIHBhcmFtZXRlcnM6ICdcIiArIHBhcmFtICsgXCInIGluICdcIiArIHBhcmFtc1N0cmluZyArIFwiJ1wiLFxuICAgICAgICAgICAgZWxlbWVudC5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcy5wdXNoKHBhcmFtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBcIkNhbm5vdCB1c2UgemVybyBibG9jayBwYXJhbWV0ZXJzOiAnXCIgKyBwYXJhbXNTdHJpbmcgKyBcIidcIixcbiAgICAgICAgZWxlbWVudC5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzLnNsaWNlKDAsIGFzSW5kZXgpO1xuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkcmVuRm9yKFxuICBub2RlOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUgfCBBU1QuRWxlbWVudE5vZGVcbik6IEFTVC5Ub3BMZXZlbFN0YXRlbWVudFtdIHtcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdCbG9jayc6XG4gICAgY2FzZSAnVGVtcGxhdGUnOlxuICAgICAgcmV0dXJuIG5vZGUuYm9keTtcbiAgICBjYXNlICdFbGVtZW50Tm9kZSc6XG4gICAgICByZXR1cm4gbm9kZS5jaGlsZHJlbjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ2hpbGQoXG4gIHBhcmVudDogQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlIHwgQVNULkVsZW1lbnROb2RlLFxuICBub2RlOiBBU1QuU3RhdGVtZW50XG4pIHtcbiAgY2hpbGRyZW5Gb3IocGFyZW50KS5wdXNoKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMaXRlcmFsKFxuICBwYXRoOiBBU1QuUGF0aEV4cHJlc3Npb24gfCBIQlMuUGF0aEV4cHJlc3Npb24gfCBBU1QuTGl0ZXJhbCB8IEhCUy5MaXRlcmFsXG4pOiBwYXRoIGlzIEFTVC5MaXRlcmFsIHtcbiAgcmV0dXJuIChcbiAgICBwYXRoLnR5cGUgPT09ICdTdHJpbmdMaXRlcmFsJyB8fFxuICAgIHBhdGgudHlwZSA9PT0gJ0Jvb2xlYW5MaXRlcmFsJyB8fFxuICAgIHBhdGgudHlwZSA9PT0gJ051bWJlckxpdGVyYWwnIHx8XG4gICAgcGF0aC50eXBlID09PSAnTnVsbExpdGVyYWwnIHx8XG4gICAgcGF0aC50eXBlID09PSAnVW5kZWZpbmVkTGl0ZXJhbCdcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50TGl0ZXJhbChsaXRlcmFsOiBBU1QuTGl0ZXJhbCk6IHN0cmluZyB7XG4gIGlmIChsaXRlcmFsLnR5cGUgPT09ICdVbmRlZmluZWRMaXRlcmFsJykge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobGl0ZXJhbC52YWx1ZSk7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIEV2ZW50ZWRUb2tlbml6ZXIsXG4gIEVudGl0eVBhcnNlcixcbiAgSFRNTDVOYW1lZENoYXJSZWZzIGFzIG5hbWVkQ2hhclJlZnMsXG59IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydCwgZXhwZWN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEVsZW1lbnQgPSBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2sgfCBBU1QuRWxlbWVudE5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnPFQgZXh0ZW5kcyAnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+IHtcbiAgdHlwZTogVDtcbiAgbmFtZTogc3RyaW5nO1xuICBhdHRyaWJ1dGVzOiBhbnlbXTtcbiAgbW9kaWZpZXJzOiBhbnlbXTtcbiAgY29tbWVudHM6IGFueVtdO1xuICBzZWxmQ2xvc2luZzogYm9vbGVhbjtcbiAgbG9jOiBBU1QuU291cmNlTG9jYXRpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXTtcbiAgaXNRdW90ZWQ6IGJvb2xlYW47XG4gIGlzRHluYW1pYzogYm9vbGVhbjtcbiAgc3RhcnQ6IEFTVC5Qb3NpdGlvbjtcbiAgdmFsdWVTdGFydExpbmU6IG51bWJlcjtcbiAgdmFsdWVTdGFydENvbHVtbjogbnVtYmVyO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGFyc2VyIHtcbiAgcHJvdGVjdGVkIGVsZW1lbnRTdGFjazogRWxlbWVudFtdID0gW107XG4gIHByaXZhdGUgc291cmNlOiBzdHJpbmdbXTtcbiAgcHVibGljIGN1cnJlbnRBdHRyaWJ1dGU6IE9wdGlvbjxBdHRyaWJ1dGU+ID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnROb2RlOiBPcHRpb248XG4gICAgQVNULkNvbW1lbnRTdGF0ZW1lbnQgfCBBU1QuVGV4dE5vZGUgfCBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPlxuICA+ID0gbnVsbDtcbiAgcHVibGljIHRva2VuaXplcjogRXZlbnRlZFRva2VuaXplcjtcblxuICBjb25zdHJ1Y3Rvcihzb3VyY2U6IHN0cmluZywgZW50aXR5UGFyc2VyID0gbmV3IEVudGl0eVBhcnNlcihuYW1lZENoYXJSZWZzKSkge1xuICAgIHRoaXMuc291cmNlID0gc291cmNlLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgdGhpcy50b2tlbml6ZXIgPSBuZXcgRXZlbnRlZFRva2VuaXplcih0aGlzLCBlbnRpdHlQYXJzZXIpO1xuICB9XG5cbiAgYWJzdHJhY3QgUHJvZ3JhbShub2RlOiBIQlMuUHJvZ3JhbSk6IEhCUy5PdXRwdXQ8J1Byb2dyYW0nPjtcbiAgYWJzdHJhY3QgTXVzdGFjaGVTdGF0ZW1lbnQobm9kZTogSEJTLk11c3RhY2hlU3RhdGVtZW50KTogSEJTLk91dHB1dDwnTXVzdGFjaGVTdGF0ZW1lbnQnPjtcbiAgYWJzdHJhY3QgRGVjb3JhdG9yKG5vZGU6IEhCUy5EZWNvcmF0b3IpOiBIQlMuT3V0cHV0PCdEZWNvcmF0b3InPjtcbiAgYWJzdHJhY3QgQmxvY2tTdGF0ZW1lbnQobm9kZTogSEJTLkJsb2NrU3RhdGVtZW50KTogSEJTLk91dHB1dDwnQmxvY2tTdGF0ZW1lbnQnPjtcbiAgYWJzdHJhY3QgRGVjb3JhdG9yQmxvY2sobm9kZTogSEJTLkRlY29yYXRvckJsb2NrKTogSEJTLk91dHB1dDwnRGVjb3JhdG9yQmxvY2snPjtcbiAgYWJzdHJhY3QgUGFydGlhbFN0YXRlbWVudChub2RlOiBIQlMuUGFydGlhbFN0YXRlbWVudCk6IEhCUy5PdXRwdXQ8J1BhcnRpYWxTdGF0ZW1lbnQnPjtcbiAgYWJzdHJhY3QgUGFydGlhbEJsb2NrU3RhdGVtZW50KFxuICAgIG5vZGU6IEhCUy5QYXJ0aWFsQmxvY2tTdGF0ZW1lbnRcbiAgKTogSEJTLk91dHB1dDwnUGFydGlhbEJsb2NrU3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IENvbnRlbnRTdGF0ZW1lbnQobm9kZTogSEJTLkNvbnRlbnRTdGF0ZW1lbnQpOiBIQlMuT3V0cHV0PCdDb250ZW50U3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IENvbW1lbnRTdGF0ZW1lbnQobm9kZTogSEJTLkNvbW1lbnRTdGF0ZW1lbnQpOiBIQlMuT3V0cHV0PCdDb21tZW50U3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IFN1YkV4cHJlc3Npb24obm9kZTogSEJTLlN1YkV4cHJlc3Npb24pOiBIQlMuT3V0cHV0PCdTdWJFeHByZXNzaW9uJz47XG4gIGFic3RyYWN0IFBhdGhFeHByZXNzaW9uKG5vZGU6IEhCUy5QYXRoRXhwcmVzc2lvbik6IEhCUy5PdXRwdXQ8J1BhdGhFeHByZXNzaW9uJz47XG4gIGFic3RyYWN0IFN0cmluZ0xpdGVyYWwobm9kZTogSEJTLlN0cmluZ0xpdGVyYWwpOiBIQlMuT3V0cHV0PCdTdHJpbmdMaXRlcmFsJz47XG4gIGFic3RyYWN0IEJvb2xlYW5MaXRlcmFsKG5vZGU6IEhCUy5Cb29sZWFuTGl0ZXJhbCk6IEhCUy5PdXRwdXQ8J0Jvb2xlYW5MaXRlcmFsJz47XG4gIGFic3RyYWN0IE51bWJlckxpdGVyYWwobm9kZTogSEJTLk51bWJlckxpdGVyYWwpOiBIQlMuT3V0cHV0PCdOdW1iZXJMaXRlcmFsJz47XG4gIGFic3RyYWN0IFVuZGVmaW5lZExpdGVyYWwobm9kZTogSEJTLlVuZGVmaW5lZExpdGVyYWwpOiBIQlMuT3V0cHV0PCdVbmRlZmluZWRMaXRlcmFsJz47XG4gIGFic3RyYWN0IE51bGxMaXRlcmFsKG5vZGU6IEhCUy5OdWxsTGl0ZXJhbCk6IEhCUy5PdXRwdXQ8J051bGxMaXRlcmFsJz47XG5cbiAgYWJzdHJhY3QgcmVzZXQoKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoRGF0YSgpOiB2b2lkO1xuICBhYnN0cmFjdCB0YWdPcGVuKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luRGF0YSgpOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBlbmRUb0RhdGEoY2hhcjogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5TdGFydFRhZygpOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBlbmRUb1RhZ05hbWUoY2hhcjogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5BdHRyaWJ1dGUoKTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwZW5kVG9BdHRyaWJ1dGVOYW1lKGNoYXI6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlVmFsdWUocXVvdGVkOiBib29sZWFuKTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwZW5kVG9BdHRyaWJ1dGVWYWx1ZShjaGFyOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpOiB2b2lkO1xuICBhYnN0cmFjdCBtYXJrVGFnQXNTZWxmQ2xvc2luZygpOiB2b2lkO1xuICBhYnN0cmFjdCBiZWdpbkVuZFRhZygpOiB2b2lkO1xuICBhYnN0cmFjdCBmaW5pc2hUYWcoKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5Db21tZW50KCk6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGVuZFRvQ29tbWVudERhdGEoY2hhcjogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQ29tbWVudCgpOiB2b2lkO1xuICBhYnN0cmFjdCByZXBvcnRTeW50YXhFcnJvcihlcnJvcjogc3RyaW5nKTogdm9pZDtcblxuICBnZXQgY3VycmVudEF0dHIoKTogQXR0cmlidXRlIHtcbiAgICByZXR1cm4gZXhwZWN0KHRoaXMuY3VycmVudEF0dHJpYnV0ZSwgJ2V4cGVjdGVkIGF0dHJpYnV0ZScpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUYWcoKTogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4ge1xuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBhc3NlcnQobm9kZSAmJiAobm9kZS50eXBlID09PSAnU3RhcnRUYWcnIHx8IG5vZGUudHlwZSA9PT0gJ0VuZFRhZycpLCAnZXhwZWN0ZWQgdGFnJyk7XG4gICAgcmV0dXJuIG5vZGUgYXMgVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz47XG4gIH1cblxuICBnZXQgY3VycmVudFN0YXJ0VGFnKCk6IFRhZzwnU3RhcnRUYWcnPiB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLmN1cnJlbnROb2RlO1xuICAgIGFzc2VydChub2RlICYmIG5vZGUudHlwZSA9PT0gJ1N0YXJ0VGFnJywgJ2V4cGVjdGVkIHN0YXJ0IHRhZycpO1xuICAgIHJldHVybiBub2RlIGFzIFRhZzwnU3RhcnRUYWcnPjtcbiAgfVxuXG4gIGdldCBjdXJyZW50RW5kVGFnKCk6IFRhZzwnRW5kVGFnJz4ge1xuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBhc3NlcnQobm9kZSAmJiBub2RlLnR5cGUgPT09ICdFbmRUYWcnLCAnZXhwZWN0ZWQgZW5kIHRhZycpO1xuICAgIHJldHVybiBub2RlIGFzIFRhZzwnRW5kVGFnJz47XG4gIH1cblxuICBnZXQgY3VycmVudENvbW1lbnQoKTogQVNULkNvbW1lbnRTdGF0ZW1lbnQge1xuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBhc3NlcnQobm9kZSAmJiBub2RlLnR5cGUgPT09ICdDb21tZW50U3RhdGVtZW50JywgJ2V4cGVjdGVkIGEgY29tbWVudCcpO1xuICAgIHJldHVybiBub2RlIGFzIEFTVC5Db21tZW50U3RhdGVtZW50O1xuICB9XG5cbiAgZ2V0IGN1cnJlbnREYXRhKCk6IEFTVC5UZXh0Tm9kZSB7XG4gICAgbGV0IG5vZGUgPSB0aGlzLmN1cnJlbnROb2RlO1xuICAgIGFzc2VydChub2RlICYmIG5vZGUudHlwZSA9PT0gJ1RleHROb2RlJywgJ2V4cGVjdGVkIGEgdGV4dCBub2RlJyk7XG4gICAgcmV0dXJuIG5vZGUgYXMgQVNULlRleHROb2RlO1xuICB9XG5cbiAgYWNjZXB0VGVtcGxhdGUobm9kZTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGUge1xuICAgIHJldHVybiAodGhpcyBhcyBhbnkpW25vZGUudHlwZV0obm9kZSkgYXMgQVNULlRlbXBsYXRlO1xuICB9XG5cbiAgYWNjZXB0Tm9kZShub2RlOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jayB8IEFTVC5UZW1wbGF0ZTtcbiAgYWNjZXB0Tm9kZTxVIGV4dGVuZHMgSEJTLk5vZGUgfCBBU1QuTm9kZT4obm9kZTogSEJTLk5vZGUpOiBVO1xuICBhY2NlcHROb2RlKG5vZGU6IEhCUy5Ob2RlKTogYW55IHtcbiAgICByZXR1cm4gKHRoaXMgYXMgYW55KVtub2RlLnR5cGVdKG5vZGUpO1xuICB9XG5cbiAgY3VycmVudEVsZW1lbnQoKTogRWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrW3RoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgc291cmNlRm9yTm9kZShub2RlOiBIQlMuTm9kZSwgZW5kTm9kZT86IHsgbG9jOiBIQlMuU291cmNlTG9jYXRpb24gfSk6IHN0cmluZyB7XG4gICAgbGV0IGZpcnN0TGluZSA9IG5vZGUubG9jLnN0YXJ0LmxpbmUgLSAxO1xuICAgIGxldCBjdXJyZW50TGluZSA9IGZpcnN0TGluZSAtIDE7XG4gICAgbGV0IGZpcnN0Q29sdW1uID0gbm9kZS5sb2Muc3RhcnQuY29sdW1uO1xuICAgIGxldCBzdHJpbmcgPSBbXTtcbiAgICBsZXQgbGluZTtcblxuICAgIGxldCBsYXN0TGluZTogbnVtYmVyO1xuICAgIGxldCBsYXN0Q29sdW1uOiBudW1iZXI7XG5cbiAgICBpZiAoZW5kTm9kZSkge1xuICAgICAgbGFzdExpbmUgPSBlbmROb2RlLmxvYy5lbmQubGluZSAtIDE7XG4gICAgICBsYXN0Q29sdW1uID0gZW5kTm9kZS5sb2MuZW5kLmNvbHVtbjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdExpbmUgPSBub2RlLmxvYy5lbmQubGluZSAtIDE7XG4gICAgICBsYXN0Q29sdW1uID0gbm9kZS5sb2MuZW5kLmNvbHVtbjtcbiAgICB9XG5cbiAgICB3aGlsZSAoY3VycmVudExpbmUgPCBsYXN0TGluZSkge1xuICAgICAgY3VycmVudExpbmUrKztcbiAgICAgIGxpbmUgPSB0aGlzLnNvdXJjZVtjdXJyZW50TGluZV07XG5cbiAgICAgIGlmIChjdXJyZW50TGluZSA9PT0gZmlyc3RMaW5lKSB7XG4gICAgICAgIGlmIChmaXJzdExpbmUgPT09IGxhc3RMaW5lKSB7XG4gICAgICAgICAgc3RyaW5nLnB1c2gobGluZS5zbGljZShmaXJzdENvbHVtbiwgbGFzdENvbHVtbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0cmluZy5wdXNoKGxpbmUuc2xpY2UoZmlyc3RDb2x1bW4pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjdXJyZW50TGluZSA9PT0gbGFzdExpbmUpIHtcbiAgICAgICAgc3RyaW5nLnB1c2gobGluZS5zbGljZSgwLCBsYXN0Q29sdW1uKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHJpbmcucHVzaChsaW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nLmpvaW4oJ1xcbicpO1xuICB9XG59XG4iLCJpbXBvcnQgYiBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgaXNMaXRlcmFsLCBwcmludExpdGVyYWwgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCB7IFBhcnNlciwgVGFnLCBBdHRyaWJ1dGUgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IFN5bnRheEVycm9yIGZyb20gJy4uL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBSZWNhc3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRva2VuaXplclN0YXRlIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMgZXh0ZW5kcyBQYXJzZXIge1xuICBhYnN0cmFjdCBhcHBlbmRUb0NvbW1lbnREYXRhKHM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlVmFsdWUocXVvdGVkOiBib29sZWFuKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQXR0cmlidXRlVmFsdWUoKTogdm9pZDtcblxuICBjdXJzb3JDb3VudCA9IDA7XG5cbiAgY3Vyc29yKCkge1xuICAgIHJldHVybiBgJWN1cnNvcjoke3RoaXMuY3Vyc29yQ291bnQrK30lYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGlzVG9wTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGU7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUge1xuICAgIGxldCBib2R5OiBBU1QuU3RhdGVtZW50W10gPSBbXTtcbiAgICB0aGlzLmN1cnNvckNvdW50ID0gMDtcblxuICAgIGxldCBub2RlO1xuXG4gICAgaWYgKHRoaXMuaXNUb3BMZXZlbCkge1xuICAgICAgbm9kZSA9IGIudGVtcGxhdGUoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5sb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gYi5ibG9ja0l0c2VsZihib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmNoYWluZWQsIHByb2dyYW0ubG9jKTtcbiAgICB9XG5cbiAgICBsZXQgaSxcbiAgICAgIGwgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuXG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmIChsID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuYWNjZXB0Tm9kZShwcm9ncmFtLmJvZHlbaV0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoYXQgdGhlIGVsZW1lbnQgc3RhY2sgaXMgYmFsYW5jZWQgcHJvcGVybHkuXG4gICAgbGV0IHBvcHBlZE5vZGUgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBpZiAocG9wcGVkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgbGV0IGVsZW1lbnROb2RlID0gcG9wcGVkTm9kZSBhcyBBU1QuRWxlbWVudE5vZGU7XG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1VuY2xvc2VkIGVsZW1lbnQgYCcgKyBlbGVtZW50Tm9kZS50YWcgKyAnYCAob24gbGluZSAnICsgZWxlbWVudE5vZGUubG9jIS5zdGFydC5saW5lICsgJykuJyxcbiAgICAgICAgZWxlbWVudE5vZGUubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEFTVC5CbG9ja1N0YXRlbWVudCB8IHZvaWQge1xuICAgIGlmICh0aGlzLnRva2VuaXplclsnc3RhdGUnXSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKGJsb2NrKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdjb21tZW50JyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdkYXRhJyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdiZWZvcmVEYXRhJ1xuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnQSBibG9jayBtYXkgb25seSBiZSB1c2VkIGluc2lkZSBhbiBIVE1MIGVsZW1lbnQgb3IgYW5vdGhlciBibG9jay4nLFxuICAgICAgICBibG9jay5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgYmxvY2spO1xuICAgIGxldCBwcm9ncmFtID0gdGhpcy5Qcm9ncmFtKGJsb2NrLnByb2dyYW0pO1xuICAgIGxldCBpbnZlcnNlID0gYmxvY2suaW52ZXJzZSA/IHRoaXMuUHJvZ3JhbShibG9jay5pbnZlcnNlKSA6IG51bGw7XG5cbiAgICBpZiAocGF0aC5vcmlnaW5hbCA9PT0gJ2luLWVsZW1lbnQnKSB7XG4gICAgICBoYXNoID0gYWRkSW5FbGVtZW50SGFzaCh0aGlzLmN1cnNvcigpLCBoYXNoLCBibG9jay5sb2MpO1xuICAgIH1cblxuICAgIGxldCBub2RlID0gYi5ibG9jayhcbiAgICAgIHBhdGgsXG4gICAgICBwYXJhbXMsXG4gICAgICBoYXNoLFxuICAgICAgcHJvZ3JhbSxcbiAgICAgIGludmVyc2UsXG4gICAgICBibG9jay5sb2MsXG4gICAgICBibG9jay5vcGVuU3RyaXAsXG4gICAgICBibG9jay5pbnZlcnNlU3RyaXAsXG4gICAgICBibG9jay5jbG9zZVN0cmlwXG4gICAgKTtcblxuICAgIGxldCBwYXJlbnRQcm9ncmFtID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgYXBwZW5kQ2hpbGQocGFyZW50UHJvZ3JhbSwgbm9kZSk7XG4gIH1cblxuICBNdXN0YWNoZVN0YXRlbWVudChyYXdNdXN0YWNoZTogSEJTLk11c3RhY2hlU3RhdGVtZW50KTogQVNULk11c3RhY2hlU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKHJhd011c3RhY2hlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQ7XG4gICAgbGV0IHsgZXNjYXBlZCwgbG9jLCBzdHJpcCB9ID0gcmF3TXVzdGFjaGU7XG5cbiAgICBpZiAoaXNMaXRlcmFsKHJhd011c3RhY2hlLnBhdGgpKSB7XG4gICAgICBtdXN0YWNoZSA9IHtcbiAgICAgICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICAgICAgcGF0aDogdGhpcy5hY2NlcHROb2RlPEFTVC5MaXRlcmFsPihyYXdNdXN0YWNoZS5wYXRoKSxcbiAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgaGFzaDogYi5oYXNoKCksXG4gICAgICAgIGVzY2FwZWQsXG4gICAgICAgIGxvYyxcbiAgICAgICAgc3RyaXAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCByYXdNdXN0YWNoZSBhcyBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQgJiB7XG4gICAgICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICAgIH0pO1xuICAgICAgbXVzdGFjaGUgPSBiLm11c3RhY2hlKHBhdGgsIHBhcmFtcywgaGFzaCwgIWVzY2FwZWQsIGxvYywgc3RyaXApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW5pemVyLnN0YXRlKSB7XG4gICAgICAvLyBUYWcgaGVscGVyc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdPcGVuOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdOYW1lOlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENhbm5vdCB1c2UgbXVzdGFjaGVzIGluIGFuIGVsZW1lbnRzIHRhZ25hbWU6IFxcYCR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICAgICAgcmF3TXVzdGFjaGUsXG4gICAgICAgICAgICByYXdNdXN0YWNoZS5wYXRoXG4gICAgICAgICAgKX1cXGAgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICBtdXN0YWNoZS5sb2NcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZU5hbWU6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5maW5pc2hBdHRyaWJ1dGVWYWx1ZSgpO1xuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlVmFsdWVRdW90ZWQ6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gQXR0cmlidXRlIHZhbHVlc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVWYWx1ZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZURvdWJsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVTaW5nbGVRdW90ZWQ6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlVW5xdW90ZWQ6XG4gICAgICAgIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQodGhpcy5jdXJyZW50QXR0cmlidXRlISwgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gVE9ETzogT25seSBhcHBlbmQgY2hpbGQgd2hlbiB0aGUgdG9rZW5pemVyIHN0YXRlIG1ha2VzXG4gICAgICAvLyBzZW5zZSB0byBkbyBzbywgb3RoZXJ3aXNlIHRocm93IGFuIGVycm9yLlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBtdXN0YWNoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG11c3RhY2hlO1xuICB9XG5cbiAgQ29udGVudFN0YXRlbWVudChjb250ZW50OiBIQlMuQ29udGVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRoaXMudG9rZW5pemVyLCBjb250ZW50KTtcblxuICAgIHRoaXMudG9rZW5pemVyLnRva2VuaXplUGFydChjb250ZW50LnZhbHVlKTtcbiAgICB0aGlzLnRva2VuaXplci5mbHVzaERhdGEoKTtcbiAgfVxuXG4gIENvbW1lbnRTdGF0ZW1lbnQocmF3Q29tbWVudDogSEJTLkNvbW1lbnRTdGF0ZW1lbnQpOiBPcHRpb248QVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudD4ge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09IFRva2VuaXplclN0YXRlLmNvbW1lbnQpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3Q29tbWVudCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHsgdmFsdWUsIGxvYyB9ID0gcmF3Q29tbWVudDtcbiAgICBsZXQgY29tbWVudCA9IGIubXVzdGFjaGVDb21tZW50KHZhbHVlLCBsb2MpO1xuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuZGF0YTpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgYSBIYW5kbGViYXJzIGNvbW1lbnQgd2hlbiBpbiB0aGUgXFxgJHt0b2tlbml6ZXJbJ3N0YXRlJ119XFxgIHN0YXRlIGlzIG5vdCBzdXBwb3J0ZWQ6IFwiJHtjb21tZW50LnZhbHVlfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX06JHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICAgICAgcmF3Q29tbWVudC5sb2NcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIFBhcnRpYWxTdGF0ZW1lbnQocGFydGlhbDogSEJTLlBhcnRpYWxTdGF0ZW1lbnQpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBwYXJ0aWFsO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbHMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUocGFydGlhbCwgcGFydGlhbC5uYW1lKX1cIiBhdCBMJHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmVcbiAgICAgIH06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgcGFydGlhbC5sb2NcbiAgICApO1xuICB9XG5cbiAgUGFydGlhbEJsb2NrU3RhdGVtZW50KHBhcnRpYWxCbG9jazogSEJTLlBhcnRpYWxCbG9ja1N0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWxCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIHBhcnRpYWwgYmxvY2tzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBwYXJ0aWFsQmxvY2ssXG4gICAgICAgIHBhcnRpYWxCbG9jay5uYW1lXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsQmxvY2subG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvcihkZWNvcmF0b3I6IEhCUy5EZWNvcmF0b3IpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3I7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBkZWNvcmF0b3JzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBkZWNvcmF0b3IsXG4gICAgICAgIGRlY29yYXRvci5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3IubG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvckJsb2NrKGRlY29yYXRvckJsb2NrOiBIQlMuRGVjb3JhdG9yQmxvY2spOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3JCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvciBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvckJsb2NrLFxuICAgICAgICBkZWNvcmF0b3JCbG9jay5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3JCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgU3ViRXhwcmVzc2lvbihzZXhwcjogSEJTLlN1YkV4cHJlc3Npb24pOiBBU1QuU3ViRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgc2V4cHIpO1xuICAgIHJldHVybiBiLnNleHByKHBhdGgsIHBhcmFtcywgaGFzaCwgc2V4cHIubG9jKTtcbiAgfVxuXG4gIFBhdGhFeHByZXNzaW9uKHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbik6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgb3JpZ2luYWwsIGxvYyB9ID0gcGF0aDtcbiAgICBsZXQgcGFydHM6IHN0cmluZ1tdO1xuXG4gICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAyKSA9PT0gJy4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVzaW5nIFwiLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXIgYW5kIHVubmVjZXNzYXJ5OiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAzKSA9PT0gJy4uLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBDaGFuZ2luZyBjb250ZXh0IHVzaW5nIFwiLi4vXCIgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgTWl4aW5nICcuJyBhbmQgJy8nIGluIHBhdGhzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lcjsgdXNlIG9ubHkgJy4nIHRvIHNlcGFyYXRlIHByb3BlcnR5IHBhdGhzOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHBhcnRzID0gW3BhdGgucGFydHMuam9pbignLycpXTtcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsID09PSAnLicpIHtcbiAgICAgIGxldCBsb2NhdGlvbkluZm8gPSBgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YDtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgYCcuJyBpcyBub3QgYSBzdXBwb3J0ZWQgcGF0aCBpbiBHbGltbWVyOyBjaGVjayBmb3IgYSBwYXRoIHdpdGggYSB0cmFpbGluZyAnLicgYXQgJHtsb2NhdGlvbkluZm99LmAsXG4gICAgICAgIHBhdGgubG9jXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cyA9IHBhdGgucGFydHM7XG4gICAgfVxuXG4gICAgbGV0IHRoaXNIZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUaGlzIGlzIHRvIGZpeCBhIGJ1ZyBpbiB0aGUgSGFuZGxlYmFycyBBU1Qgd2hlcmUgdGhlIHBhdGggZXhwcmVzc2lvbnMgaW5cbiAgICAvLyBge3t0aGlzLmZvb319YCAoYW5kIHNpbWlsYXJseSBge3tmb28tYmFyIHRoaXMuZm9vIG5hbWVkPXRoaXMuZm9vfX1gIGV0YylcbiAgICAvLyBhcmUgc2ltcGx5IHR1cm5lZCBpbnRvIGB7e2Zvb319YC4gVGhlIGZpeCBpcyB0byBwdXNoIGl0IGJhY2sgb250byB0aGVcbiAgICAvLyBwYXJ0cyBhcnJheSBhbmQgbGV0IHRoZSBydW50aW1lIHNlZSB0aGUgZGlmZmVyZW5jZS4gSG93ZXZlciwgd2UgY2Fubm90XG4gICAgLy8gc2ltcGx5IHVzZSB0aGUgc3RyaW5nIGB0aGlzYCBhcyBpdCBtZWFucyBsaXRlcmFsbHkgdGhlIHByb3BlcnR5IGNhbGxlZFxuICAgIC8vIFwidGhpc1wiIGluIHRoZSBjdXJyZW50IGNvbnRleHQgKGl0IGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIHN5bnRheCBhc1xuICAgIC8vIGB7e1t0aGlzXX19YCwgd2hlcmUgdGhlIHNxdWFyZSBicmFja2V0IGFyZSBnZW5lcmFsbHkgZm9yIHRoaXMga2luZCBvZlxuICAgIC8vIGVzY2FwaW5nIMOiwoDCkyBzdWNoIGFzIGB7e2Zvby5bXCJiYXIuYmF6XCJdfX1gIHdvdWxkIG1lYW4gbG9va3VwIGEgcHJvcGVydHlcbiAgICAvLyBuYW1lZCBsaXRlcmFsbHkgXCJiYXIuYmF6XCIgb24gYHRoaXMuZm9vYCkuIEJ5IGNvbnZlbnRpb24sIHdlIHVzZSBgbnVsbGBcbiAgICAvLyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgIGlmIChvcmlnaW5hbC5tYXRjaCgvXnRoaXMoXFwuLispPyQvKSkge1xuICAgICAgdGhpc0hlYWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgICAgb3JpZ2luYWw6IHBhdGgub3JpZ2luYWwsXG4gICAgICB0aGlzOiB0aGlzSGVhZCxcbiAgICAgIHBhcnRzLFxuICAgICAgZGF0YTogcGF0aC5kYXRhLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9O1xuICB9XG5cbiAgSGFzaChoYXNoOiBIQlMuSGFzaCk6IEFTVC5IYXNoIHtcbiAgICBsZXQgcGFpcnM6IEFTVC5IYXNoUGFpcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhc2gucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwYWlyID0gaGFzaC5wYWlyc1tpXTtcbiAgICAgIHBhaXJzLnB1c2goYi5wYWlyKHBhaXIua2V5LCB0aGlzLmFjY2VwdE5vZGUocGFpci52YWx1ZSksIHBhaXIubG9jKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGIuaGFzaChwYWlycywgaGFzaC5sb2MpO1xuICB9XG5cbiAgU3RyaW5nTGl0ZXJhbChzdHJpbmc6IEhCUy5TdHJpbmdMaXRlcmFsKTogQVNULlN0cmluZ0xpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1N0cmluZ0xpdGVyYWwnLCBzdHJpbmcudmFsdWUsIHN0cmluZy5sb2MpO1xuICB9XG5cbiAgQm9vbGVhbkxpdGVyYWwoYm9vbGVhbjogSEJTLkJvb2xlYW5MaXRlcmFsKTogQVNULkJvb2xlYW5MaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdCb29sZWFuTGl0ZXJhbCcsIGJvb2xlYW4udmFsdWUsIGJvb2xlYW4ubG9jKTtcbiAgfVxuXG4gIE51bWJlckxpdGVyYWwobnVtYmVyOiBIQlMuTnVtYmVyTGl0ZXJhbCk6IEFTVC5OdW1iZXJMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdW1iZXJMaXRlcmFsJywgbnVtYmVyLnZhbHVlLCBudW1iZXIubG9jKTtcbiAgfVxuXG4gIFVuZGVmaW5lZExpdGVyYWwodW5kZWY6IEhCUy5VbmRlZmluZWRMaXRlcmFsKTogQVNULlVuZGVmaW5lZExpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQsIHVuZGVmLmxvYyk7XG4gIH1cblxuICBOdWxsTGl0ZXJhbChudWw6IEhCUy5OdWxsTGl0ZXJhbCk6IEFTVC5OdWxsTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnTnVsbExpdGVyYWwnLCBudWxsLCBudWwubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVSaWdodFN0cmlwcGVkT2Zmc2V0cyhvcmlnaW5hbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAvLyBpZiBpdCBpcyBlbXB0eSwganVzdCByZXR1cm4gdGhlIGNvdW50IG9mIG5ld2xpbmVzXG4gICAgLy8gaW4gb3JpZ2luYWxcbiAgICByZXR1cm4ge1xuICAgICAgbGluZXM6IG9yaWdpbmFsLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxLFxuICAgICAgY29sdW1uczogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBuZXdsaW5lcyBwcmlvciB0b1xuICAvLyBgdmFsdWVgXG4gIGxldCBkaWZmZXJlbmNlID0gb3JpZ2luYWwuc3BsaXQodmFsdWUpWzBdO1xuICBsZXQgbGluZXMgPSBkaWZmZXJlbmNlLnNwbGl0KC9cXG4vKTtcbiAgbGV0IGxpbmVDb3VudCA9IGxpbmVzLmxlbmd0aCAtIDE7XG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lczogbGluZUNvdW50LFxuICAgIGNvbHVtbnM6IGxpbmVzW2xpbmVDb3VudF0ubGVuZ3RoLFxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb2tlbml6ZXJMb2NhdGlvbih0b2tlbml6ZXI6IFBhcnNlclsndG9rZW5pemVyJ10sIGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KSB7XG4gIGxldCBsaW5lID0gY29udGVudC5sb2Muc3RhcnQubGluZTtcbiAgbGV0IGNvbHVtbiA9IGNvbnRlbnQubG9jLnN0YXJ0LmNvbHVtbjtcblxuICBsZXQgb2Zmc2V0cyA9IGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKFxuICAgIGNvbnRlbnQub3JpZ2luYWwgYXMgUmVjYXN0PEhCUy5TdHJpcEZsYWdzLCBzdHJpbmc+LFxuICAgIGNvbnRlbnQudmFsdWVcbiAgKTtcblxuICBsaW5lID0gbGluZSArIG9mZnNldHMubGluZXM7XG4gIGlmIChvZmZzZXRzLmxpbmVzKSB7XG4gICAgY29sdW1uID0gb2Zmc2V0cy5jb2x1bW5zO1xuICB9IGVsc2Uge1xuICAgIGNvbHVtbiA9IGNvbHVtbiArIG9mZnNldHMuY29sdW1ucztcbiAgfVxuXG4gIHRva2VuaXplci5saW5lID0gbGluZTtcbiAgdG9rZW5pemVyLmNvbHVtbiA9IGNvbHVtbjtcbn1cblxuZnVuY3Rpb24gYWNjZXB0Q2FsbE5vZGVzKFxuICBjb21waWxlcjogSGFuZGxlYmFyc05vZGVWaXNpdG9ycyxcbiAgbm9kZToge1xuICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICBwYXJhbXM6IEhCUy5FeHByZXNzaW9uW107XG4gICAgaGFzaDogSEJTLkhhc2g7XG4gIH1cbik6IHsgcGF0aDogQVNULlBhdGhFeHByZXNzaW9uOyBwYXJhbXM6IEFTVC5FeHByZXNzaW9uW107IGhhc2g6IEFTVC5IYXNoIH0ge1xuICBsZXQgcGF0aCA9IGNvbXBpbGVyLlBhdGhFeHByZXNzaW9uKG5vZGUucGF0aCk7XG5cbiAgbGV0IHBhcmFtcyA9IG5vZGUucGFyYW1zID8gbm9kZS5wYXJhbXMubWFwKGUgPT4gY29tcGlsZXIuYWNjZXB0Tm9kZTxBU1QuRXhwcmVzc2lvbj4oZSkpIDogW107XG4gIGxldCBoYXNoID0gbm9kZS5oYXNoID8gY29tcGlsZXIuSGFzaChub2RlLmhhc2gpIDogYi5oYXNoKCk7XG5cbiAgcmV0dXJuIHsgcGF0aCwgcGFyYW1zLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRNb2RpZmllcihlbGVtZW50OiBUYWc8J1N0YXJ0VGFnJz4sIG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MgfSA9IG11c3RhY2hlO1xuXG4gIGlmIChpc0xpdGVyYWwocGF0aCkpIHtcbiAgICBsZXQgbW9kaWZpZXIgPSBge3ske3ByaW50TGl0ZXJhbChwYXRoKX19fWA7XG4gICAgbGV0IHRhZyA9IGA8JHtlbGVtZW50Lm5hbWV9IC4uLiAke21vZGlmaWVyfSAuLi5gO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEluICR7dGFnfSwgJHttb2RpZmllcn0gaXMgbm90IGEgdmFsaWQgbW9kaWZpZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2MgJiZcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICBtdXN0YWNoZS5sb2NcbiAgICApO1xuICB9XG5cbiAgbGV0IG1vZGlmaWVyID0gYi5lbGVtZW50TW9kaWZpZXIocGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MpO1xuICBlbGVtZW50Lm1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gYWRkSW5FbGVtZW50SGFzaChjdXJzb3I6IHN0cmluZywgaGFzaDogQVNULkhhc2gsIGxvYzogQVNULlNvdXJjZUxvY2F0aW9uKSB7XG4gIGxldCBoYXNJbnNlcnRCZWZvcmUgPSBmYWxzZTtcbiAgaGFzaC5wYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xuICAgIGlmIChwYWlyLmtleSA9PT0gJ2d1aWQnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0Nhbm5vdCBwYXNzIGBndWlkYCBmcm9tIHVzZXIgc3BhY2UnLCBsb2MpO1xuICAgIH1cblxuICAgIGlmIChwYWlyLmtleSA9PT0gJ2luc2VydEJlZm9yZScpIHtcbiAgICAgIGhhc0luc2VydEJlZm9yZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBsZXQgZ3VpZCA9IGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIGN1cnNvcik7XG4gIGxldCBndWlkUGFpciA9IGIucGFpcignZ3VpZCcsIGd1aWQpO1xuICBoYXNoLnBhaXJzLnVuc2hpZnQoZ3VpZFBhaXIpO1xuXG4gIGlmICghaGFzSW5zZXJ0QmVmb3JlKSB7XG4gICAgbGV0IHVuZGVmaW5lZExpdGVyYWwgPSBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQpO1xuICAgIGxldCBiZWZvcmVTaWJsaW5nID0gYi5wYWlyKCdpbnNlcnRCZWZvcmUnLCB1bmRlZmluZWRMaXRlcmFsKTtcbiAgICBoYXNoLnBhaXJzLnB1c2goYmVmb3JlU2libGluZyk7XG4gIH1cblxuICByZXR1cm4gaGFzaDtcbn1cblxuZnVuY3Rpb24gYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydChhdHRyaWJ1dGU6IEF0dHJpYnV0ZSwgcGFydDogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGF0dHJpYnV0ZS5pc0R5bmFtaWMgPSB0cnVlO1xuICBhdHRyaWJ1dGUucGFydHMucHVzaChwYXJ0KTtcbn1cbiIsImltcG9ydCB7IHR1cGxlIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuXG4vLyBlbnN1cmUgc3RheXMgaW4gc3luYyB3aXRoIHR5cGluZ1xuLy8gUGFyZW50Tm9kZSBhbmQgQ2hpbGRLZXkgdHlwZXMgYXJlIGRlcml2ZWQgZnJvbSBWaXNpdG9yS2V5c01hcFxuY29uc3QgdmlzaXRvcktleXMgPSB7XG4gIFByb2dyYW06IHR1cGxlKCdib2R5JyksXG4gIFRlbXBsYXRlOiB0dXBsZSgnYm9keScpLFxuICBCbG9jazogdHVwbGUoJ2JvZHknKSxcblxuICBNdXN0YWNoZVN0YXRlbWVudDogdHVwbGUoJ3BhdGgnLCAncGFyYW1zJywgJ2hhc2gnKSxcbiAgQmxvY2tTdGF0ZW1lbnQ6IHR1cGxlKCdwYXRoJywgJ3BhcmFtcycsICdoYXNoJywgJ3Byb2dyYW0nLCAnaW52ZXJzZScpLFxuICBFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQ6IHR1cGxlKCdwYXRoJywgJ3BhcmFtcycsICdoYXNoJyksXG4gIFBhcnRpYWxTdGF0ZW1lbnQ6IHR1cGxlKCduYW1lJywgJ3BhcmFtcycsICdoYXNoJyksXG4gIENvbW1lbnRTdGF0ZW1lbnQ6IHR1cGxlKCksXG4gIE11c3RhY2hlQ29tbWVudFN0YXRlbWVudDogdHVwbGUoKSxcbiAgRWxlbWVudE5vZGU6IHR1cGxlKCdhdHRyaWJ1dGVzJywgJ21vZGlmaWVycycsICdjaGlsZHJlbicsICdjb21tZW50cycpLFxuICBBdHRyTm9kZTogdHVwbGUoJ3ZhbHVlJyksXG4gIFRleHROb2RlOiB0dXBsZSgpLFxuXG4gIENvbmNhdFN0YXRlbWVudDogdHVwbGUoJ3BhcnRzJyksXG4gIFN1YkV4cHJlc3Npb246IHR1cGxlKCdwYXRoJywgJ3BhcmFtcycsICdoYXNoJyksXG4gIFBhdGhFeHByZXNzaW9uOiB0dXBsZSgpLFxuXG4gIFN0cmluZ0xpdGVyYWw6IHR1cGxlKCksXG4gIEJvb2xlYW5MaXRlcmFsOiB0dXBsZSgpLFxuICBOdW1iZXJMaXRlcmFsOiB0dXBsZSgpLFxuICBOdWxsTGl0ZXJhbDogdHVwbGUoKSxcbiAgVW5kZWZpbmVkTGl0ZXJhbDogdHVwbGUoKSxcblxuICBIYXNoOiB0dXBsZSgncGFpcnMnKSxcbiAgSGFzaFBhaXI6IHR1cGxlKCd2YWx1ZScpLFxufTtcblxudHlwZSBWaXNpdG9yS2V5c01hcCA9IHR5cGVvZiB2aXNpdG9yS2V5cztcblxuZXhwb3J0IHR5cGUgVmlzaXRvcktleXMgPSB7IFtQIGluIGtleW9mIFZpc2l0b3JLZXlzTWFwXTogVmlzaXRvcktleXNNYXBbUF1bbnVtYmVyXSB9O1xuZXhwb3J0IHR5cGUgVmlzaXRvcktleTxOIGV4dGVuZHMgQVNULk5vZGU+ID0gVmlzaXRvcktleXNbTlsndHlwZSddXSAmIGtleW9mIE47XG5cbmV4cG9ydCBkZWZhdWx0IHZpc2l0b3JLZXlzO1xuIiwiaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyYXZlcnNhbEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcjogVHJhdmVyc2FsRXJyb3JDb25zdHJ1Y3RvcjtcbiAga2V5OiBzdHJpbmc7XG4gIG5vZGU6IEFTVC5Ob2RlO1xuICBwYXJlbnQ6IE9wdGlvbjxBU1QuTm9kZT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJhdmVyc2FsRXJyb3JDb25zdHJ1Y3RvciB7XG4gIG5ldyAobWVzc2FnZTogc3RyaW5nLCBub2RlOiBBU1QuTm9kZSwgcGFyZW50OiBPcHRpb248QVNULk5vZGU+LCBrZXk6IHN0cmluZyk6IFRyYXZlcnNhbEVycm9yO1xuICByZWFkb25seSBwcm90b3R5cGU6IFRyYXZlcnNhbEVycm9yO1xufVxuXG5jb25zdCBUcmF2ZXJzYWxFcnJvcjogVHJhdmVyc2FsRXJyb3JDb25zdHJ1Y3RvciA9IChmdW5jdGlvbigpIHtcbiAgVHJhdmVyc2FsRXJyb3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICBUcmF2ZXJzYWxFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUcmF2ZXJzYWxFcnJvcjtcblxuICBmdW5jdGlvbiBUcmF2ZXJzYWxFcnJvcihcbiAgICB0aGlzOiBUcmF2ZXJzYWxFcnJvcixcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgbm9kZTogQVNULk5vZGUsXG4gICAgcGFyZW50OiBPcHRpb248QVNULk5vZGU+LFxuICAgIGtleTogc3RyaW5nXG4gICkge1xuICAgIGxldCBlcnJvciA9IEVycm9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgdGhpcy5zdGFjayA9IGVycm9yLnN0YWNrO1xuICB9XG5cbiAgcmV0dXJuIFRyYXZlcnNhbEVycm9yIGFzIGFueTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFRyYXZlcnNhbEVycm9yO1xuXG5leHBvcnQgZnVuY3Rpb24gY2Fubm90UmVtb3ZlTm9kZShub2RlOiBBU1QuTm9kZSwgcGFyZW50OiBBU1QuTm9kZSwga2V5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBUcmF2ZXJzYWxFcnJvcihcbiAgICAnQ2Fubm90IHJlbW92ZSBhIG5vZGUgdW5sZXNzIGl0IGlzIHBhcnQgb2YgYW4gYXJyYXknLFxuICAgIG5vZGUsXG4gICAgcGFyZW50LFxuICAgIGtleVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2Fubm90UmVwbGFjZU5vZGUobm9kZTogQVNULk5vZGUsIHBhcmVudDogQVNULk5vZGUsIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgVHJhdmVyc2FsRXJyb3IoXG4gICAgJ0Nhbm5vdCByZXBsYWNlIGEgbm9kZSB3aXRoIG11bHRpcGxlIG5vZGVzIHVubGVzcyBpdCBpcyBwYXJ0IG9mIGFuIGFycmF5JyxcbiAgICBub2RlLFxuICAgIHBhcmVudCxcbiAgICBrZXlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldChub2RlOiBBU1QuTm9kZSwga2V5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBUcmF2ZXJzYWxFcnJvcihcbiAgICAnUmVwbGFjaW5nIGFuZCByZW1vdmluZyBpbiBrZXkgaGFuZGxlcnMgaXMgbm90IHlldCBzdXBwb3J0ZWQuJyxcbiAgICBub2RlLFxuICAgIG51bGwsXG4gICAga2V5XG4gICk7XG59XG4iLCJpbXBvcnQgdmlzaXRvcktleXMsIHsgVmlzaXRvcktleXMsIFZpc2l0b3JLZXkgfSBmcm9tICcuLi90eXBlcy92aXNpdG9yLWtleXMnO1xuaW1wb3J0IHtcbiAgY2Fubm90UmVtb3ZlTm9kZSxcbiAgY2Fubm90UmVwbGFjZU5vZGUsXG4gIGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldCxcbn0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCB7IGRlcHJlY2F0ZSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgREVWTU9ERSB9IGZyb20gJ0BnbGltbWVyL2xvY2FsLWRlYnVnLWZsYWdzJztcbmltcG9ydCB7IE5vZGVIYW5kbGVyLCBOb2RlVmlzaXRvciwgS2V5SGFuZGxlciwgTm9kZVRyYXZlcnNhbCwgS2V5VHJhdmVyc2FsIH0gZnJvbSAnLi92aXNpdG9yJztcblxuZnVuY3Rpb24gZ2V0RW50ZXJGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGU+KFxuICBoYW5kbGVyOiBOb2RlVHJhdmVyc2FsPE4+XG4pOiBOb2RlSGFuZGxlcjxOPiB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIGdldEVudGVyRnVuY3Rpb248TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMgVmlzaXRvcktleTxOPj4oXG4gIGhhbmRsZXI6IEtleVRyYXZlcnNhbDxOLCBLPlxuKTogS2V5SGFuZGxlcjxOLCBLPiB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIGdldEVudGVyRnVuY3Rpb248TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMgVmlzaXRvcktleTxOPj4oXG4gIGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj4gfCBLZXlUcmF2ZXJzYWw8TiwgSz5cbik6IE5vZGVIYW5kbGVyPE4+IHwgS2V5SGFuZGxlcjxOLCBLPiB8IHVuZGVmaW5lZCB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBoYW5kbGVyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBoYW5kbGVyLmVudGVyIGFzIE5vZGVIYW5kbGVyPE4+IHwgS2V5SGFuZGxlcjxOLCBLPjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRFeGl0RnVuY3Rpb248TiBleHRlbmRzIEFTVC5Ob2RlPihoYW5kbGVyOiBOb2RlVHJhdmVyc2FsPE4+KTogTm9kZUhhbmRsZXI8Tj4gfCB1bmRlZmluZWQ7XG5mdW5jdGlvbiBnZXRFeGl0RnVuY3Rpb248TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMgVmlzaXRvcktleTxOPj4oXG4gIGhhbmRsZXI6IEtleVRyYXZlcnNhbDxOLCBLPlxuKTogS2V5SGFuZGxlcjxOLCBLPiB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIGdldEV4aXRGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGUsIEsgZXh0ZW5kcyBWaXNpdG9yS2V5PE4+PihcbiAgaGFuZGxlcjogTm9kZVRyYXZlcnNhbDxOPiB8IEtleVRyYXZlcnNhbDxOLCBLPlxuKTogTm9kZUhhbmRsZXI8Tj4gfCBLZXlIYW5kbGVyPE4sIEs+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaGFuZGxlci5leGl0IGFzIE5vZGVIYW5kbGVyPE4+IHwgS2V5SGFuZGxlcjxOLCBLPjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRLZXlIYW5kbGVyPE4gZXh0ZW5kcyBBU1QuTm9kZSwgSyBleHRlbmRzIFZpc2l0b3JLZXk8Tj4+KFxuICBoYW5kbGVyOiBOb2RlVHJhdmVyc2FsPE4+LFxuICBrZXk6IEtcbik6IEtleVRyYXZlcnNhbDxOLCBLPiB8IEtleVRyYXZlcnNhbDxOLCBWaXNpdG9yS2V5PE4+PiB8IHVuZGVmaW5lZCB7XG4gIGxldCBrZXlWaXNpdG9yID0gdHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicgPyBoYW5kbGVyLmtleXMgOiB1bmRlZmluZWQ7XG4gIGlmIChrZXlWaXNpdG9yID09PSB1bmRlZmluZWQpIHJldHVybjtcblxuICBsZXQga2V5SGFuZGxlciA9IGtleVZpc2l0b3Jba2V5XTtcbiAgaWYgKGtleUhhbmRsZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBrZXlIYW5kbGVyIGFzIEtleVRyYXZlcnNhbDxOLCBLPjtcbiAgfVxuICByZXR1cm4ga2V5VmlzaXRvci5BbGw7XG59XG5cbmZ1bmN0aW9uIGdldE5vZGVIYW5kbGVyPE4gZXh0ZW5kcyBBU1QuTm9kZT4oXG4gIHZpc2l0b3I6IE5vZGVWaXNpdG9yLFxuICBub2RlVHlwZTogTlsndHlwZSddXG4pOiBOb2RlVHJhdmVyc2FsPE4+O1xuZnVuY3Rpb24gZ2V0Tm9kZUhhbmRsZXIodmlzaXRvcjogTm9kZVZpc2l0b3IsIG5vZGVUeXBlOiAnQWxsJyk6IE5vZGVUcmF2ZXJzYWw8QVNULk5vZGU+O1xuZnVuY3Rpb24gZ2V0Tm9kZUhhbmRsZXI8TiBleHRlbmRzIEFTVC5Ob2RlPihcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3IsXG4gIG5vZGVUeXBlOiBOWyd0eXBlJ11cbik6IE5vZGVUcmF2ZXJzYWw8Tj4gfCBOb2RlVHJhdmVyc2FsPEFTVC5Ob2RlPiB8IHVuZGVmaW5lZCB7XG4gIGlmIChub2RlVHlwZSA9PT0gJ1RlbXBsYXRlJyB8fCBub2RlVHlwZSA9PT0gJ0Jsb2NrJykge1xuICAgIGlmICh2aXNpdG9yLlByb2dyYW0pIHtcbiAgICAgIGlmIChERVZNT0RFKSB7XG4gICAgICAgIGRlcHJlY2F0ZShgVE9ET2ApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmlzaXRvci5Qcm9ncmFtIGFzIGFueTtcbiAgICB9XG4gIH1cblxuICBsZXQgaGFuZGxlciA9IHZpc2l0b3Jbbm9kZVR5cGVdO1xuICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGhhbmRsZXIgYXMgTm9kZVRyYXZlcnNhbDxOPjtcbiAgfVxuICByZXR1cm4gdmlzaXRvci5BbGw7XG59XG5cbmZ1bmN0aW9uIHZpc2l0Tm9kZTxOIGV4dGVuZHMgQVNULk5vZGU+KFxuICB2aXNpdG9yOiBOb2RlVmlzaXRvcixcbiAgbm9kZTogTlxuKTogQVNULk5vZGUgfCBBU1QuTm9kZVtdIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHZvaWQge1xuICBsZXQgaGFuZGxlcjogTm9kZVRyYXZlcnNhbDxOPiA9IGdldE5vZGVIYW5kbGVyKHZpc2l0b3IsIG5vZGUudHlwZSk7XG4gIGxldCBlbnRlcjtcbiAgbGV0IGV4aXQ7XG5cbiAgaWYgKGhhbmRsZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGVudGVyID0gZ2V0RW50ZXJGdW5jdGlvbihoYW5kbGVyKTtcbiAgICBleGl0ID0gZ2V0RXhpdEZ1bmN0aW9uKGhhbmRsZXIpO1xuICB9XG5cbiAgbGV0IHJlc3VsdDogQVNULk5vZGUgfCBBU1QuTm9kZVtdIHwgdW5kZWZpbmVkIHwgbnVsbCB8IHZvaWQ7XG4gIGlmIChlbnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdWx0ID0gZW50ZXIobm9kZSk7XG4gIH1cblxuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQgJiYgcmVzdWx0ICE9PSBudWxsKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KG5vZGUpID09PSBKU09OLnN0cmluZ2lmeShyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgIHZpc2l0QXJyYXkodmlzaXRvciwgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2aXNpdE5vZGUodmlzaXRvciwgcmVzdWx0KSB8fCByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IGtleXMgPSB2aXNpdG9yS2V5c1tub2RlLnR5cGVdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0ga2V5c1tpXSBhcyBWaXNpdG9yS2V5c1tOWyd0eXBlJ11dICYga2V5b2YgTjtcbiAgICAgIC8vIHdlIGtub3cgaWYgaXQgaGFzIGNoaWxkIGtleXMgd2UgY2FuIHdpZGVuIHRvIGEgUGFyZW50Tm9kZVxuICAgICAgdmlzaXRLZXkodmlzaXRvciwgaGFuZGxlciwgbm9kZSBhcyBOLCBrZXkpO1xuICAgIH1cblxuICAgIGlmIChleGl0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJlc3VsdCA9IGV4aXQobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZ2V0PE4gZXh0ZW5kcyBBU1QuTm9kZT4oXG4gIG5vZGU6IE4sXG4gIGtleTogVmlzaXRvcktleXNbTlsndHlwZSddXSAmIGtleW9mIE5cbik6IEFTVC5Ob2RlIHwgQVNULk5vZGVbXSB7XG4gIHJldHVybiAobm9kZVtrZXldIGFzIHVua25vd24pIGFzIEFTVC5Ob2RlIHwgQVNULk5vZGVbXTtcbn1cblxuZnVuY3Rpb24gc2V0PE4gZXh0ZW5kcyBBU1QuTm9kZSwgSyBleHRlbmRzIGtleW9mIE4+KG5vZGU6IE4sIGtleTogSywgdmFsdWU6IE5bS10pOiB2b2lkIHtcbiAgbm9kZVtrZXldID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHZpc2l0S2V5PE4gZXh0ZW5kcyBBU1QuTm9kZT4oXG4gIHZpc2l0b3I6IE5vZGVWaXNpdG9yLFxuICBoYW5kbGVyOiBOb2RlVHJhdmVyc2FsPE4+LFxuICBub2RlOiBOLFxuICBrZXk6IFZpc2l0b3JLZXlzW05bJ3R5cGUnXV0gJiBrZXlvZiBOXG4pIHtcbiAgbGV0IHZhbHVlID0gZ2V0KG5vZGUsIGtleSk7XG4gIGlmICghdmFsdWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQga2V5RW50ZXI7XG4gIGxldCBrZXlFeGl0O1xuXG4gIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICBsZXQga2V5SGFuZGxlciA9IGdldEtleUhhbmRsZXIoaGFuZGxlciwga2V5KTtcbiAgICBpZiAoa2V5SGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBrZXlFbnRlciA9IGdldEVudGVyRnVuY3Rpb24oa2V5SGFuZGxlcik7XG4gICAgICBrZXlFeGl0ID0gZ2V0RXhpdEZ1bmN0aW9uKGtleUhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXlFbnRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGtleUVudGVyKG5vZGUsIGtleSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgY2Fubm90UmVwbGFjZU9yUmVtb3ZlSW5LZXlIYW5kbGVyWWV0KG5vZGUsIGtleSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgdmlzaXRBcnJheSh2aXNpdG9yLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHJlc3VsdCA9IHZpc2l0Tm9kZSh2aXNpdG9yLCB2YWx1ZSk7XG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBUT0RPOiBkeW5hbWljYWxseSBjaGVjayB0aGUgcmVzdWx0cyBieSBoYXZpbmcgYSB0YWJsZSBvZlxuICAgICAgLy8gZXhwZWN0ZWQgbm9kZSB0eXBlcyBpbiB2YWx1ZSBzcGFjZSwgbm90IGp1c3QgdHlwZSBzcGFjZVxuICAgICAgYXNzaWduS2V5KG5vZGUsIGtleSwgdmFsdWUsIHJlc3VsdCBhcyBhbnkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChrZXlFeGl0ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoa2V5RXhpdChub2RlLCBrZXkpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldChub2RlLCBrZXkpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB2aXNpdEFycmF5KHZpc2l0b3I6IE5vZGVWaXNpdG9yLCBhcnJheTogQVNULk5vZGVbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHJlc3VsdCA9IHZpc2l0Tm9kZSh2aXNpdG9yLCBhcnJheVtpXSk7XG4gICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpICs9IHNwbGljZUFycmF5KGFycmF5LCBpLCByZXN1bHQpIC0gMTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzaWduS2V5PE4gZXh0ZW5kcyBBU1QuTm9kZSwgSyBleHRlbmRzIFZpc2l0b3JLZXk8Tj4+KFxuICBub2RlOiBOLFxuICBrZXk6IEssXG4gIHZhbHVlOiBBU1QuTm9kZSxcbiAgcmVzdWx0OiBOW0tdIHwgW05bS11dIHwgbnVsbFxuKSB7XG4gIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICB0aHJvdyBjYW5ub3RSZW1vdmVOb2RlKHZhbHVlLCBub2RlLCBrZXkpO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAxKSB7XG4gICAgICBzZXQobm9kZSwga2V5LCByZXN1bHRbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBjYW5ub3RSZW1vdmVOb2RlKHZhbHVlLCBub2RlLCBrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgY2Fubm90UmVwbGFjZU5vZGUodmFsdWUsIG5vZGUsIGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNldChub2RlLCBrZXksIHJlc3VsdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3BsaWNlQXJyYXkoYXJyYXk6IEFTVC5Ob2RlW10sIGluZGV4OiBudW1iZXIsIHJlc3VsdDogQVNULk5vZGUgfCBBU1QuTm9kZVtdIHwgbnVsbCkge1xuICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gMDtcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEsIC4uLnJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdC5sZW5ndGg7XG4gIH0gZWxzZSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxLCByZXN1bHQpO1xuICAgIHJldHVybiAxO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYXZlcnNlKG5vZGU6IEFTVC5Ob2RlLCB2aXNpdG9yOiBOb2RlVmlzaXRvcikge1xuICB2aXNpdE5vZGUodmlzaXRvciwgbm9kZSk7XG59XG4iLCJjb25zdCBlbnVtIENoYXIge1xuICBOQlNQID0gMHhhMCxcbiAgUVVPVCA9IDB4MjIsXG4gIExUID0gMHgzYyxcbiAgR1QgPSAweDNlLFxuICBBTVAgPSAweDI2LFxufVxuXG5jb25zdCBBVFRSX1ZBTFVFX1JFR0VYX1RFU1QgPSAvW1xceEEwXCImXS87XG5jb25zdCBBVFRSX1ZBTFVFX1JFR0VYX1JFUExBQ0UgPSBuZXcgUmVnRXhwKEFUVFJfVkFMVUVfUkVHRVhfVEVTVC5zb3VyY2UsICdnJyk7XG5cbmNvbnN0IFRFWFRfUkVHRVhfVEVTVCA9IC9bXFx4QTAmPD5dLztcbmNvbnN0IFRFWFRfUkVHRVhfUkVQTEFDRSA9IG5ldyBSZWdFeHAoVEVYVF9SRUdFWF9URVNULnNvdXJjZSwgJ2cnKTtcblxuZnVuY3Rpb24gYXR0clZhbHVlUmVwbGFjZXIoY2hhcjogc3RyaW5nKSB7XG4gIHN3aXRjaCAoY2hhci5jaGFyQ29kZUF0KDApKSB7XG4gICAgY2FzZSBDaGFyLk5CU1A6XG4gICAgICByZXR1cm4gJyZuYnNwOyc7XG4gICAgY2FzZSBDaGFyLlFVT1Q6XG4gICAgICByZXR1cm4gJyZxdW90Oyc7XG4gICAgY2FzZSBDaGFyLkFNUDpcbiAgICAgIHJldHVybiAnJmFtcDsnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gY2hhcjtcbiAgfVxufVxuXG5mdW5jdGlvbiB0ZXh0UmVwbGFjZXIoY2hhcjogc3RyaW5nKSB7XG4gIHN3aXRjaCAoY2hhci5jaGFyQ29kZUF0KDApKSB7XG4gICAgY2FzZSBDaGFyLk5CU1A6XG4gICAgICByZXR1cm4gJyZuYnNwOyc7XG4gICAgY2FzZSBDaGFyLkFNUDpcbiAgICAgIHJldHVybiAnJmFtcDsnO1xuICAgIGNhc2UgQ2hhci5MVDpcbiAgICAgIHJldHVybiAnJmx0Oyc7XG4gICAgY2FzZSBDaGFyLkdUOlxuICAgICAgcmV0dXJuICcmZ3Q7JztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGNoYXI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZUF0dHJWYWx1ZShhdHRyVmFsdWU6IHN0cmluZykge1xuICBpZiAoQVRUUl9WQUxVRV9SRUdFWF9URVNULnRlc3QoYXR0clZhbHVlKSkge1xuICAgIHJldHVybiBhdHRyVmFsdWUucmVwbGFjZShBVFRSX1ZBTFVFX1JFR0VYX1JFUExBQ0UsIGF0dHJWYWx1ZVJlcGxhY2VyKTtcbiAgfVxuICByZXR1cm4gYXR0clZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlVGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgaWYgKFRFWFRfUkVHRVhfVEVTVC50ZXN0KHRleHQpKSB7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShURVhUX1JFR0VYX1JFUExBQ0UsIHRleHRSZXBsYWNlcik7XG4gIH1cbiAgcmV0dXJuIHRleHQ7XG59XG4iLCJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgeyB2b2lkTWFwIH0gZnJvbSAnLi4vcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycyc7XG5pbXBvcnQgeyBlc2NhcGVUZXh0LCBlc2NhcGVBdHRyVmFsdWUgfSBmcm9tICcuL3V0aWwnO1xuXG5mdW5jdGlvbiB1bnJlYWNoYWJsZSgpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcigndW5yZWFjaGFibGUnKTtcbn1cblxuaW50ZXJmYWNlIFByaW50ZXJPcHRpb25zIHtcbiAgZW50aXR5RW5jb2Rpbmc6ICd0cmFuc2Zvcm1lZCcgfCAncmF3JztcblxuICAvKipcbiAgICogVXNlZCB0byBvdmVycmlkZSB0aGUgbWVjaGFuaXNtIG9mIHByaW50aW5nIGEgZ2l2ZW4gQVNULk5vZGUuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBnZW5lcmFsbHkgb25seSBiZSB1c2VmdWwgdG8gc291cmNlIC0+IHNvdXJjZSBjb2RlbW9kc1xuICAgKiB3aGVyZSB5b3Ugd291bGQgbGlrZSB0byBzcGVjaWFsaXplL292ZXJyaWRlIHRoZSB3YXkgYSBnaXZlbiBub2RlIGlzXG4gICAqIHByaW50ZWQgKGUuZy4geW91IHdvdWxkIGxpa2UgdG8gcHJlc2VydmUgYXMgbXVjaCBvZiB0aGUgb3JpZ2luYWxcbiAgICogZm9ybWF0dGluZyBhcyBwb3NzaWJsZSkuXG4gICAqXG4gICAqIFdoZW4gdGhlIHByb3ZpZGVkIG92ZXJyaWRlIHJldHVybnMgdW5kZWZpbmVkLCB0aGUgZGVmYXVsdCBidWlsdCBpbiBwcmludGluZ1xuICAgKiB3aWxsIGJlIGRvbmUgZm9yIHRoZSBBU1QuTm9kZS5cbiAgICpcbiAgICogQHBhcmFtIGFzdCB0aGUgYXN0IG5vZGUgdG8gYmUgcHJpbnRlZFxuICAgKiBAcGFyYW0gb3B0aW9ucyB0aGUgb3B0aW9ucyBzcGVjaWZpZWQgZHVyaW5nIHRoZSBwcmludCgpIGludm9jYXRpb25cbiAgICovXG4gIG92ZXJyaWRlPyhhc3Q6IEFTVC5Ob2RlLCBvcHRpb25zOiBQcmludGVyT3B0aW9ucyk6IHZvaWQgfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJ1aWxkKFxuICBhc3Q6IEFTVC5Ob2RlLFxuICBvcHRpb25zOiBQcmludGVyT3B0aW9ucyA9IHsgZW50aXR5RW5jb2Rpbmc6ICd0cmFuc2Zvcm1lZCcgfVxuKTogc3RyaW5nIHtcbiAgaWYgKCFhc3QpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBpZiAob3B0aW9ucy5vdmVycmlkZSkge1xuICAgIGxldCByZXN1bHQgPSBvcHRpb25zLm92ZXJyaWRlKGFzdCwgb3B0aW9ucyk7XG5cbiAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRFYWNoKGFzdHM6IEFTVC5Ob2RlW10pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGFzdHMubWFwKG5vZGUgPT4gYnVpbGQobm9kZSwgb3B0aW9ucykpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGF0aFBhcmFtcyhhc3Q6IEFTVC5Ob2RlKTogc3RyaW5nIHtcbiAgICBsZXQgcGF0aDogc3RyaW5nO1xuXG4gICAgc3dpdGNoIChhc3QudHlwZSkge1xuICAgICAgY2FzZSAnTXVzdGFjaGVTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQmxvY2tTdGF0ZW1lbnQnOlxuICAgICAgICBwYXRoID0gYnVpbGQoYXN0LnBhdGgsIG9wdGlvbnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAgICBwYXRoID0gYnVpbGQoYXN0Lm5hbWUsIG9wdGlvbnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB1bnJlYWNoYWJsZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBjb21wYWN0Sm9pbihbcGF0aCwgYnVpbGRFYWNoKGFzdC5wYXJhbXMpLmpvaW4oJyAnKSwgYnVpbGQoYXN0Lmhhc2gsIG9wdGlvbnMpXSwgJyAnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbXBhY3RKb2luKGFycmF5OiBPcHRpb248c3RyaW5nPltdLCBkZWxpbWl0ZXI/OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBjb21wYWN0KGFycmF5KS5qb2luKGRlbGltaXRlciB8fCAnJyk7XG4gIH1cblxuICBmdW5jdGlvbiBibG9ja1BhcmFtcyhibG9jazogQVNULkJsb2NrU3RhdGVtZW50KTogT3B0aW9uPHN0cmluZz4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IGJsb2NrLnByb2dyYW0uYmxvY2tQYXJhbXM7XG4gICAgaWYgKHBhcmFtcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBgIGFzIHwke3BhcmFtcy5qb2luKCcgJyl9fGA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBvcGVuQmxvY2soYmxvY2s6IEFTVC5CbG9ja1N0YXRlbWVudCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGNvbXBhY3RKb2luKFtcbiAgICAgICd7eycsXG4gICAgICBibG9jay5vcGVuU3RyaXAub3BlbiA/ICd+JyA6IG51bGwsXG4gICAgICAnIycsXG4gICAgICBwYXRoUGFyYW1zKGJsb2NrKSxcbiAgICAgIGJsb2NrUGFyYW1zKGJsb2NrKSxcbiAgICAgIGJsb2NrLm9wZW5TdHJpcC5jbG9zZSA/ICd+JyA6IG51bGwsXG4gICAgICAnfX0nLFxuICAgIF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VCbG9jayhibG9jazogQVNULkJsb2NrU3RhdGVtZW50KTogc3RyaW5nIHtcbiAgICByZXR1cm4gY29tcGFjdEpvaW4oW1xuICAgICAgJ3t7JyxcbiAgICAgIGJsb2NrLmNsb3NlU3RyaXAub3BlbiA/ICd+JyA6IG51bGwsXG4gICAgICAnLycsXG4gICAgICBidWlsZChibG9jay5wYXRoLCBvcHRpb25zKSxcbiAgICAgIGJsb2NrLmNsb3NlU3RyaXAuY2xvc2UgPyAnficgOiBudWxsLFxuICAgICAgJ319JyxcbiAgICBdKTtcbiAgfVxuXG4gIGNvbnN0IG91dHB1dDogc3RyaW5nW10gPSBbXTtcblxuICBzd2l0Y2ggKGFzdC50eXBlKSB7XG4gICAgY2FzZSAnUHJvZ3JhbSc6XG4gICAgY2FzZSAnQmxvY2snOlxuICAgIGNhc2UgJ1RlbXBsYXRlJzpcbiAgICAgIHtcbiAgICAgICAgY29uc3QgY2hhaW5CbG9jayA9IGFzdC5jaGFpbmVkICYmIGFzdC5ib2R5WzBdO1xuICAgICAgICBpZiAoY2hhaW5CbG9jaykge1xuICAgICAgICAgIChjaGFpbkJsb2NrIGFzIEFTVC5CbG9ja1N0YXRlbWVudCkuY2hhaW5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm9keSA9IGJ1aWxkRWFjaChhc3QuYm9keSkuam9pbignJyk7XG4gICAgICAgIG91dHB1dC5wdXNoKGJvZHkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnRWxlbWVudE5vZGUnOlxuICAgICAgb3V0cHV0LnB1c2goJzwnLCBhc3QudGFnKTtcbiAgICAgIGlmIChhc3QuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goJyAnLCBidWlsZEVhY2goYXN0LmF0dHJpYnV0ZXMpLmpvaW4oJyAnKSk7XG4gICAgICB9XG4gICAgICBpZiAoYXN0Lm1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goJyAnLCBidWlsZEVhY2goYXN0Lm1vZGlmaWVycykuam9pbignICcpKTtcbiAgICAgIH1cbiAgICAgIGlmIChhc3QuY29tbWVudHMubGVuZ3RoKSB7XG4gICAgICAgIG91dHB1dC5wdXNoKCcgJywgYnVpbGRFYWNoKGFzdC5jb21tZW50cykuam9pbignICcpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFzdC5ibG9ja1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goJyAnLCAnYXMnLCAnICcsIGB8JHthc3QuYmxvY2tQYXJhbXMuam9pbignICcpfXxgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHZvaWRNYXBbYXN0LnRhZ10pIHtcbiAgICAgICAgaWYgKGFzdC5zZWxmQ2xvc2luZykge1xuICAgICAgICAgIG91dHB1dC5wdXNoKCcgLycpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3V0cHV0LnB1c2goJz4nKTtcbiAgICAgIH0gZWxzZSBpZiAoYXN0LnNlbGZDbG9zaW5nKSB7XG4gICAgICAgIG91dHB1dC5wdXNoKCcgLz4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKCc+Jyk7XG4gICAgICAgIG91dHB1dC5wdXNoLmFwcGx5KG91dHB1dCwgYnVpbGRFYWNoKGFzdC5jaGlsZHJlbikpO1xuICAgICAgICBvdXRwdXQucHVzaCgnPC8nLCBhc3QudGFnLCAnPicpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQXR0ck5vZGUnOlxuICAgICAgaWYgKGFzdC52YWx1ZS50eXBlID09PSAnVGV4dE5vZGUnKSB7XG4gICAgICAgIGlmIChhc3QudmFsdWUuY2hhcnMgIT09ICcnKSB7XG4gICAgICAgICAgb3V0cHV0LnB1c2goYXN0Lm5hbWUsICc9Jyk7XG4gICAgICAgICAgb3V0cHV0LnB1c2goXG4gICAgICAgICAgICAnXCInLFxuICAgICAgICAgICAgb3B0aW9ucy5lbnRpdHlFbmNvZGluZyA9PT0gJ3JhdycgPyBhc3QudmFsdWUuY2hhcnMgOiBlc2NhcGVBdHRyVmFsdWUoYXN0LnZhbHVlLmNoYXJzKSxcbiAgICAgICAgICAgICdcIidcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dHB1dC5wdXNoKGFzdC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2goYXN0Lm5hbWUsICc9Jyk7XG4gICAgICAgIC8vIGFzdC52YWx1ZSBpcyBtdXN0YWNoZSBvciBjb25jYXRcbiAgICAgICAgb3V0cHV0LnB1c2goYnVpbGQoYXN0LnZhbHVlLCBvcHRpb25zKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdDb25jYXRTdGF0ZW1lbnQnOlxuICAgICAgb3V0cHV0LnB1c2goJ1wiJyk7XG4gICAgICBhc3QucGFydHMuZm9yRWFjaCgobm9kZTogQVNULlRleHROb2RlIHwgQVNULk11c3RhY2hlU3RhdGVtZW50KSA9PiB7XG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgICAgICBvdXRwdXQucHVzaChvcHRpb25zLmVudGl0eUVuY29kaW5nID09PSAncmF3JyA/IG5vZGUuY2hhcnMgOiBlc2NhcGVBdHRyVmFsdWUobm9kZS5jaGFycykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dHB1dC5wdXNoKGJ1aWxkKG5vZGUsIG9wdGlvbnMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdXRwdXQucHVzaCgnXCInKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1RleHROb2RlJzpcbiAgICAgIG91dHB1dC5wdXNoKG9wdGlvbnMuZW50aXR5RW5jb2RpbmcgPT09ICdyYXcnID8gYXN0LmNoYXJzIDogZXNjYXBlVGV4dChhc3QuY2hhcnMpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgIHtcbiAgICAgICAgb3V0cHV0LnB1c2goXG4gICAgICAgICAgY29tcGFjdEpvaW4oW1xuICAgICAgICAgICAgYXN0LmVzY2FwZWQgPyAne3snIDogJ3t7eycsXG4gICAgICAgICAgICBhc3Quc3RyaXAub3BlbiA/ICd+JyA6IG51bGwsXG4gICAgICAgICAgICBwYXRoUGFyYW1zKGFzdCksXG4gICAgICAgICAgICBhc3Quc3RyaXAuY2xvc2UgPyAnficgOiBudWxsLFxuICAgICAgICAgICAgYXN0LmVzY2FwZWQgPyAnfX0nIDogJ319fScsXG4gICAgICAgICAgXSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011c3RhY2hlQ29tbWVudFN0YXRlbWVudCc6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKGNvbXBhY3RKb2luKFsne3shLS0nLCBhc3QudmFsdWUsICctLX19J10pKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0VsZW1lbnRNb2RpZmllclN0YXRlbWVudCc6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKGNvbXBhY3RKb2luKFsne3snLCBwYXRoUGFyYW1zKGFzdCksICd9fSddKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQYXRoRXhwcmVzc2lvbic6XG4gICAgICBvdXRwdXQucHVzaChhc3Qub3JpZ2luYWwpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKCcoJywgcGF0aFBhcmFtcyhhc3QpLCAnKScpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQm9vbGVhbkxpdGVyYWwnOlxuICAgICAgb3V0cHV0LnB1c2goYXN0LnZhbHVlID8gJ3RydWUnIDogJ2ZhbHNlJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCbG9ja1N0YXRlbWVudCc6XG4gICAgICB7XG4gICAgICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICAgIGlmIChhc3QuY2hhaW5lZCkge1xuICAgICAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICAgICBjb21wYWN0Sm9pbihbXG4gICAgICAgICAgICAgICd7eycsXG4gICAgICAgICAgICAgIGFzdC5pbnZlcnNlU3RyaXAub3BlbiA/ICd+JyA6IG51bGwsXG4gICAgICAgICAgICAgICdlbHNlICcsXG4gICAgICAgICAgICAgIHBhdGhQYXJhbXMoYXN0KSxcbiAgICAgICAgICAgICAgYXN0LmludmVyc2VTdHJpcC5jbG9zZSA/ICd+JyA6IG51bGwsXG4gICAgICAgICAgICAgICd9fScsXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZXMucHVzaChvcGVuQmxvY2soYXN0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5lcy5wdXNoKGJ1aWxkKGFzdC5wcm9ncmFtLCBvcHRpb25zKSk7XG5cbiAgICAgICAgaWYgKGFzdC5pbnZlcnNlKSB7XG4gICAgICAgICAgaWYgKCFhc3QuaW52ZXJzZS5jaGFpbmVkKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAgICAgICBjb21wYWN0Sm9pbihbXG4gICAgICAgICAgICAgICAgJ3t7JyxcbiAgICAgICAgICAgICAgICBhc3QuaW52ZXJzZVN0cmlwLm9wZW4gPyAnficgOiBudWxsLFxuICAgICAgICAgICAgICAgICdlbHNlJyxcbiAgICAgICAgICAgICAgICBhc3QuaW52ZXJzZVN0cmlwLmNsb3NlID8gJ34nIDogbnVsbCxcbiAgICAgICAgICAgICAgICAnfX0nLFxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGluZXMucHVzaChidWlsZChhc3QuaW52ZXJzZSwgb3B0aW9ucykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhc3QuY2hhaW5lZCkge1xuICAgICAgICAgIGxpbmVzLnB1c2goY2xvc2VCbG9jayhhc3QpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dC5wdXNoKGxpbmVzLmpvaW4oJycpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAge1xuICAgICAgICBvdXRwdXQucHVzaChjb21wYWN0Sm9pbihbJ3t7PicsIHBhdGhQYXJhbXMoYXN0KSwgJ319J10pKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0NvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAge1xuICAgICAgICBvdXRwdXQucHVzaChjb21wYWN0Sm9pbihbJzwhLS0nLCBhc3QudmFsdWUsICctLT4nXSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU3RyaW5nTGl0ZXJhbCc6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKGBcIiR7YXN0LnZhbHVlfVwiYCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgIHtcbiAgICAgICAgb3V0cHV0LnB1c2goU3RyaW5nKGFzdC52YWx1ZSkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKCd1bmRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ051bGxMaXRlcmFsJzpcbiAgICAgIHtcbiAgICAgICAgb3V0cHV0LnB1c2goJ251bGwnKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0hhc2gnOlxuICAgICAge1xuICAgICAgICBvdXRwdXQucHVzaChcbiAgICAgICAgICBhc3QucGFpcnNcbiAgICAgICAgICAgIC5tYXAocGFpciA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBidWlsZChwYWlyLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignICcpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdIYXNoUGFpcic6XG4gICAgICB7XG4gICAgICAgIG91dHB1dC5wdXNoKGAke2FzdC5rZXl9PSR7YnVpbGQoYXN0LnZhbHVlLCBvcHRpb25zKX1gKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhY3QoYXJyYXk6IE9wdGlvbjxzdHJpbmc+W10pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IG5ld0FycmF5OiBhbnlbXSA9IFtdO1xuICBhcnJheS5mb3JFYWNoKGEgPT4ge1xuICAgIGlmICh0eXBlb2YgYSAhPT0gJ3VuZGVmaW5lZCcgJiYgYSAhPT0gbnVsbCAmJiBhICE9PSAnJykge1xuICAgICAgbmV3QXJyYXkucHVzaChhKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbmV3QXJyYXk7XG59XG4iLCJpbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5cbmV4cG9ydCB0eXBlIE5vZGVDYWxsYmFjazxOIGV4dGVuZHMgQVNULk5vZGU+ID0gKG5vZGU6IE4sIHdhbGtlcjogV2Fsa2VyKSA9PiB2b2lkO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYWxrZXIge1xuICBwdWJsaWMgc3RhY2s6IGFueVtdID0gW107XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBvcmRlcj86IGFueSkge31cblxuICB2aXNpdDxOIGV4dGVuZHMgQVNULk5vZGU+KG5vZGU6IE9wdGlvbjxOPiwgY2FsbGJhY2s6IE5vZGVDYWxsYmFjazxOPikge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmICh0aGlzLm9yZGVyID09PSAncG9zdCcpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4obm9kZSwgY2FsbGJhY2spO1xuICAgICAgY2FsbGJhY2sobm9kZSwgdGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKG5vZGUsIHRoaXMpO1xuICAgICAgdGhpcy5jaGlsZHJlbihub2RlLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGFjay5wb3AoKTtcbiAgfVxuXG4gIGNoaWxkcmVuKG5vZGU6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgIGxldCB0eXBlO1xuICAgIGlmIChub2RlLnR5cGUgPT09ICdCbG9jaycgfHwgKG5vZGUudHlwZSA9PT0gJ1RlbXBsYXRlJyAmJiB2aXNpdG9ycy5Qcm9ncmFtKSkge1xuICAgICAgdHlwZSA9ICdQcm9ncmFtJztcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9IG5vZGUudHlwZTtcbiAgICB9XG5cbiAgICBsZXQgdmlzaXRvciA9ICh2aXNpdG9ycyBhcyBhbnkpW3R5cGVdO1xuICAgIGlmICh2aXNpdG9yKSB7XG4gICAgICB2aXNpdG9yKHRoaXMsIG5vZGUsIGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cbn1cblxubGV0IHZpc2l0b3JzID0ge1xuICBQcm9ncmFtKHdhbGtlcjogV2Fsa2VyLCBub2RlOiBBU1QuUHJvZ3JhbSwgY2FsbGJhY2s6IE5vZGVDYWxsYmFjazxBU1QuTm9kZT4pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuYm9keS5sZW5ndGg7IGkrKykge1xuICAgICAgd2Fsa2VyLnZpc2l0KG5vZGUuYm9keVtpXSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICBUZW1wbGF0ZSh3YWxrZXI6IFdhbGtlciwgbm9kZTogQVNULlRlbXBsYXRlLCBjYWxsYmFjazogTm9kZUNhbGxiYWNrPEFTVC5Ob2RlPikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5ib2R5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB3YWxrZXIudmlzaXQobm9kZS5ib2R5W2ldLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LFxuXG4gIEJsb2NrKHdhbGtlcjogV2Fsa2VyLCBub2RlOiBBU1QuQmxvY2ssIGNhbGxiYWNrOiBOb2RlQ2FsbGJhY2s8QVNULk5vZGU+KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmJvZHkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHdhbGtlci52aXNpdChub2RlLmJvZHlbaV0sIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgRWxlbWVudE5vZGUod2Fsa2VyOiBXYWxrZXIsIG5vZGU6IEFTVC5FbGVtZW50Tm9kZSwgY2FsbGJhY2s6IE5vZGVDYWxsYmFjazxBU1QuTm9kZT4pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHdhbGtlci52aXNpdChub2RlLmNoaWxkcmVuW2ldLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LFxuXG4gIEJsb2NrU3RhdGVtZW50KHdhbGtlcjogV2Fsa2VyLCBub2RlOiBBU1QuQmxvY2tTdGF0ZW1lbnQsIGNhbGxiYWNrOiBOb2RlQ2FsbGJhY2s8QVNULkJsb2NrPikge1xuICAgIHdhbGtlci52aXNpdChub2RlLnByb2dyYW0sIGNhbGxiYWNrKTtcbiAgICB3YWxrZXIudmlzaXQobm9kZS5pbnZlcnNlIHx8IG51bGwsIGNhbGxiYWNrKTtcbiAgfSxcbn07XG4iLCJpbXBvcnQgYiwgeyBTWU5USEVUSUMgfSBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgcGFyc2VFbGVtZW50QmxvY2tQYXJhbXMgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIH0gZnJvbSAnLi9oYW5kbGViYXJzLW5vZGUtdmlzaXRvcnMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCAqIGFzIEhCUyBmcm9tICcuLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgU3ludGF4RXJyb3IgZnJvbSAnLi4vZXJyb3JzL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IGJ1aWxkZXJzIGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB0cmF2ZXJzZSBmcm9tICcuLi90cmF2ZXJzYWwvdHJhdmVyc2UnO1xuaW1wb3J0IHByaW50IGZyb20gJy4uL2dlbmVyYXRpb24vcHJpbnQnO1xuaW1wb3J0IFdhbGtlciBmcm9tICcuLi90cmF2ZXJzYWwvd2Fsa2VyJztcbmltcG9ydCAqIGFzIGhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBhc3NpZ24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSAnLi4vdHJhdmVyc2FsL3Zpc2l0b3InO1xuaW1wb3J0IHsgRW50aXR5UGFyc2VyIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGNvbnN0IHZvaWRNYXA6IHtcbiAgW3RhZ05hbWU6IHN0cmluZ106IGJvb2xlYW47XG59ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxubGV0IHZvaWRUYWdOYW1lcyA9XG4gICdhcmVhIGJhc2UgYnIgY29sIGNvbW1hbmQgZW1iZWQgaHIgaW1nIGlucHV0IGtleWdlbiBsaW5rIG1ldGEgcGFyYW0gc291cmNlIHRyYWNrIHdicic7XG52b2lkVGFnTmFtZXMuc3BsaXQoJyAnKS5mb3JFYWNoKHRhZ05hbWUgPT4ge1xuICB2b2lkTWFwW3RhZ05hbWVdID0gdHJ1ZTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVG9rZW5pemVyRXZlbnRIYW5kbGVycyBleHRlbmRzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMge1xuICBwcml2YXRlIHRhZ09wZW5MaW5lID0gMDtcbiAgcHJpdmF0ZSB0YWdPcGVuQ29sdW1uID0gMDtcblxuICByZXNldCgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8vIENvbW1lbnRcblxuICBiZWdpbkNvbW1lbnQoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIuY29tbWVudCgnJyk7XG4gICAgdGhpcy5jdXJyZW50Tm9kZS5sb2MgPSB7XG4gICAgICBzb3VyY2U6IG51bGwsXG4gICAgICBzdGFydDogYi5wb3ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uKSxcbiAgICAgIGVuZDogKG51bGwgYXMgYW55KSBhcyBBU1QuUG9zaXRpb24sXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQ29tbWVudERhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC52YWx1ZSArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoQ29tbWVudCgpIHtcbiAgICB0aGlzLmN1cnJlbnRDb21tZW50LmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnRDb21tZW50KTtcbiAgfVxuXG4gIC8vIERhdGFcblxuICBiZWdpbkRhdGEoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIudGV4dCgpO1xuICAgIHRoaXMuY3VycmVudE5vZGUubG9jID0ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICBlbmQ6IChudWxsIGFzIGFueSkgYXMgQVNULlBvc2l0aW9uLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0RhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5jaGFycyArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoRGF0YSgpIHtcbiAgICB0aGlzLmN1cnJlbnREYXRhLmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnREYXRhKTtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBiYXNpY1xuXG4gIHRhZ09wZW4oKSB7XG4gICAgdGhpcy50YWdPcGVuTGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy50YWdPcGVuQ29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYmVnaW5TdGFydFRhZygpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ1N0YXJ0VGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGJlZ2luRW5kVGFnKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB7XG4gICAgICB0eXBlOiAnRW5kVGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGZpbmlzaFRhZygpIHtcbiAgICBsZXQgeyBsaW5lLCBjb2x1bW4gfSA9IHRoaXMudG9rZW5pemVyO1xuXG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICB0YWcubG9jID0gYi5sb2ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uLCBsaW5lLCBjb2x1bW4pO1xuXG4gICAgaWYgKHRhZy50eXBlID09PSAnU3RhcnRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaFN0YXJ0VGFnKCk7XG5cbiAgICAgIGlmICh2b2lkTWFwW3RhZy5uYW1lXSB8fCB0YWcuc2VsZkNsb3NpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hFbmRUYWcodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcudHlwZSA9PT0gJ0VuZFRhZycpIHtcbiAgICAgIHRoaXMuZmluaXNoRW5kVGFnKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hTdGFydFRhZygpIHtcbiAgICBsZXQgeyBuYW1lLCBhdHRyaWJ1dGVzOiBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgc2VsZkNsb3NpbmcgfSA9IHRoaXMuY3VycmVudFN0YXJ0VGFnO1xuICAgIGxldCBsb2MgPSBiLmxvYyh0aGlzLnRhZ09wZW5MaW5lLCB0aGlzLnRhZ09wZW5Db2x1bW4pO1xuICAgIGxldCBlbGVtZW50ID0gYi5lbGVtZW50KHsgbmFtZSwgc2VsZkNsb3NpbmcgfSwgeyBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgbG9jIH0pO1xuICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2goZWxlbWVudCk7XG4gIH1cblxuICBmaW5pc2hFbmRUYWcoaXNWb2lkOiBib29sZWFuKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkVsZW1lbnROb2RlO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLmN1cnJlbnRFbGVtZW50KCk7XG5cbiAgICB2YWxpZGF0ZUVuZFRhZyh0YWcsIGVsZW1lbnQsIGlzVm9pZCk7XG5cbiAgICBlbGVtZW50LmxvYy5lbmQubGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgZWxlbWVudC5sb2MuZW5kLmNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcblxuICAgIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQpO1xuICAgIGFwcGVuZENoaWxkKHBhcmVudCwgZWxlbWVudCk7XG4gIH1cblxuICBtYXJrVGFnQXNTZWxmQ2xvc2luZygpIHtcbiAgICB0aGlzLmN1cnJlbnRUYWcuc2VsZkNsb3NpbmcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVGFncyAtIG5hbWVcblxuICBhcHBlbmRUb1RhZ05hbWUoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50VGFnLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBhdHRyaWJ1dGVzXG5cbiAgYmVnaW5BdHRyaWJ1dGUoKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGVuZCB0YWc6IGNsb3NpbmcgdGFnIG11c3Qgbm90IGhhdmUgYXR0cmlidXRlcywgYCArXG4gICAgICAgICAgYGluIFxcYCR7dGFnLm5hbWV9XFxgIChvbiBsaW5lICR7dGhpcy50b2tlbml6ZXIubGluZX0pLmAsXG4gICAgICAgIHRhZy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50QXR0cmlidXRlID0ge1xuICAgICAgbmFtZTogJycsXG4gICAgICBwYXJ0czogW10sXG4gICAgICBpc1F1b3RlZDogZmFsc2UsXG4gICAgICBpc0R5bmFtaWM6IGZhbHNlLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICB2YWx1ZVN0YXJ0TGluZTogMCxcbiAgICAgIHZhbHVlU3RhcnRDb2x1bW46IDAsXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQXR0cmlidXRlTmFtZShjaGFyOiBzdHJpbmcpIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIGJlZ2luQXR0cmlidXRlVmFsdWUoaXNRdW90ZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLmlzUXVvdGVkID0gaXNRdW90ZWQ7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0TGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0Q29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVWYWx1ZShjaGFyOiBzdHJpbmcpIHtcbiAgICBsZXQgcGFydHMgPSB0aGlzLmN1cnJlbnRBdHRyLnBhcnRzO1xuICAgIGxldCBsYXN0UGFydCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGxhc3RQYXJ0ICYmIGxhc3RQYXJ0LnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIGxhc3RQYXJ0LmNoYXJzICs9IGNoYXI7XG5cbiAgICAgIC8vIHVwZGF0ZSBlbmQgbG9jYXRpb24gZm9yIGVhY2ggYWRkZWQgY2hhclxuICAgICAgbGFzdFBhcnQubG9jLmVuZC5saW5lID0gdGhpcy50b2tlbml6ZXIubGluZTtcbiAgICAgIGxhc3RQYXJ0LmxvYy5lbmQuY29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbml0aWFsbHkgYXNzdW1lIHRoZSB0ZXh0IG5vZGUgaXMgYSBzaW5nbGUgY2hhclxuICAgICAgbGV0IGxvYyA9IGIubG9jKFxuICAgICAgICB0aGlzLnRva2VuaXplci5saW5lLFxuICAgICAgICB0aGlzLnRva2VuaXplci5jb2x1bW4sXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmxpbmUsXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICAgKTtcblxuICAgICAgLy8gdGhlIHRva2VuaXplciBsaW5lL2NvbHVtbiBoYXZlIGFscmVhZHkgYmVlbiBhZHZhbmNlZCwgY29ycmVjdCBsb2NhdGlvbiBpbmZvXG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmUgLT0gMTtcbiAgICAgICAgbG9jLnN0YXJ0LmNvbHVtbiA9IGxhc3RQYXJ0ID8gbGFzdFBhcnQubG9jLmVuZC5jb2x1bW4gOiB0aGlzLmN1cnJlbnRBdHRyLnZhbHVlU3RhcnRDb2x1bW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2Muc3RhcnQuY29sdW1uIC09IDE7XG4gICAgICB9XG5cbiAgICAgIGxldCB0ZXh0ID0gYi50ZXh0KGNoYXIsIGxvYyk7XG4gICAgICBwYXJ0cy5wdXNoKHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaEF0dHJpYnV0ZVZhbHVlKCkge1xuICAgIGxldCB7IG5hbWUsIHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiB9ID0gdGhpcy5jdXJyZW50QXR0cjtcbiAgICBsZXQgdmFsdWUgPSBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB0aGlzLnRva2VuaXplci5saW5lKTtcbiAgICB2YWx1ZS5sb2MgPSBiLmxvYyh2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiwgdGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGxldCBsb2MgPSBiLmxvYyhcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQubGluZSxcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQuY29sdW1uLFxuICAgICAgdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICk7XG5cbiAgICBsZXQgYXR0cmlidXRlID0gYi5hdHRyKG5hbWUsIHZhbHVlLCBsb2MpO1xuXG4gICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gIH1cblxuICByZXBvcnRTeW50YXhFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgU3ludGF4IGVycm9yIGF0IGxpbmUgJHt0aGlzLnRva2VuaXplci5saW5lfSBjb2wgJHt0aGlzLnRva2VuaXplci5jb2x1bW59OiAke21lc3NhZ2V9YCxcbiAgICAgIGIubG9jKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbilcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlQXR0cmlidXRlVmFsdWUoXG4gIHBhcnRzOiAoQVNULk11c3RhY2hlU3RhdGVtZW50IHwgQVNULlRleHROb2RlKVtdLFxuICBpc1F1b3RlZDogYm9vbGVhbixcbiAgaXNEeW5hbWljOiBib29sZWFuLFxuICBsaW5lOiBudW1iZXJcbikge1xuICBpZiAoaXNEeW5hbWljKSB7XG4gICAgaWYgKGlzUXVvdGVkKSB7XG4gICAgICByZXR1cm4gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgcGFydHMubGVuZ3RoID09PSAxIHx8XG4gICAgICAgIChwYXJ0cy5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICBwYXJ0c1sxXS50eXBlID09PSAnVGV4dE5vZGUnICYmXG4gICAgICAgICAgKHBhcnRzWzFdIGFzIEFTVC5UZXh0Tm9kZSkuY2hhcnMgPT09ICcvJylcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYEFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSBtdXN0IGJlIGEgc3RyaW5nIG9yIGEgbXVzdGFjaGUsIGAgK1xuICAgICAgICAgICAgYHByZWNlZWRlZCBieSB3aGl0ZXNwYWNlIG9yIGEgJz0nIGNoYXJhY3RlciwgYW5kIGAgK1xuICAgICAgICAgICAgYGZvbGxvd2VkIGJ5IHdoaXRlc3BhY2UsIGEgJz4nIGNoYXJhY3Rlciwgb3IgJy8+JyAob24gbGluZSAke2xpbmV9KWAsXG4gICAgICAgICAgYi5sb2MobGluZSwgMClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDAgPyBwYXJ0c1swXSA6IGIudGV4dCgnJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhcnQ6IEFTVC5CYXNlTm9kZSA9IHBhcnRzW2ldO1xuXG4gICAgaWYgKHBhcnQudHlwZSAhPT0gJ011c3RhY2hlU3RhdGVtZW50JyAmJiBwYXJ0LnR5cGUgIT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1Vuc3VwcG9ydGVkIG5vZGUgaW4gcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZTogJyArIHBhcnRbJ3R5cGUnXSxcbiAgICAgICAgcGFydC5sb2NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGIuY29uY2F0KHBhcnRzKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbmRUYWcoXG4gIHRhZzogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4sXG4gIGVsZW1lbnQ6IEFTVC5FbGVtZW50Tm9kZSxcbiAgc2VsZkNsb3Npbmc6IGJvb2xlYW5cbikge1xuICBsZXQgZXJyb3I7XG5cbiAgaWYgKHZvaWRNYXBbdGFnLm5hbWVdICYmICFzZWxmQ2xvc2luZykge1xuICAgIC8vIEVuZ1RhZyBpcyBhbHNvIGNhbGxlZCBieSBTdGFydFRhZyBmb3Igdm9pZCBhbmQgc2VsZi1jbG9zaW5nIHRhZ3MgKGkuZS5cbiAgICAvLyA8aW5wdXQ+IG9yIDxiciAvPiwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdCBoZXJlLiBPdGhlcndpc2UsIHdlIHdvdWxkXG4gICAgLy8gdGhyb3cgYW4gZXJyb3IgZm9yIHRob3NlIGNhc2VzLlxuICAgIGVycm9yID0gJ0ludmFsaWQgZW5kIHRhZyAnICsgZm9ybWF0RW5kVGFnSW5mbyh0YWcpICsgJyAodm9pZCBlbGVtZW50cyBjYW5ub3QgaGF2ZSBlbmQgdGFncykuJztcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IgPSAnQ2xvc2luZyB0YWcgJyArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArICcgd2l0aG91dCBhbiBvcGVuIHRhZy4nO1xuICB9IGVsc2UgaWYgKGVsZW1lbnQudGFnICE9PSB0YWcubmFtZSkge1xuICAgIGVycm9yID1cbiAgICAgICdDbG9zaW5nIHRhZyAnICtcbiAgICAgIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArXG4gICAgICAnIGRpZCBub3QgbWF0Y2ggbGFzdCBvcGVuIHRhZyBgJyArXG4gICAgICBlbGVtZW50LnRhZyArXG4gICAgICAnYCAob24gbGluZSAnICtcbiAgICAgIGVsZW1lbnQubG9jLnN0YXJ0LmxpbmUgK1xuICAgICAgJykuJztcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihlcnJvciwgZWxlbWVudC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVuZFRhZ0luZm8odGFnOiBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPikge1xuICByZXR1cm4gJ2AnICsgdGFnLm5hbWUgKyAnYCAob24gbGluZSAnICsgdGFnLmxvYy5lbmQubGluZSArICcpJztcbn1cblxuLyoqXG4gIEFTVFBsdWdpbnMgY2FuIG1ha2UgY2hhbmdlcyB0byB0aGUgR2xpbW1lciB0ZW1wbGF0ZSBBU1QgYmVmb3JlXG4gIGNvbXBpbGF0aW9uIGJlZ2lucy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkJ1aWxkZXIge1xuICAoZW52OiBBU1RQbHVnaW5FbnZpcm9ubWVudCk6IEFTVFBsdWdpbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW4ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZpc2l0b3I6IE5vZGVWaXNpdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkVudmlyb25tZW50IHtcbiAgbWV0YT86IG9iamVjdDtcbiAgc3ludGF4OiBTeW50YXg7XG59XG5pbnRlcmZhY2UgSGFuZGxlYmFyc1BhcnNlT3B0aW9ucyB7XG4gIHNyY05hbWU/OiBzdHJpbmc7XG4gIGlnbm9yZVN0YW5kYWxvbmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXByb2Nlc3NPcHRpb25zIHtcbiAgbWV0YT86IHVua25vd247XG4gIHBsdWdpbnM/OiB7XG4gICAgYXN0PzogQVNUUGx1Z2luQnVpbGRlcltdO1xuICB9O1xuICBwYXJzZU9wdGlvbnM/OiBIYW5kbGViYXJzUGFyc2VPcHRpb25zO1xuXG4gIC8qKlxuICAgIFVzZWZ1bCBmb3Igc3BlY2lmeWluZyBhIGdyb3VwIG9mIG9wdGlvbnMgdG9nZXRoZXIuXG5cbiAgICBXaGVuIGAnY29kZW1vZCdgIHdlIGRpc2FibGUgYWxsIHdoaXRlc3BhY2UgY29udHJvbCBpbiBoYW5kbGViYXJzXG4gICAgKHRvIHByZXNlcnZlIGFzIG11Y2ggYXMgcG9zc2libGUpIGFuZCB3ZSBhbHNvIGF2b2lkIGFueVxuICAgIGVzY2FwaW5nL3VuZXNjYXBpbmcgb2YgSFRNTCBlbnRpdHkgY29kZXMuXG4gICAqL1xuICBtb2RlPzogJ2NvZGVtb2QnIHwgJ3ByZWNvbXBpbGUnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5bnRheCB7XG4gIHBhcnNlOiB0eXBlb2YgcHJlcHJvY2VzcztcbiAgYnVpbGRlcnM6IHR5cGVvZiBidWlsZGVycztcbiAgcHJpbnQ6IHR5cGVvZiBwcmludDtcbiAgdHJhdmVyc2U6IHR5cGVvZiB0cmF2ZXJzZTtcbiAgV2Fsa2VyOiB0eXBlb2YgV2Fsa2VyO1xufVxuXG5jb25zdCBzeW50YXg6IFN5bnRheCA9IHtcbiAgcGFyc2U6IHByZXByb2Nlc3MsXG4gIGJ1aWxkZXJzLFxuICBwcmludCxcbiAgdHJhdmVyc2UsXG4gIFdhbGtlcixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwcm9jZXNzKGh0bWw6IHN0cmluZywgb3B0aW9uczogUHJlcHJvY2Vzc09wdGlvbnMgPSB7fSk6IEFTVC5UZW1wbGF0ZSB7XG4gIGxldCBtb2RlID0gb3B0aW9ucy5tb2RlIHx8ICdwcmVjb21waWxlJztcblxuICBsZXQgYXN0OiBIQlMuUHJvZ3JhbTtcbiAgaWYgKHR5cGVvZiBodG1sID09PSAnb2JqZWN0Jykge1xuICAgIGFzdCA9IGh0bWw7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlT3B0aW9ucyA9IG9wdGlvbnMucGFyc2VPcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKG1vZGUgPT09ICdjb2RlbW9kJykge1xuICAgICAgcGFyc2VPcHRpb25zLmlnbm9yZVN0YW5kYWxvbmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGFzdCA9IGhhbmRsZWJhcnMucGFyc2UoaHRtbCwgcGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgfVxuXG4gIGxldCBlbnRpdHlQYXJzZXIgPSB1bmRlZmluZWQ7XG4gIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICBlbnRpdHlQYXJzZXIgPSBuZXcgRW50aXR5UGFyc2VyKHt9KTtcbiAgfVxuXG4gIGxldCBwcm9ncmFtID0gbmV3IFRva2VuaXplckV2ZW50SGFuZGxlcnMoaHRtbCwgZW50aXR5UGFyc2VyKS5hY2NlcHRUZW1wbGF0ZShhc3QpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucGx1Z2lucyAmJiBvcHRpb25zLnBsdWdpbnMuYXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBvcHRpb25zLnBsdWdpbnMuYXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IG9wdGlvbnMucGx1Z2lucy5hc3RbaV07XG4gICAgICBsZXQgZW52ID0gYXNzaWduKHt9LCBvcHRpb25zLCB7IHN5bnRheCB9LCB7IHBsdWdpbnM6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgbGV0IHBsdWdpblJlc3VsdCA9IHRyYW5zZm9ybShlbnYpO1xuXG4gICAgICB0cmF2ZXJzZShwcm9ncmFtLCBwbHVnaW5SZXN1bHQudmlzaXRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2dyYW07XG59XG4iXSwibmFtZXMiOlsiYXNzaWduIiwiRW50aXR5UGFyc2VyIiwibmFtZWRDaGFyUmVmcyIsIkV2ZW50ZWRUb2tlbml6ZXIiLCJ0dXBsZSIsImhhbmRsZWJhcnMucGFyc2UiXSwibWFwcGluZ3MiOiI7O0lBV0EsU0FBQSxhQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBTXdCO0lBRXRCLFFBQUksT0FBQSxJQUFBLEtBQUosUUFBQSxFQUE4QjtJQUM1QixlQUFPLFVBQVAsSUFBTyxDQUFQO0lBQ0Q7SUFFRCxXQUFPO0lBQ0wsY0FESyxtQkFBQTtJQUFBLGtCQUFBO0lBR0wsZ0JBQVEsVUFISCxFQUFBO0lBSUwsY0FBTSxRQUFRLFVBSlQsRUFJUyxDQUpUO0lBS0wsaUJBQVMsQ0FMSixHQUFBO0lBTUwsYUFBSyxTQUFTLE9B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