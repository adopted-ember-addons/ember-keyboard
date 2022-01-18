"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.preprocess = preprocess;
exports.TokenizerEventHandlers = exports.voidMap = void 0;

var _builders = _interopRequireWildcard(require("../builders"));

var _utils = require("../utils");

var _handlebarsNodeVisitors = require("./handlebars-node-visitors");

var _syntaxError = _interopRequireDefault(require("../errors/syntax-error"));

var _traverse = _interopRequireDefault(require("../traversal/traverse"));

var _print = _interopRequireDefault(require("../generation/print"));

var _walker = _interopRequireDefault(require("../traversal/walker"));

var _parser = require("@handlebars/parser");

var _util = require("@glimmer/util");

var _simpleHtmlTokenizer = require("simple-html-tokenizer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var voidMap = Object.create(null);
exports.voidMap = voidMap;
var voidTagNames = 'area base br col command embed hr img input keygen link meta param source track wbr';
voidTagNames.split(' ').forEach(function (tagName) {
  voidMap[tagName] = true;
});

var TokenizerEventHandlers = /*#__PURE__*/function (_HandlebarsNodeVisito) {
  _inheritsLoose(TokenizerEventHandlers, _HandlebarsNodeVisito);

  function TokenizerEventHandlers() {
    var _this;

    _this = _HandlebarsNodeVisito.apply(this, arguments) || this;
    _this.tagOpenLine = 0;
    _this.tagOpenColumn = 0;
    return _this;
  }

  var _proto = TokenizerEventHandlers.prototype;

  _proto.reset = function reset() {
    this.currentNode = null;
  } // Comment
  ;

  _proto.beginComment = function beginComment() {
    this.currentNode = _builders.default.comment('');
    this.currentNode.loc = {
      source: null,
      start: _builders.default.pos(this.tagOpenLine, this.tagOpenColumn),
      end: null
    };
  };

  _proto.appendToCommentData = function appendToCommentData(_char) {
    this.currentComment.value += _char;
  };

  _proto.finishComment = function finishComment() {
    this.currentComment.loc.end = _builders.default.pos(this.tokenizer.line, this.tokenizer.column);
    (0, _utils.appendChild)(this.currentElement(), this.currentComment);
  } // Data
  ;

  _proto.beginData = function beginData() {
    this.currentNode = _builders.default.text();
    this.currentNode.loc = {
      source: null,
      start: _builders.default.pos(this.tokenizer.line, this.tokenizer.column),
      end: null
    };
  };

  _proto.appendToData = function appendToData(_char2) {
    this.currentData.chars += _char2;
  };

  _proto.finishData = function finishData() {
    this.currentData.loc.end = _builders.default.pos(this.tokenizer.line, this.tokenizer.column);
    (0, _utils.appendChild)(this.currentElement(), this.currentData);
  } // Tags - basic
  ;

  _proto.tagOpen = function tagOpen() {
    this.tagOpenLine = this.tokenizer.line;
    this.tagOpenColumn = this.tokenizer.column;
  };

  _proto.beginStartTag = function beginStartTag() {
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

  _proto.beginEndTag = function beginEndTag() {
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

  _proto.finishTag = function finishTag() {
    var _this$tokenizer = this.tokenizer,
        line = _this$tokenizer.line,
        column = _this$tokenizer.column;
    var tag = this.currentTag;
    tag.loc = _builders.default.loc(this.tagOpenLine, this.tagOpenColumn, line, column);

    if (tag.type === 'StartTag') {
      this.finishStartTag();

      if (voidMap[tag.name] || tag.selfClosing) {
        this.finishEndTag(true);
      }
    } else if (tag.type === 'EndTag') {
      this.finishEndTag(false);
    }
  };

  _proto.finishStartTag = function finishStartTag() {
    var _this$currentStartTag = this.currentStartTag,
        name = _this$currentStartTag.name,
        attrs = _this$currentStartTag.attributes,
        modifiers = _this$currentStartTag.modifiers,
        comments = _this$currentStartTag.comments,
        selfClosing = _this$currentStartTag.selfClosing;

    var loc = _builders.default.loc(this.tagOpenLine, this.tagOpenColumn);

    var element = _builders.default.element({
      name: name,
      selfClosing: selfClosing
    }, {
      attrs: attrs,
      modifiers: modifiers,
      comments: comments,
      loc: loc
    });

    this.elementStack.push(element);
  };

  _proto.finishEndTag = function finishEndTag(isVoid) {
    var tag = this.currentTag;
    var element = this.elementStack.pop();
    var parent = this.currentElement();
    validateEndTag(tag, element, isVoid);
    element.loc.end.line = this.tokenizer.line;
    element.loc.end.column = this.tokenizer.column;
    (0, _utils.parseElementBlockParams)(element);
    (0, _utils.appendChild)(parent, element);
  };

  _proto.markTagAsSelfClosing = function markTagAsSelfClosing() {
    this.currentTag.selfClosing = true;
  } // Tags - name
  ;

  _proto.appendToTagName = function appendToTagName(_char3) {
    this.currentTag.name += _char3;
  } // Tags - attributes
  ;

  _proto.beginAttribute = function beginAttribute() {
    var tag = this.currentTag;

    if (tag.type === 'EndTag') {
      throw new _syntaxError.default("Invalid end tag: closing tag must not have attributes, " + ("in `" + tag.name + "` (on line " + this.tokenizer.line + ")."), tag.loc);
    }

    this.currentAttribute = {
      name: '',
      parts: [],
      isQuoted: false,
      isDynamic: false,
      start: _builders.default.pos(this.tokenizer.line, this.tokenizer.column),
      valueStartLine: 0,
      valueStartColumn: 0
    };
  };

  _proto.appendToAttributeName = function appendToAttributeName(_char4) {
    this.currentAttr.name += _char4;
  };

  _proto.beginAttributeValue = function beginAttributeValue(isQuoted) {
    this.currentAttr.isQuoted = isQuoted;
    this.currentAttr.valueStartLine = this.tokenizer.line;
    this.currentAttr.valueStartColumn = this.tokenizer.column;
  };

  _proto.appendToAttributeValue = function appendToAttributeValue(_char5) {
    var parts = this.currentAttr.parts;
    var lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.type === 'TextNode') {
      lastPart.chars += _char5; // update end location for each added char

      lastPart.loc.end.line = this.tokenizer.line;
      lastPart.loc.end.column = this.tokenizer.column;
    } else {
      // initially assume the text node is a single char
      var loc = _builders.default.loc(this.tokenizer.line, this.tokenizer.column, this.tokenizer.line, this.tokenizer.column); // the tokenizer line/column have already been advanced, correct location info


      if (_char5 === '\n') {
        loc.start.line -= 1;
        loc.start.column = lastPart ? lastPart.loc.end.column : this.currentAttr.valueStartColumn;
      } else {
        loc.start.column -= 1;
      }

      var text = _builders.default.text(_char5, loc);

      parts.push(text);
    }
  };

  _proto.finishAttributeValue = function finishAttributeValue() {
    var _this$currentAttr = this.currentAttr,
        name = _this$currentAttr.name,
        parts = _this$currentAttr.parts,
        isQuoted = _this$currentAttr.isQuoted,
        isDynamic = _this$currentAttr.isDynamic,
        valueStartLine = _this$currentAttr.valueStartLine,
        valueStartColumn = _this$currentAttr.valueStartColumn;
    var value = assembleAttributeValue(parts, isQuoted, isDynamic, this.tokenizer.line);
    value.loc = _builders.default.loc(valueStartLine, valueStartColumn, this.tokenizer.line, this.tokenizer.column);

    var loc = _builders.default.loc(this.currentAttr.start.line, this.currentAttr.start.column, this.tokenizer.line, this.tokenizer.column);

    var attribute = _builders.default.attr(name, value, loc);

    this.currentStartTag.attributes.push(attribute);
  };

  _proto.reportSyntaxError = function reportSyntaxError(message) {
    throw new _syntaxError.default("Syntax error at line " + this.tokenizer.line + " col " + this.tokenizer.column + ": " + message, _builders.default.loc(this.tokenizer.line, this.tokenizer.column));
  };

  return TokenizerEventHandlers;
}(_handlebarsNodeVisitors.HandlebarsNodeVisitors);

exports.TokenizerEventHandlers = TokenizerEventHandlers;

function assembleAttributeValue(parts, isQuoted, isDynamic, line) {
  if (isDynamic) {
    if (isQuoted) {
      return assembleConcatenatedValue(parts);
    } else {
      if (parts.length === 1 || parts.length === 2 && parts[1].type === 'TextNode' && parts[1].chars === '/') {
        return parts[0];
      } else {
        throw new _syntaxError.default("An unquoted attribute value must be a string or a mustache, " + "preceeded by whitespace or a '=' character, and " + ("followed by whitespace, a '>' character, or '/>' (on line " + line + ")"), _builders.default.loc(line, 0));
      }
    }
  } else {
    return parts.length > 0 ? parts[0] : _builders.default.text('');
  }
}

function assembleConcatenatedValue(parts) {
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
      throw new _syntaxError.default('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
    }
  }

  return _builders.default.concat(parts);
}

function validateEndTag(tag, element, selfClosing) {
  var error;

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
    throw new _syntaxError.default(error, element.loc);
  }
}

