"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _tokenizerEventHandlers = require("../parser/tokenizer-event-handlers");

var _util = require("./util");

var NON_WHITESPACE = /\S/;

var Printer = /*#__PURE__*/function () {
  function Printer(options) {
    this.buffer = '';
    this.options = options;
  }
  /*
    This is used by _all_ methods on this Printer class that add to `this.buffer`,
    it allows consumers of the printer to use alternate string representations for
    a given node.
       The primary use case for this are things like source -> source codemod utilities.
    For example, ember-template-recast attempts to always preserve the original string
    formatting in each AST node if no modifications are made to it.
  */


  var _proto = Printer.prototype;

  _proto.handledByOverride = function handledByOverride(node, ensureLeadingWhitespace) {
    if (ensureLeadingWhitespace === void 0) {
      ensureLeadingWhitespace = false;
    }

    if (this.options.override !== undefined) {
      var result = this.options.override(node, this.options);

      if (typeof result === 'string') {
        if (ensureLeadingWhitespace && result !== '' && NON_WHITESPACE.test(result[0])) {
          result = " " + result;
        }

        this.buffer += result;
        return true;
      }
    }

    return false;
  };

  _proto.Node = function Node(node) {
    switch (node.type) {
      case 'MustacheStatement':
      case 'BlockStatement':
      case 'PartialStatement':
      case 'MustacheCommentStatement':
      case 'CommentStatement':
      case 'TextNode':
      case 'ElementNode':
      case 'AttrNode':
      case 'Block':
      case 'Template':
        return this.TopLevelStatement(node);

      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'UndefinedLiteral':
      case 'NullLiteral':
      case 'PathExpression':
      case 'SubExpression':
        return this.Expression(node);

      case 'Program':
        return this.Block(node);

      case 'ConcatStatement':
        // should have an AttrNode parent
        return this.ConcatStatement(node);

      case 'Hash':
        return this.Hash(node);

      case 'HashPair':
        return this.HashPair(node);

      case 'ElementModifierStatement':
        return this.ElementModifierStatement(node);
    }

    return unreachable(node, 'Node');
  };

  _proto.Expression = function Expression(expression) {
    switch (expression.type) {
      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'UndefinedLiteral':
      case 'NullLiteral':
        return this.Literal(expression);

      case 'PathExpression':
        return this.PathExpression(expression);

      case 'SubExpression':
        return this.SubExpression(expression);
    }

    return unreachable(expression, 'Expression');
  };

  _proto.Literal = function Literal(literal) {
    switch (literal.type) {
      case 'StringLiteral':
        return this.StringLiteral(literal);

      case 'BooleanLiteral':
        return this.BooleanLiteral(literal);

      case 'NumberLiteral':
        return this.NumberLiteral(literal);

      case 'UndefinedLiteral':
        return this.UndefinedLiteral(literal);

      case 'NullLiteral':
        return this.NullLiteral(literal);
    }

    return unreachable(literal, 'Literal');
  };

  _proto.TopLevelStatement = function TopLevelStatement(statement) {
    switch (statement.type) {
      case 'MustacheStatement':
        return this.MustacheStatement(statement);

      case 'BlockStatement':
        return this.BlockStatement(statement);

      case 'PartialStatement':
        return this.PartialStatement(statement);

      case 'MustacheCommentStatement':
        return this.MustacheCommentStatement(statement);

      case 'CommentStatement':
        return this.CommentStatement(statement);

      case 'TextNode':
        return this.TextNode(statement);

      case 'ElementNode':
        return this.ElementNode(statement);

      case 'Block':
      case 'Template':
        return this.Block(statement);

      case 'AttrNode':
        // should have element
        return this.AttrNode(statement);
    }

    unreachable(statement, 'TopLevelStatement');
  };

  _proto.Block = function Block(block) {
    /*
      When processing a template like:
           ```hbs
      {{#if whatever}}
        whatever
      {{else if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}
      ```
           The AST still _effectively_ looks like:
           ```hbs
      {{#if whatever}}
        whatever
      {{else}}{{#if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}{{/if}}
      ```
           The only way we can tell if that is the case is by checking for
      `block.chained`, but unfortunately when the actual statements are
      processed the `block.body[0]` node (which will always be a
      `BlockStatement`) has no clue that its anscestor `Block` node was
      chained.
           This "forwards" the `chained` setting so that we can check
      it later when processing the `BlockStatement`.
    */
    if (block.chained) {
      var firstChild = block.body[0];
      firstChild.chained = true;
    }

    if (this.handledByOverride(block)) {
      return;
    }

    this.TopLevelStatements(block.body);
  };

  _proto.TopLevelStatements = function TopLevelStatements(statements) {
    var _this = this;

    statements.forEach(function (statement) {
      return _this.TopLevelStatement(statement);
    });
  };

  _proto.ElementNode = function ElementNode(el) {
    if (this.handledByOverride(el)) {
      return;
    }

    this.OpenElementNode(el);
    this.TopLevelStatements(el.children);
    this.CloseElementNode(el);
  };

  _proto.OpenElementNode = function OpenElementNode(el) {
    var _this2 = this;

    this.buffer += "<" + el.tag;

    if (el.attributes.length) {
      el.attributes.forEach(function (attr) {
        _this2.buffer += ' ';

        _this2.AttrNode(attr);
      });
    }

    if (el.modifiers.length) {
      el.modifiers.forEach(function (mod) {
        _this2.buffer += ' ';

        _this2.ElementModifierStatement(mod);
      });
    }

    if (el.comments.length) {
      el.comments.forEach(function (comment) {
        _this2.buffer += ' ';

        _this2.MustacheCommentStatement(comment);
      });
    }

    if (el.blockParams.length) {
      this.BlockParams(el.blockParams);
    }

    if (el.selfClosing) {
      this.buffer += ' /';
    }

    this.buffer += '>';
  };

  _proto.CloseElementNode = function CloseElementNode(el) {
    if (el.selfClosing || _tokenizerEventHandlers.voidMap[el.tag.toLowerCase()]) {
      return;
    }

    this.buffer += "</" + el.tag + ">";
  };

  _proto.AttrNode = function AttrNode(attr) {
    if (this.handledByOverride(attr)) {
      return;
    }

    var name = attr.name,
        value = attr.value;
    this.buffer += name;

    if (value.type !== 'TextNode' || value.chars.length > 0) {
      this.buffer += '=';
      this.AttrNodeValue(value);
    }
  };

  _proto.AttrNodeValue = function AttrNodeValue(value) {
    if (value.type === 'TextNode') {
      this.buffer += '"';
      this.TextNode(value, true);
      this.buffer += '"';
    } else {
      this.Node(value);
    }
  };

  _proto.TextNode = function TextNode(text, isAttr) {
    if (this.handledByOverride(text)) {
      return;
    }

    if (this.options.entityEncoding === 'raw') {
      this.buffer += text.chars;
    } else if (isAttr) {
      this.buffer += (0, _util.escapeAttrValue)(text.chars);
    } else {
      this.buffer += (0, _util.escapeText)(text.chars);
    }
  };

  _proto.MustacheStatement = function MustacheStatement(mustache) {
    if (this.handledByOverride(mustache)) {
      return;
    }

    this.buffer += mustache.escaped ? '{{' : '{{{';

    if (mustache.strip.open) {
      this.buffer += '~';
    }

    this.Expression(mustache.path);
    this.Params(mustache.params);
    this.Hash(mustache.hash);

    if (mustache.strip.close) {
      this.buffer += '~';
    }

    this.buffer += mustache.escaped ? '}}' : '}}}';
  };

  _proto.BlockStatement = function BlockStatement(block) {
    if (this.handledByOverride(block)) {
      return;
    }

    if (block.chained) {
      this.buffer += block.inverseStrip.open ? '{{~' : '{{';
      this.buffer += 'else ';
    } else {
      this.buffer += block.openStrip.open ? '{{~#' : '{{#';
    }

    this.Expression(block.path);
    this.Params(block.params);
    this.Hash(block.hash);

    if (block.program.blockParams.length) {
      this.BlockParams(block.program.blockParams);
    }

    if (block.chained) {
      this.buffer += block.inverseStrip.close ? '~}}' : '}}';
    } else {
      this.buffer += block.openStrip.close ? '~}}' : '}}';
    }

    this.Block(block.program);

    if (block.inverse) {
      if (!block.inverse.chained) {
        this.buffer += block.inverseStrip.open ? '{{~' : '{{';
        this.buffer += 'else';
        this.buffer += block.inverseStrip.close ? '~}}' : '}}';
      }

      this.Block(block.inverse);
    }

    if (!block.chained) {
      this.buffer += block.closeStrip.open ? '{{~/' : '{{/';
      this.Expression(block.path);
      this.buffer += block.closeStrip.close ? '~}}' : '}}';
    }
  };

  _proto.BlockParams = function BlockParams(blockParams) {
    this.buffer += " as |" + blockParams.join(' ') + "|";
  };

  _proto.PartialStatement = function PartialStatement(partial) {
    if (this.handledByOverride(partial)) {
      return;
    }

    this.buffer += '{{>';
    this.Expression(partial.name);
    this.Params(partial.params);
    this.Hash(partial.hash);
    this.buffer += '}}';
  };

  _proto.ConcatStatement = function ConcatStatement(concat) {
    var _this3 = this;

    if (this.handledByOverride(concat)) {
      return;
    }

    this.buffer += '"';
    concat.parts.forEach(function (part) {
      if (part.type === 'TextNode') {
        _this3.TextNode(part, true);
      } else {
        _this3.Node(part);
      }
    });
    this.buffer += '"';
  };

  _proto.MustacheCommentStatement = function MustacheCommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }

    this.buffer += "{{!--" + comment.value + "--}}";
  };

  _proto.ElementModifierStatement = function ElementModifierStatement(mod) {
    if (this.handledByOverride(mod)) {
      return;
    }

    this.buffer += '{{';
    this.Expression(mod.path);
    this.Params(mod.params);
    this.Hash(mod.hash);
    this.buffer += '}}';
  };

  _proto.CommentStatement = function CommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }

    this.buffer += "<!--" + comment.value + "-->";
  };

  _proto.PathExpression = function PathExpression(path) {
    if (this.handledByOverride(path)) {
      return;
    }

    this.buffer += path.original;
  };

  _proto.SubExpression = function SubExpression(sexp) {
    if (this.handledByOverride(sexp)) {
      return;
    }

    this.buffer += '(';
    this.Expression(sexp.path);
    this.Params(sexp.params);
    this.Hash(sexp.hash);
    this.buffer += ')';
  };

  _proto.Params = function Params(params) {
    var _this4 = this; // TODO: implement a top level Params AST node (just like the Hash object)
    // so that this can also be overridden


    if (params.length) {
      params.forEach(function (param) {
        _this4.buffer += ' ';

        _this4.Expression(param);
      });
    }
  };

  _proto.Hash = function Hash(hash) {
    var _this5 = this;

    if (this.handledByOverride(hash, true)) {
      return;
    }

    hash.pairs.forEach(function (pair) {
      _this5.buffer += ' ';

      _this5.HashPair(pair);
    });
  };

  _proto.HashPair = function HashPair(pair) {
    if (this.handledByOverride(pair)) {
      return;
    }

    this.buffer += pair.key;
    this.buffer += '=';
    this.Node(pair.value);
  };

  _proto.StringLiteral = function StringLiteral(str) {
    if (this.handledByOverride(str)) {
      return;
    }

    this.buffer += JSON.stringify(str.value);
  };

  _proto.BooleanLiteral = function BooleanLiteral(bool) {
    if (this.handledByOverride(bool)) {
      return;
    }

    this.buffer += bool.value;
  };

  _proto.NumberLiteral = function NumberLiteral(number) {
    if (this.handledByOverride(number)) {
      return;
    }

    this.buffer += number.value;
  };

  _proto.UndefinedLiteral = function UndefinedLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }

    this.buffer += 'undefined';
  };

  _proto.NullLiteral = function NullLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }

    this.buffer += 'null';
  };

  _proto.print = function print(node) {
    var options = this.options;

    if (options.override) {
      var result = options.override(node, options);

      if (result !== undefined) {
        return result;
      }
    }

    this.buffer = '';
    this.Node(node);
    return this.buffer;
  };

  return Printer;
}();

