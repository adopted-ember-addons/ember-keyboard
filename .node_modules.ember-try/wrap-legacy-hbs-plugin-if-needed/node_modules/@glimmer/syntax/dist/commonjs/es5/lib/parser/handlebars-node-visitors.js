"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HandlebarsNodeVisitors = undefined;

var _builders = require("../builders");

var _builders2 = _interopRequireDefault(_builders);

var _utils = require("../utils");

var _parser = require("../parser");

var _syntaxError = require("../errors/syntax-error");

var _syntaxError2 = _interopRequireDefault(_syntaxError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _defaults(obj, defaults) {
    var keys = Object.getOwnPropertyNames(defaults);for (var i = 0; i < keys.length; i++) {
        var key = keys[i];var value = Object.getOwnPropertyDescriptor(defaults, key);if (value && value.configurable && obj[key] === undefined) {
            Object.defineProperty(obj, key, value);
        }
    }return obj;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
}

var HandlebarsNodeVisitors = exports.HandlebarsNodeVisitors = function (_Parser) {
    _inherits(HandlebarsNodeVisitors, _Parser);

    function HandlebarsNodeVisitors() {
        _classCallCheck(this, HandlebarsNodeVisitors);

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
            node = _builders2.default.template(body, program.blockParams, program.loc);
        } else {
            node = _builders2.default.blockItself(body, program.blockParams, program.chained, program.loc);
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
            throw new _syntaxError2.default('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
        }
        return node;
    };

    HandlebarsNodeVisitors.prototype.BlockStatement = function BlockStatement(block) {
        if (this.tokenizer['state'] === 'comment') {
            this.appendToCommentData(this.sourceForNode(block));
            return;
        }
        if (this.tokenizer['state'] !== 'comment' && this.tokenizer['state'] !== 'data' && this.tokenizer['state'] !== 'beforeData') {
            throw new _syntaxError2.default('A block may only be used inside an HTML element or another block.', block.loc);
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
        var node = _builders2.default.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);
        var parentProgram = this.currentElement();
        (0, _utils.appendChild)(parentProgram, node);
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

        if ((0, _utils.isLiteral)(rawMustache.path)) {
            mustache = {
                type: 'MustacheStatement',
                path: this.acceptNode(rawMustache.path),
                params: [],
                hash: _builders2.default.hash(),
                escaped: escaped,
                loc: loc,
                strip: strip
            };
        } else {
            var _acceptCallNodes2 = acceptCallNodes(this, rawMustache),
                path = _acceptCallNodes2.path,
                params = _acceptCallNodes2.params,
                hash = _acceptCallNodes2.hash;

            mustache = _builders2.default.mustache(path, params, hash, !escaped, loc, strip);
        }
        switch (tokenizer.state) {
            // Tag helpers
            case "tagOpen" /* tagOpen */:
            case "tagName" /* tagName */:
                throw new _syntaxError2.default('Cannot use mustaches in an elements tagname: `' + this.sourceForNode(rawMustache, rawMustache.path) + '` at L' + loc.start.line + ':C' + loc.start.column, mustache.loc);
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
                (0, _utils.appendChild)(this.currentElement(), mustache);
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

        var comment = _builders2.default.mustacheComment(value, loc);
        switch (tokenizer.state) {
            case "beforeAttributeName" /* beforeAttributeName */:
                this.currentStartTag.comments.push(comment);
                break;
            case "beforeData" /* beforeData */:
            case "data" /* data */:
                (0, _utils.appendChild)(this.currentElement(), comment);
                break;
            default:
                throw new _syntaxError2.default('Using a Handlebars comment when in the `' + tokenizer['state'] + '` state is not supported: "' + comment.value + '" on line ' + loc.start.line + ':' + loc.start.column, rawComment.loc);
        }
        return comment;
    };

    HandlebarsNodeVisitors.prototype.PartialStatement = function PartialStatement(partial) {
        var loc = partial.loc;

        throw new _syntaxError2.default('Handlebars partials are not supported: "' + this.sourceForNode(partial, partial.name) + '" at L' + loc.start.line + ':C' + loc.start.column, partial.loc);
    };

    HandlebarsNodeVisitors.prototype.PartialBlockStatement = function PartialBlockStatement(partialBlock) {
        var loc = partialBlock.loc;

        throw new _syntaxError2.default('Handlebars partial blocks are not supported: "' + this.sourceForNode(partialBlock, partialBlock.name) + '" at L' + loc.start.line + ':C' + loc.start.column, partialBlock.loc);
    };

    HandlebarsNodeVisitors.prototype.Decorator = function Decorator(decorator) {
        var loc = decorator.loc;

        throw new _syntaxError2.default('Handlebars decorators are not supported: "' + this.sourceForNode(decorator, decorator.path) + '" at L' + loc.start.line + ':C' + loc.start.column, decorator.loc);
    };

    HandlebarsNodeVisitors.prototype.DecoratorBlock = function DecoratorBlock(decoratorBlock) {
        var loc = decoratorBlock.loc;

        throw new _syntaxError2.default('Handlebars decorator blocks are not supported: "' + this.sourceForNode(decoratorBlock, decoratorBlock.path) + '" at L' + loc.start.line + ':C' + loc.start.column, decoratorBlock.loc);
    };

    HandlebarsNodeVisitors.prototype.SubExpression = function SubExpression(sexpr) {
        var _acceptCallNodes3 = acceptCallNodes(this, sexpr),
            path = _acceptCallNodes3.path,
            params = _acceptCallNodes3.params,
            hash = _acceptCallNodes3.hash;

        return _builders2.default.sexpr(path, params, hash, sexpr.loc);
    };

    HandlebarsNodeVisitors.prototype.PathExpression = function PathExpression(path) {
        var original = path.original,
            loc = path.loc;

        var parts = void 0;
        if (original.indexOf('/') !== -1) {
            if (original.slice(0, 2) === './') {
                throw new _syntaxError2.default('Using "./" is not supported in Glimmer and unnecessary: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
            }
            if (original.slice(0, 3) === '../') {
                throw new _syntaxError2.default('Changing context using "../" is not supported in Glimmer: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
            }
            if (original.indexOf('.') !== -1) {
                throw new _syntaxError2.default('Mixing \'.\' and \'/\' in paths is not supported in Glimmer; use only \'.\' to separate property paths: "' + path.original + '" on line ' + loc.start.line + '.', path.loc);
            }
            parts = [path.parts.join('/')];
        } else if (original === '.') {
            var locationInfo = 'L' + loc.start.line + ':C' + loc.start.column;
            throw new _syntaxError2.default('\'.\' is not a supported path in Glimmer; check for a path with a trailing \'.\' at ' + locationInfo + '.', path.loc);
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
            pairs.push(_builders2.default.pair(pair.key, this.acceptNode(pair.value), pair.loc));
        }
        return _builders2.default.hash(pairs, hash.loc);
    };

    HandlebarsNodeVisitors.prototype.StringLiteral = function StringLiteral(string) {
        return _builders2.default.literal('StringLiteral', string.value, string.loc);
    };

    HandlebarsNodeVisitors.prototype.BooleanLiteral = function BooleanLiteral(boolean) {
        return _builders2.default.literal('BooleanLiteral', boolean.value, boolean.loc);
    };

    HandlebarsNodeVisitors.prototype.NumberLiteral = function NumberLiteral(number) {
        return _builders2.default.literal('NumberLiteral', number.value, number.loc);
    };

    HandlebarsNodeVisitors.prototype.UndefinedLiteral = function UndefinedLiteral(undef) {
        return _builders2.default.literal('UndefinedLiteral', undefined, undef.loc);
    };

    HandlebarsNodeVisitors.prototype.NullLiteral = function NullLiteral(nul) {
        return _builders2.default.literal('NullLiteral', null, nul.loc);
    };

    _createClass(HandlebarsNodeVisitors, [{
        key: 'isTopLevel',
        get: function get() {
            return this.elementStack.length === 0;
        }
    }]);

    return HandlebarsNodeVisitors;
}(_parser.Parser);
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
    var hash = node.hash ? compiler.Hash(node.hash) : _builders2.default.hash();
    return { path: path, params: params, hash: hash };
}
function addElementModifier(element, mustache) {
    var path = mustache.path,
        params = mustache.params,
        hash = mustache.hash,
        loc = mustache.loc;

    if ((0, _utils.isLiteral)(path)) {
        var _modifier = '{{' + (0, _utils.printLiteral)(path) + '}}';
        var tag = '<' + element.name + ' ... ' + _modifier + ' ...';
        throw new _syntaxError2.default('In ' + tag + ', ' + _modifier + ' is not a valid modifier: "' + path.original + '" on line ' + (loc && loc.start.line) + '.', mustache.loc);
    }
    var modifier = _builders2.default.elementModifier(path, params, hash, loc);
    element.modifiers.push(modifier);
}
function addInElementHash(cursor, hash, loc) {
    var hasInsertBefore = false;
    hash.pairs.forEach(function (pair) {
        if (pair.key === 'guid') {
            throw new _syntaxError2.default('Cannot pass `guid` from user space', loc);
        }
        if (pair.key === 'insertBefore') {
            hasInsertBefore = true;
        }
    });
    var guid = _builders2.default.literal('StringLiteral', cursor);
    var guidPair = _builders2.default.pair('guid', guid);
    hash.pairs.unshift(guidPair);
    if (!hasInsertBefore) {
        var undefinedLiteral = _builders2.default.literal('UndefinedLiteral', undefined);
        var beforeSibling = _builders2.default.pair('insertBefore', undefinedLiteral);
        hash.pairs.push(beforeSibling);
    }
    return hash;
}
function appendDynamicAttributeValuePart(attribute, part) {
    attribute.isDynamic = true;
    attribute.parts.push(part);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7QUFDQTs7QUFHQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsSUFBQSwwREFBQSxVQUFBLE9BQUEsRUFBQTtBQUFBLGNBQUEsc0JBQUEsRUFBQSxPQUFBOztBQUFBLGFBQUEsc0JBQUEsR0FBQTtBQUFBLHdCQUFBLElBQUEsRUFBQSxzQkFBQTs7QUFBQSxZQUFBLFFBQUEsMkJBQUEsSUFBQSxFLG9CQUFBLFMsQ0FBQSxDQUFBOztBQUtFLGNBQUEsV0FBQSxHQUFBLENBQUE7QUFMRixlQUFBLEtBQUE7QUFtV0M7O0FBbldELDJCQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxNQUFBLEdBT1E7QUFDSixlQUFBLGFBQWtCLEtBQWxCLFdBQWtCLEVBQWxCLEdBQUEsR0FBQTtBQVJKLEtBQUE7O0FBQUEsMkJBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLE9BQUEsQ0FBQSxPQUFBLEVBa0I4QjtBQUMxQixZQUFJLE9BQUosRUFBQTtBQUNBLGFBQUEsV0FBQSxHQUFBLENBQUE7QUFFQSxZQUFBLE9BQUEsS0FBQSxDQUFBO0FBRUEsWUFBSSxLQUFKLFVBQUEsRUFBcUI7QUFDbkIsbUJBQU8sbUJBQUEsUUFBQSxDQUFBLElBQUEsRUFBaUIsUUFBakIsV0FBQSxFQUFzQyxRQUE3QyxHQUFPLENBQVA7QUFERixTQUFBLE1BRU87QUFDTCxtQkFBTyxtQkFBQSxXQUFBLENBQUEsSUFBQSxFQUFvQixRQUFwQixXQUFBLEVBQXlDLFFBQXpDLE9BQUEsRUFBMEQsUUFBakUsR0FBTyxDQUFQO0FBQ0Q7QUFFRCxZQUFBLElBQUEsS0FBQSxDQUFBO0FBQUEsWUFDRSxJQUFJLFFBQUEsSUFBQSxDQUROLE1BQUE7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QUEsQ0FBQSxrQkFBQSxFQUF2QixTQUF1QixDQUF2QjtBQUNBLFlBQUksZ0JBQWdCLG1CQUFBLElBQUEsQ0FBQSxjQUFBLEVBQXBCLGdCQUFvQixDQUFwQjtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBO0FBQ0Q7QUFFRCxXQUFBLElBQUE7QUFDRDtBQUVELFNBQUEsK0JBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxFQUEwRjtBQUN4RixjQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsY0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBiIGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB7IGFwcGVuZENoaWxkLCBpc0xpdGVyYWwsIHByaW50TGl0ZXJhbCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi4vdHlwZXMvaGFuZGxlYmFycy1hc3QnO1xuaW1wb3J0IHsgUGFyc2VyLCBUYWcsIEF0dHJpYnV0ZSB9IGZyb20gJy4uL3BhcnNlcic7XG5pbXBvcnQgU3ludGF4RXJyb3IgZnJvbSAnLi4vZXJyb3JzL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFJlY2FzdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVG9rZW5pemVyU3RhdGUgfSBmcm9tICdzaW1wbGUtaHRtbC10b2tlbml6ZXInO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSGFuZGxlYmFyc05vZGVWaXNpdG9ycyBleHRlbmRzIFBhcnNlciB7XG4gIGFic3RyYWN0IGFwcGVuZFRvQ29tbWVudERhdGEoczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5BdHRyaWJ1dGVWYWx1ZShxdW90ZWQ6IGJvb2xlYW4pOiB2b2lkO1xuICBhYnN0cmFjdCBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpOiB2b2lkO1xuXG4gIGN1cnNvckNvdW50ID0gMDtcblxuICBjdXJzb3IoKSB7XG4gICAgcmV0dXJuIGAlY3Vyc29yOiR7dGhpcy5jdXJzb3JDb3VudCsrfSVgO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgaXNUb3BMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZTtcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZSB8IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jayB8IEFTVC5UZW1wbGF0ZSB7XG4gICAgbGV0IGJvZHk6IEFTVC5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIHRoaXMuY3Vyc29yQ291bnQgPSAwO1xuXG4gICAgbGV0IG5vZGU7XG5cbiAgICBpZiAodGhpcy5pc1RvcExldmVsKSB7XG4gICAgICBub2RlID0gYi50ZW1wbGF0ZShib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmxvYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUgPSBiLmJsb2NrSXRzZWxmKGJvZHksIHByb2dyYW0uYmxvY2tQYXJhbXMsIHByb2dyYW0uY2hhaW5lZCwgcHJvZ3JhbS5sb2MpO1xuICAgIH1cblxuICAgIGxldCBpLFxuICAgICAgbCA9IHByb2dyYW0uYm9keS5sZW5ndGg7XG5cbiAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKG5vZGUpO1xuXG4gICAgaWYgKGwgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKSBhcyBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5hY2NlcHROb2RlKHByb2dyYW0uYm9keVtpXSk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHRoYXQgdGhhdCB0aGUgZWxlbWVudCBzdGFjayBpcyBiYWxhbmNlZCBwcm9wZXJseS5cbiAgICBsZXQgcG9wcGVkTm9kZSA9IHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpO1xuICAgIGlmIChwb3BwZWROb2RlICE9PSBub2RlKSB7XG4gICAgICBsZXQgZWxlbWVudE5vZGUgPSBwb3BwZWROb2RlIGFzIEFTVC5FbGVtZW50Tm9kZTtcblxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnVW5jbG9zZWQgZWxlbWVudCBgJyArIGVsZW1lbnROb2RlLnRhZyArICdgIChvbiBsaW5lICcgKyBlbGVtZW50Tm9kZS5sb2MhLnN0YXJ0LmxpbmUgKyAnKS4nLFxuICAgICAgICBlbGVtZW50Tm9kZS5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBCbG9ja1N0YXRlbWVudChibG9jazogSEJTLkJsb2NrU3RhdGVtZW50KTogQVNULkJsb2NrU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgaWYgKHRoaXMudG9rZW5pemVyWydzdGF0ZSddID09PSAnY29tbWVudCcpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUoYmxvY2spKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnRva2VuaXplclsnc3RhdGUnXSAhPT0gJ2NvbW1lbnQnICYmXG4gICAgICB0aGlzLnRva2VuaXplclsnc3RhdGUnXSAhPT0gJ2RhdGEnICYmXG4gICAgICB0aGlzLnRva2VuaXplclsnc3RhdGUnXSAhPT0gJ2JlZm9yZURhdGEnXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICdBIGJsb2NrIG1heSBvbmx5IGJlIHVzZWQgaW5zaWRlIGFuIEhUTUwgZWxlbWVudCBvciBhbm90aGVyIGJsb2NrLicsXG4gICAgICAgIGJsb2NrLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCBibG9jayk7XG4gICAgbGV0IHByb2dyYW0gPSB0aGlzLlByb2dyYW0oYmxvY2sucHJvZ3JhbSk7XG4gICAgbGV0IGludmVyc2UgPSBibG9jay5pbnZlcnNlID8gdGhpcy5Qcm9ncmFtKGJsb2NrLmludmVyc2UpIDogbnVsbDtcblxuICAgIGlmIChwYXRoLm9yaWdpbmFsID09PSAnaW4tZWxlbWVudCcpIHtcbiAgICAgIGhhc2ggPSBhZGRJbkVsZW1lbnRIYXNoKHRoaXMuY3Vyc29yKCksIGhhc2gsIGJsb2NrLmxvYyk7XG4gICAgfVxuXG4gICAgbGV0IG5vZGUgPSBiLmJsb2NrKFxuICAgICAgcGF0aCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGhhc2gsXG4gICAgICBwcm9ncmFtLFxuICAgICAgaW52ZXJzZSxcbiAgICAgIGJsb2NrLmxvYyxcbiAgICAgIGJsb2NrLm9wZW5TdHJpcCxcbiAgICAgIGJsb2NrLmludmVyc2VTdHJpcCxcbiAgICAgIGJsb2NrLmNsb3NlU3RyaXBcbiAgICApO1xuXG4gICAgbGV0IHBhcmVudFByb2dyYW0gPSB0aGlzLmN1cnJlbnRFbGVtZW50KCk7XG5cbiAgICBhcHBlbmRDaGlsZChwYXJlbnRQcm9ncmFtLCBub2RlKTtcbiAgfVxuXG4gIE11c3RhY2hlU3RhdGVtZW50KHJhd011c3RhY2hlOiBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQpOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQgfCB2b2lkIHtcbiAgICBsZXQgeyB0b2tlbml6ZXIgfSA9IHRoaXM7XG5cbiAgICBpZiAodG9rZW5pemVyLnN0YXRlID09PSAnY29tbWVudCcpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3TXVzdGFjaGUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbXVzdGFjaGU6IEFTVC5NdXN0YWNoZVN0YXRlbWVudDtcbiAgICBsZXQgeyBlc2NhcGVkLCBsb2MsIHN0cmlwIH0gPSByYXdNdXN0YWNoZTtcblxuICAgIGlmIChpc0xpdGVyYWwocmF3TXVzdGFjaGUucGF0aCkpIHtcbiAgICAgIG11c3RhY2hlID0ge1xuICAgICAgICB0eXBlOiAnTXVzdGFjaGVTdGF0ZW1lbnQnLFxuICAgICAgICBwYXRoOiB0aGlzLmFjY2VwdE5vZGU8QVNULkxpdGVyYWw+KHJhd011c3RhY2hlLnBhdGgpLFxuICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICBoYXNoOiBiLmhhc2goKSxcbiAgICAgICAgZXNjYXBlZCxcbiAgICAgICAgbG9jLFxuICAgICAgICBzdHJpcCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gYWNjZXB0Q2FsbE5vZGVzKHRoaXMsIHJhd011c3RhY2hlIGFzIEhCUy5NdXN0YWNoZVN0YXRlbWVudCAmIHtcbiAgICAgICAgcGF0aDogSEJTLlBhdGhFeHByZXNzaW9uO1xuICAgICAgfSk7XG4gICAgICBtdXN0YWNoZSA9IGIubXVzdGFjaGUocGF0aCwgcGFyYW1zLCBoYXNoLCAhZXNjYXBlZCwgbG9jLCBzdHJpcCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIC8vIFRhZyBoZWxwZXJzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ09wZW46XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ05hbWU6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IHVzZSBtdXN0YWNoZXMgaW4gYW4gZWxlbWVudHMgdGFnbmFtZTogXFxgJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgICAgICByYXdNdXN0YWNoZSxcbiAgICAgICAgICAgIHJhd011c3RhY2hlLnBhdGhcbiAgICAgICAgICApfVxcYCBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgICAgIG11c3RhY2hlLmxvY1xuICAgICAgICApO1xuXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWU6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlTmFtZTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICB0aGlzLmZpbmlzaEF0dHJpYnV0ZVZhbHVlKCk7XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVWYWx1ZVF1b3RlZDpcbiAgICAgICAgYWRkRWxlbWVudE1vZGlmaWVyKHRoaXMuY3VycmVudFN0YXJ0VGFnLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBBdHRyaWJ1dGUgdmFsdWVzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZVZhbHVlOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KHRoaXMuY3VycmVudEF0dHJpYnV0ZSEsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVVucXVvdGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlRG91YmxlUXVvdGVkOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVNpbmdsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZDpcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBUT0RPOiBPbmx5IGFwcGVuZCBjaGlsZCB3aGVuIHRoZSB0b2tlbml6ZXIgc3RhdGUgbWFrZXNcbiAgICAgIC8vIHNlbnNlIHRvIGRvIHNvLCBvdGhlcndpc2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIG11c3RhY2hlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXVzdGFjaGU7XG4gIH1cblxuICBDb250ZW50U3RhdGVtZW50KGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KTogdm9pZCB7XG4gICAgdXBkYXRlVG9rZW5pemVyTG9jYXRpb24odGhpcy50b2tlbml6ZXIsIGNvbnRlbnQpO1xuXG4gICAgdGhpcy50b2tlbml6ZXIudG9rZW5pemVQYXJ0KGNvbnRlbnQudmFsdWUpO1xuICAgIHRoaXMudG9rZW5pemVyLmZsdXNoRGF0YSgpO1xuICB9XG5cbiAgQ29tbWVudFN0YXRlbWVudChyYXdDb21tZW50OiBIQlMuQ29tbWVudFN0YXRlbWVudCk6IE9wdGlvbjxBU1QuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50PiB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gVG9rZW5pemVyU3RhdGUuY29tbWVudCkge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShyYXdDb21tZW50KSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgeyB2YWx1ZSwgbG9jIH0gPSByYXdDb21tZW50O1xuICAgIGxldCBjb21tZW50ID0gYi5tdXN0YWNoZUNvbW1lbnQodmFsdWUsIGxvYyk7XG5cbiAgICBzd2l0Y2ggKHRva2VuaXplci5zdGF0ZSkge1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFydFRhZy5jb21tZW50cy5wdXNoKGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVEYXRhOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5kYXRhOlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBVc2luZyBhIEhhbmRsZWJhcnMgY29tbWVudCB3aGVuIGluIHRoZSBcXGAke3Rva2VuaXplclsnc3RhdGUnXX1cXGAgc3RhdGUgaXMgbm90IHN1cHBvcnRlZDogXCIke2NvbW1lbnQudmFsdWV9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfToke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICByYXdDb21tZW50LmxvY1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG5cbiAgUGFydGlhbFN0YXRlbWVudChwYXJ0aWFsOiBIQlMuUGFydGlhbFN0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWw7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBwYXJ0aWFscyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShwYXJ0aWFsLCBwYXJ0aWFsLm5hbWUpfVwiIGF0IEwke1xuICAgICAgICBsb2Muc3RhcnQubGluZVxuICAgICAgfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsLmxvY1xuICAgICk7XG4gIH1cblxuICBQYXJ0aWFsQmxvY2tTdGF0ZW1lbnQocGFydGlhbEJsb2NrOiBIQlMuUGFydGlhbEJsb2NrU3RhdGVtZW50KTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gcGFydGlhbEJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbCBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIHBhcnRpYWxCbG9jayxcbiAgICAgICAgcGFydGlhbEJsb2NrLm5hbWVcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIHBhcnRpYWxCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yKGRlY29yYXRvcjogSEJTLkRlY29yYXRvcik6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvcjtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvcixcbiAgICAgICAgZGVjb3JhdG9yLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvci5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yQmxvY2soZGVjb3JhdG9yQmxvY2s6IEhCUy5EZWNvcmF0b3JCbG9jayk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvckJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgZGVjb3JhdG9yIGJsb2NrcyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgZGVjb3JhdG9yQmxvY2ssXG4gICAgICAgIGRlY29yYXRvckJsb2NrLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvckJsb2NrLmxvY1xuICAgICk7XG4gIH1cblxuICBTdWJFeHByZXNzaW9uKHNleHByOiBIQlMuU3ViRXhwcmVzc2lvbik6IEFTVC5TdWJFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCBzZXhwcik7XG4gICAgcmV0dXJuIGIuc2V4cHIocGF0aCwgcGFyYW1zLCBoYXNoLCBzZXhwci5sb2MpO1xuICB9XG5cbiAgUGF0aEV4cHJlc3Npb24ocGF0aDogSEJTLlBhdGhFeHByZXNzaW9uKTogQVNULlBhdGhFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBvcmlnaW5hbCwgbG9jIH0gPSBwYXRoO1xuICAgIGxldCBwYXJ0czogc3RyaW5nW107XG5cbiAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDIpID09PSAnLi8nKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgXCIuL1wiIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lciBhbmQgdW5uZWNlc3Nhcnk6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDMpID09PSAnLi4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENoYW5naW5nIGNvbnRleHQgdXNpbmcgXCIuLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBNaXhpbmcgJy4nIGFuZCAnLycgaW4gcGF0aHMgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOyB1c2Ugb25seSAnLicgdG8gc2VwYXJhdGUgcHJvcGVydHkgcGF0aHM6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcGFydHMgPSBbcGF0aC5wYXJ0cy5qb2luKCcvJyldO1xuICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgPT09ICcuJykge1xuICAgICAgbGV0IGxvY2F0aW9uSW5mbyA9IGBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gO1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgJy4nIGlzIG5vdCBhIHN1cHBvcnRlZCBwYXRoIGluIEdsaW1tZXI7IGNoZWNrIGZvciBhIHBhdGggd2l0aCBhIHRyYWlsaW5nICcuJyBhdCAke2xvY2F0aW9uSW5mb30uYCxcbiAgICAgICAgcGF0aC5sb2NcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzID0gcGF0aC5wYXJ0cztcbiAgICB9XG5cbiAgICBsZXQgdGhpc0hlYWQgPSBmYWxzZTtcblxuICAgIC8vIFRoaXMgaXMgdG8gZml4IGEgYnVnIGluIHRoZSBIYW5kbGViYXJzIEFTVCB3aGVyZSB0aGUgcGF0aCBleHByZXNzaW9ucyBpblxuICAgIC8vIGB7e3RoaXMuZm9vfX1gIChhbmQgc2ltaWxhcmx5IGB7e2Zvby1iYXIgdGhpcy5mb28gbmFtZWQ9dGhpcy5mb299fWAgZXRjKVxuICAgIC8vIGFyZSBzaW1wbHkgdHVybmVkIGludG8gYHt7Zm9vfX1gLiBUaGUgZml4IGlzIHRvIHB1c2ggaXQgYmFjayBvbnRvIHRoZVxuICAgIC8vIHBhcnRzIGFycmF5IGFuZCBsZXQgdGhlIHJ1bnRpbWUgc2VlIHRoZSBkaWZmZXJlbmNlLiBIb3dldmVyLCB3ZSBjYW5ub3RcbiAgICAvLyBzaW1wbHkgdXNlIHRoZSBzdHJpbmcgYHRoaXNgIGFzIGl0IG1lYW5zIGxpdGVyYWxseSB0aGUgcHJvcGVydHkgY2FsbGVkXG4gICAgLy8gXCJ0aGlzXCIgaW4gdGhlIGN1cnJlbnQgY29udGV4dCAoaXQgY2FuIGJlIGV4cHJlc3NlZCBpbiB0aGUgc3ludGF4IGFzXG4gICAgLy8gYHt7W3RoaXNdfX1gLCB3aGVyZSB0aGUgc3F1YXJlIGJyYWNrZXQgYXJlIGdlbmVyYWxseSBmb3IgdGhpcyBraW5kIG9mXG4gICAgLy8gZXNjYXBpbmcg4oCTIHN1Y2ggYXMgYHt7Zm9vLltcImJhci5iYXpcIl19fWAgd291bGQgbWVhbiBsb29rdXAgYSBwcm9wZXJ0eVxuICAgIC8vIG5hbWVkIGxpdGVyYWxseSBcImJhci5iYXpcIiBvbiBgdGhpcy5mb29gKS4gQnkgY29udmVudGlvbiwgd2UgdXNlIGBudWxsYFxuICAgIC8vIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgaWYgKG9yaWdpbmFsLm1hdGNoKC9edGhpcyhcXC4uKyk/JC8pKSB7XG4gICAgICB0aGlzSGVhZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicsXG4gICAgICBvcmlnaW5hbDogcGF0aC5vcmlnaW5hbCxcbiAgICAgIHRoaXM6IHRoaXNIZWFkLFxuICAgICAgcGFydHMsXG4gICAgICBkYXRhOiBwYXRoLmRhdGEsXG4gICAgICBsb2M6IHBhdGgubG9jLFxuICAgIH07XG4gIH1cblxuICBIYXNoKGhhc2g6IEhCUy5IYXNoKTogQVNULkhhc2gge1xuICAgIGxldCBwYWlyczogQVNULkhhc2hQYWlyW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFzaC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBhaXIgPSBoYXNoLnBhaXJzW2ldO1xuICAgICAgcGFpcnMucHVzaChiLnBhaXIocGFpci5rZXksIHRoaXMuYWNjZXB0Tm9kZShwYWlyLnZhbHVlKSwgcGFpci5sb2MpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYi5oYXNoKHBhaXJzLCBoYXNoLmxvYyk7XG4gIH1cblxuICBTdHJpbmdMaXRlcmFsKHN0cmluZzogSEJTLlN0cmluZ0xpdGVyYWwpOiBBU1QuU3RyaW5nTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIHN0cmluZy52YWx1ZSwgc3RyaW5nLmxvYyk7XG4gIH1cblxuICBCb29sZWFuTGl0ZXJhbChib29sZWFuOiBIQlMuQm9vbGVhbkxpdGVyYWwpOiBBU1QuQm9vbGVhbkxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ0Jvb2xlYW5MaXRlcmFsJywgYm9vbGVhbi52YWx1ZSwgYm9vbGVhbi5sb2MpO1xuICB9XG5cbiAgTnVtYmVyTGl0ZXJhbChudW1iZXI6IEhCUy5OdW1iZXJMaXRlcmFsKTogQVNULk51bWJlckxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ051bWJlckxpdGVyYWwnLCBudW1iZXIudmFsdWUsIG51bWJlci5sb2MpO1xuICB9XG5cbiAgVW5kZWZpbmVkTGl0ZXJhbCh1bmRlZjogSEJTLlVuZGVmaW5lZExpdGVyYWwpOiBBU1QuVW5kZWZpbmVkTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnVW5kZWZpbmVkTGl0ZXJhbCcsIHVuZGVmaW5lZCwgdW5kZWYubG9jKTtcbiAgfVxuXG4gIE51bGxMaXRlcmFsKG51bDogSEJTLk51bGxMaXRlcmFsKTogQVNULk51bGxMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdWxsTGl0ZXJhbCcsIG51bGwsIG51bC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKG9yaWdpbmFsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKHZhbHVlID09PSAnJykge1xuICAgIC8vIGlmIGl0IGlzIGVtcHR5LCBqdXN0IHJldHVybiB0aGUgY291bnQgb2YgbmV3bGluZXNcbiAgICAvLyBpbiBvcmlnaW5hbFxuICAgIHJldHVybiB7XG4gICAgICBsaW5lczogb3JpZ2luYWwuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDEsXG4gICAgICBjb2x1bW5zOiAwLFxuICAgIH07XG4gIH1cblxuICAvLyBvdGhlcndpc2UsIHJldHVybiB0aGUgbnVtYmVyIG9mIG5ld2xpbmVzIHByaW9yIHRvXG4gIC8vIGB2YWx1ZWBcbiAgbGV0IGRpZmZlcmVuY2UgPSBvcmlnaW5hbC5zcGxpdCh2YWx1ZSlbMF07XG4gIGxldCBsaW5lcyA9IGRpZmZlcmVuY2Uuc3BsaXQoL1xcbi8pO1xuICBsZXQgbGluZUNvdW50ID0gbGluZXMubGVuZ3RoIC0gMTtcblxuICByZXR1cm4ge1xuICAgIGxpbmVzOiBsaW5lQ291bnQsXG4gICAgY29sdW1uczogbGluZXNbbGluZUNvdW50XS5sZW5ndGgsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRva2VuaXplcjogUGFyc2VyWyd0b2tlbml6ZXInXSwgY29udGVudDogSEJTLkNvbnRlbnRTdGF0ZW1lbnQpIHtcbiAgbGV0IGxpbmUgPSBjb250ZW50LmxvYy5zdGFydC5saW5lO1xuICBsZXQgY29sdW1uID0gY29udGVudC5sb2Muc3RhcnQuY29sdW1uO1xuXG4gIGxldCBvZmZzZXRzID0gY2FsY3VsYXRlUmlnaHRTdHJpcHBlZE9mZnNldHMoXG4gICAgY29udGVudC5vcmlnaW5hbCBhcyBSZWNhc3Q8SEJTLlN0cmlwRmxhZ3MsIHN0cmluZz4sXG4gICAgY29udGVudC52YWx1ZVxuICApO1xuXG4gIGxpbmUgPSBsaW5lICsgb2Zmc2V0cy5saW5lcztcbiAgaWYgKG9mZnNldHMubGluZXMpIHtcbiAgICBjb2x1bW4gPSBvZmZzZXRzLmNvbHVtbnM7XG4gIH0gZWxzZSB7XG4gICAgY29sdW1uID0gY29sdW1uICsgb2Zmc2V0cy5jb2x1bW5zO1xuICB9XG5cbiAgdG9rZW5pemVyLmxpbmUgPSBsaW5lO1xuICB0b2tlbml6ZXIuY29sdW1uID0gY29sdW1uO1xufVxuXG5mdW5jdGlvbiBhY2NlcHRDYWxsTm9kZXMoXG4gIGNvbXBpbGVyOiBIYW5kbGViYXJzTm9kZVZpc2l0b3JzLFxuICBub2RlOiB7XG4gICAgcGF0aDogSEJTLlBhdGhFeHByZXNzaW9uO1xuICAgIHBhcmFtczogSEJTLkV4cHJlc3Npb25bXTtcbiAgICBoYXNoOiBIQlMuSGFzaDtcbiAgfVxuKTogeyBwYXRoOiBBU1QuUGF0aEV4cHJlc3Npb247IHBhcmFtczogQVNULkV4cHJlc3Npb25bXTsgaGFzaDogQVNULkhhc2ggfSB7XG4gIGxldCBwYXRoID0gY29tcGlsZXIuUGF0aEV4cHJlc3Npb24obm9kZS5wYXRoKTtcblxuICBsZXQgcGFyYW1zID0gbm9kZS5wYXJhbXMgPyBub2RlLnBhcmFtcy5tYXAoZSA9PiBjb21waWxlci5hY2NlcHROb2RlPEFTVC5FeHByZXNzaW9uPihlKSkgOiBbXTtcbiAgbGV0IGhhc2ggPSBub2RlLmhhc2ggPyBjb21waWxlci5IYXNoKG5vZGUuaGFzaCkgOiBiLmhhc2goKTtcblxuICByZXR1cm4geyBwYXRoLCBwYXJhbXMsIGhhc2ggfTtcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudE1vZGlmaWVyKGVsZW1lbnQ6IFRhZzwnU3RhcnRUYWcnPiwgbXVzdGFjaGU6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCkge1xuICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYyB9ID0gbXVzdGFjaGU7XG5cbiAgaWYgKGlzTGl0ZXJhbChwYXRoKSkge1xuICAgIGxldCBtb2RpZmllciA9IGB7eyR7cHJpbnRMaXRlcmFsKHBhdGgpfX19YDtcbiAgICBsZXQgdGFnID0gYDwke2VsZW1lbnQubmFtZX0gLi4uICR7bW9kaWZpZXJ9IC4uLmA7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSW4gJHt0YWd9LCAke21vZGlmaWVyfSBpcyBub3QgYSB2YWxpZCBtb2RpZmllcjogXCIke3BhdGgub3JpZ2luYWx9XCIgb24gbGluZSAke2xvYyAmJlxuICAgICAgICBsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgIG11c3RhY2hlLmxvY1xuICAgICk7XG4gIH1cblxuICBsZXQgbW9kaWZpZXIgPSBiLmVsZW1lbnRNb2RpZmllcihwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYyk7XG4gIGVsZW1lbnQubW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xufVxuXG5mdW5jdGlvbiBhZGRJbkVsZW1lbnRIYXNoKGN1cnNvcjogc3RyaW5nLCBoYXNoOiBBU1QuSGFzaCwgbG9jOiBBU1QuU291cmNlTG9jYXRpb24pIHtcbiAgbGV0IGhhc0luc2VydEJlZm9yZSA9IGZhbHNlO1xuICBoYXNoLnBhaXJzLmZvckVhY2gocGFpciA9PiB7XG4gICAgaWYgKHBhaXIua2V5ID09PSAnZ3VpZCcpIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignQ2Fubm90IHBhc3MgYGd1aWRgIGZyb20gdXNlciBzcGFjZScsIGxvYyk7XG4gICAgfVxuXG4gICAgaWYgKHBhaXIua2V5ID09PSAnaW5zZXJ0QmVmb3JlJykge1xuICAgICAgaGFzSW5zZXJ0QmVmb3JlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIGxldCBndWlkID0gYi5saXRlcmFsKCdTdHJpbmdMaXRlcmFsJywgY3Vyc29yKTtcbiAgbGV0IGd1aWRQYWlyID0gYi5wYWlyKCdndWlkJywgZ3VpZCk7XG4gIGhhc2gucGFpcnMudW5zaGlmdChndWlkUGFpcik7XG5cbiAgaWYgKCFoYXNJbnNlcnRCZWZvcmUpIHtcbiAgICBsZXQgdW5kZWZpbmVkTGl0ZXJhbCA9IGIubGl0ZXJhbCgnVW5kZWZpbmVkTGl0ZXJhbCcsIHVuZGVmaW5lZCk7XG4gICAgbGV0IGJlZm9yZVNpYmxpbmcgPSBiLnBhaXIoJ2luc2VydEJlZm9yZScsIHVuZGVmaW5lZExpdGVyYWwpO1xuICAgIGhhc2gucGFpcnMucHVzaChiZWZvcmVTaWJsaW5nKTtcbiAgfVxuXG4gIHJldHVybiBoYXNoO1xufVxuXG5mdW5jdGlvbiBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KGF0dHJpYnV0ZTogQXR0cmlidXRlLCBwYXJ0OiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgYXR0cmlidXRlLmlzRHluYW1pYyA9IHRydWU7XG4gIGF0dHJpYnV0ZS5wYXJ0cy5wdXNoKHBhcnQpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==