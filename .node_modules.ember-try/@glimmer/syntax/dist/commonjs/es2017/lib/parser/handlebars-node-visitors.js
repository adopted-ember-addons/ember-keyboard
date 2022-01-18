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

class HandlebarsNodeVisitors extends _parser.Parser {
  get isTopLevel() {
    return this.elementStack.length === 0;
  }

  Program(program) {
    let body = [];
    let node;

    if (this.isTopLevel) {
      node = _builders.default.template(body, program.blockParams, program.loc);
    } else {
      node = _builders.default.blockItself(body, program.blockParams, program.chained, program.loc);
    }

    let i,
        l = program.body.length;
    this.elementStack.push(node);

    if (l === 0) {
      return this.elementStack.pop();
    }

    for (i = 0; i < l; i++) {
      this.acceptNode(program.body[i]);
    } // Ensure that that the element stack is balanced properly.


    let poppedNode = this.elementStack.pop();

    if (poppedNode !== node) {
      let elementNode = poppedNode;
      throw new _syntaxError.default('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
    }

    return node;
  }

  BlockStatement(block) {
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

    let {
      path,
      params,
      hash
    } = acceptCallNodes(this, block);
    let program = this.Program(block.program);
    let inverse = block.inverse ? this.Program(block.inverse) : null;

    let node = _builders.default.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);

    let parentProgram = this.currentElement();
    (0, _utils.appendChild)(parentProgram, node);
  }

  MustacheStatement(rawMustache) {
    let {
      tokenizer
    } = this;

    if (tokenizer.state === 'comment') {
      this.appendToCommentData(this.sourceForNode(rawMustache));
      return;
    }

    let mustache;
    let {
      escaped,
      loc,
      strip
    } = rawMustache;

    if ((0, _utils.isLiteral)(rawMustache.path)) {
      mustache = {
        type: 'MustacheStatement',
        path: this.acceptNode(rawMustache.path),
        params: [],
        hash: _builders.default.hash(),
        escaped,
        loc,
        strip
      };
    } else {
      let {
        path,
        params,
        hash
      } = acceptCallNodes(this, rawMustache);
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
        throw new _syntaxError.default(`Cannot use mustaches in an elements tagname: \`${this.sourceForNode(rawMustache, rawMustache.path)}\` at L${loc.start.line}:C${loc.start.column}`, mustache.loc);

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
  }

  ContentStatement(content) {
    updateTokenizerLocation(this.tokenizer, content);
    this.tokenizer.tokenizePart(content.value);
    this.tokenizer.flushData();
  }

  CommentStatement(rawComment) {
    let {
      tokenizer
    } = this;

    if (tokenizer.state === "comment"
    /* comment */
    ) {
        this.appendToCommentData(this.sourceForNode(rawComment));
        return null;
      }

    let {
      value,
      loc
    } = rawComment;

    let comment = _builders.default.mustacheComment(value, loc);

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
        throw new _syntaxError.default(`Using a Handlebars comment when in the \`${tokenizer['state']}\` state is not supported: "${comment.value}" on line ${loc.start.line}:${loc.start.column}`, rawComment.loc);
    }

    return comment;
  }

  PartialStatement(partial) {
    let {
      loc
    } = partial;
    throw new _syntaxError.default(`Handlebars partials are not supported: "${this.sourceForNode(partial, partial.name)}" at L${loc.start.line}:C${loc.start.column}`, partial.loc);
  }

  PartialBlockStatement(partialBlock) {
    let {
      loc
    } = partialBlock;
    throw new _syntaxError.default(`Handlebars partial blocks are not supported: "${this.sourceForNode(partialBlock, partialBlock.name)}" at L${loc.start.line}:C${loc.start.column}`, partialBlock.loc);
  }

  Decorator(decorator) {
    let {
      loc
    } = decorator;
    throw new _syntaxError.default(`Handlebars decorators are not supported: "${this.sourceForNode(decorator, decorator.path)}" at L${loc.start.line}:C${loc.start.column}`, decorator.loc);
  }

  DecoratorBlock(decoratorBlock) {
    let {
      loc
    } = decoratorBlock;
    throw new _syntaxError.default(`Handlebars decorator blocks are not supported: "${this.sourceForNode(decoratorBlock, decoratorBlock.path)}" at L${loc.start.line}:C${loc.start.column}`, decoratorBlock.loc);
  }

  SubExpression(sexpr) {
    let {
      path,
      params,
      hash
    } = acceptCallNodes(this, sexpr);
    return _builders.default.sexpr(path, params, hash, sexpr.loc);
  }

