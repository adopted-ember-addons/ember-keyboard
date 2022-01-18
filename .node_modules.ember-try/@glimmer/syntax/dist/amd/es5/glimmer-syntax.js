define('@glimmer/syntax', ['exports', '@glimmer/util', 'simple-html-tokenizer', '@handlebars/parser'], function (exports, util, simpleHtmlTokenizer, parser) { 'use strict';

  function buildMustache(path, params, hash, raw, loc, strip) {
    if (typeof path === 'string') {
      path = buildHead(path);
    }

    return {
      type: 'MustacheStatement',
      path: path,
      params: params || [],
      hash: hash || buildHash([]),
      escaped: !raw,
      loc: buildLoc(loc || null),
      strip: strip || {
        open: false,
        close: false
      }
    };
  }

  function buildBlock(path, params, hash, _defaultBlock, _elseBlock, loc, openStrip, inverseStrip, closeStrip) {
    var defaultBlock;
    var elseBlock;

    if (_defaultBlock.type === 'Template') {

      defaultBlock = util.assign({}, _defaultBlock, {
        type: 'Block'
      });
    } else {
      defaultBlock = _defaultBlock;
    }

    if (_elseBlock !== undefined && _elseBlock !== null && _elseBlock.type === 'Template') {

      elseBlock = util.assign({}, _elseBlock, {
        type: 'Block'
      });
    } else {
      elseBlock = _elseBlock;
    }

    return {
      type: 'BlockStatement',
      path: buildHead(path),
      params: params || [],
      hash: hash || buildHash([]),
      program: defaultBlock || null,
      inverse: elseBlock || null,
      loc: buildLoc(loc || null),
      openStrip: openStrip || {
        open: false,
        close: false
      },
      inverseStrip: inverseStrip || {
        open: false,
        close: false
      },
      closeStrip: closeStrip || {
        open: false,
        close: false
      }
    };
  }

  function buildElementModifier(path, params, hash, loc) {
    return {
      type: 'ElementModifierStatement',
      path: buildHead(path),
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
      strip: {
        open: false,
        close: false
      },
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

    var path = normalizeHead(sexp[0]);
    var params;
    var hash;
    var loc = null;
    var parts = sexp.slice(1);
    var next = parts.shift();

    _process: {
      if (isParamsSexp(next)) {
        params = next;
      } else {
        break _process;
      }

      next = parts.shift();

      if (isHashSexp(next)) {
        hash = normalizeHash(next);
      } else {
        break _process;
      }
    }

    if (isLocSexp(next)) {
      loc = next[1];
    }

    return {
      type: 'ElementModifierStatement',
      path: path,
      params: params || [],
      hash: hash || buildHash([]),
      loc: buildLoc(loc || null)
    };
  }
  function normalizeAttr(sexp) {
    var name = sexp[0];
    var value;

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
  function normalizeHead(path) {
    if (typeof path === 'string') {
      return buildHead(path);
    } else {
      return buildHead(path[1], path[2] && path[2][1]);
    }
  }
  function normalizeElementOptions() {
    var out = {};

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    for (var _i = 0, _args = args; _i < _args.length; _i++) {
      var arg = _args[_i];

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
    var normalized;

    if (Array.isArray(options)) {
      for (var _len2 = arguments.length, rest = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        rest[_key2 - 2] = arguments[_key2];
      }

      normalized = normalizeElementOptions.apply(void 0, [options].concat(rest));
    } else {
      normalized = options || {};
    }

    var _normalized = normalized,
        attrs = _normalized.attrs,
        blockParams = _normalized.blockParams,
        modifiers = _normalized.modifiers,
        comments = _normalized.comments,
        children = _normalized.children,
        loc = _normalized.loc; // this is used for backwards compat, prior to `selfClosing` being part of the ElementNode AST

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
  } // Expressions


  function buildSexpr(path, params, hash, loc) {
    return {
      type: 'SubExpression',
      path: buildHead(path),
      params: params || [],
      hash: hash || buildHash([]),
      loc: buildLoc(loc || null)
    };
  }

  function buildHead(original, loc) {
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
      "this": thisHead,
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
  } // Miscellaneous


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

  function buildBlockItself(body, blockParams, chained, loc) {
    if (chained === void 0) {
      chained = false;
    }

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
    start: {
      line: 1,
      column: 0
    },
    end: {
      line: 1,
      column: 0
    }
  };

  function buildLoc() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
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

  var builders = {
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
    path: buildHead,
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
    "boolean": literal('BooleanLiteral'),
    number: literal('NumberLiteral'),
    undefined: function (_undefined) {
      function undefined$1() {
        return _undefined.apply(this, arguments);
      }

      undefined$1.toString = function () {
        return _undefined.toString();
      };

      return undefined$1;
    }(function () {
      return buildLiteral('UndefinedLiteral', undefined);
    }),
    "null": function _null() {
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
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

  // Based on the ID validation regex in Handlebars.

  var ID_INVERSE_PATTERN = /[!"#%-,\.\/;->@\[-\^`\{-~]/; // Checks the element's attributes to see if it uses block params.
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

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  var Parser = /*#__PURE__*/function () {
    function Parser(source, entityParser, mode) {
      if (entityParser === void 0) {
        entityParser = new simpleHtmlTokenizer.EntityParser(simpleHtmlTokenizer.HTML5NamedCharRefs);
      }

      if (mode === void 0) {
        mode = 'precompile';
      }

      this.elementStack = [];
      this.currentAttribute = null;
      this.currentNode = null;
      this.source = source.split(/(?:\r\n?|\n)/g);
      this.tokenizer = new simpleHtmlTokenizer.EventedTokenizer(this, entityParser, mode);
    }

    var _proto = Parser.prototype;

    _proto.acceptTemplate = function acceptTemplate(node) {
      return this[node.type](node);
    };

    _proto.acceptNode = function acceptNode(node) {
      return this[node.type](node);
    };

    _proto.currentElement = function currentElement() {
      return this.elementStack[this.elementStack.length - 1];
    };

    _proto.sourceForNode = function sourceForNode(node, endNode) {
      var firstLine = node.loc.start.line - 1;
      var currentLine = firstLine - 1;
      var firstColumn = node.loc.start.column;
      var string = [];
      var line;
      var lastLine;
      var lastColumn;

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
      key: "currentAttr",
      get: function get() {
        return this.currentAttribute;
      }
    }, {
      key: "currentTag",
      get: function get() {
        var node = this.currentNode;
        return node;
      }
    }, {
      key: "currentStartTag",
      get: function get() {
        var node = this.currentNode;
        return node;
      }
    }, {
      key: "currentEndTag",
      get: function get() {
        var node = this.currentNode;
        return node;
      }
    }, {
      key: "currentComment",
      get: function get() {
        var node = this.currentNode;
        return node;
      }
    }, {
      key: "currentData",
      get: function get() {
        var node = this.currentNode;
        return node;
      }
    }]);

    return Parser;
  }();

  function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
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
        node = builders.template(body, program.blockParams, program.loc);
      } else {
        node = builders.blockItself(body, program.blockParams, program.chained, program.loc);
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
      var node = builders.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);
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
          hash: builders.hash(),
          escaped: escaped,
          loc: loc,
          strip: strip
        };
      } else {
        var _acceptCallNodes2 = acceptCallNodes(this, rawMustache),
            path = _acceptCallNodes2.path,
            params = _acceptCallNodes2.params,
            hash = _acceptCallNodes2.hash;

        mustache = builders.mustache(path, params, hash, !escaped, loc, strip);
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
      var comment = builders.mustacheComment(value, loc);

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

      return builders.sexpr(path, params, hash, sexpr.loc);
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
        pairs.push(builders.pair(pair.key, this.acceptNode(pair.value), pair.loc));
      }

      return builders.hash(pairs, hash.loc);
    };

    _proto.StringLiteral = function StringLiteral(string) {
      return builders.literal('StringLiteral', string.value, string.loc);
    };

    _proto.BooleanLiteral = function BooleanLiteral(_boolean) {
      return builders.literal('BooleanLiteral', _boolean.value, _boolean.loc);
    };

    _proto.NumberLiteral = function NumberLiteral(number) {
      return builders.literal('NumberLiteral', number.value, number.loc);
    };

    _proto.UndefinedLiteral = function UndefinedLiteral(undef) {
      return builders.literal('UndefinedLiteral', undefined, undef.loc);
    };

    _proto.NullLiteral = function NullLiteral(nul) {
      return builders.literal('NullLiteral', null, nul.loc);
    };

    _createClass$1(HandlebarsNodeVisitors, [{
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
    var hash = node.hash ? compiler.Hash(node.hash) : builders.hash();
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

    var modifier = builders.elementModifier(path, params, hash, loc);
    element.modifiers.push(modifier);
  }

  function appendDynamicAttributeValuePart(attribute, part) {
    attribute.isDynamic = true;
    attribute.parts.push(part);
  }

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

  function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); return Constructor; }

  var Path = /*#__PURE__*/function () {
    function Path(node, parent, parentKey) {
      if (parent === void 0) {
        parent = null;
      }

      if (parentKey === void 0) {
        parentKey = null;
      }

      this.node = node;
      this.parent = parent;
      this.parentKey = parentKey;
    }

    var _proto = Path.prototype;

    _proto.parents = function parents() {
      var _this = this,
          _ref;

      return _ref = {}, _ref[Symbol.iterator] = function () {
        return new PathParentsIterator(_this);
      }, _ref;
    };

    _createClass$2(Path, [{
      key: "parentNode",
      get: function get() {
        return this.parent ? this.parent.node : null;
      }
    }]);

    return Path;
  }();

  var PathParentsIterator = /*#__PURE__*/function () {
    function PathParentsIterator(path) {
      this.path = path;
    }

    var _proto2 = PathParentsIterator.prototype;

    _proto2.next = function next() {
      if (this.path.parent) {
        this.path = this.path.parent;
        return {
          done: false,
          value: this.path
        };
      } else {
        return {
          done: true,
          value: null
        };
      }
    };

    return PathParentsIterator;
  }();

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

  function visitNode(visitor, path) {
    var node = path.node,
        parent = path.parent,
        parentKey = path.parentKey;
    var handler = getNodeHandler(visitor, node.type);
    var enter;
    var exit;

    if (handler !== undefined) {
      enter = getEnterFunction(handler);
      exit = getExitFunction(handler);
    }

    var result;

    if (enter !== undefined) {
      result = enter(node, path);
    }

    if (result !== undefined && result !== null) {
      if (JSON.stringify(node) === JSON.stringify(result)) {
        result = undefined;
      } else if (Array.isArray(result)) {
        visitArray(visitor, result, parent, parentKey);
        return result;
      } else {
        var _path = new Path(result, parent, parentKey);

        return visitNode(visitor, _path) || result;
      }
    }

    if (result === undefined) {
      var keys = visitorKeys[node.type];

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]; // we know if it has child keys we can widen to a ParentNode

        visitKey(visitor, handler, path, key);
      }

      if (exit !== undefined) {
        result = exit(node, path);
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

  function visitKey(visitor, handler, path, key) {
    var node = path.node;
    var value = get(node, key);

    if (!value) {
      return;
    }

    var keyEnter;
    var keyExit;

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
      visitArray(visitor, value, path, key);
    } else {
      var keyPath = new Path(value, path, key);
      var result = visitNode(visitor, keyPath);

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

  function visitArray(visitor, array, parent, parentKey) {
    for (var i = 0; i < array.length; i++) {
      var node = array[i];
      var path = new Path(node, parent, parentKey);
      var result = visitNode(visitor, path);

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
    var path = new Path(node);
    visitNode(visitor, path);
  }

  var ATTR_VALUE_REGEX_TEST = /[\xA0"&]/;
  var ATTR_VALUE_REGEX_REPLACE = new RegExp(ATTR_VALUE_REGEX_TEST.source, 'g');
  var TEXT_REGEX_TEST = /[\xA0&<>]/;
  var TEXT_REGEX_REPLACE = new RegExp(TEXT_REGEX_TEST.source, 'g');

  function attrValueReplacer(_char) {
    switch (_char.charCodeAt(0)) {
      case 160
      /* NBSP */
      :
        return '&nbsp;';

      case 34
      /* QUOT */
      :
        return '&quot;';

      case 38
      /* AMP */
      :
        return '&amp;';

      default:
        return _char;
    }
  }

  function textReplacer(_char2) {
    switch (_char2.charCodeAt(0)) {
      case 160
      /* NBSP */
      :
        return '&nbsp;';

      case 38
      /* AMP */
      :
        return '&amp;';

      case 60
      /* LT */
      :
        return '&lt;';

      case 62
      /* GT */
      :
        return '&gt;';

      default:
        return _char2;
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
      if (el.selfClosing || voidMap[el.tag.toLowerCase()]) {
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
        this.buffer += escapeAttrValue(text.chars);
      } else {
        this.buffer += escapeText(text.chars);
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
      var _this4 = this;

      // TODO: implement a top level Params AST node (just like the Hash object)
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

  function unreachable(node, parentNodeType) {
    var loc = node.loc,
        type = node.type;
    throw new Error("Non-exhaustive node narrowing " + type + " @ location: " + JSON.stringify(loc) + " for parent " + parentNodeType);
  }

  function build(ast, options) {
    if (options === void 0) {
      options = {
        entityEncoding: 'transformed'
      };
    }

    if (!ast) {
      return '';
    }

    var printer = new Printer(options);
    return printer.print(ast);
  }

  var Walker = /*#__PURE__*/function () {
    function Walker(order) {
      this.order = order;
      this.stack = [];
    }

    var _proto = Walker.prototype;

    _proto.visit = function visit(node, callback) {
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

    _proto.children = function children(node, callback) {
      var type;

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

  function _inheritsLoose$1(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
  var voidMap = Object.create(null);
  var voidTagNames = 'area base br col command embed hr img input keygen link meta param source track wbr';
  voidTagNames.split(' ').forEach(function (tagName) {
    voidMap[tagName] = true;
  });
  var TokenizerEventHandlers = /*#__PURE__*/function (_HandlebarsNodeVisito) {
    _inheritsLoose$1(TokenizerEventHandlers, _HandlebarsNodeVisito);

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
      this.currentNode = builders.comment('');
      this.currentNode.loc = {
        source: null,
        start: builders.pos(this.tagOpenLine, this.tagOpenColumn),
        end: null
      };
    };

    _proto.appendToCommentData = function appendToCommentData(_char) {
      this.currentComment.value += _char;
    };

    _proto.finishComment = function finishComment() {
      this.currentComment.loc.end = builders.pos(this.tokenizer.line, this.tokenizer.column);
      appendChild(this.currentElement(), this.currentComment);
    } // Data
    ;

    _proto.beginData = function beginData() {
      this.currentNode = builders.text();
      this.currentNode.loc = {
        source: null,
        start: builders.pos(this.tokenizer.line, this.tokenizer.column),
        end: null
      };
    };

    _proto.appendToData = function appendToData(_char2) {
      this.currentData.chars += _char2;
    };

    _proto.finishData = function finishData() {
      this.currentData.loc.end = builders.pos(this.tokenizer.line, this.tokenizer.column);
      appendChild(this.currentElement(), this.currentData);
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
        loc: SYNTHETIC
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
        loc: SYNTHETIC
      };
    };

    _proto.finishTag = function finishTag() {
      var _this$tokenizer = this.tokenizer,
          line = _this$tokenizer.line,
          column = _this$tokenizer.column;
      var tag = this.currentTag;
      tag.loc = builders.loc(this.tagOpenLine, this.tagOpenColumn, line, column);

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
      var loc = builders.loc(this.tagOpenLine, this.tagOpenColumn);
      var element = builders.element({
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
      parseElementBlockParams(element);
      appendChild(parent, element);
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
        throw new SyntaxError("Invalid end tag: closing tag must not have attributes, " + ("in `" + tag.name + "` (on line " + this.tokenizer.line + ")."), tag.loc);
      }

      this.currentAttribute = {
        name: '',
        parts: [],
        isQuoted: false,
        isDynamic: false,
        start: builders.pos(this.tokenizer.line, this.tokenizer.column),
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
        var loc = builders.loc(this.tokenizer.line, this.tokenizer.column, this.tokenizer.line, this.tokenizer.column); // the tokenizer line/column have already been advanced, correct location info

        if (_char5 === '\n') {
          loc.start.line -= 1;
          loc.start.column = lastPart ? lastPart.loc.end.column : this.currentAttr.valueStartColumn;
        } else {
          loc.start.column -= 1;
        }

        var text = builders.text(_char5, loc);
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
      value.loc = builders.loc(valueStartLine, valueStartColumn, this.tokenizer.line, this.tokenizer.column);
      var loc = builders.loc(this.currentAttr.start.line, this.currentAttr.start.column, this.tokenizer.line, this.tokenizer.column);
      var attribute = builders.attr(name, value, loc);
      this.currentStartTag.attributes.push(attribute);
    };

    _proto.reportSyntaxError = function reportSyntaxError(message) {
      throw new SyntaxError("Syntax error at line " + this.tokenizer.line + " col " + this.tokenizer.column + ": " + message, builders.loc(this.tokenizer.line, this.tokenizer.column));
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
          throw new SyntaxError("An unquoted attribute value must be a string or a mustache, " + "preceeded by whitespace or a '=' character, and " + ("followed by whitespace, a '>' character, or '/>' (on line " + line + ")"), builders.loc(line, 0));
        }
      }
    } else {
      return parts.length > 0 ? parts[0] : builders.text('');
    }
  }

  function assembleConcatenatedValue(parts) {
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];

      if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
        throw new SyntaxError('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
      }
    }

    return builders.concat(parts);
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
      throw new SyntaxError(error, element.loc);
    }
  }

  function formatEndTagInfo(tag) {
    return '`' + tag.name + '` (on line ' + tag.loc.end.line + ')';
  }

  var syntax = {
    parse: preprocess,
    builders: builders,
    print: build,
    traverse: traverse,
    Walker: Walker
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
      ast = parser.parseWithoutProcessing(html, options.parseOptions);
    } else {
      ast = parser.parse(html, options.parseOptions);
    }

    var entityParser = undefined;

    if (mode === 'codemod') {
      entityParser = new simpleHtmlTokenizer.EntityParser({});
    }

    var program = new TokenizerEventHandlers(html, entityParser, mode).acceptTemplate(ast);

    if (options && options.plugins && options.plugins.ast) {
      for (var i = 0, l = options.plugins.ast.length; i < l; i++) {
        var transform = options.plugins.ast[i];
        var env = util.assign({}, options, {
          syntax: syntax
        }, {
          plugins: undefined
        });
        var pluginResult = transform(env);
        traverse(program, pluginResult.visitor);
      }
    }

    return program;
  }



  var nodes = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  exports.AST = nodes;
  exports.Path = Path;
  exports.SyntaxError = SyntaxError;
  exports.TraversalError = TraversalError;
  exports.Walker = Walker;
  exports.builders = builders;
  exports.cannotRemoveNode = cannotRemoveNode;
  exports.cannotReplaceNode = cannotReplaceNode;
  exports.cannotReplaceOrRemoveInKeyHandlerYet = cannotReplaceOrRemoveInKeyHandlerYet;
  exports.isLiteral = isLiteral;
  exports.preprocess = preprocess;
  exports.print = build;
  exports.printLiteral = printLiteral;
  exports.traverse = traverse;

  Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xpbW1lci1zeW50YXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvYnVpbGRlcnMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL2Vycm9ycy9zeW50YXgtZXJyb3IudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3V0aWxzLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvc3ludGF4L2xpYi9wYXJzZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3BhcnNlci9oYW5kbGViYXJzLW5vZGUtdmlzaXRvcnMudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3R5cGVzL3Zpc2l0b3Ita2V5cy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL2Vycm9ycy50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdHJhdmVyc2FsL3BhdGgudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3RyYXZlcnNhbC90cmF2ZXJzZS50cyIsIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvZ2VuZXJhdGlvbi91dGlsLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvQGdsaW1tZXIvc3ludGF4L2xpYi9nZW5lcmF0aW9uL3ByaW50ZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL2dlbmVyYXRpb24vcHJpbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3RyYXZlcnNhbC93YWxrZXIudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9AZ2xpbW1lci9zeW50YXgvbGliL3BhcnNlci90b2tlbml6ZXItZXZlbnQtaGFuZGxlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVNUIGZyb20gJy4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0IHsgT3B0aW9uLCBEaWN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBkZXByZWNhdGUsIGFzc2lnbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgTE9DQUxfREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBTdHJpbmdMaXRlcmFsLCBCb29sZWFuTGl0ZXJhbCwgTnVtYmVyTGl0ZXJhbCB9IGZyb20gJy4vdHlwZXMvaGFuZGxlYmFycy1hc3QnO1xuXG4vLyBTdGF0ZW1lbnRzXG5cbmV4cG9ydCB0eXBlIEJ1aWxkZXJIZWFkID0gc3RyaW5nIHwgQVNULkV4cHJlc3Npb247XG5leHBvcnQgdHlwZSBUYWdEZXNjcmlwdG9yID0gc3RyaW5nIHwgeyBuYW1lOiBzdHJpbmc7IHNlbGZDbG9zaW5nOiBib29sZWFuIH07XG5cbmZ1bmN0aW9uIGJ1aWxkTXVzdGFjaGUoXG4gIHBhdGg6IEJ1aWxkZXJIZWFkIHwgQVNULkxpdGVyYWwsXG4gIHBhcmFtcz86IEFTVC5FeHByZXNzaW9uW10sXG4gIGhhc2g/OiBBU1QuSGFzaCxcbiAgcmF3PzogYm9vbGVhbixcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uLFxuICBzdHJpcD86IEFTVC5TdHJpcEZsYWdzXG4pOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQge1xuICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgcGF0aCA9IGJ1aWxkSGVhZChwYXRoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICBwYXRoLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBlc2NhcGVkOiAhcmF3LFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICAgIHN0cmlwOiBzdHJpcCB8fCB7IG9wZW46IGZhbHNlLCBjbG9zZTogZmFsc2UgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRCbG9jayhcbiAgcGF0aDogQnVpbGRlckhlYWQsXG4gIHBhcmFtczogT3B0aW9uPEFTVC5FeHByZXNzaW9uW10+LFxuICBoYXNoOiBPcHRpb248QVNULkhhc2g+LFxuICBfZGVmYXVsdEJsb2NrOiBBU1QuUG9zc2libHlEZXByZWNhdGVkQmxvY2ssXG4gIF9lbHNlQmxvY2s/OiBPcHRpb248QVNULlBvc3NpYmx5RGVwcmVjYXRlZEJsb2NrPixcbiAgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uLFxuICBvcGVuU3RyaXA/OiBBU1QuU3RyaXBGbGFncyxcbiAgaW52ZXJzZVN0cmlwPzogQVNULlN0cmlwRmxhZ3MsXG4gIGNsb3NlU3RyaXA/OiBBU1QuU3RyaXBGbGFnc1xuKTogQVNULkJsb2NrU3RhdGVtZW50IHtcbiAgbGV0IGRlZmF1bHRCbG9jazogQVNULkJsb2NrO1xuICBsZXQgZWxzZUJsb2NrOiBPcHRpb248QVNULkJsb2NrPiB8IHVuZGVmaW5lZDtcblxuICBpZiAoX2RlZmF1bHRCbG9jay50eXBlID09PSAnVGVtcGxhdGUnKSB7XG4gICAgaWYgKExPQ0FMX0RFQlVHKSB7XG4gICAgICBkZXByZWNhdGUoYGIucHJvZ3JhbSBpcyBkZXByZWNhdGVkLiBVc2UgYi5ibG9ja0l0c2VsZiBpbnN0ZWFkLmApO1xuICAgIH1cblxuICAgIGRlZmF1bHRCbG9jayA9IChhc3NpZ24oe30sIF9kZWZhdWx0QmxvY2ssIHsgdHlwZTogJ0Jsb2NrJyB9KSBhcyB1bmtub3duKSBhcyBBU1QuQmxvY2s7XG4gIH0gZWxzZSB7XG4gICAgZGVmYXVsdEJsb2NrID0gX2RlZmF1bHRCbG9jaztcbiAgfVxuXG4gIGlmIChfZWxzZUJsb2NrICE9PSB1bmRlZmluZWQgJiYgX2Vsc2VCbG9jayAhPT0gbnVsbCAmJiBfZWxzZUJsb2NrLnR5cGUgPT09ICdUZW1wbGF0ZScpIHtcbiAgICBpZiAoTE9DQUxfREVCVUcpIHtcbiAgICAgIGRlcHJlY2F0ZShgYi5wcm9ncmFtIGlzIGRlcHJlY2F0ZWQuIFVzZSBiLmJsb2NrSXRzZWxmIGluc3RlYWQuYCk7XG4gICAgfVxuXG4gICAgZWxzZUJsb2NrID0gKGFzc2lnbih7fSwgX2Vsc2VCbG9jaywgeyB0eXBlOiAnQmxvY2snIH0pIGFzIHVua25vd24pIGFzIEFTVC5CbG9jaztcbiAgfSBlbHNlIHtcbiAgICBlbHNlQmxvY2sgPSBfZWxzZUJsb2NrO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQmxvY2tTdGF0ZW1lbnQnLFxuICAgIHBhdGg6IGJ1aWxkSGVhZChwYXRoKSxcbiAgICBwYXJhbXM6IHBhcmFtcyB8fCBbXSxcbiAgICBoYXNoOiBoYXNoIHx8IGJ1aWxkSGFzaChbXSksXG4gICAgcHJvZ3JhbTogZGVmYXVsdEJsb2NrIHx8IG51bGwsXG4gICAgaW52ZXJzZTogZWxzZUJsb2NrIHx8IG51bGwsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gICAgb3BlblN0cmlwOiBvcGVuU3RyaXAgfHwgeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgaW52ZXJzZVN0cmlwOiBpbnZlcnNlU3RyaXAgfHwgeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgY2xvc2VTdHJpcDogY2xvc2VTdHJpcCB8fCB7IG9wZW46IGZhbHNlLCBjbG9zZTogZmFsc2UgfSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50TW9kaWZpZXIoXG4gIHBhdGg6IEJ1aWxkZXJIZWFkLFxuICBwYXJhbXM/OiBBU1QuRXhwcmVzc2lvbltdLFxuICBoYXNoPzogQVNULkhhc2gsXG4gIGxvYz86IE9wdGlvbjxBU1QuU291cmNlTG9jYXRpb24+XG4pOiBBU1QuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50JyxcbiAgICBwYXRoOiBidWlsZEhlYWQocGF0aCksXG4gICAgcGFyYW1zOiBwYXJhbXMgfHwgW10sXG4gICAgaGFzaDogaGFzaCB8fCBidWlsZEhhc2goW10pLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFBhcnRpYWwoXG4gIG5hbWU6IEFTVC5QYXRoRXhwcmVzc2lvbixcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICBpbmRlbnQ/OiBzdHJpbmcsXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULlBhcnRpYWxTdGF0ZW1lbnQge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdQYXJ0aWFsU3RhdGVtZW50JyxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBpbmRlbnQ6IGluZGVudCB8fCAnJyxcbiAgICBzdHJpcDogeyBvcGVuOiBmYWxzZSwgY2xvc2U6IGZhbHNlIH0sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQ29tbWVudCh2YWx1ZTogc3RyaW5nLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuQ29tbWVudFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0NvbW1lbnRTdGF0ZW1lbnQnLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRNdXN0YWNoZUNvbW1lbnQoXG4gIHZhbHVlOiBzdHJpbmcsXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ011c3RhY2hlQ29tbWVudFN0YXRlbWVudCcsXG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZENvbmNhdChcbiAgcGFydHM6IChBU1QuVGV4dE5vZGUgfCBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpW10sXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULkNvbmNhdFN0YXRlbWVudCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0NvbmNhdFN0YXRlbWVudCcsXG4gICAgcGFydHM6IHBhcnRzIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG4vLyBOb2Rlc1xuXG5leHBvcnQgdHlwZSBFbGVtZW50QXJncyA9XG4gIHwgWydhdHRycycsIC4uLkF0dHJTZXhwW11dXG4gIHwgWydtb2RpZmllcnMnLCAuLi5Nb2RpZmllclNleHBbXV1cbiAgfCBbJ2JvZHknLCAuLi5BU1QuU3RhdGVtZW50W11dXG4gIHwgWydjb21tZW50cycsIC4uLkVsZW1lbnRDb21tZW50W11dXG4gIHwgWydhcycsIC4uLnN0cmluZ1tdXVxuICB8IFsnbG9jJywgQVNULlNvdXJjZUxvY2F0aW9uXTtcblxuZXhwb3J0IHR5cGUgUGF0aFNleHAgPSBzdHJpbmcgfCBbJ3BhdGgnLCBzdHJpbmcsIExvY1NleHA/XTtcblxuZXhwb3J0IHR5cGUgTW9kaWZpZXJTZXhwID1cbiAgfCBzdHJpbmdcbiAgfCBbUGF0aFNleHAsIExvY1NleHA/XVxuICB8IFtQYXRoU2V4cCwgQVNULkV4cHJlc3Npb25bXSwgTG9jU2V4cD9dXG4gIHwgW1BhdGhTZXhwLCBBU1QuRXhwcmVzc2lvbltdLCBEaWN0PEFTVC5FeHByZXNzaW9uPiwgTG9jU2V4cD9dO1xuXG5leHBvcnQgdHlwZSBBdHRyU2V4cCA9IFtzdHJpbmcsIEFTVC5BdHRyTm9kZVsndmFsdWUnXSB8IHN0cmluZywgTG9jU2V4cD9dO1xuXG5leHBvcnQgdHlwZSBMb2NTZXhwID0gWydsb2MnLCBBU1QuU291cmNlTG9jYXRpb25dO1xuXG5leHBvcnQgdHlwZSBFbGVtZW50Q29tbWVudCA9IEFTVC5NdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQgfCBBU1QuU291cmNlTG9jYXRpb24gfCBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIFNleHBWYWx1ZSA9XG4gIHwgc3RyaW5nXG4gIHwgQVNULkV4cHJlc3Npb25bXVxuICB8IERpY3Q8QVNULkV4cHJlc3Npb24+XG4gIHwgTG9jU2V4cFxuICB8IFBhdGhTZXhwXG4gIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNMb2NTZXhwKHZhbHVlOiBTZXhwVmFsdWUpOiB2YWx1ZSBpcyBMb2NTZXhwIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMiAmJiB2YWx1ZVswXSA9PT0gJ2xvYyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1BhcmFtc1NleHAodmFsdWU6IFNleHBWYWx1ZSk6IHZhbHVlIGlzIEFTVC5FeHByZXNzaW9uW10ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgIWlzTG9jU2V4cCh2YWx1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0hhc2hTZXhwKHZhbHVlOiBTZXhwVmFsdWUpOiB2YWx1ZSBpcyBEaWN0PEFTVC5FeHByZXNzaW9uPiB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIGV4cGVjdFR5cGU8RGljdDxBU1QuRXhwcmVzc2lvbj4+KHZhbHVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXhwZWN0VHlwZTxUPihfaW5wdXQ6IFQpOiB2b2lkIHtcbiAgcmV0dXJuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplTW9kaWZpZXIoc2V4cDogTW9kaWZpZXJTZXhwKTogQVNULkVsZW1lbnRNb2RpZmllclN0YXRlbWVudCB7XG4gIGlmICh0eXBlb2Ygc2V4cCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gYnVpbGRFbGVtZW50TW9kaWZpZXIoc2V4cCk7XG4gIH1cblxuICBsZXQgcGF0aDogQVNULkV4cHJlc3Npb24gPSBub3JtYWxpemVIZWFkKHNleHBbMF0pO1xuICBsZXQgcGFyYW1zOiBBU1QuRXhwcmVzc2lvbltdIHwgdW5kZWZpbmVkO1xuICBsZXQgaGFzaDogQVNULkhhc2ggfCB1bmRlZmluZWQ7XG4gIGxldCBsb2M6IEFTVC5Tb3VyY2VMb2NhdGlvbiB8IG51bGwgPSBudWxsO1xuXG4gIGxldCBwYXJ0cyA9IHNleHAuc2xpY2UoMSk7XG4gIGxldCBuZXh0ID0gcGFydHMuc2hpZnQoKTtcblxuICBfcHJvY2Vzczoge1xuICAgIGlmIChpc1BhcmFtc1NleHAobmV4dCkpIHtcbiAgICAgIHBhcmFtcyA9IG5leHQgYXMgQVNULkV4cHJlc3Npb25bXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWsgX3Byb2Nlc3M7XG4gICAgfVxuXG4gICAgbmV4dCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoaXNIYXNoU2V4cChuZXh0KSkge1xuICAgICAgaGFzaCA9IG5vcm1hbGl6ZUhhc2gobmV4dCBhcyBEaWN0PEFTVC5FeHByZXNzaW9uPik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrIF9wcm9jZXNzO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpc0xvY1NleHAobmV4dCkpIHtcbiAgICBsb2MgPSBuZXh0WzFdO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50JyxcbiAgICBwYXRoLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUF0dHIoc2V4cDogQXR0clNleHApOiBBU1QuQXR0ck5vZGUge1xuICBsZXQgbmFtZSA9IHNleHBbMF07XG4gIGxldCB2YWx1ZTtcblxuICBpZiAodHlwZW9mIHNleHBbMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSBidWlsZFRleHQoc2V4cFsxXSk7XG4gIH0gZWxzZSB7XG4gICAgdmFsdWUgPSBzZXhwWzFdO1xuICB9XG5cbiAgbGV0IGxvYyA9IHNleHBbMl0gPyBzZXhwWzJdWzFdIDogdW5kZWZpbmVkO1xuXG4gIHJldHVybiBidWlsZEF0dHIobmFtZSwgdmFsdWUsIGxvYyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVIYXNoKGhhc2g6IERpY3Q8QVNULkV4cHJlc3Npb24+LCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuSGFzaCB7XG4gIGxldCBwYWlyczogQVNULkhhc2hQYWlyW10gPSBbXTtcblxuICBPYmplY3Qua2V5cyhoYXNoKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBwYWlycy5wdXNoKGJ1aWxkUGFpcihrZXksIGhhc2hba2V5XSkpO1xuICB9KTtcblxuICByZXR1cm4gYnVpbGRIYXNoKHBhaXJzLCBsb2MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplSGVhZChwYXRoOiBQYXRoU2V4cCk6IEFTVC5FeHByZXNzaW9uIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBidWlsZEhlYWQocGF0aCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJ1aWxkSGVhZChwYXRoWzFdLCBwYXRoWzJdICYmIHBhdGhbMl1bMV0pO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVFbGVtZW50T3B0aW9ucyguLi5hcmdzOiBFbGVtZW50QXJnc1tdKTogQnVpbGRFbGVtZW50T3B0aW9ucyB7XG4gIGxldCBvdXQ6IEJ1aWxkRWxlbWVudE9wdGlvbnMgPSB7fTtcblxuICBmb3IgKGxldCBhcmcgb2YgYXJncykge1xuICAgIHN3aXRjaCAoYXJnWzBdKSB7XG4gICAgICBjYXNlICdhdHRycyc6IHtcbiAgICAgICAgbGV0IFssIC4uLnJlc3RdID0gYXJnO1xuICAgICAgICBvdXQuYXR0cnMgPSByZXN0Lm1hcChub3JtYWxpemVBdHRyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdtb2RpZmllcnMnOiB7XG4gICAgICAgIGxldCBbLCAuLi5yZXN0XSA9IGFyZztcbiAgICAgICAgb3V0Lm1vZGlmaWVycyA9IHJlc3QubWFwKG5vcm1hbGl6ZU1vZGlmaWVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdib2R5Jzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5jaGlsZHJlbiA9IHJlc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnY29tbWVudHMnOiB7XG4gICAgICAgIGxldCBbLCAuLi5yZXN0XSA9IGFyZztcblxuICAgICAgICBvdXQuY29tbWVudHMgPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2FzJzoge1xuICAgICAgICBsZXQgWywgLi4ucmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5ibG9ja1BhcmFtcyA9IHJlc3Q7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnbG9jJzoge1xuICAgICAgICBsZXQgWywgcmVzdF0gPSBhcmc7XG4gICAgICAgIG91dC5sb2MgPSByZXN0O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkRWxlbWVudE9wdGlvbnMge1xuICBhdHRycz86IEFTVC5BdHRyTm9kZVtdO1xuICBtb2RpZmllcnM/OiBBU1QuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50W107XG4gIGNoaWxkcmVuPzogQVNULlN0YXRlbWVudFtdO1xuICBjb21tZW50cz86IEVsZW1lbnRDb21tZW50W107XG4gIGJsb2NrUGFyYW1zPzogc3RyaW5nW107XG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRFbGVtZW50KHRhZzogVGFnRGVzY3JpcHRvciwgb3B0aW9ucz86IEJ1aWxkRWxlbWVudE9wdGlvbnMpOiBBU1QuRWxlbWVudE5vZGU7XG5mdW5jdGlvbiBidWlsZEVsZW1lbnQodGFnOiBUYWdEZXNjcmlwdG9yLCAuLi5vcHRpb25zOiBFbGVtZW50QXJnc1tdKTogQVNULkVsZW1lbnROb2RlO1xuZnVuY3Rpb24gYnVpbGRFbGVtZW50KFxuICB0YWc6IFRhZ0Rlc2NyaXB0b3IsXG4gIG9wdGlvbnM/OiBCdWlsZEVsZW1lbnRPcHRpb25zIHwgRWxlbWVudEFyZ3MsXG4gIC4uLnJlc3Q6IEVsZW1lbnRBcmdzW11cbik6IEFTVC5FbGVtZW50Tm9kZSB7XG4gIGxldCBub3JtYWxpemVkOiBCdWlsZEVsZW1lbnRPcHRpb25zO1xuICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgIG5vcm1hbGl6ZWQgPSBub3JtYWxpemVFbGVtZW50T3B0aW9ucyhvcHRpb25zLCAuLi5yZXN0KTtcbiAgfSBlbHNlIHtcbiAgICBub3JtYWxpemVkID0gb3B0aW9ucyB8fCB7fTtcbiAgfVxuXG4gIGxldCB7IGF0dHJzLCBibG9ja1BhcmFtcywgbW9kaWZpZXJzLCBjb21tZW50cywgY2hpbGRyZW4sIGxvYyB9ID0gbm9ybWFsaXplZDtcblxuICAvLyB0aGlzIGlzIHVzZWQgZm9yIGJhY2t3YXJkcyBjb21wYXQsIHByaW9yIHRvIGBzZWxmQ2xvc2luZ2AgYmVpbmcgcGFydCBvZiB0aGUgRWxlbWVudE5vZGUgQVNUXG4gIGxldCBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICBpZiAodHlwZW9mIHRhZyA9PT0gJ29iamVjdCcpIHtcbiAgICBzZWxmQ2xvc2luZyA9IHRhZy5zZWxmQ2xvc2luZztcbiAgICB0YWcgPSB0YWcubmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGFnLnNsaWNlKC0xKSA9PT0gJy8nKSB7XG4gICAgICB0YWcgPSB0YWcuc2xpY2UoMCwgLTEpO1xuICAgICAgc2VsZkNsb3NpbmcgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0VsZW1lbnROb2RlJyxcbiAgICB0YWc6IHRhZyB8fCAnJyxcbiAgICBzZWxmQ2xvc2luZzogc2VsZkNsb3NpbmcsXG4gICAgYXR0cmlidXRlczogYXR0cnMgfHwgW10sXG4gICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zIHx8IFtdLFxuICAgIG1vZGlmaWVyczogbW9kaWZpZXJzIHx8IFtdLFxuICAgIGNvbW1lbnRzOiAoY29tbWVudHMgYXMgQVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudFtdKSB8fCBbXSxcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4gfHwgW10sXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXR0cihcbiAgbmFtZTogc3RyaW5nLFxuICB2YWx1ZTogQVNULkF0dHJOb2RlWyd2YWx1ZSddLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5BdHRyTm9kZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0F0dHJOb2RlJyxcbiAgICBuYW1lOiBuYW1lLFxuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRUZXh0KGNoYXJzPzogc3RyaW5nLCBsb2M/OiBBU1QuU291cmNlTG9jYXRpb24pOiBBU1QuVGV4dE5vZGUge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUZXh0Tm9kZScsXG4gICAgY2hhcnM6IGNoYXJzIHx8ICcnLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG4vLyBFeHByZXNzaW9uc1xuXG5mdW5jdGlvbiBidWlsZFNleHByKFxuICBwYXRoOiBCdWlsZGVySGVhZCxcbiAgcGFyYW1zPzogQVNULkV4cHJlc3Npb25bXSxcbiAgaGFzaD86IEFTVC5IYXNoLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IEFTVC5TdWJFeHByZXNzaW9uIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnU3ViRXhwcmVzc2lvbicsXG4gICAgcGF0aDogYnVpbGRIZWFkKHBhdGgpLFxuICAgIHBhcmFtczogcGFyYW1zIHx8IFtdLFxuICAgIGhhc2g6IGhhc2ggfHwgYnVpbGRIYXNoKFtdKSxcbiAgICBsb2M6IGJ1aWxkTG9jKGxvYyB8fCBudWxsKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRIZWFkKG9yaWdpbmFsOiBCdWlsZGVySGVhZCwgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULkV4cHJlc3Npb24ge1xuICBpZiAodHlwZW9mIG9yaWdpbmFsICE9PSAnc3RyaW5nJykgcmV0dXJuIG9yaWdpbmFsO1xuXG4gIGxldCBwYXJ0cyA9IG9yaWdpbmFsLnNwbGl0KCcuJyk7XG4gIGxldCB0aGlzSGVhZCA9IGZhbHNlO1xuXG4gIGlmIChwYXJ0c1swXSA9PT0gJ3RoaXMnKSB7XG4gICAgdGhpc0hlYWQgPSB0cnVlO1xuICAgIHBhcnRzID0gcGFydHMuc2xpY2UoMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicsXG4gICAgb3JpZ2luYWwsXG4gICAgdGhpczogdGhpc0hlYWQsXG4gICAgcGFydHMsXG4gICAgZGF0YTogZmFsc2UsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTGl0ZXJhbDxUIGV4dGVuZHMgQVNULkxpdGVyYWw+KFxuICB0eXBlOiBUWyd0eXBlJ10sXG4gIHZhbHVlOiBUWyd2YWx1ZSddLFxuICBsb2M/OiBBU1QuU291cmNlTG9jYXRpb25cbik6IFQge1xuICByZXR1cm4ge1xuICAgIHR5cGUsXG4gICAgdmFsdWUsXG4gICAgb3JpZ2luYWw6IHZhbHVlLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9IGFzIFQ7XG59XG5cbi8vIE1pc2NlbGxhbmVvdXNcblxuZnVuY3Rpb24gYnVpbGRIYXNoKHBhaXJzPzogQVNULkhhc2hQYWlyW10sIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvbik6IEFTVC5IYXNoIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnSGFzaCcsXG4gICAgcGFpcnM6IHBhaXJzIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFBhaXIoa2V5OiBzdHJpbmcsIHZhbHVlOiBBU1QuRXhwcmVzc2lvbiwgbG9jPzogQVNULlNvdXJjZUxvY2F0aW9uKTogQVNULkhhc2hQYWlyIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnSGFzaFBhaXInLFxuICAgIGtleToga2V5LFxuICAgIHZhbHVlLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFByb2dyYW0oXG4gIGJvZHk/OiBBU1QuU3RhdGVtZW50W10sXG4gIGJsb2NrUGFyYW1zPzogc3RyaW5nW10sXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULlRlbXBsYXRlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnVGVtcGxhdGUnLFxuICAgIGJvZHk6IGJvZHkgfHwgW10sXG4gICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZEJsb2NrSXRzZWxmKFxuICBib2R5PzogQVNULlN0YXRlbWVudFtdLFxuICBibG9ja1BhcmFtcz86IHN0cmluZ1tdLFxuICBjaGFpbmVkID0gZmFsc2UsXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULkJsb2NrIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQmxvY2snLFxuICAgIGJvZHk6IGJvZHkgfHwgW10sXG4gICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zIHx8IFtdLFxuICAgIGNoYWluZWQsXG4gICAgbG9jOiBidWlsZExvYyhsb2MgfHwgbnVsbCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGVtcGxhdGUoXG4gIGJvZHk/OiBBU1QuU3RhdGVtZW50W10sXG4gIGJsb2NrUGFyYW1zPzogc3RyaW5nW10sXG4gIGxvYz86IEFTVC5Tb3VyY2VMb2NhdGlvblxuKTogQVNULlRlbXBsYXRlIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnVGVtcGxhdGUnLFxuICAgIGJvZHk6IGJvZHkgfHwgW10sXG4gICAgYmxvY2tQYXJhbXM6IGJsb2NrUGFyYW1zIHx8IFtdLFxuICAgIGxvYzogYnVpbGRMb2MobG9jIHx8IG51bGwpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBidWlsZFNvdXJjZShzb3VyY2U/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIHNvdXJjZSB8fCBudWxsO1xufVxuXG5mdW5jdGlvbiBidWlsZFBvc2l0aW9uKGxpbmU6IG51bWJlciwgY29sdW1uOiBudW1iZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBsaW5lLFxuICAgIGNvbHVtbixcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IFNZTlRIRVRJQzogQVNULlNvdXJjZUxvY2F0aW9uID0ge1xuICBzb3VyY2U6ICcoc3ludGhldGljKScsXG4gIHN0YXJ0OiB7IGxpbmU6IDEsIGNvbHVtbjogMCB9LFxuICBlbmQ6IHsgbGluZTogMSwgY29sdW1uOiAwIH0sXG59O1xuXG5mdW5jdGlvbiBidWlsZExvYyhsb2M6IE9wdGlvbjxBU1QuU291cmNlTG9jYXRpb24+KTogQVNULlNvdXJjZUxvY2F0aW9uO1xuZnVuY3Rpb24gYnVpbGRMb2MoXG4gIHN0YXJ0TGluZTogbnVtYmVyLFxuICBzdGFydENvbHVtbjogbnVtYmVyLFxuICBlbmRMaW5lPzogbnVtYmVyLFxuICBlbmRDb2x1bW4/OiBudW1iZXIsXG4gIHNvdXJjZT86IHN0cmluZ1xuKTogQVNULlNvdXJjZUxvY2F0aW9uO1xuXG5mdW5jdGlvbiBidWlsZExvYyguLi5hcmdzOiBhbnlbXSk6IEFTVC5Tb3VyY2VMb2NhdGlvbiB7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxldCBsb2MgPSBhcmdzWzBdO1xuXG4gICAgaWYgKGxvYyAmJiB0eXBlb2YgbG9jID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc291cmNlOiBidWlsZFNvdXJjZShsb2Muc291cmNlKSxcbiAgICAgICAgc3RhcnQ6IGJ1aWxkUG9zaXRpb24obG9jLnN0YXJ0LmxpbmUsIGxvYy5zdGFydC5jb2x1bW4pLFxuICAgICAgICBlbmQ6IGJ1aWxkUG9zaXRpb24obG9jLmVuZC5saW5lLCBsb2MuZW5kLmNvbHVtbiksXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gU1lOVEhFVElDO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgW3N0YXJ0TGluZSwgc3RhcnRDb2x1bW4sIGVuZExpbmUsIGVuZENvbHVtbiwgc291cmNlXSA9IGFyZ3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZTogYnVpbGRTb3VyY2Uoc291cmNlKSxcbiAgICAgIHN0YXJ0OiBidWlsZFBvc2l0aW9uKHN0YXJ0TGluZSwgc3RhcnRDb2x1bW4pLFxuICAgICAgZW5kOiBidWlsZFBvc2l0aW9uKGVuZExpbmUsIGVuZENvbHVtbiksXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG11c3RhY2hlOiBidWlsZE11c3RhY2hlLFxuICBibG9jazogYnVpbGRCbG9jayxcbiAgcGFydGlhbDogYnVpbGRQYXJ0aWFsLFxuICBjb21tZW50OiBidWlsZENvbW1lbnQsXG4gIG11c3RhY2hlQ29tbWVudDogYnVpbGRNdXN0YWNoZUNvbW1lbnQsXG4gIGVsZW1lbnQ6IGJ1aWxkRWxlbWVudCxcbiAgZWxlbWVudE1vZGlmaWVyOiBidWlsZEVsZW1lbnRNb2RpZmllcixcbiAgYXR0cjogYnVpbGRBdHRyLFxuICB0ZXh0OiBidWlsZFRleHQsXG4gIHNleHByOiBidWlsZFNleHByLFxuICBwYXRoOiBidWlsZEhlYWQsXG4gIGNvbmNhdDogYnVpbGRDb25jYXQsXG4gIGhhc2g6IGJ1aWxkSGFzaCxcbiAgcGFpcjogYnVpbGRQYWlyLFxuICBsaXRlcmFsOiBidWlsZExpdGVyYWwsXG4gIHByb2dyYW06IGJ1aWxkUHJvZ3JhbSxcbiAgYmxvY2tJdHNlbGY6IGJ1aWxkQmxvY2tJdHNlbGYsXG4gIHRlbXBsYXRlOiBidWlsZFRlbXBsYXRlLFxuICBsb2M6IGJ1aWxkTG9jLFxuICBwb3M6IGJ1aWxkUG9zaXRpb24sXG5cbiAgc3RyaW5nOiBsaXRlcmFsKCdTdHJpbmdMaXRlcmFsJykgYXMgKHZhbHVlOiBzdHJpbmcpID0+IFN0cmluZ0xpdGVyYWwsXG4gIGJvb2xlYW46IGxpdGVyYWwoJ0Jvb2xlYW5MaXRlcmFsJykgYXMgKHZhbHVlOiBib29sZWFuKSA9PiBCb29sZWFuTGl0ZXJhbCxcbiAgbnVtYmVyOiBsaXRlcmFsKCdOdW1iZXJMaXRlcmFsJykgYXMgKHZhbHVlOiBudW1iZXIpID0+IE51bWJlckxpdGVyYWwsXG4gIHVuZGVmaW5lZCgpIHtcbiAgICByZXR1cm4gYnVpbGRMaXRlcmFsKCdVbmRlZmluZWRMaXRlcmFsJywgdW5kZWZpbmVkKTtcbiAgfSxcbiAgbnVsbCgpIHtcbiAgICByZXR1cm4gYnVpbGRMaXRlcmFsKCdOdWxsTGl0ZXJhbCcsIG51bGwpO1xuICB9LFxufTtcblxudHlwZSBCdWlsZExpdGVyYWw8VCBleHRlbmRzIEFTVC5MaXRlcmFsPiA9ICh2YWx1ZTogVFsndmFsdWUnXSkgPT4gVDtcblxuZnVuY3Rpb24gbGl0ZXJhbDxUIGV4dGVuZHMgQVNULkxpdGVyYWw+KHR5cGU6IFRbJ3R5cGUnXSk6IEJ1aWxkTGl0ZXJhbDxUPiB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWU6IFRbJ3ZhbHVlJ10pOiBUIHtcbiAgICByZXR1cm4gYnVpbGRMaXRlcmFsKHR5cGUsIHZhbHVlKTtcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ludGF4RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGxvY2F0aW9uOiBBU1QuU291cmNlTG9jYXRpb247XG4gIGNvbnN0cnVjdG9yOiBTeW50YXhFcnJvckNvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN5bnRheEVycm9yQ29uc3RydWN0b3Ige1xuICBuZXcgKG1lc3NhZ2U6IHN0cmluZywgbG9jYXRpb246IEFTVC5Tb3VyY2VMb2NhdGlvbik6IFN5bnRheEVycm9yO1xuICByZWFkb25seSBwcm90b3R5cGU6IFN5bnRheEVycm9yO1xufVxuXG4vKipcbiAqIFN1YmNsYXNzIG9mIGBFcnJvcmAgd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uXG4gKiBhYm91dCBsb2NhdGlvbiBvZiBpbmNvcnJlY3QgbWFya3VwLlxuICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5jb25zdCBTeW50YXhFcnJvcjogU3ludGF4RXJyb3JDb25zdHJ1Y3RvciA9IChmdW5jdGlvbiAoKSB7XG4gIFN5bnRheEVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbiAgU3ludGF4RXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ludGF4RXJyb3I7XG5cbiAgZnVuY3Rpb24gU3ludGF4RXJyb3IodGhpczogU3ludGF4RXJyb3IsIG1lc3NhZ2U6IHN0cmluZywgbG9jYXRpb246IEFTVC5Tb3VyY2VMb2NhdGlvbikge1xuICAgIGxldCBlcnJvciA9IEVycm9yLmNhbGwodGhpcywgbWVzc2FnZSk7XG5cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gIH1cblxuICByZXR1cm4gU3ludGF4RXJyb3IgYXMgYW55O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgU3ludGF4RXJyb3I7XG4iLCJpbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCBTeW50YXhFcnJvciBmcm9tICcuL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuXG4vLyBSZWdleCB0byB2YWxpZGF0ZSB0aGUgaWRlbnRpZmllciBmb3IgYmxvY2sgcGFyYW1ldGVycy5cbi8vIEJhc2VkIG9uIHRoZSBJRCB2YWxpZGF0aW9uIHJlZ2V4IGluIEhhbmRsZWJhcnMuXG5cbmxldCBJRF9JTlZFUlNFX1BBVFRFUk4gPSAvWyFcIiMlLSxcXC5cXC87LT5AXFxbLVxcXmBcXHstfl0vO1xuXG4vLyBDaGVja3MgdGhlIGVsZW1lbnQncyBhdHRyaWJ1dGVzIHRvIHNlZSBpZiBpdCB1c2VzIGJsb2NrIHBhcmFtcy5cbi8vIElmIGl0IGRvZXMsIHJlZ2lzdGVycyB0aGUgYmxvY2sgcGFyYW1zIHdpdGggdGhlIHByb2dyYW0gYW5kXG4vLyByZW1vdmVzIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZXMgZnJvbSB0aGUgZWxlbWVudC5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQ6IEFTVC5FbGVtZW50Tm9kZSkge1xuICBsZXQgcGFyYW1zID0gcGFyc2VCbG9ja1BhcmFtcyhlbGVtZW50KTtcbiAgaWYgKHBhcmFtcykgZWxlbWVudC5ibG9ja1BhcmFtcyA9IHBhcmFtcztcbn1cblxuZnVuY3Rpb24gcGFyc2VCbG9ja1BhcmFtcyhlbGVtZW50OiBBU1QuRWxlbWVudE5vZGUpOiBPcHRpb248c3RyaW5nW10+IHtcbiAgbGV0IGwgPSBlbGVtZW50LmF0dHJpYnV0ZXMubGVuZ3RoO1xuICBsZXQgYXR0ck5hbWVzID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBhdHRyTmFtZXMucHVzaChlbGVtZW50LmF0dHJpYnV0ZXNbaV0ubmFtZSk7XG4gIH1cblxuICBsZXQgYXNJbmRleCA9IGF0dHJOYW1lcy5pbmRleE9mKCdhcycpO1xuXG4gIGlmIChhc0luZGV4ICE9PSAtMSAmJiBsID4gYXNJbmRleCAmJiBhdHRyTmFtZXNbYXNJbmRleCArIDFdLmNoYXJBdCgwKSA9PT0gJ3wnKSB7XG4gICAgLy8gU29tZSBiYXNpYyB2YWxpZGF0aW9uLCBzaW5jZSB3ZSdyZSBkb2luZyB0aGUgcGFyc2luZyBvdXJzZWx2ZXNcbiAgICBsZXQgcGFyYW1zU3RyaW5nID0gYXR0ck5hbWVzLnNsaWNlKGFzSW5kZXgpLmpvaW4oJyAnKTtcbiAgICBpZiAoXG4gICAgICBwYXJhbXNTdHJpbmcuY2hhckF0KHBhcmFtc1N0cmluZy5sZW5ndGggLSAxKSAhPT0gJ3wnIHx8XG4gICAgICBwYXJhbXNTdHJpbmcubWF0Y2goL1xcfC9nKSEubGVuZ3RoICE9PSAyXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJJbnZhbGlkIGJsb2NrIHBhcmFtZXRlcnMgc3ludGF4OiAnXCIgKyBwYXJhbXNTdHJpbmcgKyBcIidcIiwgZWxlbWVudC5sb2MpO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gYXNJbmRleCArIDE7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxldCBwYXJhbSA9IGF0dHJOYW1lc1tpXS5yZXBsYWNlKC9cXHwvZywgJycpO1xuICAgICAgaWYgKHBhcmFtICE9PSAnJykge1xuICAgICAgICBpZiAoSURfSU5WRVJTRV9QQVRURVJOLnRlc3QocGFyYW0pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgICAgXCJJbnZhbGlkIGlkZW50aWZpZXIgZm9yIGJsb2NrIHBhcmFtZXRlcnM6ICdcIiArIHBhcmFtICsgXCInIGluICdcIiArIHBhcmFtc1N0cmluZyArIFwiJ1wiLFxuICAgICAgICAgICAgZWxlbWVudC5sb2NcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcy5wdXNoKHBhcmFtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBcIkNhbm5vdCB1c2UgemVybyBibG9jayBwYXJhbWV0ZXJzOiAnXCIgKyBwYXJhbXNTdHJpbmcgKyBcIidcIixcbiAgICAgICAgZWxlbWVudC5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgZWxlbWVudC5hdHRyaWJ1dGVzID0gZWxlbWVudC5hdHRyaWJ1dGVzLnNsaWNlKDAsIGFzSW5kZXgpO1xuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkcmVuRm9yKFxuICBub2RlOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUgfCBBU1QuRWxlbWVudE5vZGVcbik6IEFTVC5Ub3BMZXZlbFN0YXRlbWVudFtdIHtcbiAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICBjYXNlICdCbG9jayc6XG4gICAgY2FzZSAnVGVtcGxhdGUnOlxuICAgICAgcmV0dXJuIG5vZGUuYm9keTtcbiAgICBjYXNlICdFbGVtZW50Tm9kZSc6XG4gICAgICByZXR1cm4gbm9kZS5jaGlsZHJlbjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kQ2hpbGQoXG4gIHBhcmVudDogQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlIHwgQVNULkVsZW1lbnROb2RlLFxuICBub2RlOiBBU1QuU3RhdGVtZW50XG4pIHtcbiAgY2hpbGRyZW5Gb3IocGFyZW50KS5wdXNoKG5vZGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMaXRlcmFsKHBhdGg6IEhCUy5FeHByZXNzaW9uKTogcGF0aCBpcyBIQlMuTGl0ZXJhbDtcbmV4cG9ydCBmdW5jdGlvbiBpc0xpdGVyYWwocGF0aDogQVNULkV4cHJlc3Npb24pOiBwYXRoIGlzIEFTVC5MaXRlcmFsO1xuZXhwb3J0IGZ1bmN0aW9uIGlzTGl0ZXJhbChcbiAgcGF0aDogSEJTLkV4cHJlc3Npb24gfCBBU1QuRXhwcmVzc2lvblxuKTogcGF0aCBpcyBIQlMuTGl0ZXJhbCB8IEFTVC5MaXRlcmFsIHtcbiAgcmV0dXJuIChcbiAgICBwYXRoLnR5cGUgPT09ICdTdHJpbmdMaXRlcmFsJyB8fFxuICAgIHBhdGgudHlwZSA9PT0gJ0Jvb2xlYW5MaXRlcmFsJyB8fFxuICAgIHBhdGgudHlwZSA9PT0gJ051bWJlckxpdGVyYWwnIHx8XG4gICAgcGF0aC50eXBlID09PSAnTnVsbExpdGVyYWwnIHx8XG4gICAgcGF0aC50eXBlID09PSAnVW5kZWZpbmVkTGl0ZXJhbCdcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50TGl0ZXJhbChsaXRlcmFsOiBBU1QuTGl0ZXJhbCk6IHN0cmluZyB7XG4gIGlmIChsaXRlcmFsLnR5cGUgPT09ICdVbmRlZmluZWRMaXRlcmFsJykge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobGl0ZXJhbC52YWx1ZSk7XG4gIH1cbn1cbiIsImltcG9ydCB7XG4gIEV2ZW50ZWRUb2tlbml6ZXIsXG4gIEVudGl0eVBhcnNlcixcbiAgSFRNTDVOYW1lZENoYXJSZWZzIGFzIG5hbWVkQ2hhclJlZnMsXG59IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydCwgZXhwZWN0IH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5cbmV4cG9ydCB0eXBlIEVsZW1lbnQgPSBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2sgfCBBU1QuRWxlbWVudE5vZGU7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFnPFQgZXh0ZW5kcyAnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+IHtcbiAgdHlwZTogVDtcbiAgbmFtZTogc3RyaW5nO1xuICBhdHRyaWJ1dGVzOiBhbnlbXTtcbiAgbW9kaWZpZXJzOiBhbnlbXTtcbiAgY29tbWVudHM6IGFueVtdO1xuICBzZWxmQ2xvc2luZzogYm9vbGVhbjtcbiAgbG9jOiBBU1QuU291cmNlTG9jYXRpb247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlIHtcbiAgbmFtZTogc3RyaW5nO1xuICBwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXTtcbiAgaXNRdW90ZWQ6IGJvb2xlYW47XG4gIGlzRHluYW1pYzogYm9vbGVhbjtcbiAgc3RhcnQ6IEFTVC5Qb3NpdGlvbjtcbiAgdmFsdWVTdGFydExpbmU6IG51bWJlcjtcbiAgdmFsdWVTdGFydENvbHVtbjogbnVtYmVyO1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGFyc2VyIHtcbiAgcHJvdGVjdGVkIGVsZW1lbnRTdGFjazogRWxlbWVudFtdID0gW107XG4gIHByaXZhdGUgc291cmNlOiBzdHJpbmdbXTtcbiAgcHVibGljIGN1cnJlbnRBdHRyaWJ1dGU6IE9wdGlvbjxBdHRyaWJ1dGU+ID0gbnVsbDtcbiAgcHVibGljIGN1cnJlbnROb2RlOiBPcHRpb248XG4gICAgQVNULkNvbW1lbnRTdGF0ZW1lbnQgfCBBU1QuVGV4dE5vZGUgfCBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPlxuICA+ID0gbnVsbDtcbiAgcHVibGljIHRva2VuaXplcjogRXZlbnRlZFRva2VuaXplcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzb3VyY2U6IHN0cmluZyxcbiAgICBlbnRpdHlQYXJzZXIgPSBuZXcgRW50aXR5UGFyc2VyKG5hbWVkQ2hhclJlZnMpLFxuICAgIG1vZGU6ICdwcmVjb21waWxlJyB8ICdjb2RlbW9kJyA9ICdwcmVjb21waWxlJ1xuICApIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZS5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgIHRoaXMudG9rZW5pemVyID0gbmV3IEV2ZW50ZWRUb2tlbml6ZXIodGhpcywgZW50aXR5UGFyc2VyLCBtb2RlKTtcbiAgfVxuXG4gIGFic3RyYWN0IFByb2dyYW0obm9kZTogSEJTLlByb2dyYW0pOiBIQlMuT3V0cHV0PCdQcm9ncmFtJz47XG4gIGFic3RyYWN0IE11c3RhY2hlU3RhdGVtZW50KG5vZGU6IEhCUy5NdXN0YWNoZVN0YXRlbWVudCk6IEhCUy5PdXRwdXQ8J011c3RhY2hlU3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IERlY29yYXRvcihub2RlOiBIQlMuRGVjb3JhdG9yKTogSEJTLk91dHB1dDwnRGVjb3JhdG9yJz47XG4gIGFic3RyYWN0IEJsb2NrU3RhdGVtZW50KG5vZGU6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEhCUy5PdXRwdXQ8J0Jsb2NrU3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IERlY29yYXRvckJsb2NrKG5vZGU6IEhCUy5EZWNvcmF0b3JCbG9jayk6IEhCUy5PdXRwdXQ8J0RlY29yYXRvckJsb2NrJz47XG4gIGFic3RyYWN0IFBhcnRpYWxTdGF0ZW1lbnQobm9kZTogSEJTLlBhcnRpYWxTdGF0ZW1lbnQpOiBIQlMuT3V0cHV0PCdQYXJ0aWFsU3RhdGVtZW50Jz47XG4gIGFic3RyYWN0IFBhcnRpYWxCbG9ja1N0YXRlbWVudChcbiAgICBub2RlOiBIQlMuUGFydGlhbEJsb2NrU3RhdGVtZW50XG4gICk6IEhCUy5PdXRwdXQ8J1BhcnRpYWxCbG9ja1N0YXRlbWVudCc+O1xuICBhYnN0cmFjdCBDb250ZW50U3RhdGVtZW50KG5vZGU6IEhCUy5Db250ZW50U3RhdGVtZW50KTogSEJTLk91dHB1dDwnQ29udGVudFN0YXRlbWVudCc+O1xuICBhYnN0cmFjdCBDb21tZW50U3RhdGVtZW50KG5vZGU6IEhCUy5Db21tZW50U3RhdGVtZW50KTogSEJTLk91dHB1dDwnQ29tbWVudFN0YXRlbWVudCc+O1xuICBhYnN0cmFjdCBTdWJFeHByZXNzaW9uKG5vZGU6IEhCUy5TdWJFeHByZXNzaW9uKTogSEJTLk91dHB1dDwnU3ViRXhwcmVzc2lvbic+O1xuICBhYnN0cmFjdCBQYXRoRXhwcmVzc2lvbihub2RlOiBIQlMuUGF0aEV4cHJlc3Npb24pOiBIQlMuT3V0cHV0PCdQYXRoRXhwcmVzc2lvbic+O1xuICBhYnN0cmFjdCBTdHJpbmdMaXRlcmFsKG5vZGU6IEhCUy5TdHJpbmdMaXRlcmFsKTogSEJTLk91dHB1dDwnU3RyaW5nTGl0ZXJhbCc+O1xuICBhYnN0cmFjdCBCb29sZWFuTGl0ZXJhbChub2RlOiBIQlMuQm9vbGVhbkxpdGVyYWwpOiBIQlMuT3V0cHV0PCdCb29sZWFuTGl0ZXJhbCc+O1xuICBhYnN0cmFjdCBOdW1iZXJMaXRlcmFsKG5vZGU6IEhCUy5OdW1iZXJMaXRlcmFsKTogSEJTLk91dHB1dDwnTnVtYmVyTGl0ZXJhbCc+O1xuICBhYnN0cmFjdCBVbmRlZmluZWRMaXRlcmFsKG5vZGU6IEhCUy5VbmRlZmluZWRMaXRlcmFsKTogSEJTLk91dHB1dDwnVW5kZWZpbmVkTGl0ZXJhbCc+O1xuICBhYnN0cmFjdCBOdWxsTGl0ZXJhbChub2RlOiBIQlMuTnVsbExpdGVyYWwpOiBIQlMuT3V0cHV0PCdOdWxsTGl0ZXJhbCc+O1xuXG4gIGFic3RyYWN0IHJlc2V0KCk6IHZvaWQ7XG4gIGFic3RyYWN0IGZpbmlzaERhdGEoKTogdm9pZDtcbiAgYWJzdHJhY3QgdGFnT3BlbigpOiB2b2lkO1xuICBhYnN0cmFjdCBiZWdpbkRhdGEoKTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwZW5kVG9EYXRhKGNoYXI6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luU3RhcnRUYWcoKTogdm9pZDtcbiAgYWJzdHJhY3QgYXBwZW5kVG9UYWdOYW1lKGNoYXI6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGVuZFRvQXR0cmlidXRlTmFtZShjaGFyOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBiZWdpbkF0dHJpYnV0ZVZhbHVlKHF1b3RlZDogYm9vbGVhbik6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGVuZFRvQXR0cmlidXRlVmFsdWUoY2hhcjogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQXR0cmlidXRlVmFsdWUoKTogdm9pZDtcbiAgYWJzdHJhY3QgbWFya1RhZ0FzU2VsZkNsb3NpbmcoKTogdm9pZDtcbiAgYWJzdHJhY3QgYmVnaW5FbmRUYWcoKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoVGFnKCk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQ29tbWVudCgpOiB2b2lkO1xuICBhYnN0cmFjdCBhcHBlbmRUb0NvbW1lbnREYXRhKGNoYXI6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGZpbmlzaENvbW1lbnQoKTogdm9pZDtcbiAgYWJzdHJhY3QgcmVwb3J0U3ludGF4RXJyb3IoZXJyb3I6IHN0cmluZyk6IHZvaWQ7XG5cbiAgZ2V0IGN1cnJlbnRBdHRyKCk6IEF0dHJpYnV0ZSB7XG4gICAgcmV0dXJuIGV4cGVjdCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUsICdleHBlY3RlZCBhdHRyaWJ1dGUnKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGFnKCk6IFRhZzwnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+IHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuY3VycmVudE5vZGU7XG4gICAgYXNzZXJ0KG5vZGUgJiYgKG5vZGUudHlwZSA9PT0gJ1N0YXJ0VGFnJyB8fCBub2RlLnR5cGUgPT09ICdFbmRUYWcnKSwgJ2V4cGVjdGVkIHRhZycpO1xuICAgIHJldHVybiBub2RlIGFzIFRhZzwnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+O1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRTdGFydFRhZygpOiBUYWc8J1N0YXJ0VGFnJz4ge1xuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBhc3NlcnQobm9kZSAmJiBub2RlLnR5cGUgPT09ICdTdGFydFRhZycsICdleHBlY3RlZCBzdGFydCB0YWcnKTtcbiAgICByZXR1cm4gbm9kZSBhcyBUYWc8J1N0YXJ0VGFnJz47XG4gIH1cblxuICBnZXQgY3VycmVudEVuZFRhZygpOiBUYWc8J0VuZFRhZyc+IHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuY3VycmVudE5vZGU7XG4gICAgYXNzZXJ0KG5vZGUgJiYgbm9kZS50eXBlID09PSAnRW5kVGFnJywgJ2V4cGVjdGVkIGVuZCB0YWcnKTtcbiAgICByZXR1cm4gbm9kZSBhcyBUYWc8J0VuZFRhZyc+O1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRDb21tZW50KCk6IEFTVC5Db21tZW50U3RhdGVtZW50IHtcbiAgICBsZXQgbm9kZSA9IHRoaXMuY3VycmVudE5vZGU7XG4gICAgYXNzZXJ0KG5vZGUgJiYgbm9kZS50eXBlID09PSAnQ29tbWVudFN0YXRlbWVudCcsICdleHBlY3RlZCBhIGNvbW1lbnQnKTtcbiAgICByZXR1cm4gbm9kZSBhcyBBU1QuQ29tbWVudFN0YXRlbWVudDtcbiAgfVxuXG4gIGdldCBjdXJyZW50RGF0YSgpOiBBU1QuVGV4dE5vZGUge1xuICAgIGxldCBub2RlID0gdGhpcy5jdXJyZW50Tm9kZTtcbiAgICBhc3NlcnQobm9kZSAmJiBub2RlLnR5cGUgPT09ICdUZXh0Tm9kZScsICdleHBlY3RlZCBhIHRleHQgbm9kZScpO1xuICAgIHJldHVybiBub2RlIGFzIEFTVC5UZXh0Tm9kZTtcbiAgfVxuXG4gIGFjY2VwdFRlbXBsYXRlKG5vZGU6IEhCUy5Qcm9ncmFtKTogQVNULlRlbXBsYXRlIHtcbiAgICByZXR1cm4gKHRoaXMgYXMgYW55KVtub2RlLnR5cGVdKG5vZGUpIGFzIEFTVC5UZW1wbGF0ZTtcbiAgfVxuXG4gIGFjY2VwdE5vZGUobm9kZTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGU7XG4gIGFjY2VwdE5vZGU8VSBleHRlbmRzIEhCUy5Ob2RlIHwgQVNULk5vZGU+KG5vZGU6IEhCUy5Ob2RlKTogVTtcbiAgYWNjZXB0Tm9kZShub2RlOiBIQlMuTm9kZSk6IGFueSB7XG4gICAgcmV0dXJuICh0aGlzIGFzIGFueSlbbm9kZS50eXBlXShub2RlKTtcbiAgfVxuXG4gIGN1cnJlbnRFbGVtZW50KCk6IEVsZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRTdGFja1t0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIHNvdXJjZUZvck5vZGUobm9kZTogSEJTLk5vZGUsIGVuZE5vZGU/OiB7IGxvYzogSEJTLlNvdXJjZUxvY2F0aW9uIH0pOiBzdHJpbmcge1xuICAgIGxldCBmaXJzdExpbmUgPSBub2RlLmxvYy5zdGFydC5saW5lIC0gMTtcbiAgICBsZXQgY3VycmVudExpbmUgPSBmaXJzdExpbmUgLSAxO1xuICAgIGxldCBmaXJzdENvbHVtbiA9IG5vZGUubG9jLnN0YXJ0LmNvbHVtbjtcbiAgICBsZXQgc3RyaW5nID0gW107XG4gICAgbGV0IGxpbmU7XG5cbiAgICBsZXQgbGFzdExpbmU6IG51bWJlcjtcbiAgICBsZXQgbGFzdENvbHVtbjogbnVtYmVyO1xuXG4gICAgaWYgKGVuZE5vZGUpIHtcbiAgICAgIGxhc3RMaW5lID0gZW5kTm9kZS5sb2MuZW5kLmxpbmUgLSAxO1xuICAgICAgbGFzdENvbHVtbiA9IGVuZE5vZGUubG9jLmVuZC5jb2x1bW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3RMaW5lID0gbm9kZS5sb2MuZW5kLmxpbmUgLSAxO1xuICAgICAgbGFzdENvbHVtbiA9IG5vZGUubG9jLmVuZC5jb2x1bW47XG4gICAgfVxuXG4gICAgd2hpbGUgKGN1cnJlbnRMaW5lIDwgbGFzdExpbmUpIHtcbiAgICAgIGN1cnJlbnRMaW5lKys7XG4gICAgICBsaW5lID0gdGhpcy5zb3VyY2VbY3VycmVudExpbmVdO1xuXG4gICAgICBpZiAoY3VycmVudExpbmUgPT09IGZpcnN0TGluZSkge1xuICAgICAgICBpZiAoZmlyc3RMaW5lID09PSBsYXN0TGluZSkge1xuICAgICAgICAgIHN0cmluZy5wdXNoKGxpbmUuc2xpY2UoZmlyc3RDb2x1bW4sIGxhc3RDb2x1bW4pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJpbmcucHVzaChsaW5lLnNsaWNlKGZpcnN0Q29sdW1uKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudExpbmUgPT09IGxhc3RMaW5lKSB7XG4gICAgICAgIHN0cmluZy5wdXNoKGxpbmUuc2xpY2UoMCwgbGFzdENvbHVtbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyaW5nLnB1c2gobGluZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZy5qb2luKCdcXG4nKTtcbiAgfVxufVxuIiwiaW1wb3J0IGIgZnJvbSAnLi4vYnVpbGRlcnMnO1xuaW1wb3J0IHsgYXBwZW5kQ2hpbGQsIGlzTGl0ZXJhbCwgcHJpbnRMaXRlcmFsIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCAqIGFzIEhCUyBmcm9tICcuLi90eXBlcy9oYW5kbGViYXJzLWFzdCc7XG5pbXBvcnQgeyBQYXJzZXIsIFRhZywgQXR0cmlidXRlIH0gZnJvbSAnLi4vcGFyc2VyJztcbmltcG9ydCBTeW50YXhFcnJvciBmcm9tICcuLi9lcnJvcnMvc3ludGF4LWVycm9yJztcbmltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgUmVjYXN0IH0gZnJvbSAnQGdsaW1tZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBUb2tlbml6ZXJTdGF0ZSB9IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIGV4dGVuZHMgUGFyc2VyIHtcbiAgYWJzdHJhY3QgYXBwZW5kVG9Db21tZW50RGF0YShzOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBiZWdpbkF0dHJpYnV0ZVZhbHVlKHF1b3RlZDogYm9vbGVhbik6IHZvaWQ7XG4gIGFic3RyYWN0IGZpbmlzaEF0dHJpYnV0ZVZhbHVlKCk6IHZvaWQ7XG5cbiAgcHJpdmF0ZSBnZXQgaXNUb3BMZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID09PSAwO1xuICB9XG5cbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZTtcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5UZW1wbGF0ZSB8IEFTVC5CbG9jaztcbiAgUHJvZ3JhbShwcm9ncmFtOiBIQlMuUHJvZ3JhbSk6IEFTVC5CbG9jayB8IEFTVC5UZW1wbGF0ZSB7XG4gICAgbGV0IGJvZHk6IEFTVC5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGxldCBub2RlO1xuXG4gICAgaWYgKHRoaXMuaXNUb3BMZXZlbCkge1xuICAgICAgbm9kZSA9IGIudGVtcGxhdGUoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5sb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gYi5ibG9ja0l0c2VsZihib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmNoYWluZWQsIHByb2dyYW0ubG9jKTtcbiAgICB9XG5cbiAgICBsZXQgaSxcbiAgICAgIGwgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuXG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmIChsID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuYWNjZXB0Tm9kZShwcm9ncmFtLmJvZHlbaV0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoYXQgdGhlIGVsZW1lbnQgc3RhY2sgaXMgYmFsYW5jZWQgcHJvcGVybHkuXG4gICAgbGV0IHBvcHBlZE5vZGUgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBpZiAocG9wcGVkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgbGV0IGVsZW1lbnROb2RlID0gcG9wcGVkTm9kZSBhcyBBU1QuRWxlbWVudE5vZGU7XG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1VuY2xvc2VkIGVsZW1lbnQgYCcgKyBlbGVtZW50Tm9kZS50YWcgKyAnYCAob24gbGluZSAnICsgZWxlbWVudE5vZGUubG9jIS5zdGFydC5saW5lICsgJykuJyxcbiAgICAgICAgZWxlbWVudE5vZGUubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEFTVC5CbG9ja1N0YXRlbWVudCB8IHZvaWQge1xuICAgIGlmICh0aGlzLnRva2VuaXplci5zdGF0ZSA9PT0gVG9rZW5pemVyU3RhdGUuY29tbWVudCkge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShibG9jaykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMudG9rZW5pemVyLnN0YXRlICE9PSBUb2tlbml6ZXJTdGF0ZS5kYXRhICYmXG4gICAgICB0aGlzLnRva2VuaXplclsnc3RhdGUnXSAhPT0gVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnQSBibG9jayBtYXkgb25seSBiZSB1c2VkIGluc2lkZSBhbiBIVE1MIGVsZW1lbnQgb3IgYW5vdGhlciBibG9jay4nLFxuICAgICAgICBibG9jay5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgYmxvY2spO1xuICAgIGxldCBwcm9ncmFtID0gdGhpcy5Qcm9ncmFtKGJsb2NrLnByb2dyYW0pO1xuICAgIGxldCBpbnZlcnNlID0gYmxvY2suaW52ZXJzZSA/IHRoaXMuUHJvZ3JhbShibG9jay5pbnZlcnNlKSA6IG51bGw7XG5cbiAgICBsZXQgbm9kZSA9IGIuYmxvY2soXG4gICAgICBwYXRoLFxuICAgICAgcGFyYW1zLFxuICAgICAgaGFzaCxcbiAgICAgIHByb2dyYW0sXG4gICAgICBpbnZlcnNlLFxuICAgICAgYmxvY2subG9jLFxuICAgICAgYmxvY2sub3BlblN0cmlwLFxuICAgICAgYmxvY2suaW52ZXJzZVN0cmlwLFxuICAgICAgYmxvY2suY2xvc2VTdHJpcFxuICAgICk7XG5cbiAgICBsZXQgcGFyZW50UHJvZ3JhbSA9IHRoaXMuY3VycmVudEVsZW1lbnQoKTtcblxuICAgIGFwcGVuZENoaWxkKHBhcmVudFByb2dyYW0sIG5vZGUpO1xuICB9XG5cbiAgTXVzdGFjaGVTdGF0ZW1lbnQocmF3TXVzdGFjaGU6IEhCUy5NdXN0YWNoZVN0YXRlbWVudCk6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IHZvaWQge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09ICdjb21tZW50Jykge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShyYXdNdXN0YWNoZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBtdXN0YWNoZTogQVNULk11c3RhY2hlU3RhdGVtZW50O1xuICAgIGxldCB7IGVzY2FwZWQsIGxvYywgc3RyaXAgfSA9IHJhd011c3RhY2hlO1xuXG4gICAgaWYgKGlzTGl0ZXJhbChyYXdNdXN0YWNoZS5wYXRoKSkge1xuICAgICAgbXVzdGFjaGUgPSB7XG4gICAgICAgIHR5cGU6ICdNdXN0YWNoZVN0YXRlbWVudCcsXG4gICAgICAgIHBhdGg6IHRoaXMuYWNjZXB0Tm9kZTxBU1QuTGl0ZXJhbD4ocmF3TXVzdGFjaGUucGF0aCksXG4gICAgICAgIHBhcmFtczogW10sXG4gICAgICAgIGhhc2g6IGIuaGFzaCgpLFxuICAgICAgICBlc2NhcGVkLFxuICAgICAgICBsb2MsXG4gICAgICAgIHN0cmlwLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXMoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIHJhd011c3RhY2hlIGFzIEhCUy5NdXN0YWNoZVN0YXRlbWVudCAmIHtcbiAgICAgICAgICBwYXRoOiBIQlMuUGF0aEV4cHJlc3Npb247XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICBtdXN0YWNoZSA9IGIubXVzdGFjaGUocGF0aCwgcGFyYW1zLCBoYXNoLCAhZXNjYXBlZCwgbG9jLCBzdHJpcCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIC8vIFRhZyBoZWxwZXJzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ09wZW46XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLnRhZ05hbWU6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IHVzZSBtdXN0YWNoZXMgaW4gYW4gZWxlbWVudHMgdGFnbmFtZTogXFxgJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgICAgICByYXdNdXN0YWNoZSxcbiAgICAgICAgICAgIHJhd011c3RhY2hlLnBhdGhcbiAgICAgICAgICApfVxcYCBhdCBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgICAgIG11c3RhY2hlLmxvY1xuICAgICAgICApO1xuXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWU6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlTmFtZTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICB0aGlzLmZpbmlzaEF0dHJpYnV0ZVZhbHVlKCk7XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYWZ0ZXJBdHRyaWJ1dGVWYWx1ZVF1b3RlZDpcbiAgICAgICAgYWRkRWxlbWVudE1vZGlmaWVyKHRoaXMuY3VycmVudFN0YXJ0VGFnLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBBdHRyaWJ1dGUgdmFsdWVzXG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZVZhbHVlOlxuICAgICAgICB0aGlzLmJlZ2luQXR0cmlidXRlVmFsdWUoZmFsc2UpO1xuICAgICAgICBhcHBlbmREeW5hbWljQXR0cmlidXRlVmFsdWVQYXJ0KHRoaXMuY3VycmVudEF0dHJpYnV0ZSEsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVVucXVvdGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlRG91YmxlUXVvdGVkOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZVNpbmdsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZDpcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyBUT0RPOiBPbmx5IGFwcGVuZCBjaGlsZCB3aGVuIHRoZSB0b2tlbml6ZXIgc3RhdGUgbWFrZXNcbiAgICAgIC8vIHNlbnNlIHRvIGRvIHNvLCBvdGhlcndpc2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIG11c3RhY2hlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbXVzdGFjaGU7XG4gIH1cblxuICBDb250ZW50U3RhdGVtZW50KGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KTogdm9pZCB7XG4gICAgdXBkYXRlVG9rZW5pemVyTG9jYXRpb24odGhpcy50b2tlbml6ZXIsIGNvbnRlbnQpO1xuXG4gICAgdGhpcy50b2tlbml6ZXIudG9rZW5pemVQYXJ0KGNvbnRlbnQudmFsdWUpO1xuICAgIHRoaXMudG9rZW5pemVyLmZsdXNoRGF0YSgpO1xuICB9XG5cbiAgQ29tbWVudFN0YXRlbWVudChyYXdDb21tZW50OiBIQlMuQ29tbWVudFN0YXRlbWVudCk6IE9wdGlvbjxBU1QuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50PiB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gVG9rZW5pemVyU3RhdGUuY29tbWVudCkge1xuICAgICAgdGhpcy5hcHBlbmRUb0NvbW1lbnREYXRhKHRoaXMuc291cmNlRm9yTm9kZShyYXdDb21tZW50KSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgeyB2YWx1ZSwgbG9jIH0gPSByYXdDb21tZW50O1xuICAgIGxldCBjb21tZW50ID0gYi5tdXN0YWNoZUNvbW1lbnQodmFsdWUsIGxvYyk7XG5cbiAgICBzd2l0Y2ggKHRva2VuaXplci5zdGF0ZSkge1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFydFRhZy5jb21tZW50cy5wdXNoKGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVEYXRhOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5kYXRhOlxuICAgICAgICBhcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRFbGVtZW50KCksIGNvbW1lbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBVc2luZyBhIEhhbmRsZWJhcnMgY29tbWVudCB3aGVuIGluIHRoZSBcXGAke3Rva2VuaXplclsnc3RhdGUnXX1cXGAgc3RhdGUgaXMgbm90IHN1cHBvcnRlZDogXCIke2NvbW1lbnQudmFsdWV9XCIgb24gbGluZSAke2xvYy5zdGFydC5saW5lfToke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICByYXdDb21tZW50LmxvY1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBjb21tZW50O1xuICB9XG5cbiAgUGFydGlhbFN0YXRlbWVudChwYXJ0aWFsOiBIQlMuUGFydGlhbFN0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWw7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBwYXJ0aWFscyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShwYXJ0aWFsLCBwYXJ0aWFsLm5hbWUpfVwiIGF0IEwke1xuICAgICAgICBsb2Muc3RhcnQubGluZVxuICAgICAgfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsLmxvY1xuICAgICk7XG4gIH1cblxuICBQYXJ0aWFsQmxvY2tTdGF0ZW1lbnQocGFydGlhbEJsb2NrOiBIQlMuUGFydGlhbEJsb2NrU3RhdGVtZW50KTogbmV2ZXIge1xuICAgIGxldCB7IGxvYyB9ID0gcGFydGlhbEJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbCBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIHBhcnRpYWxCbG9jayxcbiAgICAgICAgcGFydGlhbEJsb2NrLm5hbWVcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIHBhcnRpYWxCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yKGRlY29yYXRvcjogSEJTLkRlY29yYXRvcik6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvcjtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvcnMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvcixcbiAgICAgICAgZGVjb3JhdG9yLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvci5sb2NcbiAgICApO1xuICB9XG5cbiAgRGVjb3JhdG9yQmxvY2soZGVjb3JhdG9yQmxvY2s6IEhCUy5EZWNvcmF0b3JCbG9jayk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IGRlY29yYXRvckJsb2NrO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgZGVjb3JhdG9yIGJsb2NrcyBhcmUgbm90IHN1cHBvcnRlZDogXCIke3RoaXMuc291cmNlRm9yTm9kZShcbiAgICAgICAgZGVjb3JhdG9yQmxvY2ssXG4gICAgICAgIGRlY29yYXRvckJsb2NrLnBhdGhcbiAgICAgICl9XCIgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgIGRlY29yYXRvckJsb2NrLmxvY1xuICAgICk7XG4gIH1cblxuICBTdWJFeHByZXNzaW9uKHNleHByOiBIQlMuU3ViRXhwcmVzc2lvbik6IEFTVC5TdWJFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCBzZXhwcik7XG4gICAgcmV0dXJuIGIuc2V4cHIocGF0aCwgcGFyYW1zLCBoYXNoLCBzZXhwci5sb2MpO1xuICB9XG5cbiAgUGF0aEV4cHJlc3Npb24ocGF0aDogSEJTLlBhdGhFeHByZXNzaW9uKTogQVNULlBhdGhFeHByZXNzaW9uIHtcbiAgICBsZXQgeyBvcmlnaW5hbCwgbG9jIH0gPSBwYXRoO1xuICAgIGxldCBwYXJ0czogc3RyaW5nW107XG5cbiAgICBpZiAob3JpZ2luYWwuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDIpID09PSAnLi8nKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgXCIuL1wiIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lciBhbmQgdW5uZWNlc3Nhcnk6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLnNsaWNlKDAsIDMpID09PSAnLi4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENoYW5naW5nIGNvbnRleHQgdXNpbmcgXCIuLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy4nKSAhPT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBNaXhpbmcgJy4nIGFuZCAnLycgaW4gcGF0aHMgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOyB1c2Ugb25seSAnLicgdG8gc2VwYXJhdGUgcHJvcGVydHkgcGF0aHM6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX0uYCxcbiAgICAgICAgICBwYXRoLmxvY1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcGFydHMgPSBbcGF0aC5wYXJ0cy5qb2luKCcvJyldO1xuICAgIH0gZWxzZSBpZiAob3JpZ2luYWwgPT09ICcuJykge1xuICAgICAgbGV0IGxvY2F0aW9uSW5mbyA9IGBMJHtsb2Muc3RhcnQubGluZX06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gO1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgJy4nIGlzIG5vdCBhIHN1cHBvcnRlZCBwYXRoIGluIEdsaW1tZXI7IGNoZWNrIGZvciBhIHBhdGggd2l0aCBhIHRyYWlsaW5nICcuJyBhdCAke2xvY2F0aW9uSW5mb30uYCxcbiAgICAgICAgcGF0aC5sb2NcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzID0gcGF0aC5wYXJ0cztcbiAgICB9XG5cbiAgICBsZXQgdGhpc0hlYWQgPSBmYWxzZTtcblxuICAgIC8vIFRoaXMgaXMgdG8gZml4IGEgYnVnIGluIHRoZSBIYW5kbGViYXJzIEFTVCB3aGVyZSB0aGUgcGF0aCBleHByZXNzaW9ucyBpblxuICAgIC8vIGB7e3RoaXMuZm9vfX1gIChhbmQgc2ltaWxhcmx5IGB7e2Zvby1iYXIgdGhpcy5mb28gbmFtZWQ9dGhpcy5mb299fWAgZXRjKVxuICAgIC8vIGFyZSBzaW1wbHkgdHVybmVkIGludG8gYHt7Zm9vfX1gLiBUaGUgZml4IGlzIHRvIHB1c2ggaXQgYmFjayBvbnRvIHRoZVxuICAgIC8vIHBhcnRzIGFycmF5IGFuZCBsZXQgdGhlIHJ1bnRpbWUgc2VlIHRoZSBkaWZmZXJlbmNlLiBIb3dldmVyLCB3ZSBjYW5ub3RcbiAgICAvLyBzaW1wbHkgdXNlIHRoZSBzdHJpbmcgYHRoaXNgIGFzIGl0IG1lYW5zIGxpdGVyYWxseSB0aGUgcHJvcGVydHkgY2FsbGVkXG4gICAgLy8gXCJ0aGlzXCIgaW4gdGhlIGN1cnJlbnQgY29udGV4dCAoaXQgY2FuIGJlIGV4cHJlc3NlZCBpbiB0aGUgc3ludGF4IGFzXG4gICAgLy8gYHt7W3RoaXNdfX1gLCB3aGVyZSB0aGUgc3F1YXJlIGJyYWNrZXQgYXJlIGdlbmVyYWxseSBmb3IgdGhpcyBraW5kIG9mXG4gICAgLy8gZXNjYXBpbmcg4oCTIHN1Y2ggYXMgYHt7Zm9vLltcImJhci5iYXpcIl19fWAgd291bGQgbWVhbiBsb29rdXAgYSBwcm9wZXJ0eVxuICAgIC8vIG5hbWVkIGxpdGVyYWxseSBcImJhci5iYXpcIiBvbiBgdGhpcy5mb29gKS4gQnkgY29udmVudGlvbiwgd2UgdXNlIGBudWxsYFxuICAgIC8vIGZvciB0aGlzIHB1cnBvc2UuXG4gICAgaWYgKG9yaWdpbmFsLm1hdGNoKC9edGhpcyhcXC4uKyk/JC8pKSB7XG4gICAgICB0aGlzSGVhZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdQYXRoRXhwcmVzc2lvbicsXG4gICAgICBvcmlnaW5hbDogcGF0aC5vcmlnaW5hbCxcbiAgICAgIHRoaXM6IHRoaXNIZWFkLFxuICAgICAgcGFydHMsXG4gICAgICBkYXRhOiBwYXRoLmRhdGEsXG4gICAgICBsb2M6IHBhdGgubG9jLFxuICAgIH07XG4gIH1cblxuICBIYXNoKGhhc2g6IEhCUy5IYXNoKTogQVNULkhhc2gge1xuICAgIGxldCBwYWlyczogQVNULkhhc2hQYWlyW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGFzaC5wYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBhaXIgPSBoYXNoLnBhaXJzW2ldO1xuICAgICAgcGFpcnMucHVzaChiLnBhaXIocGFpci5rZXksIHRoaXMuYWNjZXB0Tm9kZShwYWlyLnZhbHVlKSwgcGFpci5sb2MpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYi5oYXNoKHBhaXJzLCBoYXNoLmxvYyk7XG4gIH1cblxuICBTdHJpbmdMaXRlcmFsKHN0cmluZzogSEJTLlN0cmluZ0xpdGVyYWwpOiBBU1QuU3RyaW5nTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIHN0cmluZy52YWx1ZSwgc3RyaW5nLmxvYyk7XG4gIH1cblxuICBCb29sZWFuTGl0ZXJhbChib29sZWFuOiBIQlMuQm9vbGVhbkxpdGVyYWwpOiBBU1QuQm9vbGVhbkxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ0Jvb2xlYW5MaXRlcmFsJywgYm9vbGVhbi52YWx1ZSwgYm9vbGVhbi5sb2MpO1xuICB9XG5cbiAgTnVtYmVyTGl0ZXJhbChudW1iZXI6IEhCUy5OdW1iZXJMaXRlcmFsKTogQVNULk51bWJlckxpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ051bWJlckxpdGVyYWwnLCBudW1iZXIudmFsdWUsIG51bWJlci5sb2MpO1xuICB9XG5cbiAgVW5kZWZpbmVkTGl0ZXJhbCh1bmRlZjogSEJTLlVuZGVmaW5lZExpdGVyYWwpOiBBU1QuVW5kZWZpbmVkTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnVW5kZWZpbmVkTGl0ZXJhbCcsIHVuZGVmaW5lZCwgdW5kZWYubG9jKTtcbiAgfVxuXG4gIE51bGxMaXRlcmFsKG51bDogSEJTLk51bGxMaXRlcmFsKTogQVNULk51bGxMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdWxsTGl0ZXJhbCcsIG51bGwsIG51bC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKG9yaWdpbmFsOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKHZhbHVlID09PSAnJykge1xuICAgIC8vIGlmIGl0IGlzIGVtcHR5LCBqdXN0IHJldHVybiB0aGUgY291bnQgb2YgbmV3bGluZXNcbiAgICAvLyBpbiBvcmlnaW5hbFxuICAgIHJldHVybiB7XG4gICAgICBsaW5lczogb3JpZ2luYWwuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDEsXG4gICAgICBjb2x1bW5zOiAwLFxuICAgIH07XG4gIH1cblxuICAvLyBvdGhlcndpc2UsIHJldHVybiB0aGUgbnVtYmVyIG9mIG5ld2xpbmVzIHByaW9yIHRvXG4gIC8vIGB2YWx1ZWBcbiAgbGV0IGRpZmZlcmVuY2UgPSBvcmlnaW5hbC5zcGxpdCh2YWx1ZSlbMF07XG4gIGxldCBsaW5lcyA9IGRpZmZlcmVuY2Uuc3BsaXQoL1xcbi8pO1xuICBsZXQgbGluZUNvdW50ID0gbGluZXMubGVuZ3RoIC0gMTtcblxuICByZXR1cm4ge1xuICAgIGxpbmVzOiBsaW5lQ291bnQsXG4gICAgY29sdW1uczogbGluZXNbbGluZUNvdW50XS5sZW5ndGgsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRva2VuaXplcjogUGFyc2VyWyd0b2tlbml6ZXInXSwgY29udGVudDogSEJTLkNvbnRlbnRTdGF0ZW1lbnQpIHtcbiAgbGV0IGxpbmUgPSBjb250ZW50LmxvYy5zdGFydC5saW5lO1xuICBsZXQgY29sdW1uID0gY29udGVudC5sb2Muc3RhcnQuY29sdW1uO1xuXG4gIGxldCBvZmZzZXRzID0gY2FsY3VsYXRlUmlnaHRTdHJpcHBlZE9mZnNldHMoXG4gICAgY29udGVudC5vcmlnaW5hbCBhcyBSZWNhc3Q8SEJTLlN0cmlwRmxhZ3MsIHN0cmluZz4sXG4gICAgY29udGVudC52YWx1ZVxuICApO1xuXG4gIGxpbmUgPSBsaW5lICsgb2Zmc2V0cy5saW5lcztcbiAgaWYgKG9mZnNldHMubGluZXMpIHtcbiAgICBjb2x1bW4gPSBvZmZzZXRzLmNvbHVtbnM7XG4gIH0gZWxzZSB7XG4gICAgY29sdW1uID0gY29sdW1uICsgb2Zmc2V0cy5jb2x1bW5zO1xuICB9XG5cbiAgdG9rZW5pemVyLmxpbmUgPSBsaW5lO1xuICB0b2tlbml6ZXIuY29sdW1uID0gY29sdW1uO1xufVxuXG5mdW5jdGlvbiBhY2NlcHRDYWxsTm9kZXMoXG4gIGNvbXBpbGVyOiBIYW5kbGViYXJzTm9kZVZpc2l0b3JzLFxuICBub2RlOiB7XG4gICAgcGF0aDogSEJTLlBhdGhFeHByZXNzaW9uO1xuICAgIHBhcmFtczogSEJTLkV4cHJlc3Npb25bXTtcbiAgICBoYXNoOiBIQlMuSGFzaDtcbiAgfVxuKTogeyBwYXRoOiBBU1QuUGF0aEV4cHJlc3Npb247IHBhcmFtczogQVNULkV4cHJlc3Npb25bXTsgaGFzaDogQVNULkhhc2ggfSB7XG4gIGxldCBwYXRoID0gY29tcGlsZXIuUGF0aEV4cHJlc3Npb24obm9kZS5wYXRoKTtcblxuICBsZXQgcGFyYW1zID0gbm9kZS5wYXJhbXMgPyBub2RlLnBhcmFtcy5tYXAoKGUpID0+IGNvbXBpbGVyLmFjY2VwdE5vZGU8QVNULkV4cHJlc3Npb24+KGUpKSA6IFtdO1xuICBsZXQgaGFzaCA9IG5vZGUuaGFzaCA/IGNvbXBpbGVyLkhhc2gobm9kZS5oYXNoKSA6IGIuaGFzaCgpO1xuXG4gIHJldHVybiB7IHBhdGgsIHBhcmFtcywgaGFzaCB9O1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50TW9kaWZpZXIoZWxlbWVudDogVGFnPCdTdGFydFRhZyc+LCBtdXN0YWNoZTogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGxldCB7IHBhdGgsIHBhcmFtcywgaGFzaCwgbG9jIH0gPSBtdXN0YWNoZTtcblxuICBpZiAoaXNMaXRlcmFsKHBhdGgpKSB7XG4gICAgbGV0IG1vZGlmaWVyID0gYHt7JHtwcmludExpdGVyYWwocGF0aCl9fX1gO1xuICAgIGxldCB0YWcgPSBgPCR7ZWxlbWVudC5uYW1lfSAuLi4gJHttb2RpZmllcn0gLi4uYDtcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBJbiAke3RhZ30sICR7bW9kaWZpZXJ9IGlzIG5vdCBhIHZhbGlkIG1vZGlmaWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7XG4gICAgICAgIGxvYyAmJiBsb2Muc3RhcnQubGluZVxuICAgICAgfS5gLFxuICAgICAgbXVzdGFjaGUubG9jXG4gICAgKTtcbiAgfVxuXG4gIGxldCBtb2RpZmllciA9IGIuZWxlbWVudE1vZGlmaWVyKHBhdGgsIHBhcmFtcywgaGFzaCwgbG9jKTtcbiAgZWxlbWVudC5tb2RpZmllcnMucHVzaChtb2RpZmllcik7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQoYXR0cmlidXRlOiBBdHRyaWJ1dGUsIHBhcnQ6IEFTVC5NdXN0YWNoZVN0YXRlbWVudCkge1xuICBhdHRyaWJ1dGUuaXNEeW5hbWljID0gdHJ1ZTtcbiAgYXR0cmlidXRlLnBhcnRzLnB1c2gocGFydCk7XG59XG4iLCJpbXBvcnQgeyB0dXBsZSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcblxuLy8gZW5zdXJlIHN0YXlzIGluIHN5bmMgd2l0aCB0eXBpbmdcbi8vIFBhcmVudE5vZGUgYW5kIENoaWxkS2V5IHR5cGVzIGFyZSBkZXJpdmVkIGZyb20gVmlzaXRvcktleXNNYXBcbmNvbnN0IHZpc2l0b3JLZXlzID0ge1xuICBQcm9ncmFtOiB0dXBsZSgnYm9keScpLFxuICBUZW1wbGF0ZTogdHVwbGUoJ2JvZHknKSxcbiAgQmxvY2s6IHR1cGxlKCdib2R5JyksXG5cbiAgTXVzdGFjaGVTdGF0ZW1lbnQ6IHR1cGxlKCdwYXRoJywgJ3BhcmFtcycsICdoYXNoJyksXG4gIEJsb2NrU3RhdGVtZW50OiB0dXBsZSgncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcsICdwcm9ncmFtJywgJ2ludmVyc2UnKSxcbiAgRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50OiB0dXBsZSgncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcpLFxuICBQYXJ0aWFsU3RhdGVtZW50OiB0dXBsZSgnbmFtZScsICdwYXJhbXMnLCAnaGFzaCcpLFxuICBDb21tZW50U3RhdGVtZW50OiB0dXBsZSgpLFxuICBNdXN0YWNoZUNvbW1lbnRTdGF0ZW1lbnQ6IHR1cGxlKCksXG4gIEVsZW1lbnROb2RlOiB0dXBsZSgnYXR0cmlidXRlcycsICdtb2RpZmllcnMnLCAnY2hpbGRyZW4nLCAnY29tbWVudHMnKSxcbiAgQXR0ck5vZGU6IHR1cGxlKCd2YWx1ZScpLFxuICBUZXh0Tm9kZTogdHVwbGUoKSxcblxuICBDb25jYXRTdGF0ZW1lbnQ6IHR1cGxlKCdwYXJ0cycpLFxuICBTdWJFeHByZXNzaW9uOiB0dXBsZSgncGF0aCcsICdwYXJhbXMnLCAnaGFzaCcpLFxuICBQYXRoRXhwcmVzc2lvbjogdHVwbGUoKSxcblxuICBTdHJpbmdMaXRlcmFsOiB0dXBsZSgpLFxuICBCb29sZWFuTGl0ZXJhbDogdHVwbGUoKSxcbiAgTnVtYmVyTGl0ZXJhbDogdHVwbGUoKSxcbiAgTnVsbExpdGVyYWw6IHR1cGxlKCksXG4gIFVuZGVmaW5lZExpdGVyYWw6IHR1cGxlKCksXG5cbiAgSGFzaDogdHVwbGUoJ3BhaXJzJyksXG4gIEhhc2hQYWlyOiB0dXBsZSgndmFsdWUnKSxcbn07XG5cbnR5cGUgVmlzaXRvcktleXNNYXAgPSB0eXBlb2YgdmlzaXRvcktleXM7XG5cbmV4cG9ydCB0eXBlIFZpc2l0b3JLZXlzID0geyBbUCBpbiBrZXlvZiBWaXNpdG9yS2V5c01hcF06IFZpc2l0b3JLZXlzTWFwW1BdW251bWJlcl0gfTtcbmV4cG9ydCB0eXBlIFZpc2l0b3JLZXk8TiBleHRlbmRzIEFTVC5Ob2RlPiA9IFZpc2l0b3JLZXlzW05bJ3R5cGUnXV0gJiBrZXlvZiBOO1xuXG5leHBvcnQgZGVmYXVsdCB2aXNpdG9yS2V5cztcbiIsImltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgeyBPcHRpb24gfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcblxuZXhwb3J0IGludGVyZmFjZSBUcmF2ZXJzYWxFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3I6IFRyYXZlcnNhbEVycm9yQ29uc3RydWN0b3I7XG4gIGtleTogc3RyaW5nO1xuICBub2RlOiBBU1QuTm9kZTtcbiAgcGFyZW50OiBPcHRpb248QVNULk5vZGU+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYXZlcnNhbEVycm9yQ29uc3RydWN0b3Ige1xuICBuZXcgKG1lc3NhZ2U6IHN0cmluZywgbm9kZTogQVNULk5vZGUsIHBhcmVudDogT3B0aW9uPEFTVC5Ob2RlPiwga2V5OiBzdHJpbmcpOiBUcmF2ZXJzYWxFcnJvcjtcbiAgcmVhZG9ubHkgcHJvdG90eXBlOiBUcmF2ZXJzYWxFcnJvcjtcbn1cblxuY29uc3QgVHJhdmVyc2FsRXJyb3I6IFRyYXZlcnNhbEVycm9yQ29uc3RydWN0b3IgPSAoZnVuY3Rpb24gKCkge1xuICBUcmF2ZXJzYWxFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVycm9yLnByb3RvdHlwZSk7XG4gIFRyYXZlcnNhbEVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRyYXZlcnNhbEVycm9yO1xuXG4gIGZ1bmN0aW9uIFRyYXZlcnNhbEVycm9yKFxuICAgIHRoaXM6IFRyYXZlcnNhbEVycm9yLFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBub2RlOiBBU1QuTm9kZSxcbiAgICBwYXJlbnQ6IE9wdGlvbjxBU1QuTm9kZT4sXG4gICAga2V5OiBzdHJpbmdcbiAgKSB7XG4gICAgbGV0IGVycm9yID0gRXJyb3IuY2FsbCh0aGlzLCBtZXNzYWdlKTtcblxuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnN0YWNrID0gZXJyb3Iuc3RhY2s7XG4gIH1cblxuICByZXR1cm4gVHJhdmVyc2FsRXJyb3IgYXMgYW55O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgVHJhdmVyc2FsRXJyb3I7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5ub3RSZW1vdmVOb2RlKG5vZGU6IEFTVC5Ob2RlLCBwYXJlbnQ6IEFTVC5Ob2RlLCBrZXk6IHN0cmluZykge1xuICByZXR1cm4gbmV3IFRyYXZlcnNhbEVycm9yKFxuICAgICdDYW5ub3QgcmVtb3ZlIGEgbm9kZSB1bmxlc3MgaXQgaXMgcGFydCBvZiBhbiBhcnJheScsXG4gICAgbm9kZSxcbiAgICBwYXJlbnQsXG4gICAga2V5XG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5ub3RSZXBsYWNlTm9kZShub2RlOiBBU1QuTm9kZSwgcGFyZW50OiBBU1QuTm9kZSwga2V5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBUcmF2ZXJzYWxFcnJvcihcbiAgICAnQ2Fubm90IHJlcGxhY2UgYSBub2RlIHdpdGggbXVsdGlwbGUgbm9kZXMgdW5sZXNzIGl0IGlzIHBhcnQgb2YgYW4gYXJyYXknLFxuICAgIG5vZGUsXG4gICAgcGFyZW50LFxuICAgIGtleVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2Fubm90UmVwbGFjZU9yUmVtb3ZlSW5LZXlIYW5kbGVyWWV0KG5vZGU6IEFTVC5Ob2RlLCBrZXk6IHN0cmluZykge1xuICByZXR1cm4gbmV3IFRyYXZlcnNhbEVycm9yKFxuICAgICdSZXBsYWNpbmcgYW5kIHJlbW92aW5nIGluIGtleSBoYW5kbGVycyBpcyBub3QgeWV0IHN1cHBvcnRlZC4nLFxuICAgIG5vZGUsXG4gICAgbnVsbCxcbiAgICBrZXlcbiAgKTtcbn1cbiIsImltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGg8TiBleHRlbmRzIE5vZGU+IHtcbiAgbm9kZTogTjtcbiAgcGFyZW50OiBQYXRoPE5vZGU+IHwgbnVsbDtcbiAgcGFyZW50S2V5OiBzdHJpbmcgfCBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG5vZGU6IE4sIHBhcmVudDogUGF0aDxOb2RlPiB8IG51bGwgPSBudWxsLCBwYXJlbnRLZXk6IHN0cmluZyB8IG51bGwgPSBudWxsKSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnBhcmVudEtleSA9IHBhcmVudEtleTtcbiAgfVxuXG4gIGdldCBwYXJlbnROb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5ub2RlIDogbnVsbDtcbiAgfVxuXG4gIHBhcmVudHMoKTogSXRlcmFibGU8UGF0aDxOb2RlPiB8IG51bGw+IHtcbiAgICByZXR1cm4ge1xuICAgICAgW1N5bWJvbC5pdGVyYXRvcl06ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXRoUGFyZW50c0l0ZXJhdG9yKHRoaXMpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIFBhdGhQYXJlbnRzSXRlcmF0b3IgaW1wbGVtZW50cyBJdGVyYXRvcjxQYXRoPE5vZGU+IHwgbnVsbD4ge1xuICBwYXRoOiBQYXRoPE5vZGU+O1xuXG4gIGNvbnN0cnVjdG9yKHBhdGg6IFBhdGg8Tm9kZT4pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBpZiAodGhpcy5wYXRoLnBhcmVudCkge1xuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnBhcmVudDtcbiAgICAgIHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogdGhpcy5wYXRoIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IGRvbmU6IHRydWUsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgdmlzaXRvcktleXMsIHsgVmlzaXRvcktleXMsIFZpc2l0b3JLZXkgfSBmcm9tICcuLi90eXBlcy92aXNpdG9yLWtleXMnO1xuaW1wb3J0IHtcbiAgY2Fubm90UmVtb3ZlTm9kZSxcbiAgY2Fubm90UmVwbGFjZU5vZGUsXG4gIGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldCxcbn0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCB7IGRlcHJlY2F0ZSB9IGZyb20gJ0BnbGltbWVyL3V0aWwnO1xuaW1wb3J0IHsgTE9DQUxfREVCVUcgfSBmcm9tICdAZ2xpbW1lci9sb2NhbC1kZWJ1Zy1mbGFncyc7XG5pbXBvcnQgeyBOb2RlSGFuZGxlciwgTm9kZVZpc2l0b3IsIEtleUhhbmRsZXIsIE5vZGVUcmF2ZXJzYWwsIEtleVRyYXZlcnNhbCB9IGZyb20gJy4vdmlzaXRvcic7XG5pbXBvcnQgUGF0aCBmcm9tICcuL3BhdGgnO1xuXG5mdW5jdGlvbiBnZXRFbnRlckZ1bmN0aW9uPE4gZXh0ZW5kcyBBU1QuTm9kZT4oXG4gIGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj5cbik6IE5vZGVIYW5kbGVyPE4+IHwgdW5kZWZpbmVkO1xuZnVuY3Rpb24gZ2V0RW50ZXJGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGUsIEsgZXh0ZW5kcyBWaXNpdG9yS2V5PE4+PihcbiAgaGFuZGxlcjogS2V5VHJhdmVyc2FsPE4sIEs+XG4pOiBLZXlIYW5kbGVyPE4sIEs+IHwgdW5kZWZpbmVkO1xuZnVuY3Rpb24gZ2V0RW50ZXJGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGUsIEsgZXh0ZW5kcyBWaXNpdG9yS2V5PE4+PihcbiAgaGFuZGxlcjogTm9kZVRyYXZlcnNhbDxOPiB8IEtleVRyYXZlcnNhbDxOLCBLPlxuKTogTm9kZUhhbmRsZXI8Tj4gfCBLZXlIYW5kbGVyPE4sIEs+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGhhbmRsZXI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGhhbmRsZXIuZW50ZXIgYXMgTm9kZUhhbmRsZXI8Tj4gfCBLZXlIYW5kbGVyPE4sIEs+O1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEV4aXRGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGU+KGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj4pOiBOb2RlSGFuZGxlcjxOPiB8IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIGdldEV4aXRGdW5jdGlvbjxOIGV4dGVuZHMgQVNULk5vZGUsIEsgZXh0ZW5kcyBWaXNpdG9yS2V5PE4+PihcbiAgaGFuZGxlcjogS2V5VHJhdmVyc2FsPE4sIEs+XG4pOiBLZXlIYW5kbGVyPE4sIEs+IHwgdW5kZWZpbmVkO1xuZnVuY3Rpb24gZ2V0RXhpdEZ1bmN0aW9uPE4gZXh0ZW5kcyBBU1QuTm9kZSwgSyBleHRlbmRzIFZpc2l0b3JLZXk8Tj4+KFxuICBoYW5kbGVyOiBOb2RlVHJhdmVyc2FsPE4+IHwgS2V5VHJhdmVyc2FsPE4sIEs+XG4pOiBOb2RlSGFuZGxlcjxOPiB8IEtleUhhbmRsZXI8TiwgSz4gfCB1bmRlZmluZWQge1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBoYW5kbGVyLmV4aXQgYXMgTm9kZUhhbmRsZXI8Tj4gfCBLZXlIYW5kbGVyPE4sIEs+O1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldEtleUhhbmRsZXI8TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMgVmlzaXRvcktleTxOPj4oXG4gIGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj4sXG4gIGtleTogS1xuKTogS2V5VHJhdmVyc2FsPE4sIEs+IHwgS2V5VHJhdmVyc2FsPE4sIFZpc2l0b3JLZXk8Tj4+IHwgdW5kZWZpbmVkIHtcbiAgbGV0IGtleVZpc2l0b3IgPSB0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJyA/IGhhbmRsZXIua2V5cyA6IHVuZGVmaW5lZDtcbiAgaWYgKGtleVZpc2l0b3IgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIGxldCBrZXlIYW5kbGVyID0ga2V5VmlzaXRvcltrZXldO1xuICBpZiAoa2V5SGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGtleUhhbmRsZXIgYXMgS2V5VHJhdmVyc2FsPE4sIEs+O1xuICB9XG4gIHJldHVybiBrZXlWaXNpdG9yLkFsbDtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9kZUhhbmRsZXI8TiBleHRlbmRzIEFTVC5Ob2RlPihcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3IsXG4gIG5vZGVUeXBlOiBOWyd0eXBlJ11cbik6IE5vZGVUcmF2ZXJzYWw8Tj47XG5mdW5jdGlvbiBnZXROb2RlSGFuZGxlcih2aXNpdG9yOiBOb2RlVmlzaXRvciwgbm9kZVR5cGU6ICdBbGwnKTogTm9kZVRyYXZlcnNhbDxBU1QuTm9kZT47XG5mdW5jdGlvbiBnZXROb2RlSGFuZGxlcjxOIGV4dGVuZHMgQVNULk5vZGU+KFxuICB2aXNpdG9yOiBOb2RlVmlzaXRvcixcbiAgbm9kZVR5cGU6IE5bJ3R5cGUnXVxuKTogTm9kZVRyYXZlcnNhbDxOPiB8IE5vZGVUcmF2ZXJzYWw8QVNULk5vZGU+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKG5vZGVUeXBlID09PSAnVGVtcGxhdGUnIHx8IG5vZGVUeXBlID09PSAnQmxvY2snKSB7XG4gICAgaWYgKHZpc2l0b3IuUHJvZ3JhbSkge1xuICAgICAgaWYgKExPQ0FMX0RFQlVHKSB7XG4gICAgICAgIGRlcHJlY2F0ZShgVE9ET2ApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmlzaXRvci5Qcm9ncmFtIGFzIGFueTtcbiAgICB9XG4gIH1cblxuICBsZXQgaGFuZGxlciA9IHZpc2l0b3Jbbm9kZVR5cGVdO1xuICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIChoYW5kbGVyIGFzIHVua25vd24pIGFzIE5vZGVUcmF2ZXJzYWw8Tj47XG4gIH1cbiAgcmV0dXJuIHZpc2l0b3IuQWxsO1xufVxuXG5mdW5jdGlvbiB2aXNpdE5vZGU8TiBleHRlbmRzIEFTVC5Ob2RlPihcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3IsXG4gIHBhdGg6IFBhdGg8Tj5cbik6IEFTVC5Ob2RlIHwgQVNULk5vZGVbXSB8IHVuZGVmaW5lZCB8IG51bGwgfCB2b2lkIHtcbiAgbGV0IHsgbm9kZSwgcGFyZW50LCBwYXJlbnRLZXkgfSA9IHBhdGg7XG5cbiAgbGV0IGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj4gPSBnZXROb2RlSGFuZGxlcih2aXNpdG9yLCBub2RlLnR5cGUpO1xuICBsZXQgZW50ZXI7XG4gIGxldCBleGl0O1xuXG4gIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbnRlciA9IGdldEVudGVyRnVuY3Rpb24oaGFuZGxlcik7XG4gICAgZXhpdCA9IGdldEV4aXRGdW5jdGlvbihoYW5kbGVyKTtcbiAgfVxuXG4gIGxldCByZXN1bHQ6IEFTVC5Ob2RlIHwgQVNULk5vZGVbXSB8IHVuZGVmaW5lZCB8IG51bGwgfCB2b2lkO1xuICBpZiAoZW50ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIHJlc3VsdCA9IGVudGVyKG5vZGUsIHBhdGgpO1xuICB9XG5cbiAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkICYmIHJlc3VsdCAhPT0gbnVsbCkge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeShub2RlKSA9PT0gSlNPTi5zdHJpbmdpZnkocmVzdWx0KSkge1xuICAgICAgcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICB2aXNpdEFycmF5KHZpc2l0b3IsIHJlc3VsdCwgcGFyZW50LCBwYXJlbnRLZXkpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHBhdGggPSBuZXcgUGF0aChyZXN1bHQsIHBhcmVudCwgcGFyZW50S2V5KTtcbiAgICAgIHJldHVybiB2aXNpdE5vZGUodmlzaXRvciwgcGF0aCkgfHwgcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgIGxldCBrZXlzID0gdmlzaXRvcktleXNbbm9kZS50eXBlXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGtleSA9IGtleXNbaV0gYXMgVmlzaXRvcktleXNbTlsndHlwZSddXSAmIGtleW9mIE47XG4gICAgICAvLyB3ZSBrbm93IGlmIGl0IGhhcyBjaGlsZCBrZXlzIHdlIGNhbiB3aWRlbiB0byBhIFBhcmVudE5vZGVcbiAgICAgIHZpc2l0S2V5KHZpc2l0b3IsIGhhbmRsZXIsIHBhdGgsIGtleSk7XG4gICAgfVxuXG4gICAgaWYgKGV4aXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmVzdWx0ID0gZXhpdChub2RlLCBwYXRoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBnZXQ8TiBleHRlbmRzIEFTVC5Ob2RlPihcbiAgbm9kZTogTixcbiAga2V5OiBWaXNpdG9yS2V5c1tOWyd0eXBlJ11dICYga2V5b2YgTlxuKTogQVNULk5vZGUgfCBBU1QuTm9kZVtdIHtcbiAgcmV0dXJuIChub2RlW2tleV0gYXMgdW5rbm93bikgYXMgQVNULk5vZGUgfCBBU1QuTm9kZVtdO1xufVxuXG5mdW5jdGlvbiBzZXQ8TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMga2V5b2YgTj4obm9kZTogTiwga2V5OiBLLCB2YWx1ZTogTltLXSk6IHZvaWQge1xuICBub2RlW2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gdmlzaXRLZXk8TiBleHRlbmRzIEFTVC5Ob2RlPihcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3IsXG4gIGhhbmRsZXI6IE5vZGVUcmF2ZXJzYWw8Tj4sXG4gIHBhdGg6IFBhdGg8Tj4sXG4gIGtleTogVmlzaXRvcktleXNbTlsndHlwZSddXSAmIGtleW9mIE5cbikge1xuICBsZXQgeyBub2RlIH0gPSBwYXRoO1xuXG4gIGxldCB2YWx1ZSA9IGdldChub2RlLCBrZXkpO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGtleUVudGVyO1xuICBsZXQga2V5RXhpdDtcblxuICBpZiAoaGFuZGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IGtleUhhbmRsZXIgPSBnZXRLZXlIYW5kbGVyKGhhbmRsZXIsIGtleSk7XG4gICAgaWYgKGtleUhhbmRsZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAga2V5RW50ZXIgPSBnZXRFbnRlckZ1bmN0aW9uKGtleUhhbmRsZXIpO1xuICAgICAga2V5RXhpdCA9IGdldEV4aXRGdW5jdGlvbihrZXlIYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICBpZiAoa2V5RW50ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChrZXlFbnRlcihub2RlLCBrZXkpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IGNhbm5vdFJlcGxhY2VPclJlbW92ZUluS2V5SGFuZGxlcllldChub2RlLCBrZXkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHZpc2l0QXJyYXkodmlzaXRvciwgdmFsdWUsIHBhdGgsIGtleSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGtleVBhdGggPSBuZXcgUGF0aCh2YWx1ZSwgcGF0aCwga2V5KTtcbiAgICBsZXQgcmVzdWx0ID0gdmlzaXROb2RlKHZpc2l0b3IsIGtleVBhdGgpO1xuICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gVE9ETzogZHluYW1pY2FsbHkgY2hlY2sgdGhlIHJlc3VsdHMgYnkgaGF2aW5nIGEgdGFibGUgb2ZcbiAgICAgIC8vIGV4cGVjdGVkIG5vZGUgdHlwZXMgaW4gdmFsdWUgc3BhY2UsIG5vdCBqdXN0IHR5cGUgc3BhY2VcbiAgICAgIGFzc2lnbktleShub2RlLCBrZXksIHZhbHVlLCByZXN1bHQgYXMgYW55KTtcbiAgICB9XG4gIH1cblxuICBpZiAoa2V5RXhpdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGtleUV4aXQobm9kZSwga2V5KSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBjYW5ub3RSZXBsYWNlT3JSZW1vdmVJbktleUhhbmRsZXJZZXQobm9kZSwga2V5KTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdmlzaXRBcnJheShcbiAgdmlzaXRvcjogTm9kZVZpc2l0b3IsXG4gIGFycmF5OiBBU1QuTm9kZVtdLFxuICBwYXJlbnQ6IFBhdGg8QVNULk5vZGU+IHwgbnVsbCxcbiAgcGFyZW50S2V5OiBzdHJpbmcgfCBudWxsXG4pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBub2RlID0gYXJyYXlbaV07XG4gICAgbGV0IHBhdGggPSBuZXcgUGF0aChub2RlLCBwYXJlbnQsIHBhcmVudEtleSk7XG4gICAgbGV0IHJlc3VsdCA9IHZpc2l0Tm9kZSh2aXNpdG9yLCBwYXRoKTtcbiAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGkgKz0gc3BsaWNlQXJyYXkoYXJyYXksIGksIHJlc3VsdCkgLSAxO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NpZ25LZXk8TiBleHRlbmRzIEFTVC5Ob2RlLCBLIGV4dGVuZHMgVmlzaXRvcktleTxOPj4oXG4gIG5vZGU6IE4sXG4gIGtleTogSyxcbiAgdmFsdWU6IEFTVC5Ob2RlLFxuICByZXN1bHQ6IE5bS10gfCBbTltLXV0gfCBudWxsXG4pIHtcbiAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgIHRocm93IGNhbm5vdFJlbW92ZU5vZGUodmFsdWUsIG5vZGUsIGtleSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgaWYgKHJlc3VsdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHNldChub2RlLCBrZXksIHJlc3VsdFswXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IGNhbm5vdFJlbW92ZU5vZGUodmFsdWUsIG5vZGUsIGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBjYW5ub3RSZXBsYWNlTm9kZSh2YWx1ZSwgbm9kZSwga2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0KG5vZGUsIGtleSwgcmVzdWx0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzcGxpY2VBcnJheShhcnJheTogQVNULk5vZGVbXSwgaW5kZXg6IG51bWJlciwgcmVzdWx0OiBBU1QuTm9kZSB8IEFTVC5Ob2RlW10gfCBudWxsKSB7XG4gIGlmIChyZXN1bHQgPT09IG51bGwpIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiAwO1xuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSwgLi4ucmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEsIHJlc3VsdCk7XG4gICAgcmV0dXJuIDE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhdmVyc2Uobm9kZTogQVNULk5vZGUsIHZpc2l0b3I6IE5vZGVWaXNpdG9yKSB7XG4gIGxldCBwYXRoID0gbmV3IFBhdGgobm9kZSk7XG4gIHZpc2l0Tm9kZSh2aXNpdG9yLCBwYXRoKTtcbn1cbiIsImNvbnN0IGVudW0gQ2hhciB7XG4gIE5CU1AgPSAweGEwLFxuICBRVU9UID0gMHgyMixcbiAgTFQgPSAweDNjLFxuICBHVCA9IDB4M2UsXG4gIEFNUCA9IDB4MjYsXG59XG5cbmNvbnN0IEFUVFJfVkFMVUVfUkVHRVhfVEVTVCA9IC9bXFx4QTBcIiZdLztcbmNvbnN0IEFUVFJfVkFMVUVfUkVHRVhfUkVQTEFDRSA9IG5ldyBSZWdFeHAoQVRUUl9WQUxVRV9SRUdFWF9URVNULnNvdXJjZSwgJ2cnKTtcblxuY29uc3QgVEVYVF9SRUdFWF9URVNUID0gL1tcXHhBMCY8Pl0vO1xuY29uc3QgVEVYVF9SRUdFWF9SRVBMQUNFID0gbmV3IFJlZ0V4cChURVhUX1JFR0VYX1RFU1Quc291cmNlLCAnZycpO1xuXG5mdW5jdGlvbiBhdHRyVmFsdWVSZXBsYWNlcihjaGFyOiBzdHJpbmcpIHtcbiAgc3dpdGNoIChjaGFyLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjYXNlIENoYXIuTkJTUDpcbiAgICAgIHJldHVybiAnJm5ic3A7JztcbiAgICBjYXNlIENoYXIuUVVPVDpcbiAgICAgIHJldHVybiAnJnF1b3Q7JztcbiAgICBjYXNlIENoYXIuQU1QOlxuICAgICAgcmV0dXJuICcmYW1wOyc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBjaGFyO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRleHRSZXBsYWNlcihjaGFyOiBzdHJpbmcpIHtcbiAgc3dpdGNoIChjaGFyLmNoYXJDb2RlQXQoMCkpIHtcbiAgICBjYXNlIENoYXIuTkJTUDpcbiAgICAgIHJldHVybiAnJm5ic3A7JztcbiAgICBjYXNlIENoYXIuQU1QOlxuICAgICAgcmV0dXJuICcmYW1wOyc7XG4gICAgY2FzZSBDaGFyLkxUOlxuICAgICAgcmV0dXJuICcmbHQ7JztcbiAgICBjYXNlIENoYXIuR1Q6XG4gICAgICByZXR1cm4gJyZndDsnO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gY2hhcjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlQXR0clZhbHVlKGF0dHJWYWx1ZTogc3RyaW5nKSB7XG4gIGlmIChBVFRSX1ZBTFVFX1JFR0VYX1RFU1QudGVzdChhdHRyVmFsdWUpKSB7XG4gICAgcmV0dXJuIGF0dHJWYWx1ZS5yZXBsYWNlKEFUVFJfVkFMVUVfUkVHRVhfUkVQTEFDRSwgYXR0clZhbHVlUmVwbGFjZXIpO1xuICB9XG4gIHJldHVybiBhdHRyVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVUZXh0KHRleHQ6IHN0cmluZykge1xuICBpZiAoVEVYVF9SRUdFWF9URVNULnRlc3QodGV4dCkpIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKFRFWFRfUkVHRVhfUkVQTEFDRSwgdGV4dFJlcGxhY2VyKTtcbiAgfVxuICByZXR1cm4gdGV4dDtcbn1cbiIsImltcG9ydCB7XG4gIEF0dHJOb2RlLFxuICBCbG9jayxcbiAgQmxvY2tTdGF0ZW1lbnQsXG4gIEVsZW1lbnROb2RlLFxuICBNdXN0YWNoZVN0YXRlbWVudCxcbiAgTm9kZSxcbiAgUHJvZ3JhbSxcbiAgVGV4dE5vZGUsXG4gIFBhcnRpYWxTdGF0ZW1lbnQsXG4gIENvbmNhdFN0YXRlbWVudCxcbiAgTXVzdGFjaGVDb21tZW50U3RhdGVtZW50LFxuICBDb21tZW50U3RhdGVtZW50LFxuICBFbGVtZW50TW9kaWZpZXJTdGF0ZW1lbnQsXG4gIEV4cHJlc3Npb24sXG4gIFBhdGhFeHByZXNzaW9uLFxuICBTdWJFeHByZXNzaW9uLFxuICBIYXNoLFxuICBIYXNoUGFpcixcbiAgTGl0ZXJhbCxcbiAgU3RyaW5nTGl0ZXJhbCxcbiAgQm9vbGVhbkxpdGVyYWwsXG4gIE51bWJlckxpdGVyYWwsXG4gIFVuZGVmaW5lZExpdGVyYWwsXG4gIE51bGxMaXRlcmFsLFxuICBUb3BMZXZlbFN0YXRlbWVudCxcbiAgVGVtcGxhdGUsXG59IGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCB7IHZvaWRNYXAgfSBmcm9tICcuLi9wYXJzZXIvdG9rZW5pemVyLWV2ZW50LWhhbmRsZXJzJztcbmltcG9ydCB7IGVzY2FwZVRleHQsIGVzY2FwZUF0dHJWYWx1ZSB9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IE5PTl9XSElURVNQQUNFID0gL1xcUy87XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJpbnRlck9wdGlvbnMge1xuICBlbnRpdHlFbmNvZGluZzogJ3RyYW5zZm9ybWVkJyB8ICdyYXcnO1xuXG4gIC8qKlxuICAgKiBVc2VkIHRvIG92ZXJyaWRlIHRoZSBtZWNoYW5pc20gb2YgcHJpbnRpbmcgYSBnaXZlbiBBU1QuTm9kZS5cbiAgICpcbiAgICogVGhpcyB3aWxsIGdlbmVyYWxseSBvbmx5IGJlIHVzZWZ1bCB0byBzb3VyY2UgLT4gc291cmNlIGNvZGVtb2RzXG4gICAqIHdoZXJlIHlvdSB3b3VsZCBsaWtlIHRvIHNwZWNpYWxpemUvb3ZlcnJpZGUgdGhlIHdheSBhIGdpdmVuIG5vZGUgaXNcbiAgICogcHJpbnRlZCAoZS5nLiB5b3Ugd291bGQgbGlrZSB0byBwcmVzZXJ2ZSBhcyBtdWNoIG9mIHRoZSBvcmlnaW5hbFxuICAgKiBmb3JtYXR0aW5nIGFzIHBvc3NpYmxlKS5cbiAgICpcbiAgICogV2hlbiB0aGUgcHJvdmlkZWQgb3ZlcnJpZGUgcmV0dXJucyB1bmRlZmluZWQsIHRoZSBkZWZhdWx0IGJ1aWx0IGluIHByaW50aW5nXG4gICAqIHdpbGwgYmUgZG9uZSBmb3IgdGhlIEFTVC5Ob2RlLlxuICAgKlxuICAgKiBAcGFyYW0gYXN0IHRoZSBhc3Qgbm9kZSB0byBiZSBwcmludGVkXG4gICAqIEBwYXJhbSBvcHRpb25zIHRoZSBvcHRpb25zIHNwZWNpZmllZCBkdXJpbmcgdGhlIHByaW50KCkgaW52b2NhdGlvblxuICAgKi9cbiAgb3ZlcnJpZGU/KGFzdDogTm9kZSwgb3B0aW9uczogUHJpbnRlck9wdGlvbnMpOiB2b2lkIHwgc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmludGVyIHtcbiAgcHJpdmF0ZSBidWZmZXIgPSAnJztcbiAgcHJpdmF0ZSBvcHRpb25zOiBQcmludGVyT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBQcmludGVyT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICAvKlxuICAgIFRoaXMgaXMgdXNlZCBieSBfYWxsXyBtZXRob2RzIG9uIHRoaXMgUHJpbnRlciBjbGFzcyB0aGF0IGFkZCB0byBgdGhpcy5idWZmZXJgLFxuICAgIGl0IGFsbG93cyBjb25zdW1lcnMgb2YgdGhlIHByaW50ZXIgdG8gdXNlIGFsdGVybmF0ZSBzdHJpbmcgcmVwcmVzZW50YXRpb25zIGZvclxuICAgIGEgZ2l2ZW4gbm9kZS5cblxuICAgIFRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciB0aGlzIGFyZSB0aGluZ3MgbGlrZSBzb3VyY2UgLT4gc291cmNlIGNvZGVtb2QgdXRpbGl0aWVzLlxuICAgIEZvciBleGFtcGxlLCBlbWJlci10ZW1wbGF0ZS1yZWNhc3QgYXR0ZW1wdHMgdG8gYWx3YXlzIHByZXNlcnZlIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAgICBmb3JtYXR0aW5nIGluIGVhY2ggQVNUIG5vZGUgaWYgbm8gbW9kaWZpY2F0aW9ucyBhcmUgbWFkZSB0byBpdC5cbiAgKi9cbiAgaGFuZGxlZEJ5T3ZlcnJpZGUobm9kZTogTm9kZSwgZW5zdXJlTGVhZGluZ1doaXRlc3BhY2UgPSBmYWxzZSk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLm9wdGlvbnMub3ZlcnJpZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMub3B0aW9ucy5vdmVycmlkZShub2RlLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChlbnN1cmVMZWFkaW5nV2hpdGVzcGFjZSAmJiByZXN1bHQgIT09ICcnICYmIE5PTl9XSElURVNQQUNFLnRlc3QocmVzdWx0WzBdKSkge1xuICAgICAgICAgIHJlc3VsdCA9IGAgJHtyZXN1bHR9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYnVmZmVyICs9IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgTm9kZShub2RlOiBOb2RlKTogdm9pZCB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgJ011c3RhY2hlU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ0Jsb2NrU3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ1BhcnRpYWxTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnTXVzdGFjaGVDb21tZW50U3RhdGVtZW50JzpcbiAgICAgIGNhc2UgJ0NvbW1lbnRTdGF0ZW1lbnQnOlxuICAgICAgY2FzZSAnVGV4dE5vZGUnOlxuICAgICAgY2FzZSAnRWxlbWVudE5vZGUnOlxuICAgICAgY2FzZSAnQXR0ck5vZGUnOlxuICAgICAgY2FzZSAnQmxvY2snOlxuICAgICAgY2FzZSAnVGVtcGxhdGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5Ub3BMZXZlbFN0YXRlbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWwnOlxuICAgICAgY2FzZSAnQm9vbGVhbkxpdGVyYWwnOlxuICAgICAgY2FzZSAnTnVtYmVyTGl0ZXJhbCc6XG4gICAgICBjYXNlICdVbmRlZmluZWRMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ051bGxMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ1BhdGhFeHByZXNzaW9uJzpcbiAgICAgIGNhc2UgJ1N1YkV4cHJlc3Npb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5FeHByZXNzaW9uKG5vZGUpO1xuICAgICAgY2FzZSAnUHJvZ3JhbSc6XG4gICAgICAgIHJldHVybiB0aGlzLkJsb2NrKG5vZGUpO1xuICAgICAgY2FzZSAnQ29uY2F0U3RhdGVtZW50JzpcbiAgICAgICAgLy8gc2hvdWxkIGhhdmUgYW4gQXR0ck5vZGUgcGFyZW50XG4gICAgICAgIHJldHVybiB0aGlzLkNvbmNhdFN0YXRlbWVudChub2RlKTtcbiAgICAgIGNhc2UgJ0hhc2gnOlxuICAgICAgICByZXR1cm4gdGhpcy5IYXNoKG5vZGUpO1xuICAgICAgY2FzZSAnSGFzaFBhaXInOlxuICAgICAgICByZXR1cm4gdGhpcy5IYXNoUGFpcihub2RlKTtcbiAgICAgIGNhc2UgJ0VsZW1lbnRNb2RpZmllclN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLkVsZW1lbnRNb2RpZmllclN0YXRlbWVudChub2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5yZWFjaGFibGUobm9kZSwgJ05vZGUnKTtcbiAgfVxuXG4gIEV4cHJlc3Npb24oZXhwcmVzc2lvbjogRXhwcmVzc2lvbik6IHZvaWQge1xuICAgIHN3aXRjaCAoZXhwcmVzc2lvbi50eXBlKSB7XG4gICAgICBjYXNlICdTdHJpbmdMaXRlcmFsJzpcbiAgICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsJzpcbiAgICAgIGNhc2UgJ051bWJlckxpdGVyYWwnOlxuICAgICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICBjYXNlICdOdWxsTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLkxpdGVyYWwoZXhwcmVzc2lvbik7XG4gICAgICBjYXNlICdQYXRoRXhwcmVzc2lvbic6XG4gICAgICAgIHJldHVybiB0aGlzLlBhdGhFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAgICAgY2FzZSAnU3ViRXhwcmVzc2lvbic6XG4gICAgICAgIHJldHVybiB0aGlzLlN1YkV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIHJldHVybiB1bnJlYWNoYWJsZShleHByZXNzaW9uLCAnRXhwcmVzc2lvbicpO1xuICB9XG5cbiAgTGl0ZXJhbChsaXRlcmFsOiBMaXRlcmFsKSB7XG4gICAgc3dpdGNoIChsaXRlcmFsLnR5cGUpIHtcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5TdHJpbmdMaXRlcmFsKGxpdGVyYWwpO1xuICAgICAgY2FzZSAnQm9vbGVhbkxpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5Cb29sZWFuTGl0ZXJhbChsaXRlcmFsKTtcbiAgICAgIGNhc2UgJ051bWJlckxpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdGhpcy5OdW1iZXJMaXRlcmFsKGxpdGVyYWwpO1xuICAgICAgY2FzZSAnVW5kZWZpbmVkTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLlVuZGVmaW5lZExpdGVyYWwobGl0ZXJhbCk7XG4gICAgICBjYXNlICdOdWxsTGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0aGlzLk51bGxMaXRlcmFsKGxpdGVyYWwpO1xuICAgIH1cbiAgICByZXR1cm4gdW5yZWFjaGFibGUobGl0ZXJhbCwgJ0xpdGVyYWwnKTtcbiAgfVxuXG4gIFRvcExldmVsU3RhdGVtZW50KHN0YXRlbWVudDogVG9wTGV2ZWxTdGF0ZW1lbnQpIHtcbiAgICBzd2l0Y2ggKHN0YXRlbWVudC50eXBlKSB7XG4gICAgICBjYXNlICdNdXN0YWNoZVN0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLk11c3RhY2hlU3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdCbG9ja1N0YXRlbWVudCc6XG4gICAgICAgIHJldHVybiB0aGlzLkJsb2NrU3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdQYXJ0aWFsU3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuUGFydGlhbFN0YXRlbWVudChzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnTXVzdGFjaGVDb21tZW50U3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICBjYXNlICdDb21tZW50U3RhdGVtZW50JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuQ29tbWVudFN0YXRlbWVudChzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnVGV4dE5vZGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5UZXh0Tm9kZShzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnRWxlbWVudE5vZGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5FbGVtZW50Tm9kZShzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnQmxvY2snOlxuICAgICAgY2FzZSAnVGVtcGxhdGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5CbG9jayhzdGF0ZW1lbnQpO1xuICAgICAgY2FzZSAnQXR0ck5vZGUnOlxuICAgICAgICAvLyBzaG91bGQgaGF2ZSBlbGVtZW50XG4gICAgICAgIHJldHVybiB0aGlzLkF0dHJOb2RlKHN0YXRlbWVudCk7XG4gICAgfVxuICAgIHVucmVhY2hhYmxlKHN0YXRlbWVudCwgJ1RvcExldmVsU3RhdGVtZW50Jyk7XG4gIH1cblxuICBCbG9jayhibG9jazogQmxvY2sgfCBQcm9ncmFtIHwgVGVtcGxhdGUpOiB2b2lkIHtcbiAgICAvKlxuICAgICAgV2hlbiBwcm9jZXNzaW5nIGEgdGVtcGxhdGUgbGlrZTpcblxuICAgICAgYGBgaGJzXG4gICAgICB7eyNpZiB3aGF0ZXZlcn19XG4gICAgICAgIHdoYXRldmVyXG4gICAgICB7e2Vsc2UgaWYgc29tZXRoaW5nRWxzZX19XG4gICAgICAgIHNvbWV0aGluZyBlbHNlXG4gICAgICB7e2Vsc2V9fVxuICAgICAgICBmYWxsYmFja1xuICAgICAge3svaWZ9fVxuICAgICAgYGBgXG5cbiAgICAgIFRoZSBBU1Qgc3RpbGwgX2VmZmVjdGl2ZWx5XyBsb29rcyBsaWtlOlxuXG4gICAgICBgYGBoYnNcbiAgICAgIHt7I2lmIHdoYXRldmVyfX1cbiAgICAgICAgd2hhdGV2ZXJcbiAgICAgIHt7ZWxzZX19e3sjaWYgc29tZXRoaW5nRWxzZX19XG4gICAgICAgIHNvbWV0aGluZyBlbHNlXG4gICAgICB7e2Vsc2V9fVxuICAgICAgICBmYWxsYmFja1xuICAgICAge3svaWZ9fXt7L2lmfX1cbiAgICAgIGBgYFxuXG4gICAgICBUaGUgb25seSB3YXkgd2UgY2FuIHRlbGwgaWYgdGhhdCBpcyB0aGUgY2FzZSBpcyBieSBjaGVja2luZyBmb3JcbiAgICAgIGBibG9jay5jaGFpbmVkYCwgYnV0IHVuZm9ydHVuYXRlbHkgd2hlbiB0aGUgYWN0dWFsIHN0YXRlbWVudHMgYXJlXG4gICAgICBwcm9jZXNzZWQgdGhlIGBibG9jay5ib2R5WzBdYCBub2RlICh3aGljaCB3aWxsIGFsd2F5cyBiZSBhXG4gICAgICBgQmxvY2tTdGF0ZW1lbnRgKSBoYXMgbm8gY2x1ZSB0aGF0IGl0cyBhbnNjZXN0b3IgYEJsb2NrYCBub2RlIHdhc1xuICAgICAgY2hhaW5lZC5cblxuICAgICAgVGhpcyBcImZvcndhcmRzXCIgdGhlIGBjaGFpbmVkYCBzZXR0aW5nIHNvIHRoYXQgd2UgY2FuIGNoZWNrXG4gICAgICBpdCBsYXRlciB3aGVuIHByb2Nlc3NpbmcgdGhlIGBCbG9ja1N0YXRlbWVudGAuXG4gICAgKi9cbiAgICBpZiAoYmxvY2suY2hhaW5lZCkge1xuICAgICAgbGV0IGZpcnN0Q2hpbGQgPSBibG9jay5ib2R5WzBdIGFzIEJsb2NrU3RhdGVtZW50O1xuICAgICAgZmlyc3RDaGlsZC5jaGFpbmVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShibG9jaykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLlRvcExldmVsU3RhdGVtZW50cyhibG9jay5ib2R5KTtcbiAgfVxuXG4gIFRvcExldmVsU3RhdGVtZW50cyhzdGF0ZW1lbnRzOiBUb3BMZXZlbFN0YXRlbWVudFtdKSB7XG4gICAgc3RhdGVtZW50cy5mb3JFYWNoKChzdGF0ZW1lbnQpID0+IHRoaXMuVG9wTGV2ZWxTdGF0ZW1lbnQoc3RhdGVtZW50KSk7XG4gIH1cblxuICBFbGVtZW50Tm9kZShlbDogRWxlbWVudE5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShlbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLk9wZW5FbGVtZW50Tm9kZShlbCk7XG4gICAgdGhpcy5Ub3BMZXZlbFN0YXRlbWVudHMoZWwuY2hpbGRyZW4pO1xuICAgIHRoaXMuQ2xvc2VFbGVtZW50Tm9kZShlbCk7XG4gIH1cblxuICBPcGVuRWxlbWVudE5vZGUoZWw6IEVsZW1lbnROb2RlKTogdm9pZCB7XG4gICAgdGhpcy5idWZmZXIgKz0gYDwke2VsLnRhZ31gO1xuICAgIGlmIChlbC5hdHRyaWJ1dGVzLmxlbmd0aCkge1xuICAgICAgZWwuYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PiB7XG4gICAgICAgIHRoaXMuYnVmZmVyICs9ICcgJztcbiAgICAgICAgdGhpcy5BdHRyTm9kZShhdHRyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWwubW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgZWwubW9kaWZpZXJzLmZvckVhY2goKG1vZCkgPT4ge1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSAnICc7XG4gICAgICAgIHRoaXMuRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50KG1vZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVsLmNvbW1lbnRzLmxlbmd0aCkge1xuICAgICAgZWwuY29tbWVudHMuZm9yRWFjaCgoY29tbWVudCkgPT4ge1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSAnICc7XG4gICAgICAgIHRoaXMuTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KGNvbW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChlbC5ibG9ja1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuQmxvY2tQYXJhbXMoZWwuYmxvY2tQYXJhbXMpO1xuICAgIH1cbiAgICBpZiAoZWwuc2VsZkNsb3NpbmcpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICcgLyc7XG4gICAgfVxuICAgIHRoaXMuYnVmZmVyICs9ICc+JztcbiAgfVxuXG4gIENsb3NlRWxlbWVudE5vZGUoZWw6IEVsZW1lbnROb2RlKTogdm9pZCB7XG4gICAgaWYgKGVsLnNlbGZDbG9zaW5nIHx8IHZvaWRNYXBbZWwudGFnLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuYnVmZmVyICs9IGA8LyR7ZWwudGFnfT5gO1xuICB9XG5cbiAgQXR0ck5vZGUoYXR0cjogQXR0ck5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShhdHRyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB7IG5hbWUsIHZhbHVlIH0gPSBhdHRyO1xuXG4gICAgdGhpcy5idWZmZXIgKz0gbmFtZTtcbiAgICBpZiAodmFsdWUudHlwZSAhPT0gJ1RleHROb2RlJyB8fCB2YWx1ZS5jaGFycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnPSc7XG4gICAgICB0aGlzLkF0dHJOb2RlVmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIEF0dHJOb2RlVmFsdWUodmFsdWU6IEF0dHJOb2RlWyd2YWx1ZSddKSB7XG4gICAgaWYgKHZhbHVlLnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICdcIic7XG4gICAgICB0aGlzLlRleHROb2RlKHZhbHVlLCB0cnVlKTtcbiAgICAgIHRoaXMuYnVmZmVyICs9ICdcIic7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuTm9kZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgVGV4dE5vZGUodGV4dDogVGV4dE5vZGUsIGlzQXR0cj86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZSh0ZXh0KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZW50aXR5RW5jb2RpbmcgPT09ICdyYXcnKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSB0ZXh0LmNoYXJzO1xuICAgIH0gZWxzZSBpZiAoaXNBdHRyKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBlc2NhcGVBdHRyVmFsdWUodGV4dC5jaGFycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGVzY2FwZVRleHQodGV4dC5jaGFycyk7XG4gICAgfVxuICB9XG5cbiAgTXVzdGFjaGVTdGF0ZW1lbnQobXVzdGFjaGU6IE11c3RhY2hlU3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUobXVzdGFjaGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gbXVzdGFjaGUuZXNjYXBlZCA/ICd7eycgOiAne3t7JztcblxuICAgIGlmIChtdXN0YWNoZS5zdHJpcC5vcGVuKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnfic7XG4gICAgfVxuXG4gICAgdGhpcy5FeHByZXNzaW9uKG11c3RhY2hlLnBhdGgpO1xuICAgIHRoaXMuUGFyYW1zKG11c3RhY2hlLnBhcmFtcyk7XG4gICAgdGhpcy5IYXNoKG11c3RhY2hlLmhhc2gpO1xuXG4gICAgaWYgKG11c3RhY2hlLnN0cmlwLmNsb3NlKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSAnfic7XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gbXVzdGFjaGUuZXNjYXBlZCA/ICd9fScgOiAnfX19JztcbiAgfVxuXG4gIEJsb2NrU3RhdGVtZW50KGJsb2NrOiBCbG9ja1N0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGJsb2NrKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChibG9jay5jaGFpbmVkKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5pbnZlcnNlU3RyaXAub3BlbiA/ICd7e34nIDogJ3t7JztcbiAgICAgIHRoaXMuYnVmZmVyICs9ICdlbHNlICc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLm9wZW5TdHJpcC5vcGVuID8gJ3t7fiMnIDogJ3t7Iyc7XG4gICAgfVxuXG4gICAgdGhpcy5FeHByZXNzaW9uKGJsb2NrLnBhdGgpO1xuICAgIHRoaXMuUGFyYW1zKGJsb2NrLnBhcmFtcyk7XG4gICAgdGhpcy5IYXNoKGJsb2NrLmhhc2gpO1xuICAgIGlmIChibG9jay5wcm9ncmFtLmJsb2NrUGFyYW1zLmxlbmd0aCkge1xuICAgICAgdGhpcy5CbG9ja1BhcmFtcyhibG9jay5wcm9ncmFtLmJsb2NrUGFyYW1zKTtcbiAgICB9XG5cbiAgICBpZiAoYmxvY2suY2hhaW5lZCkge1xuICAgICAgdGhpcy5idWZmZXIgKz0gYmxvY2suaW52ZXJzZVN0cmlwLmNsb3NlID8gJ359fScgOiAnfX0nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5vcGVuU3RyaXAuY2xvc2UgPyAnfn19JyA6ICd9fSc7XG4gICAgfVxuXG4gICAgdGhpcy5CbG9jayhibG9jay5wcm9ncmFtKTtcblxuICAgIGlmIChibG9jay5pbnZlcnNlKSB7XG4gICAgICBpZiAoIWJsb2NrLmludmVyc2UuY2hhaW5lZCkge1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5pbnZlcnNlU3RyaXAub3BlbiA/ICd7e34nIDogJ3t7JztcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gJ2Vsc2UnO1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5pbnZlcnNlU3RyaXAuY2xvc2UgPyAnfn19JyA6ICd9fSc7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuQmxvY2soYmxvY2suaW52ZXJzZSk7XG4gICAgfVxuXG4gICAgaWYgKCFibG9jay5jaGFpbmVkKSB7XG4gICAgICB0aGlzLmJ1ZmZlciArPSBibG9jay5jbG9zZVN0cmlwLm9wZW4gPyAne3t+LycgOiAne3svJztcbiAgICAgIHRoaXMuRXhwcmVzc2lvbihibG9jay5wYXRoKTtcbiAgICAgIHRoaXMuYnVmZmVyICs9IGJsb2NrLmNsb3NlU3RyaXAuY2xvc2UgPyAnfn19JyA6ICd9fSc7XG4gICAgfVxuICB9XG5cbiAgQmxvY2tQYXJhbXMoYmxvY2tQYXJhbXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5idWZmZXIgKz0gYCBhcyB8JHtibG9ja1BhcmFtcy5qb2luKCcgJyl9fGA7XG4gIH1cblxuICBQYXJ0aWFsU3RhdGVtZW50KHBhcnRpYWw6IFBhcnRpYWxTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShwYXJ0aWFsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICd7ez4nO1xuICAgIHRoaXMuRXhwcmVzc2lvbihwYXJ0aWFsLm5hbWUpO1xuICAgIHRoaXMuUGFyYW1zKHBhcnRpYWwucGFyYW1zKTtcbiAgICB0aGlzLkhhc2gocGFydGlhbC5oYXNoKTtcbiAgICB0aGlzLmJ1ZmZlciArPSAnfX0nO1xuICB9XG5cbiAgQ29uY2F0U3RhdGVtZW50KGNvbmNhdDogQ29uY2F0U3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoY29uY2F0KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICdcIic7XG4gICAgY29uY2F0LnBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgIGlmIChwYXJ0LnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgICAgdGhpcy5UZXh0Tm9kZShwYXJ0LCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuTm9kZShwYXJ0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmJ1ZmZlciArPSAnXCInO1xuICB9XG5cbiAgTXVzdGFjaGVDb21tZW50U3RhdGVtZW50KGNvbW1lbnQ6IE11c3RhY2hlQ29tbWVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKGNvbW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gYHt7IS0tJHtjb21tZW50LnZhbHVlfS0tfX1gO1xuICB9XG5cbiAgRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50KG1vZDogRWxlbWVudE1vZGlmaWVyU3RhdGVtZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUobW9kKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9ICd7eyc7XG4gICAgdGhpcy5FeHByZXNzaW9uKG1vZC5wYXRoKTtcbiAgICB0aGlzLlBhcmFtcyhtb2QucGFyYW1zKTtcbiAgICB0aGlzLkhhc2gobW9kLmhhc2gpO1xuICAgIHRoaXMuYnVmZmVyICs9ICd9fSc7XG4gIH1cblxuICBDb21tZW50U3RhdGVtZW50KGNvbW1lbnQ6IENvbW1lbnRTdGF0ZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShjb21tZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuYnVmZmVyICs9IGA8IS0tJHtjb21tZW50LnZhbHVlfS0tPmA7XG4gIH1cblxuICBQYXRoRXhwcmVzc2lvbihwYXRoOiBQYXRoRXhwcmVzc2lvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHBhdGgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gcGF0aC5vcmlnaW5hbDtcbiAgfVxuXG4gIFN1YkV4cHJlc3Npb24oc2V4cDogU3ViRXhwcmVzc2lvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmhhbmRsZWRCeU92ZXJyaWRlKHNleHApKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gJygnO1xuICAgIHRoaXMuRXhwcmVzc2lvbihzZXhwLnBhdGgpO1xuICAgIHRoaXMuUGFyYW1zKHNleHAucGFyYW1zKTtcbiAgICB0aGlzLkhhc2goc2V4cC5oYXNoKTtcbiAgICB0aGlzLmJ1ZmZlciArPSAnKSc7XG4gIH1cblxuICBQYXJhbXMocGFyYW1zOiBFeHByZXNzaW9uW10pIHtcbiAgICAvLyBUT0RPOiBpbXBsZW1lbnQgYSB0b3AgbGV2ZWwgUGFyYW1zIEFTVCBub2RlIChqdXN0IGxpa2UgdGhlIEhhc2ggb2JqZWN0KVxuICAgIC8vIHNvIHRoYXQgdGhpcyBjYW4gYWxzbyBiZSBvdmVycmlkZGVuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGgpIHtcbiAgICAgIHBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4ge1xuICAgICAgICB0aGlzLmJ1ZmZlciArPSAnICc7XG4gICAgICAgIHRoaXMuRXhwcmVzc2lvbihwYXJhbSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBIYXNoKGhhc2g6IEhhc2gpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShoYXNoLCB0cnVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGhhc2gucGFpcnMuZm9yRWFjaCgocGFpcikgPT4ge1xuICAgICAgdGhpcy5idWZmZXIgKz0gJyAnO1xuICAgICAgdGhpcy5IYXNoUGFpcihwYWlyKTtcbiAgICB9KTtcbiAgfVxuXG4gIEhhc2hQYWlyKHBhaXI6IEhhc2hQYWlyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUocGFpcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBwYWlyLmtleTtcbiAgICB0aGlzLmJ1ZmZlciArPSAnPSc7XG4gICAgdGhpcy5Ob2RlKHBhaXIudmFsdWUpO1xuICB9XG5cbiAgU3RyaW5nTGl0ZXJhbChzdHI6IFN0cmluZ0xpdGVyYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShzdHIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gSlNPTi5zdHJpbmdpZnkoc3RyLnZhbHVlKTtcbiAgfVxuXG4gIEJvb2xlYW5MaXRlcmFsKGJvb2w6IEJvb2xlYW5MaXRlcmFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUoYm9vbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSBib29sLnZhbHVlO1xuICB9XG5cbiAgTnVtYmVyTGl0ZXJhbChudW1iZXI6IE51bWJlckxpdGVyYWwpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5oYW5kbGVkQnlPdmVycmlkZShudW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgKz0gbnVtYmVyLnZhbHVlO1xuICB9XG5cbiAgVW5kZWZpbmVkTGl0ZXJhbChub2RlOiBVbmRlZmluZWRMaXRlcmFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUobm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIE51bGxMaXRlcmFsKG5vZGU6IE51bGxMaXRlcmFsKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaGFuZGxlZEJ5T3ZlcnJpZGUobm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlciArPSAnbnVsbCc7XG4gIH1cblxuICBwcmludChub2RlOiBOb2RlKSB7XG4gICAgbGV0IHsgb3B0aW9ucyB9ID0gdGhpcztcblxuICAgIGlmIChvcHRpb25zLm92ZXJyaWRlKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gb3B0aW9ucy5vdmVycmlkZShub2RlLCBvcHRpb25zKTtcblxuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5idWZmZXIgPSAnJztcbiAgICB0aGlzLk5vZGUobm9kZSk7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVucmVhY2hhYmxlKG5vZGU6IG5ldmVyLCBwYXJlbnROb2RlVHlwZTogc3RyaW5nKTogbmV2ZXIge1xuICBsZXQgeyBsb2MsIHR5cGUgfSA9IChub2RlIGFzIGFueSkgYXMgTm9kZTtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgIGBOb24tZXhoYXVzdGl2ZSBub2RlIG5hcnJvd2luZyAke3R5cGV9IEAgbG9jYXRpb246ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICBsb2NcbiAgICApfSBmb3IgcGFyZW50ICR7cGFyZW50Tm9kZVR5cGV9YFxuICApO1xufVxuIiwiaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uL3R5cGVzL25vZGVzJztcbmltcG9ydCBQcmludGVyLCB7IFByaW50ZXJPcHRpb25zIH0gZnJvbSAnLi9wcmludGVyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGQoXG4gIGFzdDogTm9kZSxcbiAgb3B0aW9uczogUHJpbnRlck9wdGlvbnMgPSB7IGVudGl0eUVuY29kaW5nOiAndHJhbnNmb3JtZWQnIH1cbik6IHN0cmluZyB7XG4gIGlmICghYXN0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgbGV0IHByaW50ZXIgPSBuZXcgUHJpbnRlcihvcHRpb25zKTtcbiAgcmV0dXJuIHByaW50ZXIucHJpbnQoYXN0KTtcbn1cbiIsImltcG9ydCB7IE9wdGlvbiB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuaW1wb3J0ICogYXMgQVNUIGZyb20gJy4uL3R5cGVzL25vZGVzJztcblxuZXhwb3J0IHR5cGUgTm9kZUNhbGxiYWNrPE4gZXh0ZW5kcyBBU1QuTm9kZT4gPSAobm9kZTogTiwgd2Fsa2VyOiBXYWxrZXIpID0+IHZvaWQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhbGtlciB7XG4gIHB1YmxpYyBzdGFjazogYW55W10gPSBbXTtcbiAgY29uc3RydWN0b3IocHVibGljIG9yZGVyPzogYW55KSB7fVxuXG4gIHZpc2l0PE4gZXh0ZW5kcyBBU1QuTm9kZT4obm9kZTogT3B0aW9uPE4+LCBjYWxsYmFjazogTm9kZUNhbGxiYWNrPE4+KSB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpO1xuXG4gICAgaWYgKHRoaXMub3JkZXIgPT09ICdwb3N0Jykge1xuICAgICAgdGhpcy5jaGlsZHJlbihub2RlLCBjYWxsYmFjayk7XG4gICAgICBjYWxsYmFjayhub2RlLCB0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2sobm9kZSwgdGhpcyk7XG4gICAgICB0aGlzLmNoaWxkcmVuKG5vZGUsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YWNrLnBvcCgpO1xuICB9XG5cbiAgY2hpbGRyZW4obm9kZTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgbGV0IHR5cGU7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ0Jsb2NrJyB8fCAobm9kZS50eXBlID09PSAnVGVtcGxhdGUnICYmIHZpc2l0b3JzLlByb2dyYW0pKSB7XG4gICAgICB0eXBlID0gJ1Byb2dyYW0nO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gbm9kZS50eXBlO1xuICAgIH1cblxuICAgIGxldCB2aXNpdG9yID0gKHZpc2l0b3JzIGFzIGFueSlbdHlwZV07XG4gICAgaWYgKHZpc2l0b3IpIHtcbiAgICAgIHZpc2l0b3IodGhpcywgbm9kZSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfVxufVxuXG5sZXQgdmlzaXRvcnMgPSB7XG4gIFByb2dyYW0od2Fsa2VyOiBXYWxrZXIsIG5vZGU6IEFTVC5Qcm9ncmFtLCBjYWxsYmFjazogTm9kZUNhbGxiYWNrPEFTVC5Ob2RlPikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5ib2R5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB3YWxrZXIudmlzaXQobm9kZS5ib2R5W2ldLCBjYWxsYmFjayk7XG4gICAgfVxuICB9LFxuXG4gIFRlbXBsYXRlKHdhbGtlcjogV2Fsa2VyLCBub2RlOiBBU1QuVGVtcGxhdGUsIGNhbGxiYWNrOiBOb2RlQ2FsbGJhY2s8QVNULk5vZGU+KSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmJvZHkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHdhbGtlci52aXNpdChub2RlLmJvZHlbaV0sIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgQmxvY2sod2Fsa2VyOiBXYWxrZXIsIG5vZGU6IEFTVC5CbG9jaywgY2FsbGJhY2s6IE5vZGVDYWxsYmFjazxBU1QuTm9kZT4pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuYm9keS5sZW5ndGg7IGkrKykge1xuICAgICAgd2Fsa2VyLnZpc2l0KG5vZGUuYm9keVtpXSwgY2FsbGJhY2spO1xuICAgIH1cbiAgfSxcblxuICBFbGVtZW50Tm9kZSh3YWxrZXI6IFdhbGtlciwgbm9kZTogQVNULkVsZW1lbnROb2RlLCBjYWxsYmFjazogTm9kZUNhbGxiYWNrPEFTVC5Ob2RlPikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgd2Fsa2VyLnZpc2l0KG5vZGUuY2hpbGRyZW5baV0sIGNhbGxiYWNrKTtcbiAgICB9XG4gIH0sXG5cbiAgQmxvY2tTdGF0ZW1lbnQod2Fsa2VyOiBXYWxrZXIsIG5vZGU6IEFTVC5CbG9ja1N0YXRlbWVudCwgY2FsbGJhY2s6IE5vZGVDYWxsYmFjazxBU1QuQmxvY2s+KSB7XG4gICAgd2Fsa2VyLnZpc2l0KG5vZGUucHJvZ3JhbSwgY2FsbGJhY2spO1xuICAgIHdhbGtlci52aXNpdChub2RlLmludmVyc2UgfHwgbnVsbCwgY2FsbGJhY2spO1xuICB9LFxufTtcbiIsImltcG9ydCBiLCB7IFNZTlRIRVRJQyB9IGZyb20gJy4uL2J1aWxkZXJzJztcbmltcG9ydCB7IGFwcGVuZENoaWxkLCBwYXJzZUVsZW1lbnRCbG9ja1BhcmFtcyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMgfSBmcm9tICcuL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycyc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCBTeW50YXhFcnJvciBmcm9tICcuLi9lcnJvcnMvc3ludGF4LWVycm9yJztcbmltcG9ydCB7IFRhZyB9IGZyb20gJy4uL3BhcnNlcic7XG5pbXBvcnQgYnVpbGRlcnMgZnJvbSAnLi4vYnVpbGRlcnMnO1xuaW1wb3J0IHRyYXZlcnNlIGZyb20gJy4uL3RyYXZlcnNhbC90cmF2ZXJzZSc7XG5pbXBvcnQgcHJpbnQgZnJvbSAnLi4vZ2VuZXJhdGlvbi9wcmludCc7XG5pbXBvcnQgV2Fsa2VyIGZyb20gJy4uL3RyYXZlcnNhbC93YWxrZXInO1xuaW1wb3J0IHsgcGFyc2UsIHBhcnNlV2l0aG91dFByb2Nlc3NpbmcgfSBmcm9tICdAaGFuZGxlYmFycy9wYXJzZXInO1xuaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBOb2RlVmlzaXRvciB9IGZyb20gJy4uL3RyYXZlcnNhbC92aXNpdG9yJztcbmltcG9ydCB7IEVudGl0eVBhcnNlciB9IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5cbmV4cG9ydCBjb25zdCB2b2lkTWFwOiB7XG4gIFt0YWdOYW1lOiBzdHJpbmddOiBib29sZWFuO1xufSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmxldCB2b2lkVGFnTmFtZXMgPVxuICAnYXJlYSBiYXNlIGJyIGNvbCBjb21tYW5kIGVtYmVkIGhyIGltZyBpbnB1dCBrZXlnZW4gbGluayBtZXRhIHBhcmFtIHNvdXJjZSB0cmFjayB3YnInO1xudm9pZFRhZ05hbWVzLnNwbGl0KCcgJykuZm9yRWFjaCgodGFnTmFtZSkgPT4ge1xuICB2b2lkTWFwW3RhZ05hbWVdID0gdHJ1ZTtcbn0pO1xuXG5leHBvcnQgY2xhc3MgVG9rZW5pemVyRXZlbnRIYW5kbGVycyBleHRlbmRzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMge1xuICBwcml2YXRlIHRhZ09wZW5MaW5lID0gMDtcbiAgcHJpdmF0ZSB0YWdPcGVuQ29sdW1uID0gMDtcblxuICByZXNldCgpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8vIENvbW1lbnRcblxuICBiZWdpbkNvbW1lbnQoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIuY29tbWVudCgnJyk7XG4gICAgdGhpcy5jdXJyZW50Tm9kZS5sb2MgPSB7XG4gICAgICBzb3VyY2U6IG51bGwsXG4gICAgICBzdGFydDogYi5wb3ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uKSxcbiAgICAgIGVuZDogKG51bGwgYXMgYW55KSBhcyBBU1QuUG9zaXRpb24sXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQ29tbWVudERhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC52YWx1ZSArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoQ29tbWVudCgpIHtcbiAgICB0aGlzLmN1cnJlbnRDb21tZW50LmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnRDb21tZW50KTtcbiAgfVxuXG4gIC8vIERhdGFcblxuICBiZWdpbkRhdGEoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IGIudGV4dCgpO1xuICAgIHRoaXMuY3VycmVudE5vZGUubG9jID0ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICBlbmQ6IChudWxsIGFzIGFueSkgYXMgQVNULlBvc2l0aW9uLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0RhdGEoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5jaGFycyArPSBjaGFyO1xuICB9XG5cbiAgZmluaXNoRGF0YSgpIHtcbiAgICB0aGlzLmN1cnJlbnREYXRhLmxvYy5lbmQgPSBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pO1xuXG4gICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCB0aGlzLmN1cnJlbnREYXRhKTtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBiYXNpY1xuXG4gIHRhZ09wZW4oKSB7XG4gICAgdGhpcy50YWdPcGVuTGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy50YWdPcGVuQ29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYmVnaW5TdGFydFRhZygpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ1N0YXJ0VGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGJlZ2luRW5kVGFnKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSB7XG4gICAgICB0eXBlOiAnRW5kVGFnJyxcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgYXR0cmlidXRlczogW10sXG4gICAgICBtb2RpZmllcnM6IFtdLFxuICAgICAgY29tbWVudHM6IFtdLFxuICAgICAgc2VsZkNsb3Npbmc6IGZhbHNlLFxuICAgICAgbG9jOiBTWU5USEVUSUMsXG4gICAgfTtcbiAgfVxuXG4gIGZpbmlzaFRhZygpIHtcbiAgICBsZXQgeyBsaW5lLCBjb2x1bW4gfSA9IHRoaXMudG9rZW5pemVyO1xuXG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICB0YWcubG9jID0gYi5sb2ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uLCBsaW5lLCBjb2x1bW4pO1xuXG4gICAgaWYgKHRhZy50eXBlID09PSAnU3RhcnRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaFN0YXJ0VGFnKCk7XG5cbiAgICAgIGlmICh2b2lkTWFwW3RhZy5uYW1lXSB8fCB0YWcuc2VsZkNsb3NpbmcpIHtcbiAgICAgICAgdGhpcy5maW5pc2hFbmRUYWcodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWcudHlwZSA9PT0gJ0VuZFRhZycpIHtcbiAgICAgIHRoaXMuZmluaXNoRW5kVGFnKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hTdGFydFRhZygpIHtcbiAgICBsZXQgeyBuYW1lLCBhdHRyaWJ1dGVzOiBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgc2VsZkNsb3NpbmcgfSA9IHRoaXMuY3VycmVudFN0YXJ0VGFnO1xuICAgIGxldCBsb2MgPSBiLmxvYyh0aGlzLnRhZ09wZW5MaW5lLCB0aGlzLnRhZ09wZW5Db2x1bW4pO1xuICAgIGxldCBlbGVtZW50ID0gYi5lbGVtZW50KHsgbmFtZSwgc2VsZkNsb3NpbmcgfSwgeyBhdHRycywgbW9kaWZpZXJzLCBjb21tZW50cywgbG9jIH0pO1xuICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2goZWxlbWVudCk7XG4gIH1cblxuICBmaW5pc2hFbmRUYWcoaXNWb2lkOiBib29sZWFuKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkVsZW1lbnROb2RlO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLmN1cnJlbnRFbGVtZW50KCk7XG5cbiAgICB2YWxpZGF0ZUVuZFRhZyh0YWcsIGVsZW1lbnQsIGlzVm9pZCk7XG5cbiAgICBlbGVtZW50LmxvYy5lbmQubGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgZWxlbWVudC5sb2MuZW5kLmNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcblxuICAgIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zKGVsZW1lbnQpO1xuICAgIGFwcGVuZENoaWxkKHBhcmVudCwgZWxlbWVudCk7XG4gIH1cblxuICBtYXJrVGFnQXNTZWxmQ2xvc2luZygpIHtcbiAgICB0aGlzLmN1cnJlbnRUYWcuc2VsZkNsb3NpbmcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVGFncyAtIG5hbWVcblxuICBhcHBlbmRUb1RhZ05hbWUoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50VGFnLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBhdHRyaWJ1dGVzXG5cbiAgYmVnaW5BdHRyaWJ1dGUoKSB7XG4gICAgbGV0IHRhZyA9IHRoaXMuY3VycmVudFRhZztcbiAgICBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgIGBJbnZhbGlkIGVuZCB0YWc6IGNsb3NpbmcgdGFnIG11c3Qgbm90IGhhdmUgYXR0cmlidXRlcywgYCArXG4gICAgICAgICAgYGluIFxcYCR7dGFnLm5hbWV9XFxgIChvbiBsaW5lICR7dGhpcy50b2tlbml6ZXIubGluZX0pLmAsXG4gICAgICAgIHRhZy5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50QXR0cmlidXRlID0ge1xuICAgICAgbmFtZTogJycsXG4gICAgICBwYXJ0czogW10sXG4gICAgICBpc1F1b3RlZDogZmFsc2UsXG4gICAgICBpc0R5bmFtaWM6IGZhbHNlLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbiksXG4gICAgICB2YWx1ZVN0YXJ0TGluZTogMCxcbiAgICAgIHZhbHVlU3RhcnRDb2x1bW46IDAsXG4gICAgfTtcbiAgfVxuXG4gIGFwcGVuZFRvQXR0cmlidXRlTmFtZShjaGFyOiBzdHJpbmcpIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLm5hbWUgKz0gY2hhcjtcbiAgfVxuXG4gIGJlZ2luQXR0cmlidXRlVmFsdWUoaXNRdW90ZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmN1cnJlbnRBdHRyLmlzUXVvdGVkID0gaXNRdW90ZWQ7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0TGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0Q29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICB9XG5cbiAgYXBwZW5kVG9BdHRyaWJ1dGVWYWx1ZShjaGFyOiBzdHJpbmcpIHtcbiAgICBsZXQgcGFydHMgPSB0aGlzLmN1cnJlbnRBdHRyLnBhcnRzO1xuICAgIGxldCBsYXN0UGFydCA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGxhc3RQYXJ0ICYmIGxhc3RQYXJ0LnR5cGUgPT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIGxhc3RQYXJ0LmNoYXJzICs9IGNoYXI7XG5cbiAgICAgIC8vIHVwZGF0ZSBlbmQgbG9jYXRpb24gZm9yIGVhY2ggYWRkZWQgY2hhclxuICAgICAgbGFzdFBhcnQubG9jLmVuZC5saW5lID0gdGhpcy50b2tlbml6ZXIubGluZTtcbiAgICAgIGxhc3RQYXJ0LmxvYy5lbmQuY29sdW1uID0gdGhpcy50b2tlbml6ZXIuY29sdW1uO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbml0aWFsbHkgYXNzdW1lIHRoZSB0ZXh0IG5vZGUgaXMgYSBzaW5nbGUgY2hhclxuICAgICAgbGV0IGxvYyA9IGIubG9jKFxuICAgICAgICB0aGlzLnRva2VuaXplci5saW5lLFxuICAgICAgICB0aGlzLnRva2VuaXplci5jb2x1bW4sXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmxpbmUsXG4gICAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICAgKTtcblxuICAgICAgLy8gdGhlIHRva2VuaXplciBsaW5lL2NvbHVtbiBoYXZlIGFscmVhZHkgYmVlbiBhZHZhbmNlZCwgY29ycmVjdCBsb2NhdGlvbiBpbmZvXG4gICAgICBpZiAoY2hhciA9PT0gJ1xcbicpIHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmUgLT0gMTtcbiAgICAgICAgbG9jLnN0YXJ0LmNvbHVtbiA9IGxhc3RQYXJ0ID8gbGFzdFBhcnQubG9jLmVuZC5jb2x1bW4gOiB0aGlzLmN1cnJlbnRBdHRyLnZhbHVlU3RhcnRDb2x1bW47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2Muc3RhcnQuY29sdW1uIC09IDE7XG4gICAgICB9XG5cbiAgICAgIGxldCB0ZXh0ID0gYi50ZXh0KGNoYXIsIGxvYyk7XG4gICAgICBwYXJ0cy5wdXNoKHRleHQpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmlzaEF0dHJpYnV0ZVZhbHVlKCkge1xuICAgIGxldCB7IG5hbWUsIHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiB9ID0gdGhpcy5jdXJyZW50QXR0cjtcbiAgICBsZXQgdmFsdWUgPSBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKHBhcnRzLCBpc1F1b3RlZCwgaXNEeW5hbWljLCB0aGlzLnRva2VuaXplci5saW5lKTtcbiAgICB2YWx1ZS5sb2MgPSBiLmxvYyh2YWx1ZVN0YXJ0TGluZSwgdmFsdWVTdGFydENvbHVtbiwgdGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGxldCBsb2MgPSBiLmxvYyhcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQubGluZSxcbiAgICAgIHRoaXMuY3VycmVudEF0dHIuc3RhcnQuY29sdW1uLFxuICAgICAgdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgIHRoaXMudG9rZW5pemVyLmNvbHVtblxuICAgICk7XG5cbiAgICBsZXQgYXR0cmlidXRlID0gYi5hdHRyKG5hbWUsIHZhbHVlLCBsb2MpO1xuXG4gICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XG4gIH1cblxuICByZXBvcnRTeW50YXhFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgU3ludGF4IGVycm9yIGF0IGxpbmUgJHt0aGlzLnRva2VuaXplci5saW5lfSBjb2wgJHt0aGlzLnRva2VuaXplci5jb2x1bW59OiAke21lc3NhZ2V9YCxcbiAgICAgIGIubG9jKHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbilcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlQXR0cmlidXRlVmFsdWUoXG4gIHBhcnRzOiAoQVNULk11c3RhY2hlU3RhdGVtZW50IHwgQVNULlRleHROb2RlKVtdLFxuICBpc1F1b3RlZDogYm9vbGVhbixcbiAgaXNEeW5hbWljOiBib29sZWFuLFxuICBsaW5lOiBudW1iZXJcbikge1xuICBpZiAoaXNEeW5hbWljKSB7XG4gICAgaWYgKGlzUXVvdGVkKSB7XG4gICAgICByZXR1cm4gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgcGFydHMubGVuZ3RoID09PSAxIHx8XG4gICAgICAgIChwYXJ0cy5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICBwYXJ0c1sxXS50eXBlID09PSAnVGV4dE5vZGUnICYmXG4gICAgICAgICAgKHBhcnRzWzFdIGFzIEFTVC5UZXh0Tm9kZSkuY2hhcnMgPT09ICcvJylcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gcGFydHNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYEFuIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZSBtdXN0IGJlIGEgc3RyaW5nIG9yIGEgbXVzdGFjaGUsIGAgK1xuICAgICAgICAgICAgYHByZWNlZWRlZCBieSB3aGl0ZXNwYWNlIG9yIGEgJz0nIGNoYXJhY3RlciwgYW5kIGAgK1xuICAgICAgICAgICAgYGZvbGxvd2VkIGJ5IHdoaXRlc3BhY2UsIGEgJz4nIGNoYXJhY3Rlciwgb3IgJy8+JyAob24gbGluZSAke2xpbmV9KWAsXG4gICAgICAgICAgYi5sb2MobGluZSwgMClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBhcnRzLmxlbmd0aCA+IDAgPyBwYXJ0c1swXSA6IGIudGV4dCgnJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZW1ibGVDb25jYXRlbmF0ZWRWYWx1ZShwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHBhcnQ6IEFTVC5CYXNlTm9kZSA9IHBhcnRzW2ldO1xuXG4gICAgaWYgKHBhcnQudHlwZSAhPT0gJ011c3RhY2hlU3RhdGVtZW50JyAmJiBwYXJ0LnR5cGUgIT09ICdUZXh0Tm9kZScpIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1Vuc3VwcG9ydGVkIG5vZGUgaW4gcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZTogJyArIHBhcnRbJ3R5cGUnXSxcbiAgICAgICAgcGFydC5sb2NcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGIuY29uY2F0KHBhcnRzKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbmRUYWcoXG4gIHRhZzogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4sXG4gIGVsZW1lbnQ6IEFTVC5FbGVtZW50Tm9kZSxcbiAgc2VsZkNsb3Npbmc6IGJvb2xlYW5cbikge1xuICBsZXQgZXJyb3I7XG5cbiAgaWYgKHZvaWRNYXBbdGFnLm5hbWVdICYmICFzZWxmQ2xvc2luZykge1xuICAgIC8vIEVuZ1RhZyBpcyBhbHNvIGNhbGxlZCBieSBTdGFydFRhZyBmb3Igdm9pZCBhbmQgc2VsZi1jbG9zaW5nIHRhZ3MgKGkuZS5cbiAgICAvLyA8aW5wdXQ+IG9yIDxiciAvPiwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgdGhhdCBoZXJlLiBPdGhlcndpc2UsIHdlIHdvdWxkXG4gICAgLy8gdGhyb3cgYW4gZXJyb3IgZm9yIHRob3NlIGNhc2VzLlxuICAgIGVycm9yID0gJ0ludmFsaWQgZW5kIHRhZyAnICsgZm9ybWF0RW5kVGFnSW5mbyh0YWcpICsgJyAodm9pZCBlbGVtZW50cyBjYW5ub3QgaGF2ZSBlbmQgdGFncykuJztcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IgPSAnQ2xvc2luZyB0YWcgJyArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArICcgd2l0aG91dCBhbiBvcGVuIHRhZy4nO1xuICB9IGVsc2UgaWYgKGVsZW1lbnQudGFnICE9PSB0YWcubmFtZSkge1xuICAgIGVycm9yID1cbiAgICAgICdDbG9zaW5nIHRhZyAnICtcbiAgICAgIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArXG4gICAgICAnIGRpZCBub3QgbWF0Y2ggbGFzdCBvcGVuIHRhZyBgJyArXG4gICAgICBlbGVtZW50LnRhZyArXG4gICAgICAnYCAob24gbGluZSAnICtcbiAgICAgIGVsZW1lbnQubG9jLnN0YXJ0LmxpbmUgK1xuICAgICAgJykuJztcbiAgfVxuXG4gIGlmIChlcnJvcikge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihlcnJvciwgZWxlbWVudC5sb2MpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEVuZFRhZ0luZm8odGFnOiBUYWc8J1N0YXJ0VGFnJyB8ICdFbmRUYWcnPikge1xuICByZXR1cm4gJ2AnICsgdGFnLm5hbWUgKyAnYCAob24gbGluZSAnICsgdGFnLmxvYy5lbmQubGluZSArICcpJztcbn1cblxuLyoqXG4gIEFTVFBsdWdpbnMgY2FuIG1ha2UgY2hhbmdlcyB0byB0aGUgR2xpbW1lciB0ZW1wbGF0ZSBBU1QgYmVmb3JlXG4gIGNvbXBpbGF0aW9uIGJlZ2lucy5cbiovXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkJ1aWxkZXIge1xuICAoZW52OiBBU1RQbHVnaW5FbnZpcm9ubWVudCk6IEFTVFBsdWdpbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW4ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZpc2l0b3I6IE5vZGVWaXNpdG9yO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFTVFBsdWdpbkVudmlyb25tZW50IHtcbiAgbWV0YT86IG9iamVjdDtcbiAgc3ludGF4OiBTeW50YXg7XG59XG5pbnRlcmZhY2UgSGFuZGxlYmFyc1BhcnNlT3B0aW9ucyB7XG4gIHNyY05hbWU/OiBzdHJpbmc7XG4gIGlnbm9yZVN0YW5kYWxvbmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByZXByb2Nlc3NPcHRpb25zIHtcbiAgbWV0YT86IHtcbiAgICBtb2R1bGVOYW1lPzogc3RyaW5nO1xuICB9O1xuICBwbHVnaW5zPzoge1xuICAgIGFzdD86IEFTVFBsdWdpbkJ1aWxkZXJbXTtcbiAgfTtcbiAgcGFyc2VPcHRpb25zPzogSGFuZGxlYmFyc1BhcnNlT3B0aW9ucztcblxuICAvKipcbiAgICBVc2VmdWwgZm9yIHNwZWNpZnlpbmcgYSBncm91cCBvZiBvcHRpb25zIHRvZ2V0aGVyLlxuXG4gICAgV2hlbiBgJ2NvZGVtb2QnYCB3ZSBkaXNhYmxlIGFsbCB3aGl0ZXNwYWNlIGNvbnRyb2wgaW4gaGFuZGxlYmFyc1xuICAgICh0byBwcmVzZXJ2ZSBhcyBtdWNoIGFzIHBvc3NpYmxlKSBhbmQgd2UgYWxzbyBhdm9pZCBhbnlcbiAgICBlc2NhcGluZy91bmVzY2FwaW5nIG9mIEhUTUwgZW50aXR5IGNvZGVzLlxuICAgKi9cbiAgbW9kZT86ICdjb2RlbW9kJyB8ICdwcmVjb21waWxlJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTeW50YXgge1xuICBwYXJzZTogdHlwZW9mIHByZXByb2Nlc3M7XG4gIGJ1aWxkZXJzOiB0eXBlb2YgYnVpbGRlcnM7XG4gIHByaW50OiB0eXBlb2YgcHJpbnQ7XG4gIHRyYXZlcnNlOiB0eXBlb2YgdHJhdmVyc2U7XG4gIFdhbGtlcjogdHlwZW9mIFdhbGtlcjtcbn1cblxuY29uc3Qgc3ludGF4OiBTeW50YXggPSB7XG4gIHBhcnNlOiBwcmVwcm9jZXNzLFxuICBidWlsZGVycyxcbiAgcHJpbnQsXG4gIHRyYXZlcnNlLFxuICBXYWxrZXIsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2VzcyhodG1sOiBzdHJpbmcsIG9wdGlvbnM6IFByZXByb2Nlc3NPcHRpb25zID0ge30pOiBBU1QuVGVtcGxhdGUge1xuICBsZXQgbW9kZSA9IG9wdGlvbnMubW9kZSB8fCAncHJlY29tcGlsZSc7XG5cbiAgbGV0IGFzdDogSEJTLlByb2dyYW07XG4gIGlmICh0eXBlb2YgaHRtbCA9PT0gJ29iamVjdCcpIHtcbiAgICBhc3QgPSBodG1sO1xuICB9IGVsc2UgaWYgKG1vZGUgPT09ICdjb2RlbW9kJykge1xuICAgIGFzdCA9IHBhcnNlV2l0aG91dFByb2Nlc3NpbmcoaHRtbCwgb3B0aW9ucy5wYXJzZU9wdGlvbnMpIGFzIEhCUy5Qcm9ncmFtO1xuICB9IGVsc2Uge1xuICAgIGFzdCA9IHBhcnNlKGh0bWwsIG9wdGlvbnMucGFyc2VPcHRpb25zKSBhcyBIQlMuUHJvZ3JhbTtcbiAgfVxuXG4gIGxldCBlbnRpdHlQYXJzZXIgPSB1bmRlZmluZWQ7XG4gIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICBlbnRpdHlQYXJzZXIgPSBuZXcgRW50aXR5UGFyc2VyKHt9KTtcbiAgfVxuXG4gIGxldCBwcm9ncmFtID0gbmV3IFRva2VuaXplckV2ZW50SGFuZGxlcnMoaHRtbCwgZW50aXR5UGFyc2VyLCBtb2RlKS5hY2NlcHRUZW1wbGF0ZShhc3QpO1xuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMucGx1Z2lucyAmJiBvcHRpb25zLnBsdWdpbnMuYXN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBvcHRpb25zLnBsdWdpbnMuYXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGV0IHRyYW5zZm9ybSA9IG9wdGlvbnMucGx1Z2lucy5hc3RbaV07XG4gICAgICBsZXQgZW52OiBBU1RQbHVnaW5FbnZpcm9ubWVudCA9IGFzc2lnbih7fSwgb3B0aW9ucywgeyBzeW50YXggfSwgeyBwbHVnaW5zOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGxldCBwbHVnaW5SZXN1bHQgPSB0cmFuc2Zvcm0oZW52KTtcblxuICAgICAgdHJhdmVyc2UocHJvZ3JhbSwgcGx1Z2luUmVzdWx0LnZpc2l0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9ncmFtO1xufVxuIl0sIm5hbWVzIjpbImFzc2lnbiIsIkVudGl0eVBhcnNlciIsIm5hbWVkQ2hhclJlZnMiLCJFdmVudGVkVG9rZW5pemVyIiwiYiIsInR1cGxlIiwicHJpbnQiLCJwYXJzZVdpdGhvdXRQcm9jZXNzaW5nIiwicGFyc2UiXSwibWFwcGluZ3MiOiI7O0VBV0EsU0FBQSxhQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBTXdCO0VBRXRCLE1BQUksT0FBQSxJQUFBLEtBQUosUUFBQSxFQUE4QjtFQUM1QixJQUFBLElBQUksR0FBRyxTQUFTLENBQWhCLElBQWdCLENBQWhCO0VBQ0Q7O0VBRUQsU0FBTztFQUNMLElBQUEsSUFBSSxFQURDLG1CQUFBO0VBRUwsSUFB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
