function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import b from '../builders';
import { appendChild, isLiteral, printLiteral } from '../utils';
import { Parser } from '../parser';
import SyntaxError from '../errors/syntax-error';
export var HandlebarsNodeVisitors = /*#__PURE__*/function (_Parser) {
  _inheritsLoose(HandlebarsNodeVisitors, _Parser);

  function HandlebarsNodeVisitors() {
    return _Parser.apply(this, arguments) || this;
  }

  var _proto = HandlebarsNodeVisitors.prototype;

  _proto.Program = function Program(program) {
    var body = [];
    var node;

    if (this.isTopLevel) {
      node = b.template(body, program.blockParams, program.loc);
    } else {
      node = b.blockItself(body, program.blockParams, program.chained, program.loc);
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
      throw new SyntaxError('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
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
        throw new SyntaxError('A block may only be used inside an HTML element or another block.', block.loc);
      }

    var _acceptCallNodes = acceptCallNodes(this, block),
        path = _acceptCallNodes.path,
        params = _acceptCallNodes.params,
        hash = _acceptCallNodes.hash;

    var program = this.Program(block.program);
    var inverse = block.inverse ? this.Program(block.inverse) : null;
    var node = b.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);
    var parentProgram = this.currentElement();
    appendChild(parentProgram, node);
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
      case "tagOpen"
      /* tagOpen */
      :
      case "tagName"
      /* tagName */
      :
        throw new SyntaxError("Cannot use mustaches in an elements tagname: `" + this.sourceForNode(rawMustache, rawMustache.path) + "` at L" + loc.start.line + ":C" + loc.start.column, mustache.loc);

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
        appendChild(this.currentElement(), mustache);
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
    var comment = b.mustacheComment(value, loc);

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
        appendChild(this.currentElement(), comment);
        break;

      default:
        throw new SyntaxError("Using a Handlebars comment when in the `" + tokenizer['state'] + "` state is not supported: \"" + comment.value + "\" on line " + loc.start.line + ":" + loc.start.column, rawComment.loc);
    }

    return comment;
  };

  _proto.PartialStatement = function PartialStatement(partial) {
    var loc = partial.loc;
    throw new SyntaxError("Handlebars partials are not supported: \"" + this.sourceForNode(partial, partial.name) + "\" at L" + loc.start.line + ":C" + loc.start.column, partial.loc);
  };

  _proto.PartialBlockStatement = function PartialBlockStatement(partialBlock) {
    var loc = partialBlock.loc;
    throw new SyntaxError("Handlebars partial blocks are not supported: \"" + this.sourceForNode(partialBlock, partialBlock.name) + "\" at L" + loc.start.line + ":C" + loc.start.column, partialBlock.loc);
  };

  _proto.Decorator = function Decorator(decorator) {
    var loc = decorator.loc;
    throw new SyntaxError("Handlebars decorators are not supported: \"" + this.sourceForNode(decorator, decorator.path) + "\" at L" + loc.start.line + ":C" + loc.start.column, decorator.loc);
  };

  _proto.DecoratorBlock = function DecoratorBlock(decoratorBlock) {
    var loc = decoratorBlock.loc;
    throw new SyntaxError("Handlebars decorator blocks are not supported: \"" + this.sourceForNode(decoratorBlock, decoratorBlock.path) + "\" at L" + loc.start.line + ":C" + loc.start.column, decoratorBlock.loc);
  };

  _proto.SubExpression = function SubExpression(sexpr) {
    var _acceptCallNodes3 = acceptCallNodes(this, sexpr),
        path = _acceptCallNodes3.path,
        params = _acceptCallNodes3.params,
        hash = _acceptCallNodes3.hash;

    return b.sexpr(path, params, hash, sexpr.loc);
  };

  _proto.PathExpression = function PathExpression(path) {
    var original = path.original,
        loc = path.loc;
    var parts;

    if (original.indexOf('/') !== -1) {
      if (original.slice(0, 2) === './') {
        throw new SyntaxError("Using \"./\" is not supported in Glimmer and unnecessary: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      if (original.slice(0, 3) === '../') {
        throw new SyntaxError("Changing context using \"../\" is not supported in Glimmer: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      if (original.indexOf('.') !== -1) {
        throw new SyntaxError("Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths: \"" + path.original + "\" on line " + loc.start.line + ".", path.loc);
      }

      parts = [path.parts.join('/')];
    } else if (original === '.') {
      var locationInfo = "L" + loc.start.line + ":C" + loc.start.column;
      throw new SyntaxError("'.' is not a supported path in Glimmer; check for a path with a trailing '.' at " + locationInfo + ".", path.loc);
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
      pairs.push(b.pair(pair.key, this.acceptNode(pair.value), pair.loc));
    }

    return b.hash(pairs, hash.loc);
  };

  _proto.StringLiteral = function StringLiteral(string) {
    return b.literal('StringLiteral', string.value, string.loc);
  };

  _proto.BooleanLiteral = function BooleanLiteral(_boolean) {
    return b.literal('BooleanLiteral', _boolean.value, _boolean.loc);
  };

  _proto.NumberLiteral = function NumberLiteral(number) {
    return b.literal('NumberLiteral', number.value, number.loc);
  };

  _proto.UndefinedLiteral = function UndefinedLiteral(undef) {
    return b.literal('UndefinedLiteral', undefined, undef.loc);
  };

  _proto.NullLiteral = function NullLiteral(nul) {
    return b.literal('NullLiteral', null, nul.loc);
  };

  _createClass(HandlebarsNodeVisitors, [{
    key: "isTopLevel",
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
  var hash = node.hash ? compiler.Hash(node.hash) : b.hash();
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

  if (isLiteral(path)) {
    var _modifier = "{{" + printLiteral(path) + "}}";

    var tag = "<" + element.name + " ... " + _modifier + " ...";
    throw new SyntaxError("In " + tag + ", " + _modifier + " is not a valid modifier: \"" + path.original + "\" on line " + (loc && loc.start.line) + ".", mustache.loc);
  }

  var modifier = b.elementModifier(path, params, hash, loc);
  element.modifiers.push(modifier);
}

function appendDynamicAttributeValuePart(attribute, part) {
  attribute.isDynamic = true;
  attribute.parts.push(part);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFBLENBQUEsTUFBQSxhQUFBO0FBQ0EsU0FBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLFlBQUEsUUFBQSxVQUFBO0FBR0EsU0FBQSxNQUFBLFFBQUEsV0FBQTtBQUNBLE9BQUEsV0FBQSxNQUFBLHdCQUFBO0FBS0EsV0FBTSxzQkFBTjtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQSxTQVlFLE9BWkYsR0FZRSxpQkFBTyxPQUFQLEVBQTRCO0FBQzFCLFFBQUksSUFBSSxHQUFSLEVBQUE7QUFDQSxRQUFBLElBQUE7O0FBRUEsUUFBSSxLQUFKLFVBQUEsRUFBcUI7QUFDbkIsTUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFELFFBQUEsQ0FBQSxJQUFBLEVBQWlCLE9BQU8sQ0FBeEIsV0FBQSxFQUFzQyxPQUFPLENBQXBELEdBQU8sQ0FBUDtBQURGLEtBQUEsTUFFTztBQUNMLE1BQUEsSUFBSSxHQUFHLENBQUMsQ0FBRCxXQUFBLENBQUEsSUFBQSxFQUFvQixPQUFPLENBQTNCLFdBQUEsRUFBeUMsT0FBTyxDQUFoRCxPQUFBLEVBQTBELE9BQU8sQ0FBeEUsR0FBTyxDQUFQO0FBQ0Q7O0FBRUQsUUFBQSxDQUFBO0FBQUEsUUFDRSxDQUFDLEdBQUcsT0FBTyxDQUFQLElBQUEsQ0FETixNQUFBO0FBR0EsU0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7O0FBRUEsUUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUFhO0FBQ1gsYUFBTyxLQUFBLFlBQUEsQ0FBUCxHQUFPLEVBQVA7QUFDRDs7QUFFRCxTQUFLLENBQUMsR0FBTixDQUFBLEVBQVksQ0FBQyxHQUFiLENBQUEsRUFBbUIsQ0FBbkIsRUFBQSxFQUF3QjtBQUN0QixXQUFBLFVBQUEsQ0FBZ0IsT0FBTyxD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eEYsRUFBQSxTQUFTLENBQVQsU0FBQSxHQUFBLElBQUE7QUFDQSxFQUFBLFNBQVMsQ0FBVCxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBiIGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB7IGFwcGVuZENoaWxkLCBpc0xpdGVyYWwsIHByaW50TGl0ZXJhbCB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi4vdHlwZXMvaGFuZGxlYmFycy1hc3QnO1xuaW1wb3J0IHsgUGFyc2VyLCBUYWcsIEF0dHJpYnV0ZSB9IGZyb20gJy4uL3BhcnNlcic7XG5pbXBvcnQgU3ludGF4RXJyb3IgZnJvbSAnLi4vZXJyb3JzL3N5bnRheC1lcnJvcic7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci91dGlsJztcbmltcG9ydCB7IFJlY2FzdCB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgVG9rZW5pemVyU3RhdGUgfSBmcm9tICdzaW1wbGUtaHRtbC10b2tlbml6ZXInO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSGFuZGxlYmFyc05vZGVWaXNpdG9ycyBleHRlbmRzIFBhcnNlciB7XG4gIGFic3RyYWN0IGFwcGVuZFRvQ29tbWVudERhdGEoczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5BdHRyaWJ1dGVWYWx1ZShxdW90ZWQ6IGJvb2xlYW4pOiB2b2lkO1xuICBhYnN0cmFjdCBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpOiB2b2lkO1xuXG4gIHByaXZhdGUgZ2V0IGlzVG9wTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGU7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUge1xuICAgIGxldCBib2R5OiBBU1QuU3RhdGVtZW50W10gPSBbXTtcbiAgICBsZXQgbm9kZTtcblxuICAgIGlmICh0aGlzLmlzVG9wTGV2ZWwpIHtcbiAgICAgIG5vZGUgPSBiLnRlbXBsYXRlKGJvZHksIHByb2dyYW0uYmxvY2tQYXJhbXMsIHByb2dyYW0ubG9jKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZSA9IGIuYmxvY2tJdHNlbGYoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5jaGFpbmVkLCBwcm9ncmFtLmxvYyk7XG4gICAgfVxuXG4gICAgbGV0IGksXG4gICAgICBsID0gcHJvZ3JhbS5ib2R5Lmxlbmd0aDtcblxuICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2gobm9kZSk7XG5cbiAgICBpZiAobCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpIGFzIEFTVC5CbG9jayB8IEFTVC5UZW1wbGF0ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLmFjY2VwdE5vZGUocHJvZ3JhbS5ib2R5W2ldKTtcbiAgICB9XG5cbiAgICAvLyBFbnN1cmUgdGhhdCB0aGF0IHRoZSBlbGVtZW50IHN0YWNrIGlzIGJhbGFuY2VkIHByb3Blcmx5LlxuICAgIGxldCBwb3BwZWROb2RlID0gdGhpcy5lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgaWYgKHBvcHBlZE5vZGUgIT09IG5vZGUpIHtcbiAgICAgIGxldCBlbGVtZW50Tm9kZSA9IHBvcHBlZE5vZGUgYXMgQVNULkVsZW1lbnROb2RlO1xuXG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICdVbmNsb3NlZCBlbGVtZW50IGAnICsgZWxlbWVudE5vZGUudGFnICsgJ2AgKG9uIGxpbmUgJyArIGVsZW1lbnROb2RlLmxvYyEuc3RhcnQubGluZSArICcpLicsXG4gICAgICAgIGVsZW1lbnROb2RlLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIEJsb2NrU3RhdGVtZW50KGJsb2NrOiBIQlMuQmxvY2tTdGF0ZW1lbnQpOiBBU1QuQmxvY2tTdGF0ZW1lbnQgfCB2b2lkIHtcbiAgICBpZiAodGhpcy50b2tlbml6ZXIuc3RhdGUgPT09IFRva2VuaXplclN0YXRlLmNvbW1lbnQpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUoYmxvY2spKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLnRva2VuaXplci5zdGF0ZSAhPT0gVG9rZW5pemVyU3RhdGUuZGF0YSAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09IFRva2VuaXplclN0YXRlLmJlZm9yZURhdGFcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ0EgYmxvY2sgbWF5IG9ubHkgYmUgdXNlZCBpbnNpZGUgYW4gSFRNTCBlbGVtZW50IG9yIGFub3RoZXIgYmxvY2suJyxcbiAgICAgICAgYmxvY2subG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gYWNjZXB0Q2FsbE5vZGVzKHRoaXMsIGJsb2NrKTtcbiAgICBsZXQgcHJvZ3JhbSA9IHRoaXMuUHJvZ3JhbShibG9jay5wcm9ncmFtKTtcbiAgICBsZXQgaW52ZXJzZSA9IGJsb2NrLmludmVyc2UgPyB0aGlzLlByb2dyYW0oYmxvY2suaW52ZXJzZSkgOiBudWxsO1xuXG4gICAgbGV0IG5vZGUgPSBiLmJsb2NrKFxuICAgICAgcGF0aCxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGhhc2gsXG4gICAgICBwcm9ncmFtLFxuICAgICAgaW52ZXJzZSxcbiAgICAgIGJsb2NrLmxvYyxcbiAgICAgIGJsb2NrLm9wZW5TdHJpcCxcbiAgICAgIGJsb2NrLmludmVyc2VTdHJpcCxcbiAgICAgIGJsb2NrLmNsb3NlU3RyaXBcbiAgICApO1xuXG4gICAgbGV0IHBhcmVudFByb2dyYW0gPSB0aGlzLmN1cnJlbnRFbGVtZW50KCk7XG5cbiAgICBhcHBlbmRDaGlsZChwYXJlbnRQcm9ncmFtLCBub2RlKTtcbiAgfVxuXG4gIE11c3RhY2hlU3RhdGVtZW50KHJhd011c3RhY2hlOiBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQpOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQgfCB2b2lkIHtcbiAgICBsZXQgeyB0b2tlbml6ZXIgfSA9IHRoaXM7XG5cbiAgICBpZiAodG9rZW5pemVyLnN0YXRlID09PSAnY29tbWVudCcpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3TXVzdGFjaGUpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbXVzdGFjaGU6IEFTVC5NdXN0YWNoZVN0YXRlbWVudDtcbiAgICBsZXQgeyBlc2NhcGVkLCBsb2MsIHN0cmlwIH0gPSByYXdNdXN0YWNoZTtcblxuICAgIGlmIChpc0xpdGVyYWwocmF3TXVzdGFjaGUucGF0aCkpIHtcbiAgICAgIG11c3RhY2hlID0ge1xuICAgICAgICB0eXBlOiAnTXVzdGFjaGVTdGF0ZW1lbnQnLFxuICAgICAgICBwYXRoOiB0aGlzLmFjY2VwdE5vZGU8QVNULkxpdGVyYWw+KHJhd011c3RhY2hlLnBhdGgpLFxuICAgICAgICBwYXJhbXM6IFtdLFxuICAgICAgICBoYXNoOiBiLmhhc2goKSxcbiAgICAgICAgZXNjYXBlZCxcbiAgICAgICAgbG9jLFxuICAgICAgICBzdHJpcCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gYWNjZXB0Q2FsbE5vZGVzKFxuICAgICAgICB0aGlzLFxuICAgICAgICByYXdNdXN0YWNoZSBhcyBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQgJiB7XG4gICAgICAgICAgcGF0aDogSEJTLlBhdGhFeHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgbXVzdGFjaGUgPSBiLm11c3RhY2hlKHBhdGgsIHBhcmFtcywgaGFzaCwgIWVzY2FwZWQsIGxvYywgc3RyaXApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW5pemVyLnN0YXRlKSB7XG4gICAgICAvLyBUYWcgaGVscGVyc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdPcGVuOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdOYW1lOlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENhbm5vdCB1c2UgbXVzdGFjaGVzIGluIGFuIGVsZW1lbnRzIHRhZ25hbWU6IFxcYCR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICAgICAgcmF3TXVzdGFjaGUsXG4gICAgICAgICAgICByYXdNdXN0YWNoZS5wYXRoXG4gICAgICAgICAgKX1cXGAgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICBtdXN0YWNoZS5sb2NcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZU5hbWU6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5maW5pc2hBdHRyaWJ1dGVWYWx1ZSgpO1xuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlVmFsdWVRdW90ZWQ6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gQXR0cmlidXRlIHZhbHVlc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVWYWx1ZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZURvdWJsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVTaW5nbGVRdW90ZWQ6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlVW5xdW90ZWQ6XG4gICAgICAgIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQodGhpcy5jdXJyZW50QXR0cmlidXRlISwgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gVE9ETzogT25seSBhcHBlbmQgY2hpbGQgd2hlbiB0aGUgdG9rZW5pemVyIHN0YXRlIG1ha2VzXG4gICAgICAvLyBzZW5zZSB0byBkbyBzbywgb3RoZXJ3aXNlIHRocm93IGFuIGVycm9yLlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBtdXN0YWNoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG11c3RhY2hlO1xuICB9XG5cbiAgQ29udGVudFN0YXRlbWVudChjb250ZW50OiBIQlMuQ29udGVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRoaXMudG9rZW5pemVyLCBjb250ZW50KTtcblxuICAgIHRoaXMudG9rZW5pemVyLnRva2VuaXplUGFydChjb250ZW50LnZhbHVlKTtcbiAgICB0aGlzLnRva2VuaXplci5mbHVzaERhdGEoKTtcbiAgfVxuXG4gIENvbW1lbnRTdGF0ZW1lbnQocmF3Q29tbWVudDogSEJTLkNvbW1lbnRTdGF0ZW1lbnQpOiBPcHRpb248QVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudD4ge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09IFRva2VuaXplclN0YXRlLmNvbW1lbnQpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3Q29tbWVudCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHsgdmFsdWUsIGxvYyB9ID0gcmF3Q29tbWVudDtcbiAgICBsZXQgY29tbWVudCA9IGIubXVzdGFjaGVDb21tZW50KHZhbHVlLCBsb2MpO1xuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuZGF0YTpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgYSBIYW5kbGViYXJzIGNvbW1lbnQgd2hlbiBpbiB0aGUgXFxgJHt0b2tlbml6ZXJbJ3N0YXRlJ119XFxgIHN0YXRlIGlzIG5vdCBzdXBwb3J0ZWQ6IFwiJHtjb21tZW50LnZhbHVlfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX06JHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICAgICAgcmF3Q29tbWVudC5sb2NcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIFBhcnRpYWxTdGF0ZW1lbnQocGFydGlhbDogSEJTLlBhcnRpYWxTdGF0ZW1lbnQpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBwYXJ0aWFsO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbHMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUocGFydGlhbCwgcGFydGlhbC5uYW1lKX1cIiBhdCBMJHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmVcbiAgICAgIH06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgcGFydGlhbC5sb2NcbiAgICApO1xuICB9XG5cbiAgUGFydGlhbEJsb2NrU3RhdGVtZW50KHBhcnRpYWxCbG9jazogSEJTLlBhcnRpYWxCbG9ja1N0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWxCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIHBhcnRpYWwgYmxvY2tzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBwYXJ0aWFsQmxvY2ssXG4gICAgICAgIHBhcnRpYWxCbG9jay5uYW1lXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsQmxvY2subG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvcihkZWNvcmF0b3I6IEhCUy5EZWNvcmF0b3IpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3I7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBkZWNvcmF0b3JzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBkZWNvcmF0b3IsXG4gICAgICAgIGRlY29yYXRvci5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3IubG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvckJsb2NrKGRlY29yYXRvckJsb2NrOiBIQlMuRGVjb3JhdG9yQmxvY2spOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3JCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvciBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvckJsb2NrLFxuICAgICAgICBkZWNvcmF0b3JCbG9jay5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3JCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgU3ViRXhwcmVzc2lvbihzZXhwcjogSEJTLlN1YkV4cHJlc3Npb24pOiBBU1QuU3ViRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgc2V4cHIpO1xuICAgIHJldHVybiBiLnNleHByKHBhdGgsIHBhcmFtcywgaGFzaCwgc2V4cHIubG9jKTtcbiAgfVxuXG4gIFBhdGhFeHByZXNzaW9uKHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbik6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgb3JpZ2luYWwsIGxvYyB9ID0gcGF0aDtcbiAgICBsZXQgcGFydHM6IHN0cmluZ1tdO1xuXG4gICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAyKSA9PT0gJy4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVzaW5nIFwiLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXIgYW5kIHVubmVjZXNzYXJ5OiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAzKSA9PT0gJy4uLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBDaGFuZ2luZyBjb250ZXh0IHVzaW5nIFwiLi4vXCIgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgTWl4aW5nICcuJyBhbmQgJy8nIGluIHBhdGhzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lcjsgdXNlIG9ubHkgJy4nIHRvIHNlcGFyYXRlIHByb3BlcnR5IHBhdGhzOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHBhcnRzID0gW3BhdGgucGFydHMuam9pbignLycpXTtcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsID09PSAnLicpIHtcbiAgICAgIGxldCBsb2NhdGlvbkluZm8gPSBgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YDtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgYCcuJyBpcyBub3QgYSBzdXBwb3J0ZWQgcGF0aCBpbiBHbGltbWVyOyBjaGVjayBmb3IgYSBwYXRoIHdpdGggYSB0cmFpbGluZyAnLicgYXQgJHtsb2NhdGlvbkluZm99LmAsXG4gICAgICAgIHBhdGgubG9jXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cyA9IHBhdGgucGFydHM7XG4gICAgfVxuXG4gICAgbGV0IHRoaXNIZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUaGlzIGlzIHRvIGZpeCBhIGJ1ZyBpbiB0aGUgSGFuZGxlYmFycyBBU1Qgd2hlcmUgdGhlIHBhdGggZXhwcmVzc2lvbnMgaW5cbiAgICAvLyBge3t0aGlzLmZvb319YCAoYW5kIHNpbWlsYXJseSBge3tmb28tYmFyIHRoaXMuZm9vIG5hbWVkPXRoaXMuZm9vfX1gIGV0YylcbiAgICAvLyBhcmUgc2ltcGx5IHR1cm5lZCBpbnRvIGB7e2Zvb319YC4gVGhlIGZpeCBpcyB0byBwdXNoIGl0IGJhY2sgb250byB0aGVcbiAgICAvLyBwYXJ0cyBhcnJheSBhbmQgbGV0IHRoZSBydW50aW1lIHNlZSB0aGUgZGlmZmVyZW5jZS4gSG93ZXZlciwgd2UgY2Fubm90XG4gICAgLy8gc2ltcGx5IHVzZSB0aGUgc3RyaW5nIGB0aGlzYCBhcyBpdCBtZWFucyBsaXRlcmFsbHkgdGhlIHByb3BlcnR5IGNhbGxlZFxuICAgIC8vIFwidGhpc1wiIGluIHRoZSBjdXJyZW50IGNvbnRleHQgKGl0IGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIHN5bnRheCBhc1xuICAgIC8vIGB7e1t0aGlzXX19YCwgd2hlcmUgdGhlIHNxdWFyZSBicmFja2V0IGFyZSBnZW5lcmFsbHkgZm9yIHRoaXMga2luZCBvZlxuICAgIC8vIGVzY2FwaW5nIOKAkyBzdWNoIGFzIGB7e2Zvby5bXCJiYXIuYmF6XCJdfX1gIHdvdWxkIG1lYW4gbG9va3VwIGEgcHJvcGVydHlcbiAgICAvLyBuYW1lZCBsaXRlcmFsbHkgXCJiYXIuYmF6XCIgb24gYHRoaXMuZm9vYCkuIEJ5IGNvbnZlbnRpb24sIHdlIHVzZSBgbnVsbGBcbiAgICAvLyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgIGlmIChvcmlnaW5hbC5tYXRjaCgvXnRoaXMoXFwuLispPyQvKSkge1xuICAgICAgdGhpc0hlYWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgICAgb3JpZ2luYWw6IHBhdGgub3JpZ2luYWwsXG4gICAgICB0aGlzOiB0aGlzSGVhZCxcbiAgICAgIHBhcnRzLFxuICAgICAgZGF0YTogcGF0aC5kYXRhLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9O1xuICB9XG5cbiAgSGFzaChoYXNoOiBIQlMuSGFzaCk6IEFTVC5IYXNoIHtcbiAgICBsZXQgcGFpcnM6IEFTVC5IYXNoUGFpcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhc2gucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwYWlyID0gaGFzaC5wYWlyc1tpXTtcbiAgICAgIHBhaXJzLnB1c2goYi5wYWlyKHBhaXIua2V5LCB0aGlzLmFjY2VwdE5vZGUocGFpci52YWx1ZSksIHBhaXIubG9jKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGIuaGFzaChwYWlycywgaGFzaC5sb2MpO1xuICB9XG5cbiAgU3RyaW5nTGl0ZXJhbChzdHJpbmc6IEhCUy5TdHJpbmdMaXRlcmFsKTogQVNULlN0cmluZ0xpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1N0cmluZ0xpdGVyYWwnLCBzdHJpbmcudmFsdWUsIHN0cmluZy5sb2MpO1xuICB9XG5cbiAgQm9vbGVhbkxpdGVyYWwoYm9vbGVhbjogSEJTLkJvb2xlYW5MaXRlcmFsKTogQVNULkJvb2xlYW5MaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdCb29sZWFuTGl0ZXJhbCcsIGJvb2xlYW4udmFsdWUsIGJvb2xlYW4ubG9jKTtcbiAgfVxuXG4gIE51bWJlckxpdGVyYWwobnVtYmVyOiBIQlMuTnVtYmVyTGl0ZXJhbCk6IEFTVC5OdW1iZXJMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdW1iZXJMaXRlcmFsJywgbnVtYmVyLnZhbHVlLCBudW1iZXIubG9jKTtcbiAgfVxuXG4gIFVuZGVmaW5lZExpdGVyYWwodW5kZWY6IEhCUy5VbmRlZmluZWRMaXRlcmFsKTogQVNULlVuZGVmaW5lZExpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQsIHVuZGVmLmxvYyk7XG4gIH1cblxuICBOdWxsTGl0ZXJhbChudWw6IEhCUy5OdWxsTGl0ZXJhbCk6IEFTVC5OdWxsTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnTnVsbExpdGVyYWwnLCBudWxsLCBudWwubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVSaWdodFN0cmlwcGVkT2Zmc2V0cyhvcmlnaW5hbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAvLyBpZiBpdCBpcyBlbXB0eSwganVzdCByZXR1cm4gdGhlIGNvdW50IG9mIG5ld2xpbmVzXG4gICAgLy8gaW4gb3JpZ2luYWxcbiAgICByZXR1cm4ge1xuICAgICAgbGluZXM6IG9yaWdpbmFsLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxLFxuICAgICAgY29sdW1uczogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBuZXdsaW5lcyBwcmlvciB0b1xuICAvLyBgdmFsdWVgXG4gIGxldCBkaWZmZXJlbmNlID0gb3JpZ2luYWwuc3BsaXQodmFsdWUpWzBdO1xuICBsZXQgbGluZXMgPSBkaWZmZXJlbmNlLnNwbGl0KC9cXG4vKTtcbiAgbGV0IGxpbmVDb3VudCA9IGxpbmVzLmxlbmd0aCAtIDE7XG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lczogbGluZUNvdW50LFxuICAgIGNvbHVtbnM6IGxpbmVzW2xpbmVDb3VudF0ubGVuZ3RoLFxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb2tlbml6ZXJMb2NhdGlvbih0b2tlbml6ZXI6IFBhcnNlclsndG9rZW5pemVyJ10sIGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KSB7XG4gIGxldCBsaW5lID0gY29udGVudC5sb2Muc3RhcnQubGluZTtcbiAgbGV0IGNvbHVtbiA9IGNvbnRlbnQubG9jLnN0YXJ0LmNvbHVtbjtcblxuICBsZXQgb2Zmc2V0cyA9IGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKFxuICAgIGNvbnRlbnQub3JpZ2luYWwgYXMgUmVjYXN0PEhCUy5TdHJpcEZsYWdzLCBzdHJpbmc+LFxuICAgIGNvbnRlbnQudmFsdWVcbiAgKTtcblxuICBsaW5lID0gbGluZSArIG9mZnNldHMubGluZXM7XG4gIGlmIChvZmZzZXRzLmxpbmVzKSB7XG4gICAgY29sdW1uID0gb2Zmc2V0cy5jb2x1bW5zO1xuICB9IGVsc2Uge1xuICAgIGNvbHVtbiA9IGNvbHVtbiArIG9mZnNldHMuY29sdW1ucztcbiAgfVxuXG4gIHRva2VuaXplci5saW5lID0gbGluZTtcbiAgdG9rZW5pemVyLmNvbHVtbiA9IGNvbHVtbjtcbn1cblxuZnVuY3Rpb24gYWNjZXB0Q2FsbE5vZGVzKFxuICBjb21waWxlcjogSGFuZGxlYmFyc05vZGVWaXNpdG9ycyxcbiAgbm9kZToge1xuICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICBwYXJhbXM6IEhCUy5FeHByZXNzaW9uW107XG4gICAgaGFzaDogSEJTLkhhc2g7XG4gIH1cbik6IHsgcGF0aDogQVNULlBhdGhFeHByZXNzaW9uOyBwYXJhbXM6IEFTVC5FeHByZXNzaW9uW107IGhhc2g6IEFTVC5IYXNoIH0ge1xuICBsZXQgcGF0aCA9IGNvbXBpbGVyLlBhdGhFeHByZXNzaW9uKG5vZGUucGF0aCk7XG5cbiAgbGV0IHBhcmFtcyA9IG5vZGUucGFyYW1zID8gbm9kZS5wYXJhbXMubWFwKChlKSA9PiBjb21waWxlci5hY2NlcHROb2RlPEFTVC5FeHByZXNzaW9uPihlKSkgOiBbXTtcbiAgbGV0IGhhc2ggPSBub2RlLmhhc2ggPyBjb21waWxlci5IYXNoKG5vZGUuaGFzaCkgOiBiLmhhc2goKTtcblxuICByZXR1cm4geyBwYXRoLCBwYXJhbXMsIGhhc2ggfTtcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudE1vZGlmaWVyKGVsZW1lbnQ6IFRhZzwnU3RhcnRUYWcnPiwgbXVzdGFjaGU6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCkge1xuICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYyB9ID0gbXVzdGFjaGU7XG5cbiAgaWYgKGlzTGl0ZXJhbChwYXRoKSkge1xuICAgIGxldCBtb2RpZmllciA9IGB7eyR7cHJpbnRMaXRlcmFsKHBhdGgpfX19YDtcbiAgICBsZXQgdGFnID0gYDwke2VsZW1lbnQubmFtZX0gLi4uICR7bW9kaWZpZXJ9IC4uLmA7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSW4gJHt0YWd9LCAke21vZGlmaWVyfSBpcyBub3QgYSB2YWxpZCBtb2RpZmllcjogXCIke3BhdGgub3JpZ2luYWx9XCIgb24gbGluZSAke1xuICAgICAgICBsb2MgJiYgbG9jLnN0YXJ0LmxpbmVcbiAgICAgIH0uYCxcbiAgICAgIG11c3RhY2hlLmxvY1xuICAgICk7XG4gIH1cblxuICBsZXQgbW9kaWZpZXIgPSBiLmVsZW1lbnRNb2RpZmllcihwYXRoLCBwYXJhbXMsIGhhc2gsIGxvYyk7XG4gIGVsZW1lbnQubW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KGF0dHJpYnV0ZTogQXR0cmlidXRlLCBwYXJ0OiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgYXR0cmlidXRlLmlzRHluYW1pYyA9IHRydWU7XG4gIGF0dHJpYnV0ZS5wYXJ0cy5wdXNoKHBhcnQpO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==