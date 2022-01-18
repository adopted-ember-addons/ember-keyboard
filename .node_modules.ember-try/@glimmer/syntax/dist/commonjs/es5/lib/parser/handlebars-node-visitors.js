"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HandlebarsNodeVisitors = void 0;

var _builders = _interopRequireDefault(require("../builders"));

var _utils = require("../utils");

var _parser = require("../parser");

var _syntaxError = _interopRequireDefault(require("../errors/syntax-error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var HandlebarsNodeVisitors = /*#__PURE__*/function (_Parser) {
  _inheritsLoose(HandlebarsNodeVisitors, _Parser);

  function HandlebarsNodeVisitors() {
    return _Parser.apply(this, arguments) || this;
  }

  var _proto = HandlebarsNodeVisitors.prototype;

  _proto.Program = function Program(program) {
    var body = [];
    var node;

    if (this.isTopLevel) {
      node = _builders.default.template(body, program.blockParams, program.loc);
    } else {
      node = _builders.default.blockItself(body, program.blockParams, program.chained, program.loc);
    }

    var i,
        l = program.body.length;
    this.elementStack.push(node);

    if (l === 0) {
      return this.elementStack.pop();
    }

    for (i = 0; i < l; i++) {
      this.acceptNode(program.body[i]);
    } // Ensure that that the element stack is balanced properly.


    var poppedNode = this.elementStack.pop();

    if (poppedNode !== node) {
      var elementNode = poppedNode;
      throw new _syntaxError.default('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
    }

    return node;
  };

  _proto.BlockStatement = function BlockStatement(block) {
    if (this.tokenizer.state === "comment"
    /* comment */
    ) {
        this.appendToCommentData(this.sourceForNode(block));
        return;
      }

    if (this.tokenizer.state !== "data"
    /* data */
    && this.tokenizer['state'] !== "beforeData"
    /* beforeData */
    ) {
        throw new _syntaxError.default('A block may only be used inside an HTML element or another block.', block.loc);
      }

    var _acceptCallNodes = acceptCallNodes(this, block),
        path = _acceptCallNodes.path,
        params = _acceptCallNodes.params,
        hash = _acceptCallNodes.hash;

    var program = this.Program(block.program);
    var inverse = block.inverse ? this.Program(block.inverse) : null;

    var node = _builders.default.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);

    var parentProgram = this.currentElement();
    (0, _utils.appendChild)(parentProgram, node);
  };

  _proto.MustacheStatement = function MustacheStatement(rawMustache) {
    var tokenizer = this.tokenizer;

    if (tokenizer.state === 'comment') {
      this.appendToCommentData(this.sourceForNode(rawMustache));
      return;
    }

    var mustache;
    var escaped = rawMustache.escaped,
        loc = rawMustache.loc,
        strip = rawMustache.strip;

    if ((0, _utils.isLiteral)(rawMustache.path)) {
      mustache = {
        type: 'MustacheStatement',
        path: this.acceptNode(rawMustache.path),
        params: [],
        hash: _builders.default.hash(),
        escaped: escaped,
        loc: loc,
        strip: strip
      };
    } else {
      var _acceptCallNodes2 = acceptCallNodes(this, rawMustache),
          path = _acceptCallNodes2.path,
          params = _acceptCallNodes2.params,
          hash = _acceptCallNodes2.hash;

      mustache = _builders.default.mustache(path, params, hash, !escaped, loc, strip);
    }

    switch (tokenizer.state) {
      // Tag helpers
      case "tagOpen"
      /* tagOpen */
      :
      case "tagName"
      /* tagName */
      :
        throw new _syntaxError.default("Cannot use mustaches in an elements tagname: `" + this.sourceForNode(rawMustache, rawMustache.path) + "` at L" + loc.start.line + ":C" + loc.start.column, mustache.loc);

      case "beforeAttributeName"
      /* beforeAttributeName */
      :
        addElementModifier(this.currentStartTag, mustache);
        break;

      case "attributeName"
      /* attributeName */
      :
      case "afterAttributeName"
      /* afterAttributeName */
      :
        this.beginAttributeValue(false);
        this.finishAttributeValue();
        addElementModifier(this.currentStartTag, mustache);
        tokenizer.transitionTo("beforeAttributeName"
        /* beforeAttributeName */
        );
        break;

      case "afterAttributeValueQuoted"
      /* afterAttributeValueQuoted */
      :
        addElementModifier(this.currentStartTag, mustache);
        tokenizer.transitionTo("beforeAttributeName"
        /* beforeAttributeName */
        );
        break;
      // Attribute values

      case "beforeAttributeValue"
      /* beforeAttributeValue */
      :
        this.beginAttributeValue(false);
        appendDynamicAttributeValuePart(this.currentAttribute, mustache);
        tokenizer.transitionTo("attributeValueUnquoted"
        /* attributeValueUnquoted */
        );
        break;

      case "attributeValueDoubleQuoted"
      /* attributeValueDoubleQuoted */
      :
      case "attributeValueSingleQuoted"
      /* attributeValueSingleQuoted */
      :
      case "attributeValueUnquoted"
      /* attributeValueUnquoted */
      :
        appendDynamicAttributeValuePart(this.currentAttribute, mustache);
        break;
      // TODO: Only append child when the tokenizer state makes
      // sense to do so, otherwise throw an error.

      default:
        (0, _utils.appendChild)(this.currentElement(), mustache);
    }

    return mustache;
  };

  _proto.ContentStatement = function ContentStatement(content) {
    updateTokenizerLocation(this.tokenizer, content);
    this.tokenizer.tokenizePart(content.value);
    this.tokenizer.flushData();
  };

  _proto.CommentStatement = function CommentStatement(rawComment) {
    var tokenizer = this.tokenizer;

    if (tokenizer.state === "comment"
    /* comment */
    ) {
        this.appendToCommentData(this.sourceForNode(rawComment));
        return null;
      }

    var value = rawComment.value,
        loc = rawComment.loc;

    var comment = _builders.default.mustacheComment(value, loc);

    switch (tokenizer.state) {
      case "beforeAttributeName"
      /* beforeAttributeName */
      :
        this.currentStartTag.comments.push(comment);
        break;

      case "beforeData"
      /* beforeData */
      :
      case "data"
      /* data */
      :
        (0, _utils.appendChild)(this.currentElement(), comment);
        break;

      default:
        throw new _syntaxError.default("Using a Handlebars comment when in the `" + tokenizer['state'] + "` state is not supported: \"" + comment.value + "\" on line " + loc.start.line + ":" + loc.start.column, rawComment.loc);
    }

    return comment;
  };

  _proto.PartialStatement = function PartialStatement(partial) {
    var loc = partial.loc;
    throw new _syntaxError.default("Handlebars partials are not supported: \"" + this.sourceForNode(partial, partial.name) + "\" at L" + loc.start.line + ":C" + loc.start.column, partial.loc);
  };

  _proto.PartialBlockStatement = function PartialBlockStatement(partialBlock) {
    var loc = partialBlock.loc;
    throw new _syntaxError.default("Handlebars partial blocks are not supported: \"" + this.sourceForNode(partialBlock, partialBlock.name) + "\" at L" + loc.start.line + ":C" + loc.start.column, partialBlock.loc);
  };

  _proto.Decorator = function Decorator(decorator) {
    var loc = decorator.loc;
    throw new _syntaxError.default("Handlebars decorators are not supported: \"" + this.sourceForNode(decorator, decorator.path) + "\" at L" + loc.start.line + ":C" + loc.start.column, decorator.loc);
  };

  _proto.DecoratorBlock = function DecoratorBlock(decoratorBlock) {
    var loc = decoratorBlock.loc;
    throw new _syntaxError.default("Handlebars decorator blocks are not supported: \"" + this.sourceForNode(decoratorBlock, decoratorBlock.path) + "\" at L" + loc.start.line + ":C" + loc.start.column, decoratorBlock.loc);
  };

  _proto.SubExpression = function SubExpression(sexpr) {
    var _acceptCallNodes3 = acceptCallNodes(this, sexpr),
        path = _acceptCallNodes3.path,
        params = _acceptCallNodes3.params,
        hash = _acceptCallNodes3.hash;

    return _builders.default.sexpr(path, params, hash, sexpr.loc);
  };

  _proto.PathExpression = function PathExpression(path) {
    var original = path.original,
        loc = path.loc;
    var parts;

    if (original.indexOf('/') !== -1) {
      if (original.slice(0, 2) === './') {
        throw new _syntaxError.default("Using \"./\" is not supported in Glimmer and unnecessary: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      if (original.slice(0, 3) === '../') {
        throw new _syntaxError.default("Changing context using \"../\" is not supported in Glimmer: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      if (original.indexOf('.') !== -1) {
        throw new _syntaxError.default("Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      parts = [path.parts.join('/')];
    } else if (original === '.') {
      var locationInfo = "L" + loc.start.line + ":C" + loc.start.column;
      throw new _syntaxError.default("'.' is not a supported path in Glimmer; check for a path with a trailing '.' at " + locationInfo + ".", path.loc);
    } else {
      parts = path.parts;
    }

    var thisHead = false; // This is to fix a bug in the Handlebars AST where the path expressions in
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
      "this": thisHead,
      parts: parts,
      data: path.data,
      loc: path.loc
    };
  };

  _proto.Hash = function Hash(hash) {
    var pairs = [];

    for (var i = 0; i < hash.pairs.length; i++) {
      var pair = hash.pairs[i];
      pairs.push(_builders.default.pair(pair.key, this.acceptNode(pair.value), pair.loc));
    }

    return _builders.default.hash(pairs, hash.loc);
  };

  _proto.StringLiteral = function StringLiteral(string) {
    return _builders.default.literal('StringLiteral', string.value, string.loc);
  };

  _proto.BooleanLiteral = function BooleanLiteral(_boolean) {
    return _builders.default.literal('BooleanLiteral', _boolean.value, _boolean.loc);
  };

  _proto.NumberLiteral = function NumberLiteral(number) {
    return _builders.default.literal('NumberLiteral', number.value, number.loc);
  };

  _proto.UndefinedLiteral = function UndefinedLiteral(undef) {
    return _builders.default.literal('UndefinedLiteral', undefined, undef.loc);
  };

  _proto.NullLiteral = function NullLiteral(nul) {
    return _builders.default.literal('NullLiteral', null, nul.loc);
  };

  _createClass(HandlebarsNodeVisitors, [{
    key: "isTopLevel",
    get: function get() {
      return this.elementStack.length === 0;
    }
  }]);

  return HandlebarsNodeVisitors;
}(_parser.Parser);

exports.HandlebarsNodeVisitors = HandlebarsNodeVisitors;

function calculateRightStrippedOffsets(original, value) {
  if (value === '') {
    // if it is empty, just return the count of newlines
    // in original
    return {
      lines: original.split('\n').length - 1,
      columns: 0
    };
  } // otherwise, return the number of newlines prior to
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
  var hash = node.hash ? compiler.Hash(node.hash) : _builders.default.hash();
  return {
    path: path,
    params: params,
    hash: hash
  };
}

function addElementModifier(element, mustache) {
  var path = mustache.path,
      params = mustache.params,
      hash = mustache.hash,
      loc = mustache.loc;

  if ((0, _utils.isLiteral)(path)) {
    var _modifier = "{{" + (0, _utils.printLiteral)(path) + "}}";

    var tag = "<" + element.name + " ... " + _modifier + " ...";
    throw new _syntaxError.default("In " + tag + ", " + _modifier + " is not a valid modifier: \"" + path.original + "\" on line " + (loc && loc.start.line) + ".", mustache.loc);
  }

  var modifier = _builders.default.elementModifier(path, params, hash, loc);

  element.modifiers.push(modifier);
}

function appendDynamicAttributeValuePart(attribute, part) {
  attribute.isDynamic = true;
  attribute.parts.push(part);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBR0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBS0EsSUFBTSxzQkFBTixHQUFBLGFBQUEsVUFBQSxPQUFBLEVBQUE7QUFBQSxFQUFBLGNBQUEsQ0FBQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQTs7QUFBQSxXQUFBLHNCQUFBLEdBQUE7QUFBQSxXQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLFNBQUEsS0FBQSxJQUFBO0FBQUE7O0FBQUEsTUFBQSxNQUFBLEdBQUEsc0JBQUEsQ0FBQSxTQUFBOztBQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsR0FZRSxTQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQTRCO0FBQzFCLFFBQUksSUFBSSxHQUFSLEVBQUE7QUFDQSxRQUFBLElBQUE7O0FBRUEsUUFBSSxLQUFKLFVBQUEsRUFBcUI7QUFDbkIsTUFBQSxJQUFJLEdBQUcsa0JBQUEsUUFBQSxDQUFBLElBQUEsRUFBaUIsT0FBTyxDQUF4QixXQUFBLEVBQXNDLE9BQU8sQ0FBcEQsR0FBTyxDQUFQO0FBREYsS0FBQSxNQUVPO0FBQ0wsTUFBQSxJQUFJLEdBQUcsa0JBQUEsV0FBQSxDQUFBLElBQUEsRUFBb0IsT0FBTyxDQUEzQixXQUFBLEVBQXlDLE9BQU8sQ0FBaEQsT0FBQSxFQUEwRCxPQUFPLENBQXhFLEdBQU8sQ0FBUDtBQUNEOztBQUVELFFBQUEsQ0FBQTtBQUFBLFFBQ0UsQ0FBQyxHQUFHLE9BQU8sQ0FBUCxJQUFBLENBRE4sTUFBQTtBQUdBLFNBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBOztBQUVBLFFBQUksQ0FBQyxLQUFMLENBQUEsRUFBYTtBQUNYLGFBQU8sS0FBQSxZQUFBLENBQVAsR0FBTyxFQUFQO0FBQ0Q7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cnMnO1xuaW1wb3J0IHsgYXBwZW5kQ2hpbGQsIGlzTGl0ZXJhbCwgcHJpbnRMaXRlcmFsIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCAqIGFzIEhCUyBmcm9tICcuLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBQYXJzZXIsIFRhZywgQXR0cmlidXRlIH0gZnJvbSAnLi4vcGFyc2VyJztcbmltcG9ydCBTeW50YXhFcnJvciBmcm9tICcuLi9lcnJvcnMvc3ludGF4LWVycm9yJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgUmVjYXN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBUb2tlbml6ZXJTdGF0ZSB9IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIGV4dGVuZHMgUGFyc2VyIHtcbiAgYWJzdHJhY3QgYXBwZW5kVG9Db21tZW50RGF0YShzOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBiZWdpbkF0dHJpYnV0ZVZhbHVlKHF1b3RlZDogYm9vbGVhbik6IHZvaWQ7XG4gIGFic3RyYWN0IGZpbmlzaEF0dHJpYnV0ZVZhbHVlKCk6IHZvaWQ7XG5cbiAgcHJpdmF0ZSBnZXQgaXNUb3BMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZTtcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZSB8IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jayB8IEFTVC5UZW1wbGF0ZSB7XG4gICAgbGV0IGJvZHk6IEFTVC5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGxldCBub2RlO1xuXG4gICAgaWYgKHRoaXMuaXNUb3BMZXZlbCkge1xuICAgICAgbm9kZSA9IGIudGVtcGxhdGUoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5sb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gYi5ibG9ja0l0c2VsZihib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmNoYWluZWQsIHByb2dyYW0ubG9jKTtcbiAgICB9XG5cbiAgICBsZXQgaSxcbiAgICAgIGwgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuXG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmIChsID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuYWNjZXB0Tm9kZShwcm9ncmFtLmJvZHlbaV0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoYXQgdGhlIGVsZW1lbnQgc3RhY2sgaXMgYmFsYW5jZWQgcHJvcGVybHkuXG4gICAgbGV0IHBvcHBlZE5vZGUgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBpZiAocG9wcGVkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgbGV0IGVsZW1lbnROb2RlID0gcG9wcGVkTm9kZSBhcyBBU1QuRWxlbWVudE5vZGU7XG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1VuY2xvc2VkIGVsZW1lbnQgYCcgKyBlbGVtZW50Tm9kZS50YWcgKyAnYCAob24gbGluZSAnICsgZWxlbWVudE5vZGUubG9jIS5zdGFydC5saW5lICsgJykuJyxcbiAgICAgICAgZWxlbWVudE5vZGUubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEFTVC5CbG9ja1N0YXRlbWVudCB8IHZvaWQge1xuICAgIGlmICh0aGlzLnRva2VuaXplci5zdGF0ZSA9PT0gVG9rZW5pemVyU3RhdGUuY29tbWVudCkge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShibG9jaykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMudG9rZW5pemVyLnN0YXRlICE9PSBUb2tlbml6ZXJTdGF0ZS5kYXRhICYmXG4gICAgICB0aGlzLnRva2VuaXplclsnc3RhdGUnXSAhPT0gVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnQSBibG9jayBtYXkgb25seSBiZSB1c2VkIGluc2lkZSBhbiBIVE1MIGVsZW1lbnQgb3IgYW5vdGhlciBibG9jay4nLFxuICAgICAgICBibG9jay5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgYmxvY2spO1xuICAgIGxldCBwcm9ncmFtID0gdGhpcy5Qcm9ncmFtKGJsb2NrLnByb2dyYW0pO1xuICAgIGxldCBpbnZlcnNlID0gYmxvY2suaW52ZXJzZSA/IHRoaXMuUHJvZ3JhbShibG9jay5pbnZlcnNlKSA6IG51bGw7XG5cbiAgICBsZXQgbm9kZSA9IGIuYmxvY2soXG4gICAgICBwYXRoLFxuICAgICAgcGFyYW1zLFxuICAgICAgaGFzaCxcbiAgICAgIHByb2dyYW0sXG4gICAgICBpbnZlcnNlLFxuICAgICAgYmxvY2subG9jLFxuICAgICAgYmxvY2sub3BlblN0cmlwLFxuICAgICAgYmxvY2suaW52ZXJzZVN0cmlwLFxuICAgICAgYmxvY2suY2xvc2VTdHJpcFxuICAgICk7XG5cbiAgICBsZXQgcGFyZW50UHJvZ3JhbSA9IHRoaXMuY3VycmVudEVsZW1lbnQoKTtcblxuICAgIGFwcGVuZENoaWxkKHBhcmVudFByb2dyYW0sIG5vZGUpO1xuICB9XG5cbiAgTXVzdGFjaGVTdGF0ZW1lbnQocmF3TXVzdGFjaGU6IEhCUy5NdXN0YWNoZVN0YXRlbWVudCk6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IHZvaWQge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09ICdjb21tZW50Jykge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShyYXdNdXN0YWNoZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBtdXN0YWNoZTogQVNULk11c3RhY2hlU3RhdGVtZW50O1xuICAgIGxldCB7IGVzY2FwZWQsIGxvYywgc3RyaXAgfSA9IHJhd011c3RhY2hlO1xuXG4gICAgaWYgKGlzTGl0ZXJhbChyYXdNdXN0YWNoZS5wYXRoKSkge1xuICAgICAgbXVzdGFjaGUgPSB7XG4gICAgICAgIHR5cGU6ICdNdXN0YWNoZVN0YXRlbWVudCcsXG4gICAgICAgIHBhdGg6IHRoaXMuYWNjZXB0Tm9kZTxBU1QuTGl0ZXJhbD4ocmF3TXVzdGFjaGUucGF0aCksXG4gICAgICAgIHBhcmFtczogW10sXG4gICAgICAgIGhhc2g6IGIuaGFzaCgpLFxuICAgICAgICBlc2NhcGVkLFxuICAgICAgICBsb2MsXG4gICAgICAgIHN0cmlwLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXMoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHJhd011c3RhY2hlIGFzIEhCUy5NdXN0YWNoZVN0YXRlbWVudCAmIHtcbiAgICAgICAgICBwYXRoOiBIQlMuUGF0aEV4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBtdXN0YWNoZSA9IGIubXVzdGFjaGUocGF0aCwgcGFyYW1zLCBoYXNoLCAhZXNjYXBlZCwgbG9jLCBzdHJpcCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIC8vIFRhZyBoZWxwZXJzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ09wZW46XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ05hbWU6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IHVzZSBtdXN0YWNoZXMgaW4gYW4gZWxlbWVudHMgdGFnbmFtZTogXFxgJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgICAgICByYXdNdXN0YWNoZSxcbiAgICAgICAgICAgIHJhd011c3RhY2hlLnBhdGhcbiAgICAgICAgICApfVxcYCBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgICAgIG11c3RhY2hlLmxvY1xuICAgICAgICApO1xuXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWU6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlTmFtZTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICB0aGlzLmZpbmlzaEF0dHJpYnV0ZVZhbHVlKCk7XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVWYWx1ZVF1b3RlZDpcbiAgICAgICAgYWRkRWxlbWVudE1vZGlmaWVyKHRoaXMuY3VycmVudFN0YXJ0VGFnLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBBdHRyaWJ1dGUgdmFsdWVzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZVZhbHVlOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KHRoaXMuY3VycmVudEF0dHJpYnV0ZSEsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVVucXVvdGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlRG91YmxlUXVvdGVkOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVNpbmdsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZDpcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBUT0RPOiBPbmx5IGFwcGVuZCBjaGlsZCB3aGVuIHRoZSB0b2tlbml6ZXIgc3RhdGUgbWFrZXNcbiAgICAgIC8vIHNlbnNlIHRvIGRvIHNvLCBvdGhlcndpc2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIG11c3RhY2hlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXVzdGFjaGU7XG4gIH1cblxuICBDb250ZW50U3RhdGVtZW50KGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KTogdm9pZCB7XG4gICAgdXBkYXRlVG9rZW5pemVyTG9jYXRpb24odGhpcy50b2tlbml6ZXIsIGNvbnRlbnQpO1xuXG4gICAgdGhpcy50b2tlbml6ZXIudG9rZW5pemVQYXJ0KGNvbnRlbnQudmFsdWUpO1xuICAgIHRoaXMudG9rZW5pemVyLmZsdXNoRGF0YSgpO1xuICB9XG5cbiAgQ29tbWVudFN0YXRlbWVudChyYXdDb21tZW50OiBIQlMuQ29tbWVudFN0YXRlbWVudCk6IE9wdGlvbjxBU1QuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50PiB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gVG9rZW5pemVyU3RhdGUuY29tbWVudCkge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShyYXdDb21tZW50KSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgeyB2YWx1ZSwgbG9jIH0gPSByYXdDb21tZW50O1xuICAgIGxldCBjb21tZW50ID0gYi5tdXN0YWNoZUNvbW1lbnQodmFsdWUsIGxvYyk7XG5cbiAgICBzd2l0Y2ggKHRva2VuaXplci5zdGF0ZSkge1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFydFRhZy5jb21tZW50cy5wdXNoKGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVEYXRhOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5kYXRhOlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBVc2luZyBhIEhhbmRsZWJhcnMgY29tbWVudCB3aGVuIGluIHRoZSBcXGAke3Rva2VuaXplclsnc3RhdGUnXX1cXGAgc3RhdGUgaXMgbm90IHN1cHBvcnRlZDogXCIke2NvbW1lbnQudmFsdWV9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfToke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICByYXdDb21tZW50LmxvY1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG5cbiAgUGFydGlhbFN0YXRlbWVudChwYXJ0aWFsOiBIQlMuUGFydGlhbFN0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWw7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBwYXJ0aWFscyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShwYXJ0aWFsLCBwYXJ0aWFsLm5hbWUpfVwiIGF0IEwke1xuICAgICAgICBsb2Muc3RhcnQubGluZVxuICAgICAgfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsLmxvY1xuICAgICk7XG4gIH1cblxuICBQYXJ0aWFsQmxvY2tTdGF0ZW1lbnQocGFydGlhbEJsb2NrOiBIQlMuUGFydGlhbEJsb2NrU3RhdGVtZW50KTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gcGFydGlhbEJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbCBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIHBhcnRpYWxCbG9jayxcbiAgICAgICAgcGFydGlhbEJsb2NrLm5hbWVcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIHBhcnRpYWxCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yKGRlY29yYXRvcjogSEJTLkRlY29yYXRvcik6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvcjtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvcixcbiAgICAgICAgZGVjb3JhdG9yLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvci5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yQmxvY2soZGVjb3JhdG9yQmxvY2s6IEhCUy5EZWNvcmF0b3JCbG9jayk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvckJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgZGVjb3JhdG9yIGJsb2NrcyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgZGVjb3JhdG9yQmxvY2ssXG4gICAgICAgIGRlY29yYXRvckJsb2NrLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvckJsb2NrLmxvY1xuICAgICk7XG4gIH1cblxuICBTdWJFeHByZXNzaW9uKHNleHByOiBIQlMuU3ViRXhwcmVzc2lvbik6IEFTVC5TdWJFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCBzZXhwcik7XG4gICAgcmV0dXJuIGIuc2V4cHIocGF0aCwgcGFyYW1zLCBoYXNoLCBzZXhwci5sb2MpO1xuICB9XG5cbiAgUGF0aEV4cHJlc3Npb24ocGF0aDogSEJTLlBhdGhFeHByZXNzaW9uKTogQVNULlBhdGhFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBvcmlnaW5hbCwgbG9jIH0gPSBwYXRoO1xuICAgIGxldCBwYXJ0czogc3RyaW5nW107XG5cbiAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDIpID09PSAnLi8nKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgXCIuL1wiIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lciBhbmQgdW5uZWNlc3Nhcnk6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDMpID09PSAnLi4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENoYW5naW5nIGNvbnRleHQgdXNpbmcgXCIuLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBNaXhpbmcgJy4nIGFuZCAnLycgaW4gcGF0aHMgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOyB1c2Ugb25seSAnLicgdG8gc2VwYXJhdGUgcHJvcGVydHkgcGF0aHM6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcGFydHMgPSBbcGF0aC5wYXJ0cy5qb2luKCcvJyldO1xuICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgPT09ICcuJykge1xuICAgICAgbGV0IGxvY2F0aW9uSW5mbyA9IGBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gO1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgJy4nIGlzIG5vdCBhIHN1cHBvcnRlZCBwYXRoIGluIEdsaW1tZXI7IGNoZWNrIGZvciBhIHBhdGggd2l0aCBhIHRyYWlsaW5nICcuJyBhdCAke2xvY2F0aW9uSW5mb30uYCxcbiAgICAgICAgcGF0aC5sb2NcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzID0gcGF0aC5wYXJ0cztcbiAgICB9XG5cbiAgICBsZXQgdGhpc0hlYWQgPSBmYWxzZTtcblxuICAgIC8vIFRoaXMgaXMgdG8gZml4IGEgYnVnIGluIHRoZSBIYW5kbGViYXJzIEFTVCB3aGVyZSB0aGUgcGF0aCBleHByZXNzaW9ucyBpblxuICAgIC8vIGB7e3RoaXMuZm9vfX1gIChhbmQgc2ltaWxhcmx5IGB7e2Zvby1iYXIgdGhpcy5mb28gbmFtZWQ9dGhpcy5mb299fWAgZXRjKVxuICAgIC8vIGFyZSBzaW1wbHkgdHVybmVkIGludG8gYHt7Zm9vfX1gLiBUaGUgZml4IGlzIHRvIHB1c2ggaXQgYmFjayBvbnRvIHRoZVxuICAgIC8vIHBhcnRzIGFycmF5IGFuZCBsZXQgdGhlIHJ1bnRpbWUgc2VlIHRoZSBkaWZmZXJlbmNlLiBIb3dldmVyLCB3ZSBjYW5ub3RcbiAgICAvLyBzaW1wbHkgdXNlIHRoZSBzdHJpbmcgYHRoaXNgIGFzIGl0IG1lYW5zIGxpdGVyYWxseSB0aGUgcHJvcGVydHkgY2FsbGVkXG4gICAgLy8gXCJ0aGlzXCIgaW4gdGhlIGN1cnJlbnQgY29udGV4dCAoaXQgY2FuIGJlIGV4cHJlc3NlZCBpbiB0aGUgc3ludGF4IGFzXG4gICAgLy8gYHt7W3RoaXNdfX1gLCB3aGVyZSB0aGUgc3F1YXJlIGJyYWNrZXQgYXJlIGdlbmVyYWxseSBmb3IgdGhpcyBraW5kIG9mXG4gICAgLy8gZXNjYXBpbmcg4oCTIHN1Y2ggYXMgYHt7Zm9vLltcImJhci5iYXpcIl19fWAgd291bGQgbWVhbiBsb29rdXAgYSBwcm9wZXJ0eVxuICAgIC8vIG5hbWVkIGxpdGVyYWxseSBcImJhci5iYXpcIiBvbiBgdGhpcy5mb29gKS4gQnkgY29udmVudGlvbiwgd2UgdXNlIGBudWxsYFxuICAgIC8vIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgaWYgKG9yaWdpbmFsLm1hdGNoKC9edGhpcyhcXC4uKyk/JC8pKSB7XG4gICAgICB0aGlzSGVhZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicsXG4gICAgICBvcmlnaW5hbDogcGF0aC5vcmlnaW5hbCxcbiAgICAgIHRoaXM6IHRoaXNIZWFkLFxuICAgICAgcGFydHMsXG4gICAgICBkYXRhOiBwYXRoLmRhdGEsXG4gICAgICBsb2M6IHBhdGgubG9jLFxuICAgIH07XG4gIH1cblxuICBIYXNoKGhhc2g6IEhCUy5IYXNoKTogQVNULkhhc2gge1xuICAgIGxldCBwYWlyczogQVNULkhhc2hQYWlyW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFzaC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBhaXIgPSBoYXNoLnBhaXJzW2ldO1xuICAgICAgcGFpcnMucHVzaChiLnBhaXIocGFpci5rZXksIHRoaXMuYWNjZXB0Tm9kZShwYWlyLnZhbHVlKSwgcGFpci5sb2MpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYi5oYXNoKHBhaXJzLCBoYXNoLmxvYyk7XG4gIH1cblxuICBTdHJpbmdMaXRlcmFsKHN0cmluZzogSEJTLlN0cmluZ0xpdGVyYWwpOiBBU1QuU3RyaW5nTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIHN0cmluZy52YWx1ZSwgc3RyaW5nLmxvYyk7XG4gIH1cblxuICBCb29sZWFuTGl0ZXJhbChib29sZWFuOiBIQlMuQm9vbGVhbkxpdGVyYWwpOiBBU1QuQm9vbGVhbkxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ0Jvb2xlYW5MaXRlcmFsJywgYm9vbGVhbi52YWx1ZSwgYm9vbGVhbi5sb2MpO1xuICB9XG5cbiAgTnVtYmVyTGl0ZXJhbChudW1iZXI6IEhCUy5OdW1iZXJMaXRlcmFsKTogQVNULk51bWJlckxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ051bWJlckxpdGVyYWwnLCBudW1iZXIudmFsdWUsIG51bWJlci5sb2MpO1xuICB9XG5cbiAgVW5kZWZpbmVkTGl0ZXJhbCh1bmRlZjogSEJTLlVuZGVmaW5lZExpdGVyYWwpOiBBU1QuVW5kZWZpbmVkTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnVW5kZWZpbmVkTGl0ZXJhbCcsIHVuZGVmaW5lZCwgdW5kZWYubG9jKTtcbiAgfVxuXG4gIE51bGxMaXRlcmFsKG51bDogSEJTLk51bGxMaXRlcmFsKTogQVNULk51bGxMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdWxsTGl0ZXJhbCcsIG51bGwsIG51bC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKG9yaWdpbmFsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKHZhbHVlID09PSAnJykge1xuICAgIC8vIGlmIGl0IGlzIGVtcHR5LCBqdXN0IHJldHVybiB0aGUgY291bnQgb2YgbmV3bGluZXNcbiAgICAvLyBpbiBvcmlnaW5hbFxuICAgIHJldHVybiB7XG4gICAgICBsaW5lczogb3JpZ2luYWwuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDEsXG4gICAgICBjb2x1bW5zOiAwLFxuICAgIH07XG4gIH1cblxuICAvLyBvdGhlcndpc2UsIHJldHVybiB0aGUgbnVtYmVyIG9mIG5ld2xpbmVzIHByaW9yIHRvXG4gIC8vIGB2YWx1ZWBcbiAgbGV0IGRpZmZlcmVuY2UgPSBvcmlnaW5hbC5zcGxpdCh2YWx1ZSlbMF07XG4gIGxldCBsaW5lcyA9IGRpZmZlcmVuY2Uuc3BsaXQoL1xcbi8pO1xuICBsZXQgbGluZUNvdW50ID0gbGluZXMubGVuZ3RoIC0gMTtcblxuICByZXR1cm4ge1xuICAgIGxpbmVzOiBsaW5lQ291bnQsXG4gICAgY29sdW1uczogbGluZXNbbGluZUNvdW50XS5sZW5ndGgsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRva2VuaXplcjogUGFyc2VyWyd0b2tlbml6ZXInXSwgY29udGVudDogSEJTLkNvbnRlbnRTdGF0ZW1lbnQpIHtcbiAgbGV0IGxpbmUgPSBjb250ZW50LmxvYy5zdGFydC5saW5lO1xuICBsZXQgY29sdW1uID0gY29udGVudC5sb2Muc3RhcnQuY29sdW1uO1xuXG4gIGxldCBvZmZzZXRzID0gY2FsY3VsYXRlUmlnaHRTdHJpcHBlZE9mZnNldHMoXG4gICAgY29udGVudC5vcmlnaW5hbCBhcyBSZWNhc3Q8SEJTLlN0cmlwRmxhZ3MsIHN0cmluZz4sXG4gICAgY29udGVudC52YWx1ZVxuICApO1xuXG4gIGxpbmUgPSBsaW5lICsgb2Zmc2V0cy5saW5lcztcbiAgaWYgKG9mZnNldHMubGluZXMpIHtcbiAgICBjb2x1bW4gPSBvZmZzZXRzLmNvbHVtbnM7XG4gIH0gZWxzZSB7XG4gICAgY29sdW1uID0gY29sdW1uICsgb2Zmc2V0cy5jb2x1bW5zO1xuICB9XG5cbiAgdG9rZW5pemVyLmxpbmUgPSBsaW5lO1xuICB0b2tlbml6ZXIuY29sdW1uID0gY29sdW1uO1xufVxuXG5mdW5jdGlvbiBhY2NlcHRDYWxsTm9kZXMoXG4gIGNvbXBpbGVyOiBIYW5kbGViYXJzTm9kZVZpc2l0b3JzLFxuICBub2RlOiB7XG4gICAgcGF0aDogSEJTLlBhdGhFeHByZXNzaW9uO1xuICAgIHBhcmFtczogSEJTLkV4cHJlc3Npb25bXTtcbiAgICBoYXNoOiBIQlMuSGFzaDtcbiAgfVxuKTogeyBwYXRoOiBBU1QuUGF0aEV4cHJlc3Npb247IHBhcmFtczogQVNULkV4cHJlc3Npb25bXTsgaGFzaDogQVNULkhhc2ggfSB7XG4gIGxldCBwYXRoID0gY29tcGlsZXIuUGF0aEV4cHJlc3Npb24obm9kZS5wYXRoKTtcblxuICBsZXQgcGFyYW1zID0gbm9kZS5wYXJhbXMgPyBub2RlLnBhcmFtcy5tYXAoKGUpID0+IGNvbXBpbGVyLmFjY2VwdE5vZGU8QVNULkV4cHJlc3Npb24+KGUpKSA6IFtdO1xuICBsZXQgaGFzaCA9IG5vZGUuaGFzaCA/IGNvbXBpbGVyLkhhc2gobm9kZS5oYXNoKSA6IGIuaGFzaCgpO1xuXG4gIHJldHVybiB7IHBhdGgsIHBhcmFtcywgaGFzaCB9O1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50TW9kaWZpZXIoZWxlbWVudDogVGFnPCdTdGFydFRhZyc+LCBtdXN0YWNoZTogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCwgbG9jIH0gPSBtdXN0YWNoZTtcblxuICBpZiAoaXNMaXRlcmFsKHBhdGgpKSB7XG4gICAgbGV0IG1vZGlmaWVyID0gYHt7JHtwcmludExpdGVyYWwocGF0aCl9fX1gO1xuICAgIGxldCB0YWcgPSBgPCR7ZWxlbWVudC5uYW1lfSAuLi4gJHttb2RpZmllcn0gLi4uYDtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBJbiAke3RhZ30sICR7bW9kaWZpZXJ9IGlzIG5vdCBhIHZhbGlkIG1vZGlmaWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7XG4gICAgICAgIGxvYyAmJiBsb2Muc3RhcnQubGluZVxuICAgICAgfS5gLFxuICAgICAgbXVzdGFjaGUubG9jXG4gICAgKTtcbiAgfVxuXG4gIGxldCBtb2RpZmllciA9IGIuZWxlbWVudE1vZGlmaWVyKHBhdGgsIHBhcmFtcywgaGFzaCwgbG9jKTtcbiAgZWxlbWVudC5tb2RpZmllcnMucHVzaChtb2RpZmllcik7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQoYXR0cmlidXRlOiBBdHRyaWJ1dGUsIHBhcnQ6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCkge1xuICBhdHRyaWJ1dGUuaXNEeW5hbWljID0gdHJ1ZTtcbiAgYXR0cmlidXRlLnBhcnRzLnB1c2gocGFydCk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9