  PathExpression(path) {
    let {
      original,
      loc
    } = path;
    let parts;

    if (original.indexOf('/') !== -1) {
      if (original.slice(0, 2) === './') {
        throw new _syntaxError.default(`Using "./" is not supported in Glimmer and unnecessary: "${path.original}" on line ${loc.start.line}.`, path.loc);
      }

      if (original.slice(0, 3) === '../') {
        throw new _syntaxError.default(`Changing context using "../" is not supported in Glimmer: "${path.original}" on line ${loc.start.line}.`, path.loc);
      }

      if (original.indexOf('.') !== -1) {
        throw new _syntaxError.default(`Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths: "${path.original}" on line ${loc.start.line}.`, path.loc);
      }

      parts = [path.parts.join('/')];
    } else if (original === '.') {
      let locationInfo = `L${loc.start.line}:C${loc.start.column}`;
      throw new _syntaxError.default(`'.' is not a supported path in Glimmer; check for a path with a trailing '.' at ${locationInfo}.`, path.loc);
    } else {
      parts = path.parts;
    }

    let thisHead = false; // This is to fix a bug in the Handlebars AST where the path expressions in
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
      parts,
      data: path.data,
      loc: path.loc
    };
  }

  Hash(hash) {
    let pairs = [];

    for (let i = 0; i < hash.pairs.length; i++) {
      let pair = hash.pairs[i];
      pairs.push(_builders.default.pair(pair.key, this.acceptNode(pair.value), pair.loc));
    }

    return _builders.default.hash(pairs, hash.loc);
  }

  StringLiteral(string) {
    return _builders.default.literal('StringLiteral', string.value, string.loc);
  }

  BooleanLiteral(boolean) {
    return _builders.default.literal('BooleanLiteral', boolean.value, boolean.loc);
  }

  NumberLiteral(number) {
    return _builders.default.literal('NumberLiteral', number.value, number.loc);
  }

  UndefinedLiteral(undef) {
    return _builders.default.literal('UndefinedLiteral', undefined, undef.loc);
  }

  NullLiteral(nul) {
    return _builders.default.literal('NullLiteral', null, nul.loc);
  }

}

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


  let difference = original.split(value)[0];
  let lines = difference.split(/\n/);
  let lineCount = lines.length - 1;
  return {
    lines: lineCount,
    columns: lines[lineCount].length
  };
}

function updateTokenizerLocation(tokenizer, content) {
  let line = content.loc.start.line;
  let column = content.loc.start.column;
  let offsets = calculateRightStrippedOffsets(content.original, content.value);
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
  let path = compiler.PathExpression(node.path);
  let params = node.params ? node.params.map(e => compiler.acceptNode(e)) : [];
  let hash = node.hash ? compiler.Hash(node.hash) : _builders.default.hash();
  return {
    path,
    params,
    hash
  };
}

function addElementModifier(element, mustache) {
  let {
    path,
    params,
    hash,
    loc
  } = mustache;

  if ((0, _utils.isLiteral)(path)) {
    let modifier = `{{${(0, _utils.printLiteral)(path)}}}`;
    let tag = `<${element.name} ... ${modifier} ...`;
    throw new _syntaxError.default(`In ${tag}, ${modifier} is not a valid modifier: "${path.original}" on line ${loc && loc.start.line}.`, mustache.loc);
  }

  let modifier = _builders.default.elementModifier(path, params, hash, loc);

  element.modifiers.push(modifier);
}