exports.default = Printer;

function unreachable(node, parentNodeType) {
  var loc = node.loc,
      type = node.type;
  throw new Error("Non-exhaustive node narrowing " + type + " @ location: " + JSON.stringify(loc) + " for parent " + parentNodeType);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvZ2VuZXJhdGlvbi9wcmludGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUE0QkE7O0FBQ0E7O0FBRUEsSUFBTSxjQUFjLEdBQXBCLElBQUE7O0lBc0JjLE87QUFJWixXQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQW1DO0FBSDNCLFNBQUEsTUFBQSxHQUFBLEVBQUE7QUFJTixTQUFBLE9BQUEsR0FBQSxPQUFBO0FBQ0Q7QUFFRDs7Ozs7Ozs7Ozs7O1NBU0EsaUIsR0FBQSxTQUFBLGlCQUFBLENBQUEsSUFBQSxFQUFBLHVCQUFBLEVBQTZEO0FBQUEsUUFBL0IsdUJBQStCLEtBQUEsS0FBQSxDQUFBLEVBQUE7QUFBL0IsTUFBQSx1QkFBK0IsR0FBNUMsS0FBYTtBQUErQjs7QUFDM0QsUUFBSSxLQUFBLE9BQUEsQ0FBQSxRQUFBLEtBQUosU0FBQSxFQUF5QztBQUN2QyxVQUFJLE1BQU0sR0FBRyxLQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUE0QixLQUF6QyxPQUFhLENBQWI7O0FBQ0EsVUFBSSxPQUFBLE1BQUEsS0FBSixRQUFBLEVBQWdDO0FBQzlCLFlBQUksdUJBQXVCLElBQUksTUFBTSxLQUFqQyxFQUFBLElBQTRDLGNBQWMsQ0FBZCxJQUFBLENBQW9CLE1BQU0sQ0FBMUUsQ0FBMEUsQ0FBMUIsQ0FBaEQsRUFBZ0Y7QUFDOUUsVUFBQSxNQUFNLEdBQUEsTUFBTixNQUFBO0FBQ0Q7O0FBRUQsYUFBQSxNQUFBLElBQUEsTUFBQTtBQUNBLGVBQUEsSUFBQTtBQUNEO0FBQ0Y7O0FBRUQsV0FBQSxLQUFBOzs7U0FHRixJLEdBQUEsU0FBQSxJQUFBLENBQUEsSUFBQSxFQUFlO0FBQ2IsWUFBUSxJQUFJLENBQVosSUFBQTtBQUNFLFdBQUEsbUJBQUE7QUFDQSxXQUFBLGdCQUFBO0FBQ0EsV0FBQSxrQkFBQTtBQUNBLFdBQUEsMEJBQUE7QUFDQSxXQUFBLGtC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QkFBQSxDQUFKLElBQUksQ0FBSixFQUFrQztBQUNoQztBQUNEOztBQUVELFNBQUEsTUFBQSxJQUFBLFdBQUE7OztTQUdGLFcsR0FBQSxTQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQTZCO0FBQzNCLFFBQUksS0FBQSxpQkFBQSxDQUFKLElBQUksQ0FBSixFQUFrQztBQUNoQztBQUNEOztBQUVELFNBQUEsTUFBQSxJQUFBLE1BQUE7OztTQUdGLEssR0FBQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQWdCO0FBQUEsUUFDUixPQURRLEdBQUEsS0FBQSxPQUFBOztBQUdkLFFBQUksT0FBTyxDQUFYLFFBQUEsRUFBc0I7QUFDcEIsVUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFQLFFBQUEsQ0FBQSxJQUFBLEVBQWIsT0FBYSxDQUFiOztBQUVBLFVBQUksTUFBTSxLQUFWLFNBQUEsRUFBMEI7QUFDeEIsZUFBQSxNQUFBO0FBQ0Q7QUFDRjs7QUFFRCxTQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFdBQU8sS0FBUCxNQUFBOzs7Ozs7OztBQUlKLFNBQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxjQUFBLEVBQXdEO0FBQUEsTUFDbEQsR0FEa0QsR0FDdEQsSUFEc0QsQ0FBQSxHQUFBO0FBQUEsTUFDM0MsSUFEMkMsR0FDdEQsSUFEc0QsQ0FBQSxJQUFBO0FBRXRELFFBQU0sSUFBQSxLQUFBLENBQUEsbUNBQUEsSUFBQSxHQUFBLGVBQUEsR0FDaUQsSUFBSSxDQUFKLFNBQUEsQ0FEakQsR0FDaUQsQ0FEakQsR0FBQSxjQUFBLEdBQU4sY0FBTSxDQUFOO0FBS0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBdHRyTm9kZSxcbiAgQmxvY2ssXG4gIEJsb2NrU3RhdGVtZW50LFxuICBFbGVtZW50Tm9kZSxcbiAgTXVzdGFjaGVTdGF0ZW1lbnQsXG4gIE5vZGUsXG4gIFByb2dyYW0sXG4gIFRleHROb2RlLFxuICBQYXJ0aWFsU3RhdGVtZW50LFxuICBDb25jYXRTdGF0ZW1lbnQsXG4gIE11c3RhY2hlQ29tbWVudFN0YXRlbWVudCxcbiAgQ29tbWVudFN0YXRlbWVudCxcbiAgRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50LFxuICBFeHByZXNzaW9uLFxuICBQYXRoRXhwcmVzc2lvbixcbiAgU3ViRXhwcmVzc2lvbixcbiAgSGFzaCxcbiAgSGFzaFBhaXIsXG4gIExpdGVyYWwsXG4gIFN0cmluZ0xpdGVyYWwsXG4gIEJvb2xlYW5MaXRlcmFsLFxuICBOdW1iZXJMaXRlcmFsLFxuICBVbmRlZmluZWRMaXRlcmFsLFxuICBOdWxsTGl0ZXJhbCxcbiAgVG9wTGV2ZWxTdGF0ZW1lbnQsXG4gIFRlbXBsYXRlLFxufSBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgeyB2b2lkTWFwIH0gZnJvbSAnLi4vcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycyc7XG5pbXBvcnQgeyBlc2NhcGVUZXh0LCBlc2NhcGVBdHRyVmFsdWUgfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBOT05fV0hJVEVTUEFDRSA9IC9cXFMvO1xuXG5leHBvcnQgaW50ZXJmYWNlIFByaW50ZXJPcHRpb25zIHtcbiAgZW50aXR5RW5jb2Rpbmc6ICd0cmFuc2Zvcm1lZCcgfCAncmF3JztcblxuICAvKipcbiAgICogVXNlZCB0byBvdmVycmlkZSB0aGUgbWVjaGFuaXNtIG9mIHByaW50aW5nIGEgZ2l2ZW4gQVNULk5vZGUuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBnZW5lcmFsbHkgb25seSBiZSB1c2VmdWwgdG8gc291cmNlIC0+IHNvdXJjZSBjb2RlbW9kc1xuICAgKiB3aGVyZSB5b3Ugd291bGQgbGlrZSB0byBzcGVjaWFsaXplL292ZXJyaWRlIHRoZSB3YXkgYSBnaXZlbiBub2RlIGlzXG4gICAqIHByaW50ZWQgKGUuZy4geW91IHdvdWxkIGxpa2UgdG8gcHJlc2VydmUgYXMgbXVjaCBvZiB0aGUgb3JpZ2luYWxcbiAgICogZm9ybWF0dGluZyBhcyBwb3NzaWJsZSkuXG4gICAqXG4gICAqIFdoZW4gdGhlIHByb3ZpZGVkIG92ZXJyaWRlIHJldHVybnMgdW5kZWZpbmVkLCB0aGUgZGVmYXVsdCBidWlsdCBpbiBwcmludGluZ1xuICAgKiB3aWxsIGJlIGRvbmUgZm9yIHRoZSBBU1QuTm9kZS5cbiAgICpcbiAgICogQHBhcmFtIGFzdCB0aGUgYXN0IG5vZGUgdG8gYmUgcHJpbnRlZFxuICAgKiBAcGFyYW0gb3B0aW9ucyB0aGUgb3B0aW9ucyBzcGVjaWZpZWQgZHVyaW5nIHRoZSBwcmludCgpIGludm9jYXRpb25cbiAgICovXG4gIG92ZXJyaWRlPyhhc3Q6IE5vZGUsIG9wdGlvbnM6IFByaW50ZXJPcHRpb25zKTogdm9pZCB8IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJpbnRlciB7XG4gIHByaXZhdGUgYnVmZmVyID0gJyc7XG4gIHByaXZhdGUgb3B0aW9uczogUHJpbnRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogUHJpbnRlck9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgLypcbiAgICBUaGlzIGlzIHVzZWQgYnkgX2FsbF8gbWV0aG9kcyBvbiB0aGlzIFByaW50ZXIgY2xhc3MgdGhhdCBhZGQgdG8gYHRoaXMuYnVmZmVyYCxcbiAgICBpdCBhbGxvd3MgY29uc3VtZXJzIG9mIHRoZSBwcmludGVyIHRvIHVzZSBhbHRlcm5hdGUgc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBmb3JcbiAgICBhIGdpdmVuIG5vZGUuXG5cbiAgICBUaGUgcHJpbWFyeSB1c2UgY2FzZSBmb3IgdGhpcyBhcmUgdGhpbmdzIGxpa2Ugc291cmNlIC0+IHNvdXJjZSBjb2RlbW9kIHV0aWxpdGllcy5cbiAgICBGb3IgZXhhbXBsZSwgZW1iZXItdGVtcGxhdGUtcmVjYXN0IGF0dGVtcHRzIHRvIGFsd2F5cyBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgc3RyaW5nXG4gICAgZm9ybWF0dGluZyBpbiBlYWNoIEFTVCBub2RlIGlmIG5vIG1vZGlmaWNhdGlvbnMgYXJlIG1hZGUgdG8gaXQuXG4gICovXG4gIGhhbmRsZWRCeU92ZXJyaWRlKG5vZGU6IE5vZGUsIGVuc3VyZUxlYWRpbmdXaGl0ZXNwYWNlID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJyaWRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCByZXN1bHQgPSB0aGlzLm9wdGlvbnMub3ZlcnJpZGUobm9kZSwgdGhpcy5vcHRpb25zKTtcbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoZW5zdXJlTGVhZGluZ1doaXRlc3BhY2UgJiYgcmVzdWx0ICE9PSAnJyAmJiBOT05fV0hJVEVTUEFDRS50ZXN0KHJlc3VsdFswXSkpIHtcbiAgICAgICAgICByZXN1bHQgPSBgICR7cmVzdWx0fWA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJ1ZmZlciArPSByZXN1bHQ7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIE5vZGUobm9kZTogTm9kZSk6IHZvaWQge1xuICAgIHN3aXRjaCAobm9kZS50eXBlKSB7XG4gICAgICBjYXNlICdNdXN0YWNoZVN0YXRlbWVudCc6XG4gICAgICBjYXNlICdCbG9ja1N0YXRlbWVudCc6XG4gICAgICBjYXNlICdQYXJ0aWFsU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ011c3RhY2hlQ29tbWVudFN0YXRlbWVudCc6XG4gICAgICBjYXNlICdDb21tZW50U3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ1RleHROb2RlJzpcbiAgICAgIGNhc2UgJ0VsZW1lbnROb2RlJzpcbiAgICAgIGNhc2UgJ0F0dHJOb2RlJzpcbiAgICAgIGNhc2UgJ0Jsb2NrJzpcbiAgICAgIGNhc2UgJ1RlbXBsYXRlJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuVG9wTGV2ZWxTdGF0ZW1lbnQobm9kZSk7XG4gICAgICBjYXNlICdTdHJpbmdMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsJzpcbiAgICAgIGNhc2UgJ051bWJlckxpdGVyYWwnOlxuICAgICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdWxsTGl0ZXJhbCc6XG4gICAgICBjYXNlICdQYXRoRXhwcmVzc2lvbic6XG4gICAgICBjYXNlICdTdWJFeHByZXNzaW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuRXhwcmVzc2lvbihub2RlKTtcbiAgICAgIGNhc2UgJ1Byb2dyYW0nOlxuICAgICAgICByZXR1cm4gdGhpcy5CbG9jayhub2RlKTtcbiAgICAgIGNhc2UgJ0NvbmNhdFN0YXRlbWVudCc6XG4gICAgICAgIC8vIHNob3VsZCBoYXZlIGFuIEF0dHJOb2RlIHBhcmVudFxuICAgICAgICByZXR1cm4gdGhpcy5Db25jYXRTdGF0ZW1lbnQobm9kZSk7XG4gICAgICBjYXNlICdIYXNoJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuSGFzaChub2RlKTtcbiAgICAgIGNhc2UgJ0hhc2hQYWlyJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuSGFzaFBhaXIobm9kZSk7XG4gICAgICBjYXNlICdFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5FbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQobm9kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVucmVhY2hhYmxlKG5vZGUsICdOb2RlJyk7XG4gIH1cblxuICBFeHByZXNzaW9uKGV4cHJlc3Npb246IEV4cHJlc3Npb24pOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGV4cHJlc3Npb24udHlwZSkge1xuICAgICAgY2FzZSAnU3RyaW5nTGl0ZXJhbCc6XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ1VuZGVmaW5lZExpdGVyYWwnOlxuICAgICAgY2FzZSAnTnVsbExpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5MaXRlcmFsKGV4cHJlc3Npb24pO1xuICAgICAgY2FzZSAnUGF0aEV4cHJlc3Npb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5QYXRoRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgICAgIGNhc2UgJ1N1YkV4cHJlc3Npb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5TdWJFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gdW5yZWFjaGFibGUoZXhwcmVzc2lvbiwgJ0V4cHJlc3Npb24nKTtcbiAgfVxuXG4gIExpdGVyYWwobGl0ZXJhbDogTGl0ZXJhbCkge1xuICAgIHN3aXRjaCAobGl0ZXJhbC50eXBlKSB7XG4gICAgICBjYXNlICdTdHJpbmdMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuU3RyaW5nTGl0ZXJhbChsaXRlcmFsKTtcbiAgICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuQm9vbGVhbkxpdGVyYWwobGl0ZXJhbCk7XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTnVtYmVyTGl0ZXJhbChsaXRlcmFsKTtcbiAgICAgIGNhc2UgJ1VuZGVmaW5lZExpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5VbmRlZmluZWRMaXRlcmFsKGxpdGVyYWwpO1xuICAgICAgY2FzZSAnTnVsbExpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5OdWxsTGl0ZXJhbChsaXRlcmFsKTtcbiAgICB9XG4gICAgcmV0dXJuIHVucmVhY2hhYmxlKGxpdGVyYWwsICdMaXRlcmFsJyk7XG4gIH1cblxuICBUb3BMZXZlbFN0YXRlbWVudChzdGF0ZW1lbnQ6IFRvcExldmVsU3RhdGVtZW50KSB7XG4gICAgc3dpdGNoIChzdGF0ZW1lbnQudHlwZSkge1xuICAgICAgY2FzZSAnTXVzdGFjaGVTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5NdXN0YWNoZVN0YXRlbWVudChzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnQmxvY2tTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5CbG9ja1N0YXRlbWVudChzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnUGFydGlhbFN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLlBhcnRpYWxTdGF0ZW1lbnQoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ011c3RhY2hlQ29tbWVudFN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLk11c3RhY2hlQ29tbWVudFN0YXRlbWVudChzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnQ29tbWVudFN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLkNvbW1lbnRTdGF0ZW1lbnQoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ1RleHROb2RlJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuVGV4dE5vZGUoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ0VsZW1lbnROb2RlJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuRWxlbWVudE5vZGUoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ0Jsb2NrJzpcbiAgICAgIGNhc2UgJ1RlbXBsYXRlJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuQmxvY2soc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ0F0dHJOb2RlJzpcbiAgICAgICAgLy8gc2hvdWxkIGhhdmUgZWxlbWVudFxuICAgICAgICByZXR1cm4gdGhpcy5BdHRyTm9kZShzdGF0ZW1lbnQpO1xuICAgIH1cbiAgICB1bnJlYWNoYWJsZShzdGF0ZW1lbnQsICdUb3BMZXZlbFN0YXRlbWVudCcpO1xuICB9XG5cbiAgQmxvY2soYmxvY2s6IEJsb2NrIHwgUHJvZ3JhbSB8IFRlbXBsYXRlKTogdm9pZCB7XG4gICAgLypcbiAgICAgIFdoZW4gcHJvY2Vzc2luZyBhIHRlbXBsYXRlIGxpa2U6XG5cbiAgICAgIGBgYGhic1xuICAgICAge3sjaWYgd2hhdGV2ZXJ9fVxuICAgICAgICB3aGF0ZXZlclxuICAgICAge3tlbHNlIGlmIHNvbWV0aGluZ0Vsc2V9fVxuICAgICAgICBzb21ldGhpbmcgZWxzZVxuICAgICAge3tlbHNlfX1cbiAgICAgICAgZmFsbGJhY2tcbiAgICAgIHt7L2lmfX1cbiAgICAgIGBgYFxuXG4gICAgICBUaGUgQVNUIHN0aWxsIF9lZmZlY3RpdmVseV8gbG9va3MgbGlrZTpcblxuICAgICAgYGBgaGJzXG4gICAgICB7eyNpZiB3aGF0ZXZlcn19XG4gICAgICAgIHdoYXRldmVyXG4gICAgICB7e2Vsc2V9fXt7I2lmIHNvbWV0aGluZ0Vsc2V9fVxuICAgICAgICBzb21ldGhpbmcgZWxzZVxuICAgICAge3tlbHNlfX1cbiAgICAgICAgZmFsbGJhY2tcbiAgICAgIHt7L2lmfX17ey9pZn19XG4gICAgICBgYGBcblxuICAgICAgVGhlIG9ubHkgd2F5IHdlIGNhbiB0ZWxsIGlmIHRoYXQgaXMgdGhlIGNhc2UgaXMgYnkgY2hlY2tpbmcgZm9yXG4gICAgICBgYmxvY2suY2hhaW5lZGAsIGJ1dCB1bmZvcnR1bmF0ZWx5IHdoZW4gdGhlIGFjdHVhbCBzdGF0ZW1lbnRzIGFyZVxuICAgICAgcHJvY2Vzc2VkIHRoZSBgYmxvY2suYm9keVswXWAgbm9kZSAod2hpY2ggd2lsbCBhbHdheXMgYmUgYVxuICAgICAgYEJsb2NrU3RhdGVtZW50YCkgaGFzIG5vIGNsdWUgdGhhdCBpdHMgYW5zY2VzdG9yIGBCbG9ja2Agbm9kZSB3YXNcbiAgICAgIGNoYWluZWQuXG5cbiAgICAgIFRoaXMgXCJmb3J3YXJkc1wiIHRoZSBgY2hhaW5lZGAgc2V0dGluZyBzbyB0aGF0IHdlIGNhbiBjaGVja1xuICAgICAgaXQgbGF0ZXIgd2hlbiBwcm9jZXNzaW5nIHRoZSBgQmxvY2tTdGF0ZW1lbnRgLlxuICAgICovXG4gICAgaWYgKGJsb2NrLmNoYWluZWQpIHtcbiAgICAgIGxldCBmaXJzdENoaWxkID0gYmxvY2suYm9keVswXSBhcyBCbG9ja1N0YXRlbWVudDtcbiAgICAgIGZpcnN0Q2hpbGQuY2hhaW5lZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoYmxvY2spKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5Ub3BMZXZlbFN0YXRlbWVudHMoYmxvY2suYm9keSk7XG4gIH1cblxuICBUb3BMZXZlbFN0YXRlbWVudHMoc3RhdGVtZW50czogVG9wTGV2ZWxTdGF0ZW1lbnRbXSkge1xuICAgIHN0YXRlbWVudHMuZm9yRWFjaCgoc3RhdGVtZW50KSA9PiB0aGlzLlRvcExldmVsU3RhdGVtZW50KHN0YXRlbWVudCkpO1xuICB9XG5cbiAgRWxlbWVudE5vZGUoZWw6IEVsZW1lbnROb2RlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoZWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5PcGVuRWxlbWVudE5vZGUoZWwpO1xuICAgIHRoaXMuVG9wTGV2ZWxTdGF0ZW1lbnRzKGVsLmNoaWxkcmVuKTtcbiAgICB0aGlzLkNsb3NlRWxlbWVudE5vZGUoZWwpO1xuICB9XG5cbiAgT3BlbkVsZW1lbnROb2RlKGVsOiBFbGVtZW50Tm9kZSk6IHZvaWQge1xuICAgIHRoaXMuYnVmZmVyICs9IGA8JHtlbC50YWd9YDtcbiAgICBpZiAoZWwuYXR0cmlidXRlcy5sZW5ndGgpIHtcbiAgICAgIGVsLmF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSAnICc7XG4gICAgICAgIHRoaXMuQXR0ck5vZGUoYXR0cik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsLm1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgIGVsLm1vZGlmaWVycy5mb3JFYWNoKChtb2QpID0+IHtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gJyAnO1xuICAgICAgICB0aGlzLkVsZW1lbnRNb2RpZmllclN0YXRlbWVudChtb2QpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbC5jb21tZW50cy5sZW5ndGgpIHtcbiAgICAgIGVsLmNvbW1lbnRzLmZvckVhY2goKGNvbW1lbnQpID0+IHtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gJyAnO1xuICAgICAgICB0aGlzLk11c3RhY2hlQ29tbWVudFN0YXRlbWVudChjb21tZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWwuYmxvY2tQYXJhbXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLkJsb2NrUGFyYW1zKGVsLmJsb2NrUGFyYW1zKTtcbiAgICB9XG4gICAgaWYgKGVsLnNlbGZDbG9zaW5nKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnIC8nO1xuICAgIH1cbiAgICB0aGlzLmJ1ZmZlciArPSAnPic7XG4gIH1cblxuICBDbG9zZUVsZW1lbnROb2RlKGVsOiBFbGVtZW50Tm9kZSk6IHZvaWQge1xuICAgIGlmIChlbC5zZWxmQ2xvc2luZyB8fCB2b2lkTWFwW2VsLnRhZy50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmJ1ZmZlciArPSBgPC8ke2VsLnRhZ30+YDtcbiAgfVxuXG4gIEF0dHJOb2RlKGF0dHI6IEF0dHJOb2RlKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoYXR0cikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgeyBuYW1lLCB2YWx1ZSB9ID0gYXR0cjtcblxuICAgIHRoaXMuYnVmZmVyICs9IG5hbWU7XG4gICAgaWYgKHZhbHVlLnR5cGUgIT09ICdUZXh0Tm9kZScgfHwgdmFsdWUuY2hhcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJz0nO1xuICAgICAgdGhpcy5BdHRyTm9kZVZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBBdHRyTm9kZVZhbHVlKHZhbHVlOiBBdHRyTm9kZVsndmFsdWUnXSkge1xuICAgIGlmICh2YWx1ZS50eXBlID09PSAnVGV4dE5vZGUnKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnXCInO1xuICAgICAgdGhpcy5UZXh0Tm9kZSh2YWx1ZSwgdHJ1ZSk7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnXCInO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLk5vZGUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIFRleHROb2RlKHRleHQ6IFRleHROb2RlLCBpc0F0dHI/OiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUodGV4dCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmVudGl0eUVuY29kaW5nID09PSAncmF3Jykge1xuICAgICAgdGhpcy5idWZmZXIgKz0gdGV4dC5jaGFycztcbiAgICB9IGVsc2UgaWYgKGlzQXR0cikge1xuICAgICAgdGhpcy5idWZmZXIgKz0gZXNjYXBlQXR0clZhbHVlKHRleHQuY2hhcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBlc2NhcGVUZXh0KHRleHQuY2hhcnMpO1xuICAgIH1cbiAgfVxuXG4gIE11c3RhY2hlU3RhdGVtZW50KG11c3RhY2hlOiBNdXN0YWNoZVN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKG11c3RhY2hlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IG11c3RhY2hlLmVzY2FwZWQgPyAne3snIDogJ3t7eyc7XG5cbiAgICBpZiAobXVzdGFjaGUuc3RyaXAub3Blbikge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJ34nO1xuICAgIH1cblxuICAgIHRoaXMuRXhwcmVzc2lvbihtdXN0YWNoZS5wYXRoKTtcbiAgICB0aGlzLlBhcmFtcyhtdXN0YWNoZS5wYXJhbXMpO1xuICAgIHRoaXMuSGFzaChtdXN0YWNoZS5oYXNoKTtcblxuICAgIGlmIChtdXN0YWNoZS5zdHJpcC5jbG9zZSkge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJ34nO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IG11c3RhY2hlLmVzY2FwZWQgPyAnfX0nIDogJ319fSc7XG4gIH1cblxuICBCbG9ja1N0YXRlbWVudChibG9jazogQmxvY2tTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShibG9jaykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2suY2hhaW5lZCkge1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suaW52ZXJzZVN0cmlwLm9wZW4gPyAne3t+JyA6ICd7eyc7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnZWxzZSAnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5vcGVuU3RyaXAub3BlbiA/ICd7e34jJyA6ICd7eyMnO1xuICAgIH1cblxuICAgIHRoaXMuRXhwcmVzc2lvbihibG9jay5wYXRoKTtcbiAgICB0aGlzLlBhcmFtcyhibG9jay5wYXJhbXMpO1xuICAgIHRoaXMuSGFzaChibG9jay5oYXNoKTtcbiAgICBpZiAoYmxvY2sucHJvZ3JhbS5ibG9ja1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuQmxvY2tQYXJhbXMoYmxvY2sucHJvZ3JhbS5ibG9ja1BhcmFtcyk7XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrLmNoYWluZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmludmVyc2VTdHJpcC5jbG9zZSA/ICd+fX0nIDogJ319JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2sub3BlblN0cmlwLmNsb3NlID8gJ359fScgOiAnfX0nO1xuICAgIH1cblxuICAgIHRoaXMuQmxvY2soYmxvY2sucHJvZ3JhbSk7XG5cbiAgICBpZiAoYmxvY2suaW52ZXJzZSkge1xuICAgICAgaWYgKCFibG9jay5pbnZlcnNlLmNoYWluZWQpIHtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suaW52ZXJzZVN0cmlwLm9wZW4gPyAne3t+JyA6ICd7eyc7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9ICdlbHNlJztcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suaW52ZXJzZVN0cmlwLmNsb3NlID8gJ359fScgOiAnfX0nO1xuICAgICAgfVxuXG4gICAgICB0aGlzLkJsb2NrKGJsb2NrLmludmVyc2UpO1xuICAgIH1cblxuICAgIGlmICghYmxvY2suY2hhaW5lZCkge1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suY2xvc2VTdHJpcC5vcGVuID8gJ3t7fi8nIDogJ3t7Lyc7XG4gICAgICB0aGlzLkV4cHJlc3Npb24oYmxvY2sucGF0aCk7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5jbG9zZVN0cmlwLmNsb3NlID8gJ359fScgOiAnfX0nO1xuICAgIH1cbiAgfVxuXG4gIEJsb2NrUGFyYW1zKGJsb2NrUGFyYW1zOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuYnVmZmVyICs9IGAgYXMgfCR7YmxvY2tQYXJhbXMuam9pbignICcpfXxgO1xuICB9XG5cbiAgUGFydGlhbFN0YXRlbWVudChwYXJ0aWFsOiBQYXJ0aWFsU3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUocGFydGlhbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAne3s+JztcbiAgICB0aGlzLkV4cHJlc3Npb24ocGFydGlhbC5uYW1lKTtcbiAgICB0aGlzLlBhcmFtcyhwYXJ0aWFsLnBhcmFtcyk7XG4gICAgdGhpcy5IYXNoKHBhcnRpYWwuaGFzaCk7XG4gICAgdGhpcy5idWZmZXIgKz0gJ319JztcbiAgfVxuXG4gIENvbmNhdFN0YXRlbWVudChjb25jYXQ6IENvbmNhdFN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGNvbmNhdCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAnXCInO1xuICAgIGNvbmNhdC5wYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBpZiAocGFydC50eXBlID09PSAnVGV4dE5vZGUnKSB7XG4gICAgICAgIHRoaXMuVGV4dE5vZGUocGFydCwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLk5vZGUocGFydCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5idWZmZXIgKz0gJ1wiJztcbiAgfVxuXG4gIE11c3RhY2hlQ29tbWVudFN0YXRlbWVudChjb21tZW50OiBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShjb21tZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IGB7eyEtLSR7Y29tbWVudC52YWx1ZX0tLX19YDtcbiAgfVxuXG4gIEVsZW1lbnRNb2RpZmllclN0YXRlbWVudChtb2Q6IEVsZW1lbnRNb2RpZmllclN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKG1vZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAne3snO1xuICAgIHRoaXMuRXhwcmVzc2lvbihtb2QucGF0aCk7XG4gICAgdGhpcy5QYXJhbXMobW9kLnBhcmFtcyk7XG4gICAgdGhpcy5IYXNoKG1vZC5oYXNoKTtcbiAgICB0aGlzLmJ1ZmZlciArPSAnfX0nO1xuICB9XG5cbiAgQ29tbWVudFN0YXRlbWVudChjb21tZW50OiBDb21tZW50U3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoY29tbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBgPCEtLSR7Y29tbWVudC52YWx1ZX0tLT5gO1xuICB9XG5cbiAgUGF0aEV4cHJlc3Npb24ocGF0aDogUGF0aEV4cHJlc3Npb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShwYXRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IHBhdGgub3JpZ2luYWw7XG4gIH1cblxuICBTdWJFeHByZXNzaW9uKHNleHA6IFN1YkV4cHJlc3Npb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShzZXhwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICcoJztcbiAgICB0aGlzLkV4cHJlc3Npb24oc2V4cC5wYXRoKTtcbiAgICB0aGlzLlBhcmFtcyhzZXhwLnBhcmFtcyk7XG4gICAgdGhpcy5IYXNoKHNleHAuaGFzaCk7XG4gICAgdGhpcy5idWZmZXIgKz0gJyknO1xuICB9XG5cbiAgUGFyYW1zKHBhcmFtczogRXhwcmVzc2lvbltdKSB7XG4gICAgLy8gVE9ETzogaW1wbGVtZW50IGEgdG9wIGxldmVsIFBhcmFtcyBBU1Qgbm9kZSAoanVzdCBsaWtlIHRoZSBIYXNoIG9iamVjdClcbiAgICAvLyBzbyB0aGF0IHRoaXMgY2FuIGFsc28gYmUgb3ZlcnJpZGRlblxuICAgIGlmIChwYXJhbXMubGVuZ3RoKSB7XG4gICAgICBwYXJhbXMuZm9yRWFjaCgocGFyYW0pID0+IHtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gJyAnO1xuICAgICAgICB0aGlzLkV4cHJlc3Npb24ocGFyYW0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgSGFzaChoYXNoOiBIYXNoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoaGFzaCwgdHJ1ZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoYXNoLnBhaXJzLmZvckVhY2goKHBhaXIpID0+IHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICcgJztcbiAgICAgIHRoaXMuSGFzaFBhaXIocGFpcik7XG4gICAgfSk7XG4gIH1cblxuICBIYXNoUGFpcihwYWlyOiBIYXNoUGFpcik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHBhaXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gcGFpci5rZXk7XG4gICAgdGhpcy5idWZmZXIgKz0gJz0nO1xuICAgIHRoaXMuTm9kZShwYWlyLnZhbHVlKTtcbiAgfVxuXG4gIFN0cmluZ0xpdGVyYWwoc3RyOiBTdHJpbmdMaXRlcmFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoc3RyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IEpTT04uc3RyaW5naWZ5KHN0ci52YWx1ZSk7XG4gIH1cblxuICBCb29sZWFuTGl0ZXJhbChib29sOiBCb29sZWFuTGl0ZXJhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGJvb2wpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gYm9vbC52YWx1ZTtcbiAgfVxuXG4gIE51bWJlckxpdGVyYWwobnVtYmVyOiBOdW1iZXJMaXRlcmFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUobnVtYmVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IG51bWJlci52YWx1ZTtcbiAgfVxuXG4gIFVuZGVmaW5lZExpdGVyYWwobm9kZTogVW5kZWZpbmVkTGl0ZXJhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKG5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICBOdWxsTGl0ZXJhbChub2RlOiBOdWxsTGl0ZXJhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKG5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJ251bGwnO1xuICB9XG5cbiAgcHJpbnQobm9kZTogTm9kZSkge1xuICAgIGxldCB7IG9wdGlvbnMgfSA9IHRoaXM7XG5cbiAgICBpZiAob3B0aW9ucy5vdmVycmlkZSkge1xuICAgICAgbGV0IHJlc3VsdCA9IG9wdGlvbnMub3ZlcnJpZGUobm9kZSwgb3B0aW9ucyk7XG5cbiAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyID0gJyc7XG4gICAgdGhpcy5Ob2RlKG5vZGUpO1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlcjtcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnJlYWNoYWJsZShub2RlOiBuZXZlciwgcGFyZW50Tm9kZVR5cGU6IHN0cmluZyk6IG5ldmVyIHtcbiAgbGV0IHsgbG9jLCB0eXBlIH0gPSAobm9kZSBhcyBhbnkpIGFzIE5vZGU7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBgTm9uLWV4aGF1c3RpdmUgbm9kZSBuYXJyb3dpbmcgJHt0eXBlfSBAIGxvY2F0aW9uOiAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgbG9jXG4gICAgKX0gZm9yIHBhcmVudCAke3BhcmVudE5vZGVUeXBlfWBcbiAgKTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=