function formatEndTagInfo(tag) {
  return '`' + tag.name + '` (on line ' + tag.loc.end.line + ')';
}

var syntax = {
  parse: preprocess,
  builders: _builders.default,
  print: _print.default,
  traverse: _traverse.default,
  Walker: _walker.default
};

function preprocess(html, options) {
  if (options === void 0) {
    options = {};
  }

  var mode = options.mode || 'precompile';
  var ast;

  if (typeof html === 'object') {
    ast = html;
  } else if (mode === 'codemod') {
    ast = (0, _parser.parseWithoutProcessing)(html, options.parseOptions);
  } else {
    ast = (0, _parser.parse)(html, options.parseOptions);
  }

  var entityParser = undefined;

  if (mode === 'codemod') {
    entityParser = new _simpleHtmlTokenizer.EntityParser({});
  }

  var program = new TokenizerEventHandlers(html, entityParser, mode).acceptTemplate(ast);

  if (options && options.plugins && options.plugins.ast) {
    for (var i = 0, l = options.plugins.ast.length; i < l; i++) {
      var transform = options.plugins.ast[i];
      var env = (0, _util.assign)({}, options, {
        syntax: syntax
      }, {
        plugins: undefined
      });
      var pluginResult = transform(env);
      (0, _traverse.default)(program, pluginResult.visitor);
    }
  }

  return program;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUdBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7OztBQUVPLElBQU0sT0FBTyxHQUVoQixNQUFNLENBQU4sTUFBQSxDQUZHLElBRUgsQ0FGRzs7QUFJUCxJQUFJLFlBQVksR0FBaEIscUZBQUE7QUFFQSxZQUFZLENBQVosS0FBQSxDQUFBLEdBQUEsRUFBQSxPQUFBLENBQWlDLFVBQUQsT0FBQyxFQUFXO0FBQzFDLEVBQUEsT0FBTyxDQUFQLE9BQU8sQ0FBUCxHQUFBLElBQUE7QUFERixDQUFBOztBQUlBLElBQU0sc0JBQU4sR0FBQSxhQUFBLFVBQUEscUJBQUEsRUFBQTtBQUFBLEVBQUEsY0FBQSxDQUFBLHNCQUFBLEVBQUEscUJBQUEsQ0FBQTs7QUFBQSxXQUFBLHNCQUFBLEdBQUE7QUFBQSxRQUFBLEtBQUE7OztBQUNVLElBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxDQUFBO0FBQ0EsSUFBQSxLQUFBLENBQUEsYUFBQSxHQUFBLENBQUE7QUFGVixXQUFBLEtBQUE7QUEwTkM7O0FBMU5ELE1BQUEsTUFBQSxHQUFBLHNCQUFBLENBQUEsU0FBQTs7QUFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLEdBSUUsU0FBQSxLQUFBLEdBQUs7QUFDSCxTQUFBLFdBQUEsR0FBQSxJQUFBO0FBTEosR0FBQSxDQVFFO0FBUkY7O0FBQUEsRUFBQSxNQUFBLENBQUEsWUFBQSxHQVVFLFNBQUEsWUFBQSxHQUFZO0FBQ1YsU0FBQSxXQUFBLEdBQW1CLGtCQUFBLE9BQUEsQ0FBbkIsRUFBbUIsQ0FBbkI7QUFDQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEdBQXVCO0FBQ3JCLE1BQUEsTUFBTSxFQURlLElBQUE7QUFF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SSxDQUFDLEdBQUwsQ0FBQSxFQUFXLENBQUMsR0FBRyxPQUFPLENBQVAsT0FBQSxDQUFBLEdBQUEsQ0FBcEIsTUFBQSxFQUFnRCxDQUFDLEdBQWpELENBQUEsRUFBdUQsQ0FBdkQsRUFBQSxFQUE0RDtBQUMxRCxVQUFJLFNBQVMsR0FBRyxPQUFPLENBQVAsT0FBQSxDQUFBLEdBQUEsQ0FBaEIsQ0FBZ0IsQ0FBaEI7QUFDQSxVQUFJLEdBQUcsR0FBeUIsa0JBQU0sRUFBTixFQUFNLE9BQU4sRUFBb0I7QUFBRSxRQUFBLE1BQUEsRUFBQTtBQUFGLE9BQXBCLEVBQWdDO0FBQUUsUUFBQSxPQUFPLEVBQUU7QUFBWCxPQUFoQyxDQUFoQztBQUVBLFVBQUksWUFBWSxHQUFHLFNBQVMsQ0FBNUIsR0FBNEIsQ0FBNUI7QUFFQSw2QkFBUSxPQUFSLEVBQWtCLFlBQVksQ0FBOUIsT0FBQTtBQUNEO0FBQ0Y7O0FBRUQsU0FBQSxPQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYiwgeyBTWU5USEVUSUMgfSBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgcGFyc2VFbGVtZW50QmxvY2tQYXJhbXMgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIH0gZnJvbSAnLi9oYW5kbGViYXJzLW5vZGUtdmlzaXRvcnMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCAqIGFzIEhCUyBmcm9tICcuLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgU3ludGF4RXJyb3IgZnJvbSAnLi4vZXJyb3JzL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBUYWcgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IGJ1aWxkZXJzIGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB0cmF2ZXJzZSBmcm9tICcuLi90cmF2ZXJzYWwvdHJhdmVyc2UnO1xuaW1wb3J0IHByaW50IGZyb20gJy4uL2dlbmVyYXRpb24vcHJpbnQnO1xuaW1wb3J0IFdhbGtlciBmcm9tICcuLi90cmF2ZXJzYWwvd2Fsa2VyJztcbmltcG9ydCB7IHBhcnNlLCBwYXJzZVdpdGhvdXRQcm9jZXNzaW5nIH0gZnJvbSAnQGhhbmRsZWJhcnMvcGFyc2VyJztcbmltcG9ydCB7IGFzc2lnbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgTm9kZVZpc2l0b3IgfSBmcm9tICcuLi90cmF2ZXJzYWwvdmlzaXRvcic7XG5pbXBvcnQgeyBFbnRpdHlQYXJzZXIgfSBmcm9tICdzaW1wbGUtaHRtbC10b2tlbml6ZXInO1xuXG5leHBvcnQgY29uc3Qgdm9pZE1hcDoge1xuICBbdGFnTmFtZTogc3RyaW5nXTogYm9vbGVhbjtcbn0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5sZXQgdm9pZFRhZ05hbWVzID1cbiAgJ2FyZWEgYmFzZSBiciBjb2wgY29tbWFuZCBlbWJlZCBociBpbWcgaW5wdXQga2V5Z2VuIGxpbmsgbWV0YSBwYXJhbSBzb3VyY2UgdHJhY2sgd2JyJztcbnZvaWRUYWdOYW1lcy5zcGxpdCgnICcpLmZvckVhY2goKHRhZ05hbWUpID0+IHtcbiAgdm9pZE1hcFt0YWdOYW1lXSA9IHRydWU7XG59KTtcblxuZXhwb3J0IGNsYXNzIFRva2VuaXplckV2ZW50SGFuZGxlcnMgZXh0ZW5kcyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIHtcbiAgcHJpdmF0ZSB0YWdPcGVuTGluZSA9IDA7XG4gIHByaXZhdGUgdGFnT3BlbkNvbHVtbiA9IDA7XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IG51bGw7XG4gIH1cblxuICAvLyBDb21tZW50XG5cbiAgYmVnaW5Db21tZW50KCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLmNvbW1lbnQoJycpO1xuICAgIHRoaXMuY3VycmVudE5vZGUubG9jID0ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudGFnT3BlbkxpbmUsIHRoaXMudGFnT3BlbkNvbHVtbiksXG4gICAgICBlbmQ6IChudWxsIGFzIGFueSkgYXMgQVNULlBvc2l0aW9uLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0NvbW1lbnREYXRhKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudENvbW1lbnQudmFsdWUgKz0gY2hhcjtcbiAgfVxuXG4gIGZpbmlzaENvbW1lbnQoKSB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC5sb2MuZW5kID0gYi5wb3ModGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgdGhpcy5jdXJyZW50Q29tbWVudCk7XG4gIH1cblxuICAvLyBEYXRhXG5cbiAgYmVnaW5EYXRhKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLnRleHQoKTtcbiAgICB0aGlzLmN1cnJlbnROb2RlLmxvYyA9IHtcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIHN0YXJ0OiBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pLFxuICAgICAgZW5kOiAobnVsbCBhcyBhbnkpIGFzIEFTVC5Qb3NpdGlvbixcbiAgICB9O1xuICB9XG5cbiAgYXBwZW5kVG9EYXRhKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudERhdGEuY2hhcnMgKz0gY2hhcjtcbiAgfVxuXG4gIGZpbmlzaERhdGEoKSB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5sb2MuZW5kID0gYi5wb3ModGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgdGhpcy5jdXJyZW50RGF0YSk7XG4gIH1cblxuICAvLyBUYWdzIC0gYmFzaWNcblxuICB0YWdPcGVuKCkge1xuICAgIHRoaXMudGFnT3BlbkxpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIHRoaXMudGFnT3BlbkNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgfVxuXG4gIGJlZ2luU3RhcnRUYWcoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IHtcbiAgICAgIHR5cGU6ICdTdGFydFRhZycsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgbW9kaWZpZXJzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIHNlbGZDbG9zaW5nOiBmYWxzZSxcbiAgICAgIGxvYzogU1lOVEhFVElDLFxuICAgIH07XG4gIH1cblxuICBiZWdpbkVuZFRhZygpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ0VuZFRhZycsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgbW9kaWZpZXJzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIHNlbGZDbG9zaW5nOiBmYWxzZSxcbiAgICAgIGxvYzogU1lOVEhFVElDLFxuICAgIH07XG4gIH1cblxuICBmaW5pc2hUYWcoKSB7XG4gICAgbGV0IHsgbGluZSwgY29sdW1uIH0gPSB0aGlzLnRva2VuaXplcjtcblxuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG4gICAgdGFnLmxvYyA9IGIubG9jKHRoaXMudGFnT3BlbkxpbmUsIHRoaXMudGFnT3BlbkNvbHVtbiwgbGluZSwgY29sdW1uKTtcblxuICAgIGlmICh0YWcudHlwZSA9PT0gJ1N0YXJ0VGFnJykge1xuICAgICAgdGhpcy5maW5pc2hTdGFydFRhZygpO1xuXG4gICAgICBpZiAodm9pZE1hcFt0YWcubmFtZV0gfHwgdGFnLnNlbGZDbG9zaW5nKSB7XG4gICAgICAgIHRoaXMuZmluaXNoRW5kVGFnKHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaEVuZFRhZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoU3RhcnRUYWcoKSB7XG4gICAgbGV0IHsgbmFtZSwgYXR0cmlidXRlczogYXR0cnMsIG1vZGlmaWVycywgY29tbWVudHMsIHNlbGZDbG9zaW5nIH0gPSB0aGlzLmN1cnJlbnRTdGFydFRhZztcbiAgICBsZXQgbG9jID0gYi5sb2ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uKTtcbiAgICBsZXQgZWxlbWVudCA9IGIuZWxlbWVudCh7IG5hbWUsIHNlbGZDbG9zaW5nIH0sIHsgYXR0cnMsIG1vZGlmaWVycywgY29tbWVudHMsIGxvYyB9KTtcbiAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKGVsZW1lbnQpO1xuICB9XG5cbiAgZmluaXNoRW5kVGFnKGlzVm9pZDogYm9vbGVhbikge1xuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpIGFzIEFTVC5FbGVtZW50Tm9kZTtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgdmFsaWRhdGVFbmRUYWcodGFnLCBlbGVtZW50LCBpc1ZvaWQpO1xuXG4gICAgZWxlbWVudC5sb2MuZW5kLmxpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIGVsZW1lbnQubG9jLmVuZC5jb2x1bW4gPSB0aGlzLnRva2VuaXplci5jb2x1bW47XG5cbiAgICBwYXJzZUVsZW1lbnRCbG9ja1BhcmFtcyhlbGVtZW50KTtcbiAgICBhcHBlbmRDaGlsZChwYXJlbnQsIGVsZW1lbnQpO1xuICB9XG5cbiAgbWFya1RhZ0FzU2VsZkNsb3NpbmcoKSB7XG4gICAgdGhpcy5jdXJyZW50VGFnLnNlbGZDbG9zaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBuYW1lXG5cbiAgYXBwZW5kVG9UYWdOYW1lKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudFRhZy5uYW1lICs9IGNoYXI7XG4gIH1cblxuICAvLyBUYWdzIC0gYXR0cmlidXRlc1xuXG4gIGJlZ2luQXR0cmlidXRlKCkge1xuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG4gICAgaWYgKHRhZy50eXBlID09PSAnRW5kVGFnJykge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgSW52YWxpZCBlbmQgdGFnOiBjbG9zaW5nIHRhZyBtdXN0IG5vdCBoYXZlIGF0dHJpYnV0ZXMsIGAgK1xuICAgICAgICAgIGBpbiBcXGAke3RhZy5uYW1lfVxcYCAob24gbGluZSAke3RoaXMudG9rZW5pemVyLmxpbmV9KS5gLFxuICAgICAgICB0YWcubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudEF0dHJpYnV0ZSA9IHtcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgcGFydHM6IFtdLFxuICAgICAgaXNRdW90ZWQ6IGZhbHNlLFxuICAgICAgaXNEeW5hbWljOiBmYWxzZSxcbiAgICAgIHN0YXJ0OiBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pLFxuICAgICAgdmFsdWVTdGFydExpbmU6IDAsXG4gICAgICB2YWx1ZVN0YXJ0Q29sdW1uOiAwLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0F0dHJpYnV0ZU5hbWUoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50QXR0ci5uYW1lICs9IGNoYXI7XG4gIH1cblxuICBiZWdpbkF0dHJpYnV0ZVZhbHVlKGlzUXVvdGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5jdXJyZW50QXR0ci5pc1F1b3RlZCA9IGlzUXVvdGVkO1xuICAgIHRoaXMuY3VycmVudEF0dHIudmFsdWVTdGFydExpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIHRoaXMuY3VycmVudEF0dHIudmFsdWVTdGFydENvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgfVxuXG4gIGFwcGVuZFRvQXR0cmlidXRlVmFsdWUoY2hhcjogc3RyaW5nKSB7XG4gICAgbGV0IHBhcnRzID0gdGhpcy5jdXJyZW50QXR0ci5wYXJ0cztcbiAgICBsZXQgbGFzdFBhcnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcblxuICAgIGlmIChsYXN0UGFydCAmJiBsYXN0UGFydC50eXBlID09PSAnVGV4dE5vZGUnKSB7XG4gICAgICBsYXN0UGFydC5jaGFycyArPSBjaGFyO1xuXG4gICAgICAvLyB1cGRhdGUgZW5kIGxvY2F0aW9uIGZvciBlYWNoIGFkZGVkIGNoYXJcbiAgICAgIGxhc3RQYXJ0LmxvYy5lbmQubGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgICBsYXN0UGFydC5sb2MuZW5kLmNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaW5pdGlhbGx5IGFzc3VtZSB0aGUgdGV4dCBub2RlIGlzIGEgc2luZ2xlIGNoYXJcbiAgICAgIGxldCBsb2MgPSBiLmxvYyhcbiAgICAgICAgdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgICAgdGhpcy50b2tlbml6ZXIuY29sdW1uLFxuICAgICAgICB0aGlzLnRva2VuaXplci5saW5lLFxuICAgICAgICB0aGlzLnRva2VuaXplci5jb2x1bW5cbiAgICAgICk7XG5cbiAgICAgIC8vIHRoZSB0b2tlbml6ZXIgbGluZS9jb2x1bW4gaGF2ZSBhbHJlYWR5IGJlZW4gYWR2YW5jZWQsIGNvcnJlY3QgbG9jYXRpb24gaW5mb1xuICAgICAgaWYgKGNoYXIgPT09ICdcXG4nKSB7XG4gICAgICAgIGxvYy5zdGFydC5saW5lIC09IDE7XG4gICAgICAgIGxvYy5zdGFydC5jb2x1bW4gPSBsYXN0UGFydCA/IGxhc3RQYXJ0LmxvYy5lbmQuY29sdW1uIDogdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0Q29sdW1uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jLnN0YXJ0LmNvbHVtbiAtPSAxO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGV4dCA9IGIudGV4dChjaGFyLCBsb2MpO1xuICAgICAgcGFydHMucHVzaCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpIHtcbiAgICBsZXQgeyBuYW1lLCBwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgdmFsdWVTdGFydExpbmUsIHZhbHVlU3RhcnRDb2x1bW4gfSA9IHRoaXMuY3VycmVudEF0dHI7XG4gICAgbGV0IHZhbHVlID0gYXNzZW1ibGVBdHRyaWJ1dGVWYWx1ZShwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgdGhpcy50b2tlbml6ZXIubGluZSk7XG4gICAgdmFsdWUubG9jID0gYi5sb2ModmFsdWVTdGFydExpbmUsIHZhbHVlU3RhcnRDb2x1bW4sIHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbik7XG5cbiAgICBsZXQgbG9jID0gYi5sb2MoXG4gICAgICB0aGlzLmN1cnJlbnRBdHRyLnN0YXJ0LmxpbmUsXG4gICAgICB0aGlzLmN1cnJlbnRBdHRyLnN0YXJ0LmNvbHVtbixcbiAgICAgIHRoaXMudG9rZW5pemVyLmxpbmUsXG4gICAgICB0aGlzLnRva2VuaXplci5jb2x1bW5cbiAgICApO1xuXG4gICAgbGV0IGF0dHJpYnV0ZSA9IGIuYXR0cihuYW1lLCB2YWx1ZSwgbG9jKTtcblxuICAgIHRoaXMuY3VycmVudFN0YXJ0VGFnLmF0dHJpYnV0ZXMucHVzaChhdHRyaWJ1dGUpO1xuICB9XG5cbiAgcmVwb3J0U3ludGF4RXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYFN5bnRheCBlcnJvciBhdCBsaW5lICR7dGhpcy50b2tlbml6ZXIubGluZX0gY29sICR7dGhpcy50b2tlbml6ZXIuY29sdW1ufTogJHttZXNzYWdlfWAsXG4gICAgICBiLmxvYyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKFxuICBwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXSxcbiAgaXNRdW90ZWQ6IGJvb2xlYW4sXG4gIGlzRHluYW1pYzogYm9vbGVhbixcbiAgbGluZTogbnVtYmVyXG4pIHtcbiAgaWYgKGlzRHluYW1pYykge1xuICAgIGlmIChpc1F1b3RlZCkge1xuICAgICAgcmV0dXJuIGFzc2VtYmxlQ29uY2F0ZW5hdGVkVmFsdWUocGFydHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgIHBhcnRzLmxlbmd0aCA9PT0gMSB8fFxuICAgICAgICAocGFydHMubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgcGFydHNbMV0udHlwZSA9PT0gJ1RleHROb2RlJyAmJlxuICAgICAgICAgIChwYXJ0c1sxXSBhcyBBU1QuVGV4dE5vZGUpLmNoYXJzID09PSAnLycpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBBbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIG11c3RhY2hlLCBgICtcbiAgICAgICAgICAgIGBwcmVjZWVkZWQgYnkgd2hpdGVzcGFjZSBvciBhICc9JyBjaGFyYWN0ZXIsIGFuZCBgICtcbiAgICAgICAgICAgIGBmb2xsb3dlZCBieSB3aGl0ZXNwYWNlLCBhICc+JyBjaGFyYWN0ZXIsIG9yICcvPicgKG9uIGxpbmUgJHtsaW5lfSlgLFxuICAgICAgICAgIGIubG9jKGxpbmUsIDApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXJ0cy5sZW5ndGggPiAwID8gcGFydHNbMF0gOiBiLnRleHQoJycpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlQ29uY2F0ZW5hdGVkVmFsdWUocGFydHM6IChBU1QuTXVzdGFjaGVTdGF0ZW1lbnQgfCBBU1QuVGV4dE5vZGUpW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBwYXJ0OiBBU1QuQmFzZU5vZGUgPSBwYXJ0c1tpXTtcblxuICAgIGlmIChwYXJ0LnR5cGUgIT09ICdNdXN0YWNoZVN0YXRlbWVudCcgJiYgcGFydC50eXBlICE9PSAnVGV4dE5vZGUnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICdVbnN1cHBvcnRlZCBub2RlIGluIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWU6ICcgKyBwYXJ0Wyd0eXBlJ10sXG4gICAgICAgIHBhcnQubG9jXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiLmNvbmNhdChwYXJ0cyk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW5kVGFnKFxuICB0YWc6IFRhZzwnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+LFxuICBlbGVtZW50OiBBU1QuRWxlbWVudE5vZGUsXG4gIHNlbGZDbG9zaW5nOiBib29sZWFuXG4pIHtcbiAgbGV0IGVycm9yO1xuXG4gIGlmICh2b2lkTWFwW3RhZy5uYW1lXSAmJiAhc2VsZkNsb3NpbmcpIHtcbiAgICAvLyBFbmdUYWcgaXMgYWxzbyBjYWxsZWQgYnkgU3RhcnRUYWcgZm9yIHZvaWQgYW5kIHNlbGYtY2xvc2luZyB0YWdzIChpLmUuXG4gICAgLy8gPGlucHV0PiBvciA8YnIgLz4sIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIHRoYXQgaGVyZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZFxuICAgIC8vIHRocm93IGFuIGVycm9yIGZvciB0aG9zZSBjYXNlcy5cbiAgICBlcnJvciA9ICdJbnZhbGlkIGVuZCB0YWcgJyArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArICcgKHZvaWQgZWxlbWVudHMgY2Fubm90IGhhdmUgZW5kIHRhZ3MpLic7XG4gIH0gZWxzZSBpZiAoZWxlbWVudC50YWcgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9yID0gJ0Nsb3NpbmcgdGFnICcgKyBmb3JtYXRFbmRUYWdJbmZvKHRhZykgKyAnIHdpdGhvdXQgYW4gb3BlbiB0YWcuJztcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyAhPT0gdGFnLm5hbWUpIHtcbiAgICBlcnJvciA9XG4gICAgICAnQ2xvc2luZyB0YWcgJyArXG4gICAgICBmb3JtYXRFbmRUYWdJbmZvKHRhZykgK1xuICAgICAgJyBkaWQgbm90IG1hdGNoIGxhc3Qgb3BlbiB0YWcgYCcgK1xuICAgICAgZWxlbWVudC50YWcgK1xuICAgICAgJ2AgKG9uIGxpbmUgJyArXG4gICAgICBlbGVtZW50LmxvYy5zdGFydC5saW5lICtcbiAgICAgICcpLic7XG4gIH1cblxuICBpZiAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoZXJyb3IsIGVsZW1lbnQubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRFbmRUYWdJbmZvKHRhZzogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4pIHtcbiAgcmV0dXJuICdgJyArIHRhZy5uYW1lICsgJ2AgKG9uIGxpbmUgJyArIHRhZy5sb2MuZW5kLmxpbmUgKyAnKSc7XG59XG5cbi8qKlxuICBBU1RQbHVnaW5zIGNhbiBtYWtlIGNoYW5nZXMgdG8gdGhlIEdsaW1tZXIgdGVtcGxhdGUgQVNUIGJlZm9yZVxuICBjb21waWxhdGlvbiBiZWdpbnMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW5CdWlsZGVyIHtcbiAgKGVudjogQVNUUGx1Z2luRW52aXJvbm1lbnQpOiBBU1RQbHVnaW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQVNUUGx1Z2luIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2aXNpdG9yOiBOb2RlVmlzaXRvcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW5FbnZpcm9ubWVudCB7XG4gIG1ldGE/OiBvYmplY3Q7XG4gIHN5bnRheDogU3ludGF4O1xufVxuaW50ZXJmYWNlIEhhbmRsZWJhcnNQYXJzZU9wdGlvbnMge1xuICBzcmNOYW1lPzogc3RyaW5nO1xuICBpZ25vcmVTdGFuZGFsb25lPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVwcm9jZXNzT3B0aW9ucyB7XG4gIG1ldGE/OiB7XG4gICAgbW9kdWxlTmFtZT86IHN0cmluZztcbiAgfTtcbiAgcGx1Z2lucz86IHtcbiAgICBhc3Q/OiBBU1RQbHVnaW5CdWlsZGVyW107XG4gIH07XG4gIHBhcnNlT3B0aW9ucz86IEhhbmRsZWJhcnNQYXJzZU9wdGlvbnM7XG5cbiAgLyoqXG4gICAgVXNlZnVsIGZvciBzcGVjaWZ5aW5nIGEgZ3JvdXAgb2Ygb3B0aW9ucyB0b2dldGhlci5cblxuICAgIFdoZW4gYCdjb2RlbW9kJ2Agd2UgZGlzYWJsZSBhbGwgd2hpdGVzcGFjZSBjb250cm9sIGluIGhhbmRsZWJhcnNcbiAgICAodG8gcHJlc2VydmUgYXMgbXVjaCBhcyBwb3NzaWJsZSkgYW5kIHdlIGFsc28gYXZvaWQgYW55XG4gICAgZXNjYXBpbmcvdW5lc2NhcGluZyBvZiBIVE1MIGVudGl0eSBjb2Rlcy5cbiAgICovXG4gIG1vZGU/OiAnY29kZW1vZCcgfCAncHJlY29tcGlsZSc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ludGF4IHtcbiAgcGFyc2U6IHR5cGVvZiBwcmVwcm9jZXNzO1xuICBidWlsZGVyczogdHlwZW9mIGJ1aWxkZXJzO1xuICBwcmludDogdHlwZW9mIHByaW50O1xuICB0cmF2ZXJzZTogdHlwZW9mIHRyYXZlcnNlO1xuICBXYWxrZXI6IHR5cGVvZiBXYWxrZXI7XG59XG5cbmNvbnN0IHN5bnRheDogU3ludGF4ID0ge1xuICBwYXJzZTogcHJlcHJvY2VzcyxcbiAgYnVpbGRlcnMsXG4gIHByaW50LFxuICB0cmF2ZXJzZSxcbiAgV2Fsa2VyLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXByb2Nlc3MoaHRtbDogc3RyaW5nLCBvcHRpb25zOiBQcmVwcm9jZXNzT3B0aW9ucyA9IHt9KTogQVNULlRlbXBsYXRlIHtcbiAgbGV0IG1vZGUgPSBvcHRpb25zLm1vZGUgfHwgJ3ByZWNvbXBpbGUnO1xuXG4gIGxldCBhc3Q6IEhCUy5Qcm9ncmFtO1xuICBpZiAodHlwZW9mIGh0bWwgPT09ICdvYmplY3QnKSB7XG4gICAgYXN0ID0gaHRtbDtcbiAgfSBlbHNlIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICBhc3QgPSBwYXJzZVdpdGhvdXRQcm9jZXNzaW5nKGh0bWwsIG9wdGlvbnMucGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgfSBlbHNlIHtcbiAgICBhc3QgPSBwYXJzZShodG1sLCBvcHRpb25zLnBhcnNlT3B0aW9ucykgYXMgSEJTLlByb2dyYW07XG4gIH1cblxuICBsZXQgZW50aXR5UGFyc2VyID0gdW5kZWZpbmVkO1xuICBpZiAobW9kZSA9PT0gJ2NvZGVtb2QnKSB7XG4gICAgZW50aXR5UGFyc2VyID0gbmV3IEVudGl0eVBhcnNlcih7fSk7XG4gIH1cblxuICBsZXQgcHJvZ3JhbSA9IG5ldyBUb2tlbml6ZXJFdmVudEhhbmRsZXJzKGh0bWwsIGVudGl0eVBhcnNlciwgbW9kZSkuYWNjZXB0VGVtcGxhdGUoYXN0KTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnBsdWdpbnMgJiYgb3B0aW9ucy5wbHVnaW5zLmFzdCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gb3B0aW9ucy5wbHVnaW5zLmFzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSBvcHRpb25zLnBsdWdpbnMuYXN0W2ldO1xuICAgICAgbGV0IGVudjogQVNUUGx1Z2luRW52aXJvbm1lbnQgPSBhc3NpZ24oe30sIG9wdGlvbnMsIHsgc3ludGF4IH0sIHsgcGx1Z2luczogdW5kZWZpbmVkIH0pO1xuXG4gICAgICBsZXQgcGx1Z2luUmVzdWx0ID0gdHJhbnNmb3JtKGVudik7XG5cbiAgICAgIHRyYXZlcnNlKHByb2dyYW0sIHBsdWdpblJlc3VsdC52aXNpdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvZ3JhbTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=