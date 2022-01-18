import { voidMap } from '../parser/tokenizer-event-handlers';
import { escapeText, escapeAttrValue } from './util';
const NON_WHITESPACE = /\S/;
export default class Printer {
  constructor(options) {
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


  handledByOverride(node, ensureLeadingWhitespace = false) {
    if (this.options.override !== undefined) {
      let result = this.options.override(node, this.options);

      if (typeof result === 'string') {
        if (ensureLeadingWhitespace && result !== '' && NON_WHITESPACE.test(result[0])) {
          result = ` ${result}`;
        }

        this.buffer += result;
        return true;
      }
    }

    return false;
  }

  Node(node) {
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
  }

  Expression(expression) {
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
  }

  Literal(literal) {
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
  }

  TopLevelStatement(statement) {
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
  }

  Block(block) {
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
      let firstChild = block.body[0];
      firstChild.chained = true;
    }

    if (this.handledByOverride(block)) {
      return;
    }

    this.TopLevelStatements(block.body);
  }

  TopLevelStatements(statements) {
    statements.forEach(statement => this.TopLevelStatement(statement));
  }

  ElementNode(el) {
    if (this.handledByOverride(el)) {
      return;
    }

    this.OpenElementNode(el);
    this.TopLevelStatements(el.children);
    this.CloseElementNode(el);
  }

  OpenElementNode(el) {
    this.buffer += `<${el.tag}`;

    if (el.attributes.length) {
      el.attributes.forEach(attr => {
        this.buffer += ' ';
        this.AttrNode(attr);
      });
    }

    if (el.modifiers.length) {
      el.modifiers.forEach(mod => {
        this.buffer += ' ';
        this.ElementModifierStatement(mod);
      });
    }

    if (el.comments.length) {
      el.comments.forEach(comment => {
        this.buffer += ' ';
        this.MustacheCommentStatement(comment);
      });
    }

    if (el.blockParams.length) {
      this.BlockParams(el.blockParams);
    }

    if (el.selfClosing) {
      this.buffer += ' /';
    }

    this.buffer += '>';
  }

  CloseElementNode(el) {
    if (el.selfClosing || voidMap[el.tag.toLowerCase()]) {
      return;
    }

    this.buffer += `</${el.tag}>`;
  }

  AttrNode(attr) {
    if (this.handledByOverride(attr)) {
      return;
    }

    let {
      name,
      value
    } = attr;
    this.buffer += name;

    if (value.type !== 'TextNode' || value.chars.length > 0) {
      this.buffer += '=';
      this.AttrNodeValue(value);
    }
  }

  AttrNodeValue(value) {
    if (value.type === 'TextNode') {
      this.buffer += '"';
      this.TextNode(value, true);
      this.buffer += '"';
    } else {
      this.Node(value);
    }
  }

  TextNode(text, isAttr) {
    if (this.handledByOverride(text)) {
      return;
    }

    if (this.options.entityEncoding === 'raw') {
      this.buffer += text.chars;
    } else if (isAttr) {
      this.buffer += escapeAttrValue(text.chars);
    } else {
      this.buffer += escapeText(text.chars);
    }
  }

  MustacheStatement(mustache) {
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
  }

  BlockStatement(block) {
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
  }

  BlockParams(blockParams) {
    this.buffer += ` as |${blockParams.join(' ')}|`;
  }

  PartialStatement(partial) {
    if (this.handledByOverride(partial)) {
      return;
    }

    this.buffer += '{{>';
    this.Expression(partial.name);
    this.Params(partial.params);
    this.Hash(partial.hash);
    this.buffer += '}}';
  }

  ConcatStatement(concat) {
    if (this.handledByOverride(concat)) {
      return;
    }

    this.buffer += '"';
    concat.parts.forEach(part => {
      if (part.type === 'TextNode') {
        this.TextNode(part, true);
      } else {
        this.Node(part);
      }
    });
    this.buffer += '"';
  }

  MustacheCommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }

    this.buffer += `{{!--${comment.value}--}}`;
  }

  ElementModifierStatement(mod) {
    if (this.handledByOverride(mod)) {
      return;
    }

    this.buffer += '{{';
    this.Expression(mod.path);
    this.Params(mod.params);
    this.Hash(mod.hash);
    this.buffer += '}}';
  }

  CommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }

    this.buffer += `<!--${comment.value}-->`;
  }

  PathExpression(path) {
    if (this.handledByOverride(path)) {
      return;
    }

    this.buffer += path.original;
  }

  SubExpression(sexp) {
    if (this.handledByOverride(sexp)) {
      return;
    }

    this.buffer += '(';
    this.Expression(sexp.path);
    this.Params(sexp.params);
    this.Hash(sexp.hash);
    this.buffer += ')';
  }

  Params(params) {
    // TODO: implement a top level Params AST node (just like the Hash object)
    // so that this can also be overridden
    if (params.length) {
      params.forEach(param => {
        this.buffer += ' ';
        this.Expression(param);
      });
    }
  }

  Hash(hash) {
    if (this.handledByOverride(hash, true)) {
      return;
    }

    hash.pairs.forEach(pair => {
      this.buffer += ' ';
      this.HashPair(pair);
    });
  }

  HashPair(pair) {
    if (this.handledByOverride(pair)) {
      return;
    }

    this.buffer += pair.key;
    this.buffer += '=';
    this.Node(pair.value);
  }

  StringLiteral(str) {
    if (this.handledByOverride(str)) {
      return;
    }

    this.buffer += JSON.stringify(str.value);
  }

  BooleanLiteral(bool) {
    if (this.handledByOverride(bool)) {
      return;
    }

    this.buffer += bool.value;
  }

  NumberLiteral(number) {
    if (this.handledByOverride(number)) {
      return;
    }

    this.buffer += number.value;
  }

  UndefinedLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }

    this.buffer += 'undefined';
  }

  NullLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }

    this.buffer += 'null';
  }

  print(node) {
    let {
      options
    } = this;

    if (options.override) {
      let result = options.override(node, options);

      if (result !== undefined) {
        return result;
      }
    }

    this.buffer = '';
    this.Node(node);
    return this.buffer;
  }

}