function appendDynamicAttributeValuePart(attribute, part) {
  attribute.isDynamic = true;
  attribute.parts.push(part);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBR0E7O0FBQ0E7Ozs7QUFLTSxNQUFBLHNCQUFBLFNBQUEsY0FBQSxDQUFxRDtBQUt6RCxNQUFBLFVBQUEsR0FBc0I7QUFDcEIsV0FBTyxLQUFBLFlBQUEsQ0FBQSxNQUFBLEtBQVAsQ0FBQTtBQUNEOztBQUtELEVBQUEsT0FBTyxDQUFBLE9BQUEsRUFBcUI7QUFDMUIsUUFBSSxJQUFJLEdBQVIsRUFBQTtBQUNBLFFBQUEsSUFBQTs7QUFFQSxRQUFJLEtBQUosVUFBQSxFQUFxQjtBQUNuQixNQUFBLElBQUksR0FBRyxrQkFBQSxRQUFBLENBQUEsSUFBQSxFQUFpQixPQUFPLENBQXhCLFdBQUEsRUFBc0MsT0FBTyxDQUFwRCxHQUFPLENBQVA7QUFERixLQUFBLE1BRU87QUFDTCxNQUFBLElBQUksR0FBRyxrQkFBQSxXQUFBLENBQUEsSUFBQSxFQUFvQixPQUFPLENBQTNCLFdBQUEsRUFBeUMsT0FBTyxDQUFoRCxPQUFBLEVBQTBELE9BQU8sQ0FBeEUsR0FBTyxDQUFQO0FBQ0Q7O0FBRUQsUUFBQSxDQUFBO0FBQUEsUUFDRSxDQUFDLEdBQUcsT0FBTyxDQUFQLElBQUEsQ0FETixNQUFBO0FBR0EsU0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLElBQUE7O0FBRUEsUUFBSSxDQUFDLEtBQUwsQ0FBQSxFQUFhO0FBQ1gsYUFBTyxLQUFBLFlBQUEsQ0FBUCxHQUFPLEVBQVA7QUFDRDs7QUFFRCxTQUFLLENBQUMsR0FBTixDQUFBLEVBQVksQ0FBQyxHQUFiLENBQUEsRUFBbUIsQ0FBbkIsRUFBQSxFQUF3QjtBQUN0QixXQUFBLFVBQUEsQ0FBZ0IsT0FBTyxDQUFQLElBQUEsQ0FBaEIsQ0FBZ0IsQ0FBaEI7QUFwQndCLEtBQUEsQ0F1QjFCOzs7QUFD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LENBQVAsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Q7O0FBRUQsU0FBQSwrQkFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLEVBQTBGO0FBQ3hGLEVBQUEsU0FBUyxDQUFULFNBQUEsR0FBQSxJQUFBO0FBQ0EsRUFBQSxTQUFTLENBQVQsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYiBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgaXNMaXRlcmFsLCBwcmludExpdGVyYWwgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCB7IFBhcnNlciwgVGFnLCBBdHRyaWJ1dGUgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IFN5bnRheEVycm9yIGZyb20gJy4uL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBSZWNhc3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRva2VuaXplclN0YXRlIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMgZXh0ZW5kcyBQYXJzZXIge1xuICBhYnN0cmFjdCBhcHBlbmRUb0NvbW1lbnREYXRhKHM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlVmFsdWUocXVvdGVkOiBib29sZWFuKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQXR0cmlidXRlVmFsdWUoKTogdm9pZDtcblxuICBwcml2YXRlIGdldCBpc1RvcExldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggPT09IDA7XG4gIH1cblxuICBQcm9ncmFtKHByb2dyYW06IEhCUy5Qcm9ncmFtKTogQVNULkJsb2NrO1xuICBQcm9ncmFtKHByb2dyYW06IEhCUy5Qcm9ncmFtKTogQVNULlRlbXBsYXRlO1xuICBQcm9ncmFtKHByb2dyYW06IEhCUy5Qcm9ncmFtKTogQVNULlRlbXBsYXRlIHwgQVNULkJsb2NrO1xuICBQcm9ncmFtKHByb2dyYW06IEhCUy5Qcm9ncmFtKTogQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlIHtcbiAgICBsZXQgYm9keTogQVNULlN0YXRlbWVudFtdID0gW107XG4gICAgbGV0IG5vZGU7XG5cbiAgICBpZiAodGhpcy5pc1RvcExldmVsKSB7XG4gICAgICBub2RlID0gYi50ZW1wbGF0ZShib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmxvYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUgPSBiLmJsb2NrSXRzZWxmKGJvZHksIHByb2dyYW0uYmxvY2tQYXJhbXMsIHByb2dyYW0uY2hhaW5lZCwgcHJvZ3JhbS5sb2MpO1xuICAgIH1cblxuICAgIGxldCBpLFxuICAgICAgbCA9IHByb2dyYW0uYm9keS5sZW5ndGg7XG5cbiAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKG5vZGUpO1xuXG4gICAgaWYgKGwgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKSBhcyBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5hY2NlcHROb2RlKHByb2dyYW0uYm9keVtpXSk7XG4gICAgfVxuXG4gICAgLy8gRW5zdXJlIHRoYXQgdGhhdCB0aGUgZWxlbWVudCBzdGFjayBpcyBiYWxhbmNlZCBwcm9wZXJseS5cbiAgICBsZXQgcG9wcGVkTm9kZSA9IHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpO1xuICAgIGlmIChwb3BwZWROb2RlICE9PSBub2RlKSB7XG4gICAgICBsZXQgZWxlbWVudE5vZGUgPSBwb3BwZWROb2RlIGFzIEFTVC5FbGVtZW50Tm9kZTtcblxuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnVW5jbG9zZWQgZWxlbWVudCBgJyArIGVsZW1lbnROb2RlLnRhZyArICdgIChvbiBsaW5lICcgKyBlbGVtZW50Tm9kZS5sb2MhLnN0YXJ0LmxpbmUgKyAnKS4nLFxuICAgICAgICBlbGVtZW50Tm9kZS5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBCbG9ja1N0YXRlbWVudChibG9jazogSEJTLkJsb2NrU3RhdGVtZW50KTogQVNULkJsb2NrU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgaWYgKHRoaXMudG9rZW5pemVyLnN0YXRlID09PSBUb2tlbml6ZXJTdGF0ZS5jb21tZW50KSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKGJsb2NrKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy50b2tlbml6ZXIuc3RhdGUgIT09IFRva2VuaXplclN0YXRlLmRhdGEgJiZcbiAgICAgIHRoaXMudG9rZW5pemVyWydzdGF0ZSddICE9PSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVEYXRhXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICdBIGJsb2NrIG1heSBvbmx5IGJlIHVzZWQgaW5zaWRlIGFuIEhUTUwgZWxlbWVudCBvciBhbm90aGVyIGJsb2NrLicsXG4gICAgICAgIGJsb2NrLmxvY1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCBibG9jayk7XG4gICAgbGV0IHByb2dyYW0gPSB0aGlzLlByb2dyYW0oYmxvY2sucHJvZ3JhbSk7XG4gICAgbGV0IGludmVyc2UgPSBibG9jay5pbnZlcnNlID8gdGhpcy5Qcm9ncmFtKGJsb2NrLmludmVyc2UpIDogbnVsbDtcblxuICAgIGxldCBub2RlID0gYi5ibG9jayhcbiAgICAgIHBhdGgsXG4gICAgICBwYXJhbXMsXG4gICAgICBoYXNoLFxuICAgICAgcHJvZ3JhbSxcbiAgICAgIGludmVyc2UsXG4gICAgICBibG9jay5sb2MsXG4gICAgICBibG9jay5vcGVuU3RyaXAsXG4gICAgICBibG9jay5pbnZlcnNlU3RyaXAsXG4gICAgICBibG9jay5jbG9zZVN0cmlwXG4gICAgKTtcblxuICAgIGxldCBwYXJlbnRQcm9ncmFtID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgYXBwZW5kQ2hpbGQocGFyZW50UHJvZ3JhbSwgbm9kZSk7XG4gIH1cblxuICBNdXN0YWNoZVN0YXRlbWVudChyYXdNdXN0YWNoZTogSEJTLk11c3RhY2hlU3RhdGVtZW50KTogQVNULk11c3RhY2hlU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKHJhd011c3RhY2hlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQ7XG4gICAgbGV0IHsgZXNjYXBlZCwgbG9jLCBzdHJpcCB9ID0gcmF3TXVzdGFjaGU7XG5cbiAgICBpZiAoaXNMaXRlcmFsKHJhd011c3RhY2hlLnBhdGgpKSB7XG4gICAgICBtdXN0YWNoZSA9IHtcbiAgICAgICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICAgICAgcGF0aDogdGhpcy5hY2NlcHROb2RlPEFTVC5MaXRlcmFsPihyYXdNdXN0YWNoZS5wYXRoKSxcbiAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgaGFzaDogYi5oYXNoKCksXG4gICAgICAgIGVzY2FwZWQsXG4gICAgICAgIGxvYyxcbiAgICAgICAgc3RyaXAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2RlcyhcbiAgICAgICAgdGhpcyxcbiAgICAgICAgcmF3TXVzdGFjaGUgYXMgSEJTLk11c3RhY2hlU3RhdGVtZW50ICYge1xuICAgICAgICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIG11c3RhY2hlID0gYi5tdXN0YWNoZShwYXRoLCBwYXJhbXMsIGhhc2gsICFlc2NhcGVkLCBsb2MsIHN0cmlwKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHRva2VuaXplci5zdGF0ZSkge1xuICAgICAgLy8gVGFnIGhlbHBlcnNcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUudGFnT3BlbjpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUudGFnTmFtZTpcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBDYW5ub3QgdXNlIG11c3RhY2hlcyBpbiBhbiBlbGVtZW50cyB0YWduYW1lOiBcXGAke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgICAgIHJhd011c3RhY2hlLFxuICAgICAgICAgICAgcmF3TXVzdGFjaGUucGF0aFxuICAgICAgICAgICl9XFxgIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICAgICAgbXVzdGFjaGUubG9jXG4gICAgICAgICk7XG5cbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZTpcbiAgICAgICAgYWRkRWxlbWVudE1vZGlmaWVyKHRoaXMuY3VycmVudFN0YXJ0VGFnLCBtdXN0YWNoZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVOYW1lOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hZnRlckF0dHJpYnV0ZU5hbWU6XG4gICAgICAgIHRoaXMuYmVnaW5BdHRyaWJ1dGVWYWx1ZShmYWxzZSk7XG4gICAgICAgIHRoaXMuZmluaXNoQXR0cmlidXRlVmFsdWUoKTtcbiAgICAgICAgYWRkRWxlbWVudE1vZGlmaWVyKHRoaXMuY3VycmVudFN0YXJ0VGFnLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hZnRlckF0dHJpYnV0ZVZhbHVlUXVvdGVkOlxuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIEF0dHJpYnV0ZSB2YWx1ZXNcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlVmFsdWU6XG4gICAgICAgIHRoaXMuYmVnaW5BdHRyaWJ1dGVWYWx1ZShmYWxzZSk7XG4gICAgICAgIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQodGhpcy5jdXJyZW50QXR0cmlidXRlISwgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlVW5xdW90ZWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVEb3VibGVRdW90ZWQ6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlU2luZ2xlUXVvdGVkOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVVucXVvdGVkOlxuICAgICAgICBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KHRoaXMuY3VycmVudEF0dHJpYnV0ZSEsIG11c3RhY2hlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIFRPRE86IE9ubHkgYXBwZW5kIGNoaWxkIHdoZW4gdGhlIHRva2VuaXplciBzdGF0ZSBtYWtlc1xuICAgICAgLy8gc2Vuc2UgdG8gZG8gc28sIG90aGVyd2lzZSB0aHJvdyBhbiBlcnJvci5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgbXVzdGFjaGUpO1xuICAgIH1cblxuICAgIHJldHVybiBtdXN0YWNoZTtcbiAgfVxuXG4gIENvbnRlbnRTdGF0ZW1lbnQoY29udGVudDogSEJTLkNvbnRlbnRTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICB1cGRhdGVUb2tlbml6ZXJMb2NhdGlvbih0aGlzLnRva2VuaXplciwgY29udGVudCk7XG5cbiAgICB0aGlzLnRva2VuaXplci50b2tlbml6ZVBhcnQoY29udGVudC52YWx1ZSk7XG4gICAgdGhpcy50b2tlbml6ZXIuZmx1c2hEYXRhKCk7XG4gIH1cblxuICBDb21tZW50U3RhdGVtZW50KHJhd0NvbW1lbnQ6IEhCUy5Db21tZW50U3RhdGVtZW50KTogT3B0aW9uPEFTVC5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQ+IHtcbiAgICBsZXQgeyB0b2tlbml6ZXIgfSA9IHRoaXM7XG5cbiAgICBpZiAodG9rZW5pemVyLnN0YXRlID09PSBUb2tlbml6ZXJTdGF0ZS5jb21tZW50KSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKHJhd0NvbW1lbnQpKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB7IHZhbHVlLCBsb2MgfSA9IHJhd0NvbW1lbnQ7XG4gICAgbGV0IGNvbW1lbnQgPSBiLm11c3RhY2hlQ29tbWVudCh2YWx1ZSwgbG9jKTtcblxuICAgIHN3aXRjaCAodG9rZW5pemVyLnN0YXRlKSB7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWU6XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXJ0VGFnLmNvbW1lbnRzLnB1c2goY29tbWVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZURhdGE6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmRhdGE6XG4gICAgICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgY29tbWVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVzaW5nIGEgSGFuZGxlYmFycyBjb21tZW50IHdoZW4gaW4gdGhlIFxcYCR7dG9rZW5pemVyWydzdGF0ZSddfVxcYCBzdGF0ZSBpcyBub3Qgc3VwcG9ydGVkOiBcIiR7Y29tbWVudC52YWx1ZX1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9OiR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgICAgIHJhd0NvbW1lbnQubG9jXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbW1lbnQ7XG4gIH1cblxuICBQYXJ0aWFsU3RhdGVtZW50KHBhcnRpYWw6IEhCUy5QYXJ0aWFsU3RhdGVtZW50KTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gcGFydGlhbDtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIHBhcnRpYWxzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKHBhcnRpYWwsIHBhcnRpYWwubmFtZSl9XCIgYXQgTCR7XG4gICAgICAgIGxvYy5zdGFydC5saW5lXG4gICAgICB9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIHBhcnRpYWwubG9jXG4gICAgKTtcbiAgfVxuXG4gIFBhcnRpYWxCbG9ja1N0YXRlbWVudChwYXJ0aWFsQmxvY2s6IEhCUy5QYXJ0aWFsQmxvY2tTdGF0ZW1lbnQpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBwYXJ0aWFsQmxvY2s7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBwYXJ0aWFsIGJsb2NrcyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgcGFydGlhbEJsb2NrLFxuICAgICAgICBwYXJ0aWFsQmxvY2submFtZVxuICAgICAgKX1cIiBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgcGFydGlhbEJsb2NrLmxvY1xuICAgICk7XG4gIH1cblxuICBEZWNvcmF0b3IoZGVjb3JhdG9yOiBIQlMuRGVjb3JhdG9yKTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gZGVjb3JhdG9yO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgZGVjb3JhdG9ycyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgZGVjb3JhdG9yLFxuICAgICAgICBkZWNvcmF0b3IucGF0aFxuICAgICAgKX1cIiBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgZGVjb3JhdG9yLmxvY1xuICAgICk7XG4gIH1cblxuICBEZWNvcmF0b3JCbG9jayhkZWNvcmF0b3JCbG9jazogSEJTLkRlY29yYXRvckJsb2NrKTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gZGVjb3JhdG9yQmxvY2s7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBkZWNvcmF0b3IgYmxvY2tzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBkZWNvcmF0b3JCbG9jayxcbiAgICAgICAgZGVjb3JhdG9yQmxvY2sucGF0aFxuICAgICAgKX1cIiBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgZGVjb3JhdG9yQmxvY2subG9jXG4gICAgKTtcbiAgfVxuXG4gIFN1YkV4cHJlc3Npb24oc2V4cHI6IEhCUy5TdWJFeHByZXNzaW9uKTogQVNULlN1YkV4cHJlc3Npb24ge1xuICAgIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCB9ID0gYWNjZXB0Q2FsbE5vZGVzKHRoaXMsIHNleHByKTtcbiAgICByZXR1cm4gYi5zZXhwcihwYXRoLCBwYXJhbXMsIGhhc2gsIHNleHByLmxvYyk7XG4gIH1cblxuICBQYXRoRXhwcmVzc2lvbihwYXRoOiBIQlMuUGF0aEV4cHJlc3Npb24pOiBBU1QuUGF0aEV4cHJlc3Npb24ge1xuICAgIGxldCB7IG9yaWdpbmFsLCBsb2MgfSA9IHBhdGg7XG4gICAgbGV0IHBhcnRzOiBzdHJpbmdbXTtcblxuICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcvJykgIT09IC0xKSB7XG4gICAgICBpZiAob3JpZ2luYWwuc2xpY2UoMCwgMikgPT09ICcuLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBVc2luZyBcIi4vXCIgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyIGFuZCB1bm5lY2Vzc2FyeTogXCIke3BhdGgub3JpZ2luYWx9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfS5gLFxuICAgICAgICAgIHBhdGgubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAob3JpZ2luYWwuc2xpY2UoMCwgMykgPT09ICcuLi8nKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgQ2hhbmdpbmcgY29udGV4dCB1c2luZyBcIi4uL1wiIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lcjogXCIke3BhdGgub3JpZ2luYWx9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfS5gLFxuICAgICAgICAgIHBhdGgubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignLicpICE9PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYE1peGluZyAnLicgYW5kICcvJyBpbiBwYXRocyBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXI7IHVzZSBvbmx5ICcuJyB0byBzZXBhcmF0ZSBwcm9wZXJ0eSBwYXRoczogXCIke3BhdGgub3JpZ2luYWx9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfS5gLFxuICAgICAgICAgIHBhdGgubG9jXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBwYXJ0cyA9IFtwYXRoLnBhcnRzLmpvaW4oJy8nKV07XG4gICAgfSBlbHNlIGlmIChvcmlnaW5hbCA9PT0gJy4nKSB7XG4gICAgICBsZXQgbG9jYXRpb25JbmZvID0gYEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWA7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgIGAnLicgaXMgbm90IGEgc3VwcG9ydGVkIHBhdGggaW4gR2xpbW1lcjsgY2hlY2sgZm9yIGEgcGF0aCB3aXRoIGEgdHJhaWxpbmcgJy4nIGF0ICR7bG9jYXRpb25JbmZvfS5gLFxuICAgICAgICBwYXRoLmxvY1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMgPSBwYXRoLnBhcnRzO1xuICAgIH1cblxuICAgIGxldCB0aGlzSGVhZCA9IGZhbHNlO1xuXG4gICAgLy8gVGhpcyBpcyB0byBmaXggYSBidWcgaW4gdGhlIEhhbmRsZWJhcnMgQVNUIHdoZXJlIHRoZSBwYXRoIGV4cHJlc3Npb25zIGluXG4gICAgLy8gYHt7dGhpcy5mb299fWAgKGFuZCBzaW1pbGFybHkgYHt7Zm9vLWJhciB0aGlzLmZvbyBuYW1lZD10aGlzLmZvb319YCBldGMpXG4gICAgLy8gYXJlIHNpbXBseSB0dXJuZWQgaW50byBge3tmb299fWAuIFRoZSBmaXggaXMgdG8gcHVzaCBpdCBiYWNrIG9udG8gdGhlXG4gICAgLy8gcGFydHMgYXJyYXkgYW5kIGxldCB0aGUgcnVudGltZSBzZWUgdGhlIGRpZmZlcmVuY2UuIEhvd2V2ZXIsIHdlIGNhbm5vdFxuICAgIC8vIHNpbXBseSB1c2UgdGhlIHN0cmluZyBgdGhpc2AgYXMgaXQgbWVhbnMgbGl0ZXJhbGx5IHRoZSBwcm9wZXJ0eSBjYWxsZWRcbiAgICAvLyBcInRoaXNcIiBpbiB0aGUgY3VycmVudCBjb250ZXh0IChpdCBjYW4gYmUgZXhwcmVzc2VkIGluIHRoZSBzeW50YXggYXNcbiAgICAvLyBge3tbdGhpc119fWAsIHdoZXJlIHRoZSBzcXVhcmUgYnJhY2tldCBhcmUgZ2VuZXJhbGx5IGZvciB0aGlzIGtpbmQgb2ZcbiAgICAvLyBlc2NhcGluZyDigJMgc3VjaCBhcyBge3tmb28uW1wiYmFyLmJhelwiXX19YCB3b3VsZCBtZWFuIGxvb2t1cCBhIHByb3BlcnR5XG4gICAgLy8gbmFtZWQgbGl0ZXJhbGx5IFwiYmFyLmJhelwiIG9uIGB0aGlzLmZvb2ApLiBCeSBjb252ZW50aW9uLCB3ZSB1c2UgYG51bGxgXG4gICAgLy8gZm9yIHRoaXMgcHVycG9zZS5cbiAgICBpZiAob3JpZ2luYWwubWF0Y2goL150aGlzKFxcLi4rKT8kLykpIHtcbiAgICAgIHRoaXNIZWFkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ1BhdGhFeHByZXNzaW9uJyxcbiAgICAgIG9yaWdpbmFsOiBwYXRoLm9yaWdpbmFsLFxuICAgICAgdGhpczogdGhpc0hlYWQsXG4gICAgICBwYXJ0cyxcbiAgICAgIGRhdGE6IHBhdGguZGF0YSxcbiAgICAgIGxvYzogcGF0aC5sb2MsXG4gICAgfTtcbiAgfVxuXG4gIEhhc2goaGFzaDogSEJTLkhhc2gpOiBBU1QuSGFzaCB7XG4gICAgbGV0IHBhaXJzOiBBU1QuSGFzaFBhaXJbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoYXNoLnBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgcGFpciA9IGhhc2gucGFpcnNbaV07XG4gICAgICBwYWlycy5wdXNoKGIucGFpcihwYWlyLmtleSwgdGhpcy5hY2NlcHROb2RlKHBhaXIudmFsdWUpLCBwYWlyLmxvYykpO1xuICAgIH1cblxuICAgIHJldHVybiBiLmhhc2gocGFpcnMsIGhhc2gubG9jKTtcbiAgfVxuXG4gIFN0cmluZ0xpdGVyYWwoc3RyaW5nOiBIQlMuU3RyaW5nTGl0ZXJhbCk6IEFTVC5TdHJpbmdMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdTdHJpbmdMaXRlcmFsJywgc3RyaW5nLnZhbHVlLCBzdHJpbmcubG9jKTtcbiAgfVxuXG4gIEJvb2xlYW5MaXRlcmFsKGJvb2xlYW46IEhCUy5Cb29sZWFuTGl0ZXJhbCk6IEFTVC5Cb29sZWFuTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnQm9vbGVhbkxpdGVyYWwnLCBib29sZWFuLnZhbHVlLCBib29sZWFuLmxvYyk7XG4gIH1cblxuICBOdW1iZXJMaXRlcmFsKG51bWJlcjogSEJTLk51bWJlckxpdGVyYWwpOiBBU1QuTnVtYmVyTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnTnVtYmVyTGl0ZXJhbCcsIG51bWJlci52YWx1ZSwgbnVtYmVyLmxvYyk7XG4gIH1cblxuICBVbmRlZmluZWRMaXRlcmFsKHVuZGVmOiBIQlMuVW5kZWZpbmVkTGl0ZXJhbCk6IEFTVC5VbmRlZmluZWRMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdVbmRlZmluZWRMaXRlcmFsJywgdW5kZWZpbmVkLCB1bmRlZi5sb2MpO1xuICB9XG5cbiAgTnVsbExpdGVyYWwobnVsOiBIQlMuTnVsbExpdGVyYWwpOiBBU1QuTnVsbExpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ051bGxMaXRlcmFsJywgbnVsbCwgbnVsLmxvYyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2FsY3VsYXRlUmlnaHRTdHJpcHBlZE9mZnNldHMob3JpZ2luYWw6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgLy8gaWYgaXQgaXMgZW1wdHksIGp1c3QgcmV0dXJuIHRoZSBjb3VudCBvZiBuZXdsaW5lc1xuICAgIC8vIGluIG9yaWdpbmFsXG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbmVzOiBvcmlnaW5hbC5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMSxcbiAgICAgIGNvbHVtbnM6IDAsXG4gICAgfTtcbiAgfVxuXG4gIC8vIG90aGVyd2lzZSwgcmV0dXJuIHRoZSBudW1iZXIgb2YgbmV3bGluZXMgcHJpb3IgdG9cbiAgLy8gYHZhbHVlYFxuICBsZXQgZGlmZmVyZW5jZSA9IG9yaWdpbmFsLnNwbGl0KHZhbHVlKVswXTtcbiAgbGV0IGxpbmVzID0gZGlmZmVyZW5jZS5zcGxpdCgvXFxuLyk7XG4gIGxldCBsaW5lQ291bnQgPSBsaW5lcy5sZW5ndGggLSAxO1xuXG4gIHJldHVybiB7XG4gICAgbGluZXM6IGxpbmVDb3VudCxcbiAgICBjb2x1bW5zOiBsaW5lc1tsaW5lQ291bnRdLmxlbmd0aCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlVG9rZW5pemVyTG9jYXRpb24odG9rZW5pemVyOiBQYXJzZXJbJ3Rva2VuaXplciddLCBjb250ZW50OiBIQlMuQ29udGVudFN0YXRlbWVudCkge1xuICBsZXQgbGluZSA9IGNvbnRlbnQubG9jLnN0YXJ0LmxpbmU7XG4gIGxldCBjb2x1bW4gPSBjb250ZW50LmxvYy5zdGFydC5jb2x1bW47XG5cbiAgbGV0IG9mZnNldHMgPSBjYWxjdWxhdGVSaWdodFN0cmlwcGVkT2Zmc2V0cyhcbiAgICBjb250ZW50Lm9yaWdpbmFsIGFzIFJlY2FzdDxIQlMuU3RyaXBGbGFncywgc3RyaW5nPixcbiAgICBjb250ZW50LnZhbHVlXG4gICk7XG5cbiAgbGluZSA9IGxpbmUgKyBvZmZzZXRzLmxpbmVzO1xuICBpZiAob2Zmc2V0cy5saW5lcykge1xuICAgIGNvbHVtbiA9IG9mZnNldHMuY29sdW1ucztcbiAgfSBlbHNlIHtcbiAgICBjb2x1bW4gPSBjb2x1bW4gKyBvZmZzZXRzLmNvbHVtbnM7XG4gIH1cblxuICB0b2tlbml6ZXIubGluZSA9IGxpbmU7XG4gIHRva2VuaXplci5jb2x1bW4gPSBjb2x1bW47XG59XG5cbmZ1bmN0aW9uIGFjY2VwdENhbGxOb2RlcyhcbiAgY29tcGlsZXI6IEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMsXG4gIG5vZGU6IHtcbiAgICBwYXRoOiBIQlMuUGF0aEV4cHJlc3Npb247XG4gICAgcGFyYW1zOiBIQlMuRXhwcmVzc2lvbltdO1xuICAgIGhhc2g6IEhCUy5IYXNoO1xuICB9XG4pOiB7IHBhdGg6IEFTVC5QYXRoRXhwcmVzc2lvbjsgcGFyYW1zOiBBU1QuRXhwcmVzc2lvbltdOyBoYXNoOiBBU1QuSGFzaCB9IHtcbiAgbGV0IHBhdGggPSBjb21waWxlci5QYXRoRXhwcmVzc2lvbihub2RlLnBhdGgpO1xuXG4gIGxldCBwYXJhbXMgPSBub2RlLnBhcmFtcyA/IG5vZGUucGFyYW1zLm1hcCgoZSkgPT4gY29tcGlsZXIuYWNjZXB0Tm9kZTxBU1QuRXhwcmVzc2lvbj4oZSkpIDogW107XG4gIGxldCBoYXNoID0gbm9kZS5oYXNoID8gY29tcGlsZXIuSGFzaChub2RlLmhhc2gpIDogYi5oYXNoKCk7XG5cbiAgcmV0dXJuIHsgcGF0aCwgcGFyYW1zLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRNb2RpZmllcihlbGVtZW50OiBUYWc8J1N0YXJ0VGFnJz4sIG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MgfSA9IG11c3RhY2hlO1xuXG4gIGlmIChpc0xpdGVyYWwocGF0aCkpIHtcbiAgICBsZXQgbW9kaWZpZXIgPSBge3ske3ByaW50TGl0ZXJhbChwYXRoKX19fWA7XG4gICAgbGV0IHRhZyA9IGA8JHtlbGVtZW50Lm5hbWV9IC4uLiAke21vZGlmaWVyfSAuLi5gO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEluICR7dGFnfSwgJHttb2RpZmllcn0gaXMgbm90IGEgdmFsaWQgbW9kaWZpZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtcbiAgICAgICAgbG9jICYmIGxvYy5zdGFydC5saW5lXG4gICAgICB9LmAsXG4gICAgICBtdXN0YWNoZS5sb2NcbiAgICApO1xuICB9XG5cbiAgbGV0IG1vZGlmaWVyID0gYi5lbGVtZW50TW9kaWZpZXIocGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MpO1xuICBlbGVtZW50Lm1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydChhdHRyaWJ1dGU6IEF0dHJpYnV0ZSwgcGFydDogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGF0dHJpYnV0ZS5pc0R5bmFtaWMgPSB0cnVlO1xuICBhdHRyaWJ1dGUucGFydHMucHVzaChwYXJ0KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=