"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TokenizerEventHandlers = exports.voidMap = undefined;
exports.preprocess = preprocess;

var _builders = require("../builders");

var _builders2 = _interopRequireDefault(_builders);

var _utils = require("../utils");

var _handlebarsNodeVisitors = require("./handlebars-node-visitors");

var _syntaxError = require("../errors/syntax-error");

var _syntaxError2 = _interopRequireDefault(_syntaxError);

var _traverse = require("../traversal/traverse");

var _traverse2 = _interopRequireDefault(_traverse);

var _print = require("../generation/print");

var _print2 = _interopRequireDefault(_print);

var _walker = require("../traversal/walker");

var _walker2 = _interopRequireDefault(_walker);

var _handlebars = require("handlebars");

var handlebars = _interopRequireWildcard(_handlebars);

var _util = require("@glimmer/util");

var _simpleHtmlTokenizer = require("simple-html-tokenizer");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var voidMap = exports.voidMap = Object.create(null);
var voidTagNames = 'area base br col command embed hr img input keygen link meta param source track wbr';
voidTagNames.split(' ').forEach(function (tagName) {
    voidMap[tagName] = true;
});
var TokenizerEventHandlers = exports.TokenizerEventHandlers = function (_HandlebarsNodeVisito) {
    _inherits(TokenizerEventHandlers, _HandlebarsNodeVisito);

    function TokenizerEventHandlers() {
        _classCallCheck(this, TokenizerEventHandlers);

        var _this = _possibleConstructorReturn(this, _HandlebarsNodeVisito.apply(this, arguments));

        _this.tagOpenLine = 0;
        _this.tagOpenColumn = 0;
        return _this;
    }

    TokenizerEventHandlers.prototype.reset = function reset() {
        this.currentNode = null;
    };
    // Comment


    TokenizerEventHandlers.prototype.beginComment = function beginComment() {
        this.currentNode = _builders2.default.comment('');
        this.currentNode.loc = {
            source: null,
            start: _builders2.default.pos(this.tagOpenLine, this.tagOpenColumn),
            end: null
        };
    };

    TokenizerEventHandlers.prototype.appendToCommentData = function appendToCommentData(char) {
        this.currentComment.value += char;
    };

    TokenizerEventHandlers.prototype.finishComment = function finishComment() {
        this.currentComment.loc.end = _builders2.default.pos(this.tokenizer.line, this.tokenizer.column);
        (0, _utils.appendChild)(this.currentElement(), this.currentComment);
    };
    // Data


    TokenizerEventHandlers.prototype.beginData = function beginData() {
        this.currentNode = _builders2.default.text();
        this.currentNode.loc = {
            source: null,
            start: _builders2.default.pos(this.tokenizer.line, this.tokenizer.column),
            end: null
        };
    };

    TokenizerEventHandlers.prototype.appendToData = function appendToData(char) {
        this.currentData.chars += char;
    };

    TokenizerEventHandlers.prototype.finishData = function finishData() {
        this.currentData.loc.end = _builders2.default.pos(this.tokenizer.line, this.tokenizer.column);
        (0, _utils.appendChild)(this.currentElement(), this.currentData);
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
            loc: _builders.SYNTHETIC
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
            loc: _builders.SYNTHETIC
        };
    };

    TokenizerEventHandlers.prototype.finishTag = function finishTag() {
        var _tokenizer = this.tokenizer,
            line = _tokenizer.line,
            column = _tokenizer.column;

        var tag = this.currentTag;
        tag.loc = _builders2.default.loc(this.tagOpenLine, this.tagOpenColumn, line, column);
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

        var loc = _builders2.default.loc(this.tagOpenLine, this.tagOpenColumn);
        var element = _builders2.default.element({ name: name, selfClosing: selfClosing }, { attrs: attrs, modifiers: modifiers, comments: comments, loc: loc });
        this.elementStack.push(element);
    };

    TokenizerEventHandlers.prototype.finishEndTag = function finishEndTag(isVoid) {
        var tag = this.currentTag;
        var element = this.elementStack.pop();
        var parent = this.currentElement();
        validateEndTag(tag, element, isVoid);
        element.loc.end.line = this.tokenizer.line;
        element.loc.end.column = this.tokenizer.column;
        (0, _utils.parseElementBlockParams)(element);
        (0, _utils.appendChild)(parent, element);
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
            throw new _syntaxError2.default('Invalid end tag: closing tag must not have attributes, ' + ('in `' + tag.name + '` (on line ' + this.tokenizer.line + ').'), tag.loc);
        }
        this.currentAttribute = {
            name: '',
            parts: [],
            isQuoted: false,
            isDynamic: false,
            start: _builders2.default.pos(this.tokenizer.line, this.tokenizer.column),
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
            var loc = _builders2.default.loc(this.tokenizer.line, this.tokenizer.column, this.tokenizer.line, this.tokenizer.column);
            // the tokenizer line/column have already been advanced, correct location info
            if (char === '\n') {
                loc.start.line -= 1;
                loc.start.column = lastPart ? lastPart.loc.end.column : this.currentAttr.valueStartColumn;
            } else {
                loc.start.column -= 1;
            }
            var text = _builders2.default.text(char, loc);
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
        value.loc = _builders2.default.loc(valueStartLine, valueStartColumn, this.tokenizer.line, this.tokenizer.column);
        var loc = _builders2.default.loc(this.currentAttr.start.line, this.currentAttr.start.column, this.tokenizer.line, this.tokenizer.column);
        var attribute = _builders2.default.attr(name, value, loc);
        this.currentStartTag.attributes.push(attribute);
    };

    TokenizerEventHandlers.prototype.reportSyntaxError = function reportSyntaxError(message) {
        throw new _syntaxError2.default('Syntax error at line ' + this.tokenizer.line + ' col ' + this.tokenizer.column + ': ' + message, _builders2.default.loc(this.tokenizer.line, this.tokenizer.column));
    };

    return TokenizerEventHandlers;
}(_handlebarsNodeVisitors.HandlebarsNodeVisitors);
function assembleAttributeValue(parts, isQuoted, isDynamic, line) {
    if (isDynamic) {
        if (isQuoted) {
            return assembleConcatenatedValue(parts);
        } else {
            if (parts.length === 1 || parts.length === 2 && parts[1].type === 'TextNode' && parts[1].chars === '/') {
                return parts[0];
            } else {
                throw new _syntaxError2.default('An unquoted attribute value must be a string or a mustache, ' + 'preceeded by whitespace or a \'=\' character, and ' + ('followed by whitespace, a \'>\' character, or \'/>\' (on line ' + line + ')'), _builders2.default.loc(line, 0));
            }
        }
    } else {
        return parts.length > 0 ? parts[0] : _builders2.default.text('');
    }
}
function assembleConcatenatedValue(parts) {
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
            throw new _syntaxError2.default('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
        }
    }
    return _builders2.default.concat(parts);
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
        throw new _syntaxError2.default(error, element.loc);
    }
}
function formatEndTagInfo(tag) {
    return '`' + tag.name + '` (on line ' + tag.loc.end.line + ')';
}
var syntax = {
    parse: preprocess,
    builders: _builders2.default,
    print: _print2.default,
    traverse: _traverse2.default,
    Walker: _walker2.default
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
        entityParser = new _simpleHtmlTokenizer.EntityParser({});
    }
    var program = new TokenizerEventHandlers(html, entityParser).acceptTemplate(ast);
    if (options && options.plugins && options.plugins.ast) {
        for (var i = 0, l = options.plugins.ast.length; i < l; i++) {
            var transform = options.plugins.ast[i];
            var env = (0, _util.assign)({}, options, { syntax: syntax }, { plugins: undefined });
            var pluginResult = transform(env);
            (0, _traverse2.default)(program, pluginResult.visitor);
        }
    }
    return program;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7UUE2WE0sVSxHQUFBLFU7O0FBN1hOOzs7O0FBQ0E7O0FBQ0E7O0FBR0E7Ozs7QUFHQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBQSxVOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVPLElBQU0sNEJBRVQsT0FBQSxNQUFBLENBRkcsSUFFSCxDQUZHO0FBSVAsSUFBSSxlQUFKLHFGQUFBO0FBRUEsYUFBQSxLQUFBLENBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBZ0MsVUFBQSxPQUFBLEVBQVU7QUFDeEMsWUFBQSxPQUFBLElBQUEsSUFBQTtBQURGLENBQUE7QUFJQSxJQUFBLDBEQUFBLFVBQUEscUJBQUEsRUFBQTtBQUFBLGNBQUEsc0JBQUEsRUFBQSxxQkFBQTs7QUFBQSxhQUFBLHNCQUFBLEdBQUE7QUFBQSx3QkFBQSxJQUFBLEVBQUEsc0JBQUE7O0FBQUEsWUFBQSxRQUFBLDJCQUFBLElBQUEsRSxrQ0FBQSxTLENBQUEsQ0FBQTs7QUFDVSxjQUFBLFdBQUEsR0FBQSxDQUFBO0FBQ0EsY0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUZWLGVBQUEsS0FBQTtBQTBOQzs7QUExTkQsMkJBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxTQUFBLEtBQUEsR0FJTztBQUNILGFBQUEsV0FBQSxHQUFBLElBQUE7QUFMSixLQUFBO0FBUUU7OztBQVJGLDJCQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxZQUFBLEdBVWM7QUFDVixhQUFBLFdBQUEsR0FBbUIsbUJBQUEsT0FBQSxDQUFuQixFQUFtQixDQUFuQjtBQUNBLGFBQUEsV0FBQSxDQUFBLEdBQUEsR0FBdUI7QUFDckIsb0JBRHFCLElBQUE7QUFFckIsbUJBQU8sbUJBQUEsR0FBQSxD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QUFwQixRQUFBLE1BQW9CLEVBQXBCLEVBQWdDLEVBQUUsU0FBNUMsU0FBMEMsRUFBaEMsQ0FBVjtBQUVBLGdCQUFJLGVBQWUsVUFBbkIsR0FBbUIsQ0FBbkI7QUFFQSxvQ0FBQSxPQUFBLEVBQWtCLGFBQWxCLE9BQUE7QUFDRDtBQUNGO0FBRUQsV0FBQSxPQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYiwgeyBTWU5USEVUSUMgfSBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgcGFyc2VFbGVtZW50QmxvY2tQYXJhbXMgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIH0gZnJvbSAnLi9oYW5kbGViYXJzLW5vZGUtdmlzaXRvcnMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCAqIGFzIEhCUyBmcm9tICcuLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgU3ludGF4RXJyb3IgZnJvbSAnLi4vZXJyb3JzL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IGJ1aWxkZXJzIGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB0cmF2ZXJzZSBmcm9tICcuLi90cmF2ZXJzYWwvdHJhdmVyc2UnO1xuaW1wb3J0IHByaW50IGZyb20gJy4uL2dlbmVyYXRpb24vcHJpbnQnO1xuaW1wb3J0IFdhbGtlciBmcm9tICcuLi90cmF2ZXJzYWwvd2Fsa2VyJztcbmltcG9ydCAqIGFzIGhhbmRsZWJhcnMgZnJvbSAnaGFuZGxlYmFycyc7XG5pbXBvcnQgeyBhc3NpZ24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IE5vZGVWaXNpdG9yIH0gZnJvbSAnLi4vdHJhdmVyc2FsL3Zpc2l0b3InO1xuaW1wb3J0IHsgRW50aXR5UGFyc2VyIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGNvbnN0IHZvaWRNYXA6IHtcbiAgW3RhZ05hbWU6IHN0cmluZ106IGJvb2xlYW47XG59ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxubGV0IHZvaWRUYWdOYW1lcyA9XG4gICdhcmVhIGJhc2UgYnIgY29sIGNvbW1hbmQgZW1iZWQgaHIgaW1nIGlucHV0IGtleWdlbiBsaW5rIG1ldGEgcGFyYW0gc291cmNlIHRyYWNrIHdicic7XG52b2lkVGFnTmFtZXMuc3BsaXQoJyAnKS5mb3JFYWNoKHRhZ05hbWUgPT4ge1xuICB2b2lkTWFwW3RhZ05hbWVdID0gdHJ1ZTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVG9rZW5pemVyRXZlbnRIYW5kbGVycyBleHRlbmRzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMge1xuICBwcml2YXRlIHRhZ09wZW5MaW5lID0gMDtcbiAgcHJpdmF0ZSB0YWdPcGVuQ29sdW1uID0gMDtcblxuICByZXNldCgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8vIENvbW1lbnRcblxuICBiZWdpbkNvbW1lbnQoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIuY29tbWVudCgnJyk7XG4gICAgdGhpcy5jdXJyZW50Tm9kZS5sb2MgPSB7XG4gICAgICBzb3VyY2U6IG51bGwsXG4gICAgICBzdGFydDogYi5wb3ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uKSxcbiAgICAgIGVuZDogKG51bGwgYXMgYW55KSBhcyBBU1QuUG9zaXRpb24sXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQ29tbWVudERhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC52YWx1ZSArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoQ29tbWVudCgpIHtcbiAgICB0aGlzLmN1cnJlbnRDb21tZW50LmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnRDb21tZW50KTtcbiAgfVxuXG4gIC8vIERhdGFcblxuICBiZWdpbkRhdGEoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIudGV4dCgpO1xuICAgIHRoaXMuY3VycmVudE5vZGUubG9jID0ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICBlbmQ6IChudWxsIGFzIGFueSkgYXMgQVNULlBvc2l0aW9uLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0RhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5jaGFycyArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoRGF0YSgpIHtcbiAgICB0aGlzLmN1cnJlbnREYXRhLmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnREYXRhKTtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBiYXNpY1xuXG4gIHRhZ09wZW4oKSB7XG4gICAgdGhpcy50YWdPcGVuTGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy50YWdPcGVuQ29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYmVnaW5TdGFydFRhZygpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ1N0YXJ0VGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGJlZ2luRW5kVGFnKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB7XG4gICAgICB0eXBlOiAnRW5kVGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGZpbmlzaFRhZygpIHtcbiAgICBsZXQgeyBsaW5lLCBjb2x1bW4gfSA9IHRoaXMudG9rZW5pemVyO1xuXG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICB0YWcubG9jID0gYi5sb2ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uLCBsaW5lLCBjb2x1bW4pO1xuXG4gICAgaWYgKHRhZy50eXBlID09PSAnU3RhcnRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaFN0YXJ0VGFnKCk7XG5cbiAgICAgIGlmICh2b2lkTWFwW3RhZy5uYW1lXSB8fCB0YWcuc2VsZkNsb3NpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hFbmRUYWcodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcudHlwZSA9PT0gJ0VuZFRhZycpIHtcbiAgICAgIHRoaXMuZmluaXNoRW5kVGFnKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hTdGFydFRhZygpIHtcbiAgICBsZXQgeyBuYW1lLCBhdHRyaWJ1dGVzOiBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgc2VsZkNsb3NpbmcgfSA9IHRoaXMuY3VycmVudFN0YXJ0VGFnO1xuICAgIGxldCBsb2MgPSBiLmxvYyh0aGlzLnRhZ09wZW5MaW5lLCB0aGlzLnRhZ09wZW5Db2x1bW4pO1xuICAgIGxldCBlbGVtZW50ID0gYi5lbGVtZW50KHsgbmFtZSwgc2VsZkNsb3NpbmcgfSwgeyBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgbG9jIH0pO1xuICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2goZWxlbWVudCk7XG4gIH1cblxuICBmaW5pc2hFbmRUYWcoaXNWb2lkOiBib29sZWFuKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkVsZW1lbnROb2RlO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLmN1cnJlbnRFbGVtZW50KCk7XG5cbiAgICB2YWxpZGF0ZUVuZFRhZyh0YWcsIGVsZW1lbnQsIGlzVm9pZCk7XG5cbiAgICBlbGVtZW50LmxvYy5lbmQubGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgZWxlbWVudC5sb2MuZW5kLmNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcblxuICAgIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQpO1xuICAgIGFwcGVuZENoaWxkKHBhcmVudCwgZWxlbWVudCk7XG4gIH1cblxuICBtYXJrVGFnQXNTZWxmQ2xvc2luZygpIHtcbiAgICB0aGlzLmN1cnJlbnRUYWcuc2VsZkNsb3NpbmcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVGFncyAtIG5hbWVcblxuICBhcHBlbmRUb1RhZ05hbWUoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50VGFnLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBhdHRyaWJ1dGVzXG5cbiAgYmVnaW5BdHRyaWJ1dGUoKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGVuZCB0YWc6IGNsb3NpbmcgdGFnIG11c3Qgbm90IGhhdmUgYXR0cmlidXRlcywgYCArXG4gICAgICAgICAgYGluIFxcYCR7dGFnLm5hbWV9XFxgIChvbiBsaW5lICR7dGhpcy50b2tlbml6ZXIubGluZX0pLmAsXG4gICAgICAgIHRhZy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50QXR0cmlidXRlID0ge1xuICAgICAgbmFtZTogJycsXG4gICAgICBwYXJ0czogW10sXG4gICAgICBpc1F1b3RlZDogZmFsc2UsXG4gICAgICBpc0R5bmFtaWM6IGZhbHNlLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICB2YWx1ZVN0YXJ0TGluZTogMCxcbiAgICAgIHZhbHVlU3RhcnRDb2x1bW46IDAsXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQXR0cmlidXRlTmFtZShjaGFyOiBzdHJpbmcpIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIGJlZ2luQXR0cmlidXRlVmFsdWUoaXNRdW90ZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLmlzUXVvdGVkID0gaXNRdW90ZWQ7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0TGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0Q29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVWYWx1ZShjaGFyOiBzdHJpbmcpIHtcbiAgICBsZXQgcGFydHMgPSB0aGlzLmN1cnJlbnRBdHRyLnBhcnRzO1xuICAgIGxldCBsYXN0UGFydCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGxhc3RQYXJ0ICYmIGxhc3RQYXJ0LnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIGxhc3RQYXJ0LmNoYXJzICs9IGNoYXI7XG5cbiAgICAgIC8vIHVwZGF0ZSBlbmQgbG9jYXRpb24gZm9yIGVhY2ggYWRkZWQgY2hhclxuICAgICAgbGFzdFBhcnQubG9jLmVuZC5saW5lID0gdGhpcy50b2tlbml6ZXIubGluZTtcbiAgICAgIGxhc3RQYXJ0LmxvYy5lbmQuY29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbml0aWFsbHkgYXNzdW1lIHRoZSB0ZXh0IG5vZGUgaXMgYSBzaW5nbGUgY2hhclxuICAgICAgbGV0IGxvYyA9IGIubG9jKFxuICAgICAgICB0aGlzLnRva2VuaXplci5saW5lLFxuICAgICAgICB0aGlzLnRva2VuaXplci5jb2x1bW4sXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmxpbmUsXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICAgKTtcblxuICAgICAgLy8gdGhlIHRva2VuaXplciBsaW5lL2NvbHVtbiBoYXZlIGFscmVhZHkgYmVlbiBhZHZhbmNlZCwgY29ycmVjdCBsb2NhdGlvbiBpbmZvXG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmUgLT0gMTtcbiAgICAgICAgbG9jLnN0YXJ0LmNvbHVtbiA9IGxhc3RQYXJ0ID8gbGFzdFBhcnQubG9jLmVuZC5jb2x1bW4gOiB0aGlzLmN1cnJlbnRBdHRyLnZhbHVlU3RhcnRDb2x1bW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2Muc3RhcnQuY29sdW1uIC09IDE7XG4gICAgICB9XG5cbiAgICAgIGxldCB0ZXh0ID0gYi50ZXh0KGNoYXIsIGxvYyk7XG4gICAgICBwYXJ0cy5wdXNoKHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaEF0dHJpYnV0ZVZhbHVlKCkge1xuICAgIGxldCB7IG5hbWUsIHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiB9ID0gdGhpcy5jdXJyZW50QXR0cjtcbiAgICBsZXQgdmFsdWUgPSBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB0aGlzLnRva2VuaXplci5saW5lKTtcbiAgICB2YWx1ZS5sb2MgPSBiLmxvYyh2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiwgdGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGxldCBsb2MgPSBiLmxvYyhcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQubGluZSxcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQuY29sdW1uLFxuICAgICAgdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICk7XG5cbiAgICBsZXQgYXR0cmlidXRlID0gYi5hdHRyKG5hbWUsIHZhbHVlLCBsb2MpO1xuXG4gICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gIH1cblxuICByZXBvcnRTeW50YXhFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgU3ludGF4IGVycm9yIGF0IGxpbmUgJHt0aGlzLnRva2VuaXplci5saW5lfSBjb2wgJHt0aGlzLnRva2VuaXplci5jb2x1bW59OiAke21lc3NhZ2V9YCxcbiAgICAgIGIubG9jKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbilcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlQXR0cmlidXRlVmFsdWUoXG4gIHBhcnRzOiAoQVNULk11c3RhY2hlU3RhdGVtZW50IHwgQVNULlRleHROb2RlKVtdLFxuICBpc1F1b3RlZDogYm9vbGVhbixcbiAgaXNEeW5hbWljOiBib29sZWFuLFxuICBsaW5lOiBudW1iZXJcbikge1xuICBpZiAoaXNEeW5hbWljKSB7XG4gICAgaWYgKGlzUXVvdGVkKSB7XG4gICAgICByZXR1cm4gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgcGFydHMubGVuZ3RoID09PSAxIHx8XG4gICAgICAgIChwYXJ0cy5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICBwYXJ0c1sxXS50eXBlID09PSAnVGV4dE5vZGUnICYmXG4gICAgICAgICAgKHBhcnRzWzFdIGFzIEFTVC5UZXh0Tm9kZSkuY2hhcnMgPT09ICcvJylcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYEFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSBtdXN0IGJlIGEgc3RyaW5nIG9yIGEgbXVzdGFjaGUsIGAgK1xuICAgICAgICAgICAgYHByZWNlZWRlZCBieSB3aGl0ZXNwYWNlIG9yIGEgJz0nIGNoYXJhY3RlciwgYW5kIGAgK1xuICAgICAgICAgICAgYGZvbGxvd2VkIGJ5IHdoaXRlc3BhY2UsIGEgJz4nIGNoYXJhY3Rlciwgb3IgJy8+JyAob24gbGluZSAke2xpbmV9KWAsXG4gICAgICAgICAgYi5sb2MobGluZSwgMClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDAgPyBwYXJ0c1swXSA6IGIudGV4dCgnJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhcnQ6IEFTVC5CYXNlTm9kZSA9IHBhcnRzW2ldO1xuXG4gICAgaWYgKHBhcnQudHlwZSAhPT0gJ011c3RhY2hlU3RhdGVtZW50JyAmJiBwYXJ0LnR5cGUgIT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1Vuc3VwcG9ydGVkIG5vZGUgaW4gcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZTogJyArIHBhcnRbJ3R5cGUnXSxcbiAgICAgICAgcGFydC5sb2NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGIuY29uY2F0KHBhcnRzKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbmRUYWcoXG4gIHRhZzogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4sXG4gIGVsZW1lbnQ6IEFTVC5FbGVtZW50Tm9kZSxcbiAgc2VsZkNsb3Npbmc6IGJvb2xlYW5cbikge1xuICBsZXQgZXJyb3I7XG5cbiAgaWYgKHZvaWRNYXBbdGFnLm5hbWVdICYmICFzZWxmQ2xvc2luZykge1xuICAgIC8vIEVuZ1RhZyBpcyBhbHNvIGNhbGxlZCBieSBTdGFydFRhZyBmb3Igdm9pZCBhbmQgc2VsZi1jbG9zaW5nIHRhZ3MgKGkuZS5cbiAgICAvLyA8aW5wdXQ+IG9yIDxiciAvPiwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdCBoZXJlLiBPdGhlcndpc2UsIHdlIHdvdWxkXG4gICAgLy8gdGhyb3cgYW4gZXJyb3IgZm9yIHRob3NlIGNhc2VzLlxuICAgIGVycm9yID0gJ0ludmFsaWQgZW5kIHRhZyAnICsgZm9ybWF0RW5kVGFnSW5mbyh0YWcpICsgJyAodm9pZCBlbGVtZW50cyBjYW5ub3QgaGF2ZSBlbmQgdGFncykuJztcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IgPSAnQ2xvc2luZyB0YWcgJyArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArICcgd2l0aG91dCBhbiBvcGVuIHRhZy4nO1xuICB9IGVsc2UgaWYgKGVsZW1lbnQudGFnICE9PSB0YWcubmFtZSkge1xuICAgIGVycm9yID1cbiAgICAgICdDbG9zaW5nIHRhZyAnICtcbiAgICAgIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArXG4gICAgICAnIGRpZCBub3QgbWF0Y2ggbGFzdCBvcGVuIHRhZyBgJyArXG4gICAgICBlbGVtZW50LnRhZyArXG4gICAgICAnYCAob24gbGluZSAnICtcbiAgICAgIGVsZW1lbnQubG9jLnN0YXJ0LmxpbmUgK1xuICAgICAgJykuJztcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihlcnJvciwgZWxlbWVudC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVuZFRhZ0luZm8odGFnOiBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPikge1xuICByZXR1cm4gJ2AnICsgdGFnLm5hbWUgKyAnYCAob24gbGluZSAnICsgdGFnLmxvYy5lbmQubGluZSArICcpJztcbn1cblxuLyoqXG4gIEFTVFBsdWdpbnMgY2FuIG1ha2UgY2hhbmdlcyB0byB0aGUgR2xpbW1lciB0ZW1wbGF0ZSBBU1QgYmVmb3JlXG4gIGNvbXBpbGF0aW9uIGJlZ2lucy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkJ1aWxkZXIge1xuICAoZW52OiBBU1RQbHVnaW5FbnZpcm9ubWVudCk6IEFTVFBsdWdpbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW4ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZpc2l0b3I6IE5vZGVWaXNpdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkVudmlyb25tZW50IHtcbiAgbWV0YT86IG9iamVjdDtcbiAgc3ludGF4OiBTeW50YXg7XG59XG5pbnRlcmZhY2UgSGFuZGxlYmFyc1BhcnNlT3B0aW9ucyB7XG4gIHNyY05hbWU/OiBzdHJpbmc7XG4gIGlnbm9yZVN0YW5kYWxvbmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXByb2Nlc3NPcHRpb25zIHtcbiAgbWV0YT86IHVua25vd247XG4gIHBsdWdpbnM/OiB7XG4gICAgYXN0PzogQVNUUGx1Z2luQnVpbGRlcltdO1xuICB9O1xuICBwYXJzZU9wdGlvbnM/OiBIYW5kbGViYXJzUGFyc2VPcHRpb25zO1xuXG4gIC8qKlxuICAgIFVzZWZ1bCBmb3Igc3BlY2lmeWluZyBhIGdyb3VwIG9mIG9wdGlvbnMgdG9nZXRoZXIuXG5cbiAgICBXaGVuIGAnY29kZW1vZCdgIHdlIGRpc2FibGUgYWxsIHdoaXRlc3BhY2UgY29udHJvbCBpbiBoYW5kbGViYXJzXG4gICAgKHRvIHByZXNlcnZlIGFzIG11Y2ggYXMgcG9zc2libGUpIGFuZCB3ZSBhbHNvIGF2b2lkIGFueVxuICAgIGVzY2FwaW5nL3VuZXNjYXBpbmcgb2YgSFRNTCBlbnRpdHkgY29kZXMuXG4gICAqL1xuICBtb2RlPzogJ2NvZGVtb2QnIHwgJ3ByZWNvbXBpbGUnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5bnRheCB7XG4gIHBhcnNlOiB0eXBlb2YgcHJlcHJvY2VzcztcbiAgYnVpbGRlcnM6IHR5cGVvZiBidWlsZGVycztcbiAgcHJpbnQ6IHR5cGVvZiBwcmludDtcbiAgdHJhdmVyc2U6IHR5cGVvZiB0cmF2ZXJzZTtcbiAgV2Fsa2VyOiB0eXBlb2YgV2Fsa2VyO1xufVxuXG5jb25zdCBzeW50YXg6IFN5bnRheCA9IHtcbiAgcGFyc2U6IHByZXByb2Nlc3MsXG4gIGJ1aWxkZXJzLFxuICBwcmludCxcbiAgdHJhdmVyc2UsXG4gIFdhbGtlcixcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwcm9jZXNzKGh0bWw6IHN0cmluZywgb3B0aW9uczogUHJlcHJvY2Vzc09wdGlvbnMgPSB7fSk6IEFTVC5UZW1wbGF0ZSB7XG4gIGxldCBtb2RlID0gb3B0aW9ucy5tb2RlIHx8ICdwcmVjb21waWxlJztcblxuICBsZXQgYXN0OiBIQlMuUHJvZ3JhbTtcbiAgaWYgKHR5cGVvZiBodG1sID09PSAnb2JqZWN0Jykge1xuICAgIGFzdCA9IGh0bWw7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHBhcnNlT3B0aW9ucyA9IG9wdGlvbnMucGFyc2VPcHRpb25zIHx8IHt9O1xuXG4gICAgaWYgKG1vZGUgPT09ICdjb2RlbW9kJykge1xuICAgICAgcGFyc2VPcHRpb25zLmlnbm9yZVN0YW5kYWxvbmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGFzdCA9IGhhbmRsZWJhcnMucGFyc2UoaHRtbCwgcGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgfVxuXG4gIGxldCBlbnRpdHlQYXJzZXIgPSB1bmRlZmluZWQ7XG4gIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICBlbnRpdHlQYXJzZXIgPSBuZXcgRW50aXR5UGFyc2VyKHt9KTtcbiAgfVxuXG4gIGxldCBwcm9ncmFtID0gbmV3IFRva2VuaXplckV2ZW50SGFuZGxlcnMoaHRtbCwgZW50aXR5UGFyc2VyKS5hY2NlcHRUZW1wbGF0ZShhc3QpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucGx1Z2lucyAmJiBvcHRpb25zLnBsdWdpbnMuYXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBvcHRpb25zLnBsdWdpbnMuYXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IG9wdGlvbnMucGx1Z2lucy5hc3RbaV07XG4gICAgICBsZXQgZW52ID0gYXNzaWduKHt9LCBvcHRpb25zLCB7IHN5bnRheCB9LCB7IHBsdWdpbnM6IHVuZGVmaW5lZCB9KTtcblxuICAgICAgbGV0IHBsdWdpblJlc3VsdCA9IHRyYW5zZm9ybShlbnYpO1xuXG4gICAgICB0cmF2ZXJzZShwcm9ncmFtLCBwbHVnaW5SZXN1bHQudmlzaXRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2dyYW07XG59XG4iXSwic291cmNlUm9vdCI6IiJ9