function unreachable(node, parentNodeType) {
  let {
    loc,
    type
  } = node;
  throw new Error(`Non-exhaustive node narrowing ${type} @ location: ${JSON.stringify(loc)} for parent ${parentNodeType}`);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvZ2VuZXJhdGlvbi9wcmludGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTRCQSxTQUFTLE9BQVQsUUFBd0Isb0NBQXhCO0FBQ0EsU0FBUyxVQUFULEVBQXFCLGVBQXJCLFFBQTRDLFFBQTVDO0FBRUEsTUFBTSxjQUFjLEdBQUcsSUFBdkI7QUFzQkEsZUFBYyxNQUFPLE9BQVAsQ0FBYztBQUkxQixFQUFBLFdBQUEsQ0FBWSxPQUFaLEVBQW1DO0FBSDNCLFNBQUEsTUFBQSxHQUFTLEVBQVQ7QUFJTixTQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0Q7QUFFRDs7Ozs7Ozs7OztBQVNBLEVBQUEsaUJBQWlCLENBQUMsSUFBRCxFQUFhLHVCQUF1QixHQUFHLEtBQXZDLEVBQTRDO0FBQzNELFFBQUksS0FBSyxPQUFMLENBQWEsUUFBYixLQUEwQixTQUE5QixFQUF5QztBQUN2QyxVQUFJLE1BQU0sR0FBRyxLQUFLLE9BQUwsQ0FBYSxRQUFiLENBQXNCLElBQXRCLEVBQTRCLEtBQUssT0FBakMsQ0FBYjs7QUFDQSxVQUFJLE9BQU8sTUFBUCxLQUFrQixRQUF0QixFQUFnQztBQUM5QixZQUFJLHVCQUF1QixJQUFJLE1BQU0sS0FBSyxFQUF0QyxJQUE0QyxjQUFjLENBQUMsSUFBZixDQUFvQixNQUFNLENBQUMsQ0FBRCxDQUExQixDQUFoRCxFQUFnRjtBQUM5RSxVQUFBLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBbkI7QUFDRDs7QUFFRCxhQUFLLE1BQUwsSUFBZSxNQUFmO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPLEtBQVA7QUFDRDs7QUFFRCxFQUFBLElBQUksQ0FBQyxJQUFELEVBQVc7QUFDYixZQUFRLElBQUksQ0FBQyxJQUFiO0FBQ0UsV0FBSyxtQkFBTDtBQUNBLFdBQUssZ0JBQUw7QUFDQSxXQUFLLGtCQUFMO0FBQ0EsV0FBSywwQkFBTDtBQUNBLFdBQUss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QXNCO0FBQ3BCLFVBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFSLENBQWlCLElBQWpCLEVBQXVCLE9BQXZCLENBQWI7O0FBRUEsVUFBSSxNQUFNLEtBQUssU0FBZixFQUEwQjtBQUN4QixlQUFPLE1BQVA7QUFDRDtBQUNGOztBQUVELFNBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxTQUFLLElBQUwsQ0FBVSxJQUFWO0FBQ0EsV0FBTyxLQUFLLE1BQVo7QUFDRDs7QUEvZXlCOztBQWtmNUIsU0FBUyxXQUFULENBQXFCLElBQXJCLEVBQWtDLGNBQWxDLEVBQXdEO0FBQ3RELE1BQUk7QUFBRSxJQUFBLEdBQUY7QUFBTyxJQUFBO0FBQVAsTUFBaUIsSUFBckI7QUFDQSxRQUFNLElBQUksS0FBSixDQUNKLGlDQUFpQyxJQUFJLGdCQUFnQixJQUFJLENBQUMsU0FBTCxDQUNuRCxHQURtRCxDQUVwRCxlQUFlLGNBQWMsRUFIMUIsQ0FBTjtBQUtEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXR0ck5vZGUsXG4gIEJsb2NrLFxuICBCbG9ja1N0YXRlbWVudCxcbiAgRWxlbWVudE5vZGUsXG4gIE11c3RhY2hlU3RhdGVtZW50LFxuICBOb2RlLFxuICBQcm9ncmFtLFxuICBUZXh0Tm9kZSxcbiAgUGFydGlhbFN0YXRlbWVudCxcbiAgQ29uY2F0U3RhdGVtZW50LFxuICBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQsXG4gIENvbW1lbnRTdGF0ZW1lbnQsXG4gIEVsZW1lbnRNb2RpZmllclN0YXRlbWVudCxcbiAgRXhwcmVzc2lvbixcbiAgUGF0aEV4cHJlc3Npb24sXG4gIFN1YkV4cHJlc3Npb24sXG4gIEhhc2gsXG4gIEhhc2hQYWlyLFxuICBMaXRlcmFsLFxuICBTdHJpbmdMaXRlcmFsLFxuICBCb29sZWFuTGl0ZXJhbCxcbiAgTnVtYmVyTGl0ZXJhbCxcbiAgVW5kZWZpbmVkTGl0ZXJhbCxcbiAgTnVsbExpdGVyYWwsXG4gIFRvcExldmVsU3RhdGVtZW50LFxuICBUZW1wbGF0ZSxcbn0gZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0IHsgdm9pZE1hcCB9IGZyb20gJy4uL3BhcnNlci90b2tlbml6ZXItZXZlbnQtaGFuZGxlcnMnO1xuaW1wb3J0IHsgZXNjYXBlVGV4dCwgZXNjYXBlQXR0clZhbHVlIH0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgTk9OX1dISVRFU1BBQ0UgPSAvXFxTLztcblxuZXhwb3J0IGludGVyZmFjZSBQcmludGVyT3B0aW9ucyB7XG4gIGVudGl0eUVuY29kaW5nOiAndHJhbnNmb3JtZWQnIHwgJ3Jhdyc7XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gb3ZlcnJpZGUgdGhlIG1lY2hhbmlzbSBvZiBwcmludGluZyBhIGdpdmVuIEFTVC5Ob2RlLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgZ2VuZXJhbGx5IG9ubHkgYmUgdXNlZnVsIHRvIHNvdXJjZSAtPiBzb3VyY2UgY29kZW1vZHNcbiAgICogd2hlcmUgeW91IHdvdWxkIGxpa2UgdG8gc3BlY2lhbGl6ZS9vdmVycmlkZSB0aGUgd2F5IGEgZ2l2ZW4gbm9kZSBpc1xuICAgKiBwcmludGVkIChlLmcuIHlvdSB3b3VsZCBsaWtlIHRvIHByZXNlcnZlIGFzIG11Y2ggb2YgdGhlIG9yaWdpbmFsXG4gICAqIGZvcm1hdHRpbmcgYXMgcG9zc2libGUpLlxuICAgKlxuICAgKiBXaGVuIHRoZSBwcm92aWRlZCBvdmVycmlkZSByZXR1cm5zIHVuZGVmaW5lZCwgdGhlIGRlZmF1bHQgYnVpbHQgaW4gcHJpbnRpbmdcbiAgICogd2lsbCBiZSBkb25lIGZvciB0aGUgQVNULk5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgdGhlIGFzdCBub2RlIHRvIGJlIHByaW50ZWRcbiAgICogQHBhcmFtIG9wdGlvbnMgdGhlIG9wdGlvbnMgc3BlY2lmaWVkIGR1cmluZyB0aGUgcHJpbnQoKSBpbnZvY2F0aW9uXG4gICAqL1xuICBvdmVycmlkZT8oYXN0OiBOb2RlLCBvcHRpb25zOiBQcmludGVyT3B0aW9ucyk6IHZvaWQgfCBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW50ZXIge1xuICBwcml2YXRlIGJ1ZmZlciA9ICcnO1xuICBwcml2YXRlIG9wdGlvbnM6IFByaW50ZXJPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFByaW50ZXJPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8qXG4gICAgVGhpcyBpcyB1c2VkIGJ5IF9hbGxfIG1ldGhvZHMgb24gdGhpcyBQcmludGVyIGNsYXNzIHRoYXQgYWRkIHRvIGB0aGlzLmJ1ZmZlcmAsXG4gICAgaXQgYWxsb3dzIGNvbnN1bWVycyBvZiB0aGUgcHJpbnRlciB0byB1c2UgYWx0ZXJuYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMgZm9yXG4gICAgYSBnaXZlbiBub2RlLlxuXG4gICAgVGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIHRoaXMgYXJlIHRoaW5ncyBsaWtlIHNvdXJjZSAtPiBzb3VyY2UgY29kZW1vZCB1dGlsaXRpZXMuXG4gICAgRm9yIGV4YW1wbGUsIGVtYmVyLXRlbXBsYXRlLXJlY2FzdCBhdHRlbXB0cyB0byBhbHdheXMgcHJlc2VydmUgdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgIGZvcm1hdHRpbmcgaW4gZWFjaCBBU1Qgbm9kZSBpZiBubyBtb2RpZmljYXRpb25zIGFyZSBtYWRlIHRvIGl0LlxuICAqL1xuICBoYW5kbGVkQnlPdmVycmlkZShub2RlOiBOb2RlLCBlbnN1cmVMZWFkaW5nV2hpdGVzcGFjZSA9IGZhbHNlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vdmVycmlkZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5vcHRpb25zLm92ZXJyaWRlKG5vZGUsIHRoaXMub3B0aW9ucyk7XG4gICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGVuc3VyZUxlYWRpbmdXaGl0ZXNwYWNlICYmIHJlc3VsdCAhPT0gJycgJiYgTk9OX1dISVRFU1BBQ0UudGVzdChyZXN1bHRbMF0pKSB7XG4gICAgICAgICAgcmVzdWx0ID0gYCAke3Jlc3VsdH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5idWZmZXIgKz0gcmVzdWx0O1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBOb2RlKG5vZGU6IE5vZGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSAnTXVzdGFjaGVTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQmxvY2tTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnUGFydGlhbFN0YXRlbWVudCc6XG4gICAgICBjYXNlICdNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnQ29tbWVudFN0YXRlbWVudCc6XG4gICAgICBjYXNlICdUZXh0Tm9kZSc6XG4gICAgICBjYXNlICdFbGVtZW50Tm9kZSc6XG4gICAgICBjYXNlICdBdHRyTm9kZSc6XG4gICAgICBjYXNlICdCbG9jayc6XG4gICAgICBjYXNlICdUZW1wbGF0ZSc6XG4gICAgICAgIHJldHVybiB0aGlzLlRvcExldmVsU3RhdGVtZW50KG5vZGUpO1xuICAgICAgY2FzZSAnU3RyaW5nTGl0ZXJhbCc6XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ1VuZGVmaW5lZExpdGVyYWwnOlxuICAgICAgY2FzZSAnTnVsbExpdGVyYWwnOlxuICAgICAgY2FzZSAnUGF0aEV4cHJlc3Npb24nOlxuICAgICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6XG4gICAgICAgIHJldHVybiB0aGlzLkV4cHJlc3Npb24obm9kZSk7XG4gICAgICBjYXNlICdQcm9ncmFtJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuQmxvY2sobm9kZSk7XG4gICAgICBjYXNlICdDb25jYXRTdGF0ZW1lbnQnOlxuICAgICAgICAvLyBzaG91bGQgaGF2ZSBhbiBBdHRyTm9kZSBwYXJlbnRcbiAgICAgICAgcmV0dXJuIHRoaXMuQ29uY2F0U3RhdGVtZW50KG5vZGUpO1xuICAgICAgY2FzZSAnSGFzaCc6XG4gICAgICAgIHJldHVybiB0aGlzLkhhc2gobm9kZSk7XG4gICAgICBjYXNlICdIYXNoUGFpcic6XG4gICAgICAgIHJldHVybiB0aGlzLkhhc2hQYWlyKG5vZGUpO1xuICAgICAgY2FzZSAnRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50KG5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiB1bnJlYWNoYWJsZShub2RlLCAnTm9kZScpO1xuICB9XG5cbiAgRXhwcmVzc2lvbihleHByZXNzaW9uOiBFeHByZXNzaW9uKTogdm9pZCB7XG4gICAgc3dpdGNoIChleHByZXNzaW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWwnOlxuICAgICAgY2FzZSAnQm9vbGVhbkxpdGVyYWwnOlxuICAgICAgY2FzZSAnTnVtYmVyTGl0ZXJhbCc6XG4gICAgICBjYXNlICdVbmRlZmluZWRMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ051bGxMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTGl0ZXJhbChleHByZXNzaW9uKTtcbiAgICAgIGNhc2UgJ1BhdGhFeHByZXNzaW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuUGF0aEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gICAgICBjYXNlICdTdWJFeHByZXNzaW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuU3ViRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHVucmVhY2hhYmxlKGV4cHJlc3Npb24sICdFeHByZXNzaW9uJyk7XG4gIH1cblxuICBMaXRlcmFsKGxpdGVyYWw6IExpdGVyYWwpIHtcbiAgICBzd2l0Y2ggKGxpdGVyYWwudHlwZSkge1xuICAgICAgY2FzZSAnU3RyaW5nTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLlN0cmluZ0xpdGVyYWwobGl0ZXJhbCk7XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLkJvb2xlYW5MaXRlcmFsKGxpdGVyYWwpO1xuICAgICAgY2FzZSAnTnVtYmVyTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLk51bWJlckxpdGVyYWwobGl0ZXJhbCk7XG4gICAgICBjYXNlICdVbmRlZmluZWRMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuVW5kZWZpbmVkTGl0ZXJhbChsaXRlcmFsKTtcbiAgICAgIGNhc2UgJ051bGxMaXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTnVsbExpdGVyYWwobGl0ZXJhbCk7XG4gICAgfVxuICAgIHJldHVybiB1bnJlYWNoYWJsZShsaXRlcmFsLCAnTGl0ZXJhbCcpO1xuICB9XG5cbiAgVG9wTGV2ZWxTdGF0ZW1lbnQoc3RhdGVtZW50OiBUb3BMZXZlbFN0YXRlbWVudCkge1xuICAgIHN3aXRjaCAoc3RhdGVtZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVTdGF0ZW1lbnQoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ0Jsb2NrU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuQmxvY2tTdGF0ZW1lbnQoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5QYXJ0aWFsU3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQoc3RhdGVtZW50KTtcbiAgICAgIGNhc2UgJ0NvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAgICByZXR1cm4gdGhpcy5Db21tZW50U3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdUZXh0Tm9kZSc6XG4gICAgICAgIHJldHVybiB0aGlzLlRleHROb2RlKHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdFbGVtZW50Tm9kZSc6XG4gICAgICAgIHJldHVybiB0aGlzLkVsZW1lbnROb2RlKHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdCbG9jayc6XG4gICAgICBjYXNlICdUZW1wbGF0ZSc6XG4gICAgICAgIHJldHVybiB0aGlzLkJsb2NrKHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdBdHRyTm9kZSc6XG4gICAgICAgIC8vIHNob3VsZCBoYXZlIGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIHRoaXMuQXR0ck5vZGUoc3RhdGVtZW50KTtcbiAgICB9XG4gICAgdW5yZWFjaGFibGUoc3RhdGVtZW50LCAnVG9wTGV2ZWxTdGF0ZW1lbnQnKTtcbiAgfVxuXG4gIEJsb2NrKGJsb2NrOiBCbG9jayB8IFByb2dyYW0gfCBUZW1wbGF0ZSk6IHZvaWQge1xuICAgIC8qXG4gICAgICBXaGVuIHByb2Nlc3NpbmcgYSB0ZW1wbGF0ZSBsaWtlOlxuXG4gICAgICBgYGBoYnNcbiAgICAgIHt7I2lmIHdoYXRldmVyfX1cbiAgICAgICAgd2hhdGV2ZXJcbiAgICAgIHt7ZWxzZSBpZiBzb21ldGhpbmdFbHNlfX1cbiAgICAgICAgc29tZXRoaW5nIGVsc2VcbiAgICAgIHt7ZWxzZX19XG4gICAgICAgIGZhbGxiYWNrXG4gICAgICB7ey9pZn19XG4gICAgICBgYGBcblxuICAgICAgVGhlIEFTVCBzdGlsbCBfZWZmZWN0aXZlbHlfIGxvb2tzIGxpa2U6XG5cbiAgICAgIGBgYGhic1xuICAgICAge3sjaWYgd2hhdGV2ZXJ9fVxuICAgICAgICB3aGF0ZXZlclxuICAgICAge3tlbHNlfX17eyNpZiBzb21ldGhpbmdFbHNlfX1cbiAgICAgICAgc29tZXRoaW5nIGVsc2VcbiAgICAgIHt7ZWxzZX19XG4gICAgICAgIGZhbGxiYWNrXG4gICAgICB7ey9pZn19e3svaWZ9fVxuICAgICAgYGBgXG5cbiAgICAgIFRoZSBvbmx5IHdheSB3ZSBjYW4gdGVsbCBpZiB0aGF0IGlzIHRoZSBjYXNlIGlzIGJ5IGNoZWNraW5nIGZvclxuICAgICAgYGJsb2NrLmNoYWluZWRgLCBidXQgdW5mb3J0dW5hdGVseSB3aGVuIHRoZSBhY3R1YWwgc3RhdGVtZW50cyBhcmVcbiAgICAgIHByb2Nlc3NlZCB0aGUgYGJsb2NrLmJvZHlbMF1gIG5vZGUgKHdoaWNoIHdpbGwgYWx3YXlzIGJlIGFcbiAgICAgIGBCbG9ja1N0YXRlbWVudGApIGhhcyBubyBjbHVlIHRoYXQgaXRzIGFuc2Nlc3RvciBgQmxvY2tgIG5vZGUgd2FzXG4gICAgICBjaGFpbmVkLlxuXG4gICAgICBUaGlzIFwiZm9yd2FyZHNcIiB0aGUgYGNoYWluZWRgIHNldHRpbmcgc28gdGhhdCB3ZSBjYW4gY2hlY2tcbiAgICAgIGl0IGxhdGVyIHdoZW4gcHJvY2Vzc2luZyB0aGUgYEJsb2NrU3RhdGVtZW50YC5cbiAgICAqL1xuICAgIGlmIChibG9jay5jaGFpbmVkKSB7XG4gICAgICBsZXQgZmlyc3RDaGlsZCA9IGJsb2NrLmJvZHlbMF0gYXMgQmxvY2tTdGF0ZW1lbnQ7XG4gICAgICBmaXJzdENoaWxkLmNoYWluZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGJsb2NrKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuVG9wTGV2ZWxTdGF0ZW1lbnRzKGJsb2NrLmJvZHkpO1xuICB9XG5cbiAgVG9wTGV2ZWxTdGF0ZW1lbnRzKHN0YXRlbWVudHM6IFRvcExldmVsU3RhdGVtZW50W10pIHtcbiAgICBzdGF0ZW1lbnRzLmZvckVhY2goKHN0YXRlbWVudCkgPT4gdGhpcy5Ub3BMZXZlbFN0YXRlbWVudChzdGF0ZW1lbnQpKTtcbiAgfVxuXG4gIEVsZW1lbnROb2RlKGVsOiBFbGVtZW50Tm9kZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGVsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuT3BlbkVsZW1lbnROb2RlKGVsKTtcbiAgICB0aGlzLlRvcExldmVsU3RhdGVtZW50cyhlbC5jaGlsZHJlbik7XG4gICAgdGhpcy5DbG9zZUVsZW1lbnROb2RlKGVsKTtcbiAgfVxuXG4gIE9wZW5FbGVtZW50Tm9kZShlbDogRWxlbWVudE5vZGUpOiB2b2lkIHtcbiAgICB0aGlzLmJ1ZmZlciArPSBgPCR7ZWwudGFnfWA7XG4gICAgaWYgKGVsLmF0dHJpYnV0ZXMubGVuZ3RoKSB7XG4gICAgICBlbC5hdHRyaWJ1dGVzLmZvckVhY2goKGF0dHIpID0+IHtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gJyAnO1xuICAgICAgICB0aGlzLkF0dHJOb2RlKGF0dHIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbC5tb2RpZmllcnMubGVuZ3RoKSB7XG4gICAgICBlbC5tb2RpZmllcnMuZm9yRWFjaCgobW9kKSA9PiB7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9ICcgJztcbiAgICAgICAgdGhpcy5FbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQobW9kKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWwuY29tbWVudHMubGVuZ3RoKSB7XG4gICAgICBlbC5jb21tZW50cy5mb3JFYWNoKChjb21tZW50KSA9PiB7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9ICcgJztcbiAgICAgICAgdGhpcy5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQoY29tbWVudCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsLmJsb2NrUGFyYW1zLmxlbmd0aCkge1xuICAgICAgdGhpcy5CbG9ja1BhcmFtcyhlbC5ibG9ja1BhcmFtcyk7XG4gICAgfVxuICAgIGlmIChlbC5zZWxmQ2xvc2luZykge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJyAvJztcbiAgICB9XG4gICAgdGhpcy5idWZmZXIgKz0gJz4nO1xuICB9XG5cbiAgQ2xvc2VFbGVtZW50Tm9kZShlbDogRWxlbWVudE5vZGUpOiB2b2lkIHtcbiAgICBpZiAoZWwuc2VsZkNsb3NpbmcgfHwgdm9pZE1hcFtlbC50YWcudG9Mb3dlckNhc2UoKV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5idWZmZXIgKz0gYDwvJHtlbC50YWd9PmA7XG4gIH1cblxuICBBdHRyTm9kZShhdHRyOiBBdHRyTm9kZSk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGF0dHIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHsgbmFtZSwgdmFsdWUgfSA9IGF0dHI7XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBuYW1lO1xuICAgIGlmICh2YWx1ZS50eXBlICE9PSAnVGV4dE5vZGUnIHx8IHZhbHVlLmNoYXJzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICc9JztcbiAgICAgIHRoaXMuQXR0ck5vZGVWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQXR0ck5vZGVWYWx1ZSh2YWx1ZTogQXR0ck5vZGVbJ3ZhbHVlJ10pIHtcbiAgICBpZiAodmFsdWUudHlwZSA9PT0gJ1RleHROb2RlJykge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJ1wiJztcbiAgICAgIHRoaXMuVGV4dE5vZGUodmFsdWUsIHRydWUpO1xuICAgICAgdGhpcy5idWZmZXIgKz0gJ1wiJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5Ob2RlKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBUZXh0Tm9kZSh0ZXh0OiBUZXh0Tm9kZSwgaXNBdHRyPzogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHRleHQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbnRpdHlFbmNvZGluZyA9PT0gJ3JhdycpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IHRleHQuY2hhcnM7XG4gICAgfSBlbHNlIGlmIChpc0F0dHIpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGVzY2FwZUF0dHJWYWx1ZSh0ZXh0LmNoYXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIgKz0gZXNjYXBlVGV4dCh0ZXh0LmNoYXJzKTtcbiAgICB9XG4gIH1cblxuICBNdXN0YWNoZVN0YXRlbWVudChtdXN0YWNoZTogTXVzdGFjaGVTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShtdXN0YWNoZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBtdXN0YWNoZS5lc2NhcGVkID8gJ3t7JyA6ICd7e3snO1xuXG4gICAgaWYgKG11c3RhY2hlLnN0cmlwLm9wZW4pIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICd+JztcbiAgICB9XG5cbiAgICB0aGlzLkV4cHJlc3Npb24obXVzdGFjaGUucGF0aCk7XG4gICAgdGhpcy5QYXJhbXMobXVzdGFjaGUucGFyYW1zKTtcbiAgICB0aGlzLkhhc2gobXVzdGFjaGUuaGFzaCk7XG5cbiAgICBpZiAobXVzdGFjaGUuc3RyaXAuY2xvc2UpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICd+JztcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBtdXN0YWNoZS5lc2NhcGVkID8gJ319JyA6ICd9fX0nO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEJsb2NrU3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoYmxvY2spKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGJsb2NrLmNoYWluZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmludmVyc2VTdHJpcC5vcGVuID8gJ3t7ficgOiAne3snO1xuICAgICAgdGhpcy5idWZmZXIgKz0gJ2Vsc2UgJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2sub3BlblN0cmlwLm9wZW4gPyAne3t+IycgOiAne3sjJztcbiAgICB9XG5cbiAgICB0aGlzLkV4cHJlc3Npb24oYmxvY2sucGF0aCk7XG4gICAgdGhpcy5QYXJhbXMoYmxvY2sucGFyYW1zKTtcbiAgICB0aGlzLkhhc2goYmxvY2suaGFzaCk7XG4gICAgaWYgKGJsb2NrLnByb2dyYW0uYmxvY2tQYXJhbXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLkJsb2NrUGFyYW1zKGJsb2NrLnByb2dyYW0uYmxvY2tQYXJhbXMpO1xuICAgIH1cblxuICAgIGlmIChibG9jay5jaGFpbmVkKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5pbnZlcnNlU3RyaXAuY2xvc2UgPyAnfn19JyA6ICd9fSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLm9wZW5TdHJpcC5jbG9zZSA/ICd+fX0nIDogJ319JztcbiAgICB9XG5cbiAgICB0aGlzLkJsb2NrKGJsb2NrLnByb2dyYW0pO1xuXG4gICAgaWYgKGJsb2NrLmludmVyc2UpIHtcbiAgICAgIGlmICghYmxvY2suaW52ZXJzZS5jaGFpbmVkKSB7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmludmVyc2VTdHJpcC5vcGVuID8gJ3t7ficgOiAne3snO1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSAnZWxzZSc7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmludmVyc2VTdHJpcC5jbG9zZSA/ICd+fX0nIDogJ319JztcbiAgICAgIH1cblxuICAgICAgdGhpcy5CbG9jayhibG9jay5pbnZlcnNlKTtcbiAgICB9XG5cbiAgICBpZiAoIWJsb2NrLmNoYWluZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmNsb3NlU3RyaXAub3BlbiA/ICd7e34vJyA6ICd7ey8nO1xuICAgICAgdGhpcy5FeHByZXNzaW9uKGJsb2NrLnBhdGgpO1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suY2xvc2VTdHJpcC5jbG9zZSA/ICd+fX0nIDogJ319JztcbiAgICB9XG4gIH1cblxuICBCbG9ja1BhcmFtcyhibG9ja1BhcmFtczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmJ1ZmZlciArPSBgIGFzIHwke2Jsb2NrUGFyYW1zLmpvaW4oJyAnKX18YDtcbiAgfVxuXG4gIFBhcnRpYWxTdGF0ZW1lbnQocGFydGlhbDogUGFydGlhbFN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHBhcnRpYWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJ3t7Pic7XG4gICAgdGhpcy5FeHByZXNzaW9uKHBhcnRpYWwubmFtZSk7XG4gICAgdGhpcy5QYXJhbXMocGFydGlhbC5wYXJhbXMpO1xuICAgIHRoaXMuSGFzaChwYXJ0aWFsLmhhc2gpO1xuICAgIHRoaXMuYnVmZmVyICs9ICd9fSc7XG4gIH1cblxuICBDb25jYXRTdGF0ZW1lbnQoY29uY2F0OiBDb25jYXRTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShjb25jYXQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJ1wiJztcbiAgICBjb25jYXQucGFydHMuZm9yRWFjaCgocGFydCkgPT4ge1xuICAgICAgaWYgKHBhcnQudHlwZSA9PT0gJ1RleHROb2RlJykge1xuICAgICAgICB0aGlzLlRleHROb2RlKHBhcnQsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5Ob2RlKHBhcnQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYnVmZmVyICs9ICdcIic7XG4gIH1cblxuICBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQoY29tbWVudDogTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoY29tbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBge3shLS0ke2NvbW1lbnQudmFsdWV9LS19fWA7XG4gIH1cblxuICBFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQobW9kOiBFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShtb2QpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJ3t7JztcbiAgICB0aGlzLkV4cHJlc3Npb24obW9kLnBhdGgpO1xuICAgIHRoaXMuUGFyYW1zKG1vZC5wYXJhbXMpO1xuICAgIHRoaXMuSGFzaChtb2QuaGFzaCk7XG4gICAgdGhpcy5idWZmZXIgKz0gJ319JztcbiAgfVxuXG4gIENvbW1lbnRTdGF0ZW1lbnQoY29tbWVudDogQ29tbWVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGNvbW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gYDwhLS0ke2NvbW1lbnQudmFsdWV9LS0+YDtcbiAgfVxuXG4gIFBhdGhFeHByZXNzaW9uKHBhdGg6IFBhdGhFeHByZXNzaW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUocGF0aCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBwYXRoLm9yaWdpbmFsO1xuICB9XG5cbiAgU3ViRXhwcmVzc2lvbihzZXhwOiBTdWJFeHByZXNzaW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoc2V4cCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAnKCc7XG4gICAgdGhpcy5FeHByZXNzaW9uKHNleHAucGF0aCk7XG4gICAgdGhpcy5QYXJhbXMoc2V4cC5wYXJhbXMpO1xuICAgIHRoaXMuSGFzaChzZXhwLmhhc2gpO1xuICAgIHRoaXMuYnVmZmVyICs9ICcpJztcbiAgfVxuXG4gIFBhcmFtcyhwYXJhbXM6IEV4cHJlc3Npb25bXSkge1xuICAgIC8vIFRPRE86IGltcGxlbWVudCBhIHRvcCBsZXZlbCBQYXJhbXMgQVNUIG5vZGUgKGp1c3QgbGlrZSB0aGUgSGFzaCBvYmplY3QpXG4gICAgLy8gc28gdGhhdCB0aGlzIGNhbiBhbHNvIGJlIG92ZXJyaWRkZW5cbiAgICBpZiAocGFyYW1zLmxlbmd0aCkge1xuICAgICAgcGFyYW1zLmZvckVhY2goKHBhcmFtKSA9PiB7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9ICcgJztcbiAgICAgICAgdGhpcy5FeHByZXNzaW9uKHBhcmFtKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEhhc2goaGFzaDogSGFzaCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGhhc2gsIHRydWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaGFzaC5wYWlycy5mb3JFYWNoKChwYWlyKSA9PiB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnICc7XG4gICAgICB0aGlzLkhhc2hQYWlyKHBhaXIpO1xuICAgIH0pO1xuICB9XG5cbiAgSGFzaFBhaXIocGFpcjogSGFzaFBhaXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShwYWlyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IHBhaXIua2V5O1xuICAgIHRoaXMuYnVmZmVyICs9ICc9JztcbiAgICB0aGlzLk5vZGUocGFpci52YWx1ZSk7XG4gIH1cblxuICBTdHJpbmdMaXRlcmFsKHN0cjogU3RyaW5nTGl0ZXJhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHN0cikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBKU09OLnN0cmluZ2lmeShzdHIudmFsdWUpO1xuICB9XG5cbiAgQm9vbGVhbkxpdGVyYWwoYm9vbDogQm9vbGVhbkxpdGVyYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShib29sKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IGJvb2wudmFsdWU7XG4gIH1cblxuICBOdW1iZXJMaXRlcmFsKG51bWJlcjogTnVtYmVyTGl0ZXJhbCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKG51bWJlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBudW1iZXIudmFsdWU7XG4gIH1cblxuICBVbmRlZmluZWRMaXRlcmFsKG5vZGU6IFVuZGVmaW5lZExpdGVyYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShub2RlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgTnVsbExpdGVyYWwobm9kZTogTnVsbExpdGVyYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShub2RlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICdudWxsJztcbiAgfVxuXG4gIHByaW50KG5vZGU6IE5vZGUpIHtcbiAgICBsZXQgeyBvcHRpb25zIH0gPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMub3ZlcnJpZGUpIHtcbiAgICAgIGxldCByZXN1bHQgPSBvcHRpb25zLm92ZXJyaWRlKG5vZGUsIG9wdGlvbnMpO1xuXG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgIHRoaXMuTm9kZShub2RlKTtcbiAgICByZXR1cm4gdGhpcy5idWZmZXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5yZWFjaGFibGUobm9kZTogbmV2ZXIsIHBhcmVudE5vZGVUeXBlOiBzdHJpbmcpOiBuZXZlciB7XG4gIGxldCB7IGxvYywgdHlwZSB9ID0gKG5vZGUgYXMgYW55KSBhcyBOb2RlO1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgYE5vbi1leGhhdXN0aXZlIG5vZGUgbmFycm93aW5nICR7dHlwZX0gQCBsb2NhdGlvbjogJHtKU09OLnN0cmluZ2lmeShcbiAgICAgIGxvY1xuICAgICl9IGZvciBwYXJlbnQgJHtwYXJlbnROb2RlVHlwZX1gXG4gICk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9