var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

import b from '../builders';
import { appendChild, isLiteral, printLiteral } from '../utils';
import { Parser } from '../parser';
import SyntaxError from '../errors/syntax-error';
export var HandlebarsNodeVisitors = function (_Parser) {
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

    _createClass(HandlebarsNodeVisitors, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsT0FBQSxDQUFBLE1BQUEsYUFBQTtBQUNBLFNBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLFFBQUEsVUFBQTtBQUdBLFNBQUEsTUFBQSxRQUFBLFdBQUE7QUFDQSxPQUFBLFdBQUEsTUFBQSx3QkFBQTtBQUtBLFdBQU0sc0JBQU47QUFBQTs7QUFBQSxzQ0FBQTtBQUFBOztBQUFBLHFELDhCQUFBOztBQUtFLGNBQUEsV0FBQSxHQUFBLENBQUE7QUFMRjtBQW1XQzs7QUFuV0QscUNBT0UsTUFQRixxQkFPUTtBQUNKLDRCQUFrQixLQUFsQixXQUFrQixFQUFsQjtBQUNELEtBVEg7O0FBQUEscUNBa0JFLE9BbEJGLG9CQWtCRSxPQWxCRixFQWtCOEI7QUFDMUIsWUFBSSxPQUFKLEVBQUE7QUFDQSxhQUFBLFdBQUEsR0FBQSxDQUFBO0FBRUEsWUFBQSxhQUFBO0FBRUEsWUFBSSxLQUFKLFVBQUEsRUFBcUI7QUFDbkIsbUJBQU8sRUFBQSxRQUFBLENBQUEsSUFBQSxFQUFpQixRQUFqQixXQUFBLEVBQXNDLFFBQTdDLEdBQU8sQ0FBUDtBQURGLFNBQUEsTUFFTztBQUNMLG1CQUFPLEVBQUEsV0FBQSxDQUFBLElBQUEsRUFBb0IsUUFBcEIsV0FBQSxFQUF5QyxRQUF6QyxPQUFBLEVBQTBELFFBQWpFLEdBQU8sQ0FBUDtBQUNEO0FBRUQsWUFBQSxVQUFBO0FBQUEsWUFDRSxJQUFJLFFBQUEsSUFBQSxDQUROLE1BQUE7QUFHQSxhQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUVBLFlBQUksTUFBSixDQUFBLEVBQWE7QUFDWCxtQkFBTyxLQUFBLFlBQUEsQ0FBUCxHQUFPLEVBQVA7QUFDRDtBQUVELGFBQUssSUFBTCxDQUFBLEVBQVksSUFBWixD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L0IsOEJBQUEsSUFBQTtBQUNEO0FBUEgsS0FBQTtBQVVBLFFBQUksT0FBTyxFQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQVgsTUFBVyxDQUFYO0FBQ0EsUUFBSSxXQUFXLEVBQUEsSUFBQSxDQUFBLE1BQUEsRUFBZixJQUFlLENBQWY7QUFDQSxTQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQTtBQUVBLFFBQUksQ0FBSixlQUFBLEVBQXNCO0FBQ3BCLFlBQUksbUJBQW1CLEVBQUEsT0FBQSxDQUFBLGtCQUFBLEVBQXZCLFNBQXVCLENBQXZCO0FBQ0EsWUFBSSxnQkFBZ0IsRUFBQSxJQUFBLENBQUEsY0FBQSxFQUFwQixnQkFBb0IsQ0FBcEI7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQTtBQUNEO0FBRUQsV0FBQSxJQUFBO0FBQ0Q7QUFFRCxTQUFBLCtCQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsRUFBMEY7QUFDeEYsY0FBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGNBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYiBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgaXNMaXRlcmFsLCBwcmludExpdGVyYWwgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCB7IFBhcnNlciwgVGFnLCBBdHRyaWJ1dGUgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IFN5bnRheEVycm9yIGZyb20gJy4uL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBSZWNhc3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRva2VuaXplclN0YXRlIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMgZXh0ZW5kcyBQYXJzZXIge1xuICBhYnN0cmFjdCBhcHBlbmRUb0NvbW1lbnREYXRhKHM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlVmFsdWUocXVvdGVkOiBib29sZWFuKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQXR0cmlidXRlVmFsdWUoKTogdm9pZDtcblxuICBjdXJzb3JDb3VudCA9IDA7XG5cbiAgY3Vyc29yKCkge1xuICAgIHJldHVybiBgJWN1cnNvcjoke3RoaXMuY3Vyc29yQ291bnQrK30lYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGlzVG9wTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGU7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUge1xuICAgIGxldCBib2R5OiBBU1QuU3RhdGVtZW50W10gPSBbXTtcbiAgICB0aGlzLmN1cnNvckNvdW50ID0gMDtcblxuICAgIGxldCBub2RlO1xuXG4gICAgaWYgKHRoaXMuaXNUb3BMZXZlbCkge1xuICAgICAgbm9kZSA9IGIudGVtcGxhdGUoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5sb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gYi5ibG9ja0l0c2VsZihib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmNoYWluZWQsIHByb2dyYW0ubG9jKTtcbiAgICB9XG5cbiAgICBsZXQgaSxcbiAgICAgIGwgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuXG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmIChsID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuYWNjZXB0Tm9kZShwcm9ncmFtLmJvZHlbaV0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoYXQgdGhlIGVsZW1lbnQgc3RhY2sgaXMgYmFsYW5jZWQgcHJvcGVybHkuXG4gICAgbGV0IHBvcHBlZE5vZGUgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBpZiAocG9wcGVkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgbGV0IGVsZW1lbnROb2RlID0gcG9wcGVkTm9kZSBhcyBBU1QuRWxlbWVudE5vZGU7XG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1VuY2xvc2VkIGVsZW1lbnQgYCcgKyBlbGVtZW50Tm9kZS50YWcgKyAnYCAob24gbGluZSAnICsgZWxlbWVudE5vZGUubG9jIS5zdGFydC5saW5lICsgJykuJyxcbiAgICAgICAgZWxlbWVudE5vZGUubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEFTVC5CbG9ja1N0YXRlbWVudCB8IHZvaWQge1xuICAgIGlmICh0aGlzLnRva2VuaXplclsnc3RhdGUnXSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKGJsb2NrKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdjb21tZW50JyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdkYXRhJyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdiZWZvcmVEYXRhJ1xuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnQSBibG9jayBtYXkgb25seSBiZSB1c2VkIGluc2lkZSBhbiBIVE1MIGVsZW1lbnQgb3IgYW5vdGhlciBibG9jay4nLFxuICAgICAgICBibG9jay5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgYmxvY2spO1xuICAgIGxldCBwcm9ncmFtID0gdGhpcy5Qcm9ncmFtKGJsb2NrLnByb2dyYW0pO1xuICAgIGxldCBpbnZlcnNlID0gYmxvY2suaW52ZXJzZSA/IHRoaXMuUHJvZ3JhbShibG9jay5pbnZlcnNlKSA6IG51bGw7XG5cbiAgICBpZiAocGF0aC5vcmlnaW5hbCA9PT0gJ2luLWVsZW1lbnQnKSB7XG4gICAgICBoYXNoID0gYWRkSW5FbGVtZW50SGFzaCh0aGlzLmN1cnNvcigpLCBoYXNoLCBibG9jay5sb2MpO1xuICAgIH1cblxuICAgIGxldCBub2RlID0gYi5ibG9jayhcbiAgICAgIHBhdGgsXG4gICAgICBwYXJhbXMsXG4gICAgICBoYXNoLFxuICAgICAgcHJvZ3JhbSxcbiAgICAgIGludmVyc2UsXG4gICAgICBibG9jay5sb2MsXG4gICAgICBibG9jay5vcGVuU3RyaXAsXG4gICAgICBibG9jay5pbnZlcnNlU3RyaXAsXG4gICAgICBibG9jay5jbG9zZVN0cmlwXG4gICAgKTtcblxuICAgIGxldCBwYXJlbnRQcm9ncmFtID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgYXBwZW5kQ2hpbGQocGFyZW50UHJvZ3JhbSwgbm9kZSk7XG4gIH1cblxuICBNdXN0YWNoZVN0YXRlbWVudChyYXdNdXN0YWNoZTogSEJTLk11c3RhY2hlU3RhdGVtZW50KTogQVNULk11c3RhY2hlU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKHJhd011c3RhY2hlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQ7XG4gICAgbGV0IHsgZXNjYXBlZCwgbG9jLCBzdHJpcCB9ID0gcmF3TXVzdGFjaGU7XG5cbiAgICBpZiAoaXNMaXRlcmFsKHJhd011c3RhY2hlLnBhdGgpKSB7XG4gICAgICBtdXN0YWNoZSA9IHtcbiAgICAgICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICAgICAgcGF0aDogdGhpcy5hY2NlcHROb2RlPEFTVC5MaXRlcmFsPihyYXdNdXN0YWNoZS5wYXRoKSxcbiAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgaGFzaDogYi5oYXNoKCksXG4gICAgICAgIGVzY2FwZWQsXG4gICAgICAgIGxvYyxcbiAgICAgICAgc3RyaXAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCByYXdNdXN0YWNoZSBhcyBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQgJiB7XG4gICAgICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICAgIH0pO1xuICAgICAgbXVzdGFjaGUgPSBiLm11c3RhY2hlKHBhdGgsIHBhcmFtcywgaGFzaCwgIWVzY2FwZWQsIGxvYywgc3RyaXApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW5pemVyLnN0YXRlKSB7XG4gICAgICAvLyBUYWcgaGVscGVyc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdPcGVuOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdOYW1lOlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENhbm5vdCB1c2UgbXVzdGFjaGVzIGluIGFuIGVsZW1lbnRzIHRhZ25hbWU6IFxcYCR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICAgICAgcmF3TXVzdGFjaGUsXG4gICAgICAgICAgICByYXdNdXN0YWNoZS5wYXRoXG4gICAgICAgICAgKX1cXGAgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICBtdXN0YWNoZS5sb2NcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZU5hbWU6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5maW5pc2hBdHRyaWJ1dGVWYWx1ZSgpO1xuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlVmFsdWVRdW90ZWQ6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gQXR0cmlidXRlIHZhbHVlc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVWYWx1ZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZURvdWJsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVTaW5nbGVRdW90ZWQ6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlVW5xdW90ZWQ6XG4gICAgICAgIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQodGhpcy5jdXJyZW50QXR0cmlidXRlISwgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gVE9ETzogT25seSBhcHBlbmQgY2hpbGQgd2hlbiB0aGUgdG9rZW5pemVyIHN0YXRlIG1ha2VzXG4gICAgICAvLyBzZW5zZSB0byBkbyBzbywgb3RoZXJ3aXNlIHRocm93IGFuIGVycm9yLlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBtdXN0YWNoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG11c3RhY2hlO1xuICB9XG5cbiAgQ29udGVudFN0YXRlbWVudChjb250ZW50OiBIQlMuQ29udGVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRoaXMudG9rZW5pemVyLCBjb250ZW50KTtcblxuICAgIHRoaXMudG9rZW5pemVyLnRva2VuaXplUGFydChjb250ZW50LnZhbHVlKTtcbiAgICB0aGlzLnRva2VuaXplci5mbHVzaERhdGEoKTtcbiAgfVxuXG4gIENvbW1lbnRTdGF0ZW1lbnQocmF3Q29tbWVudDogSEJTLkNvbW1lbnRTdGF0ZW1lbnQpOiBPcHRpb248QVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudD4ge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09IFRva2VuaXplclN0YXRlLmNvbW1lbnQpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3Q29tbWVudCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHsgdmFsdWUsIGxvYyB9ID0gcmF3Q29tbWVudDtcbiAgICBsZXQgY29tbWVudCA9IGIubXVzdGFjaGVDb21tZW50KHZhbHVlLCBsb2MpO1xuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuZGF0YTpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgYSBIYW5kbGViYXJzIGNvbW1lbnQgd2hlbiBpbiB0aGUgXFxgJHt0b2tlbml6ZXJbJ3N0YXRlJ119XFxgIHN0YXRlIGlzIG5vdCBzdXBwb3J0ZWQ6IFwiJHtjb21tZW50LnZhbHVlfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX06JHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICAgICAgcmF3Q29tbWVudC5sb2NcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIFBhcnRpYWxTdGF0ZW1lbnQocGFydGlhbDogSEJTLlBhcnRpYWxTdGF0ZW1lbnQpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBwYXJ0aWFsO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbHMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUocGFydGlhbCwgcGFydGlhbC5uYW1lKX1cIiBhdCBMJHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmVcbiAgICAgIH06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgcGFydGlhbC5sb2NcbiAgICApO1xuICB9XG5cbiAgUGFydGlhbEJsb2NrU3RhdGVtZW50KHBhcnRpYWxCbG9jazogSEJTLlBhcnRpYWxCbG9ja1N0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWxCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIHBhcnRpYWwgYmxvY2tzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBwYXJ0aWFsQmxvY2ssXG4gICAgICAgIHBhcnRpYWxCbG9jay5uYW1lXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsQmxvY2subG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvcihkZWNvcmF0b3I6IEhCUy5EZWNvcmF0b3IpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3I7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBkZWNvcmF0b3JzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBkZWNvcmF0b3IsXG4gICAgICAgIGRlY29yYXRvci5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3IubG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvckJsb2NrKGRlY29yYXRvckJsb2NrOiBIQlMuRGVjb3JhdG9yQmxvY2spOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3JCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvciBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvckJsb2NrLFxuICAgICAgICBkZWNvcmF0b3JCbG9jay5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3JCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgU3ViRXhwcmVzc2lvbihzZXhwcjogSEJTLlN1YkV4cHJlc3Npb24pOiBBU1QuU3ViRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgc2V4cHIpO1xuICAgIHJldHVybiBiLnNleHByKHBhdGgsIHBhcmFtcywgaGFzaCwgc2V4cHIubG9jKTtcbiAgfVxuXG4gIFBhdGhFeHByZXNzaW9uKHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbik6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgb3JpZ2luYWwsIGxvYyB9ID0gcGF0aDtcbiAgICBsZXQgcGFydHM6IHN0cmluZ1tdO1xuXG4gICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAyKSA9PT0gJy4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVzaW5nIFwiLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXIgYW5kIHVubmVjZXNzYXJ5OiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAzKSA9PT0gJy4uLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBDaGFuZ2luZyBjb250ZXh0IHVzaW5nIFwiLi4vXCIgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgTWl4aW5nICcuJyBhbmQgJy8nIGluIHBhdGhzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lcjsgdXNlIG9ubHkgJy4nIHRvIHNlcGFyYXRlIHByb3BlcnR5IHBhdGhzOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHBhcnRzID0gW3BhdGgucGFydHMuam9pbignLycpXTtcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsID09PSAnLicpIHtcbiAgICAgIGxldCBsb2NhdGlvbkluZm8gPSBgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YDtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgYCcuJyBpcyBub3QgYSBzdXBwb3J0ZWQgcGF0aCBpbiBHbGltbWVyOyBjaGVjayBmb3IgYSBwYXRoIHdpdGggYSB0cmFpbGluZyAnLicgYXQgJHtsb2NhdGlvbkluZm99LmAsXG4gICAgICAgIHBhdGgubG9jXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cyA9IHBhdGgucGFydHM7XG4gICAgfVxuXG4gICAgbGV0IHRoaXNIZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUaGlzIGlzIHRvIGZpeCBhIGJ1ZyBpbiB0aGUgSGFuZGxlYmFycyBBU1Qgd2hlcmUgdGhlIHBhdGggZXhwcmVzc2lvbnMgaW5cbiAgICAvLyBge3t0aGlzLmZvb319YCAoYW5kIHNpbWlsYXJseSBge3tmb28tYmFyIHRoaXMuZm9vIG5hbWVkPXRoaXMuZm9vfX1gIGV0YylcbiAgICAvLyBhcmUgc2ltcGx5IHR1cm5lZCBpbnRvIGB7e2Zvb319YC4gVGhlIGZpeCBpcyB0byBwdXNoIGl0IGJhY2sgb250byB0aGVcbiAgICAvLyBwYXJ0cyBhcnJheSBhbmQgbGV0IHRoZSBydW50aW1lIHNlZSB0aGUgZGlmZmVyZW5jZS4gSG93ZXZlciwgd2UgY2Fubm90XG4gICAgLy8gc2ltcGx5IHVzZSB0aGUgc3RyaW5nIGB0aGlzYCBhcyBpdCBtZWFucyBsaXRlcmFsbHkgdGhlIHByb3BlcnR5IGNhbGxlZFxuICAgIC8vIFwidGhpc1wiIGluIHRoZSBjdXJyZW50IGNvbnRleHQgKGl0IGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIHN5bnRheCBhc1xuICAgIC8vIGB7e1t0aGlzXX19YCwgd2hlcmUgdGhlIHNxdWFyZSBicmFja2V0IGFyZSBnZW5lcmFsbHkgZm9yIHRoaXMga2luZCBvZlxuICAgIC8vIGVzY2FwaW5nIOKAkyBzdWNoIGFzIGB7e2Zvby5bXCJiYXIuYmF6XCJdfX1gIHdvdWxkIG1lYW4gbG9va3VwIGEgcHJvcGVydHlcbiAgICAvLyBuYW1lZCBsaXRlcmFsbHkgXCJiYXIuYmF6XCIgb24gYHRoaXMuZm9vYCkuIEJ5IGNvbnZlbnRpb24sIHdlIHVzZSBgbnVsbGBcbiAgICAvLyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgIGlmIChvcmlnaW5hbC5tYXRjaCgvXnRoaXMoXFwuLispPyQvKSkge1xuICAgICAgdGhpc0hlYWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgICAgb3JpZ2luYWw6IHBhdGgub3JpZ2luYWwsXG4gICAgICB0aGlzOiB0aGlzSGVhZCxcbiAgICAgIHBhcnRzLFxuICAgICAgZGF0YTogcGF0aC5kYXRhLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9O1xuICB9XG5cbiAgSGFzaChoYXNoOiBIQlMuSGFzaCk6IEFTVC5IYXNoIHtcbiAgICBsZXQgcGFpcnM6IEFTVC5IYXNoUGFpcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhc2gucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwYWlyID0gaGFzaC5wYWlyc1tpXTtcbiAgICAgIHBhaXJzLnB1c2goYi5wYWlyKHBhaXIua2V5LCB0aGlzLmFjY2VwdE5vZGUocGFpci52YWx1ZSksIHBhaXIubG9jKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGIuaGFzaChwYWlycywgaGFzaC5sb2MpO1xuICB9XG5cbiAgU3RyaW5nTGl0ZXJhbChzdHJpbmc6IEhCUy5TdHJpbmdMaXRlcmFsKTogQVNULlN0cmluZ0xpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1N0cmluZ0xpdGVyYWwnLCBzdHJpbmcudmFsdWUsIHN0cmluZy5sb2MpO1xuICB9XG5cbiAgQm9vbGVhbkxpdGVyYWwoYm9vbGVhbjogSEJTLkJvb2xlYW5MaXRlcmFsKTogQVNULkJvb2xlYW5MaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdCb29sZWFuTGl0ZXJhbCcsIGJvb2xlYW4udmFsdWUsIGJvb2xlYW4ubG9jKTtcbiAgfVxuXG4gIE51bWJlckxpdGVyYWwobnVtYmVyOiBIQlMuTnVtYmVyTGl0ZXJhbCk6IEFTVC5OdW1iZXJMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdW1iZXJMaXRlcmFsJywgbnVtYmVyLnZhbHVlLCBudW1iZXIubG9jKTtcbiAgfVxuXG4gIFVuZGVmaW5lZExpdGVyYWwodW5kZWY6IEhCUy5VbmRlZmluZWRMaXRlcmFsKTogQVNULlVuZGVmaW5lZExpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQsIHVuZGVmLmxvYyk7XG4gIH1cblxuICBOdWxsTGl0ZXJhbChudWw6IEhCUy5OdWxsTGl0ZXJhbCk6IEFTVC5OdWxsTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnTnVsbExpdGVyYWwnLCBudWxsLCBudWwubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVSaWdodFN0cmlwcGVkT2Zmc2V0cyhvcmlnaW5hbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAvLyBpZiBpdCBpcyBlbXB0eSwganVzdCByZXR1cm4gdGhlIGNvdW50IG9mIG5ld2xpbmVzXG4gICAgLy8gaW4gb3JpZ2luYWxcbiAgICByZXR1cm4ge1xuICAgICAgbGluZXM6IG9yaWdpbmFsLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxLFxuICAgICAgY29sdW1uczogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBuZXdsaW5lcyBwcmlvciB0b1xuICAvLyBgdmFsdWVgXG4gIGxldCBkaWZmZXJlbmNlID0gb3JpZ2luYWwuc3BsaXQodmFsdWUpWzBdO1xuICBsZXQgbGluZXMgPSBkaWZmZXJlbmNlLnNwbGl0KC9cXG4vKTtcbiAgbGV0IGxpbmVDb3VudCA9IGxpbmVzLmxlbmd0aCAtIDE7XG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lczogbGluZUNvdW50LFxuICAgIGNvbHVtbnM6IGxpbmVzW2xpbmVDb3VudF0ubGVuZ3RoLFxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb2tlbml6ZXJMb2NhdGlvbih0b2tlbml6ZXI6IFBhcnNlclsndG9rZW5pemVyJ10sIGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KSB7XG4gIGxldCBsaW5lID0gY29udGVudC5sb2Muc3RhcnQubGluZTtcbiAgbGV0IGNvbHVtbiA9IGNvbnRlbnQubG9jLnN0YXJ0LmNvbHVtbjtcblxuICBsZXQgb2Zmc2V0cyA9IGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKFxuICAgIGNvbnRlbnQub3JpZ2luYWwgYXMgUmVjYXN0PEhCUy5TdHJpcEZsYWdzLCBzdHJpbmc+LFxuICAgIGNvbnRlbnQudmFsdWVcbiAgKTtcblxuICBsaW5lID0gbGluZSArIG9mZnNldHMubGluZXM7XG4gIGlmIChvZmZzZXRzLmxpbmVzKSB7XG4gICAgY29sdW1uID0gb2Zmc2V0cy5jb2x1bW5zO1xuICB9IGVsc2Uge1xuICAgIGNvbHVtbiA9IGNvbHVtbiArIG9mZnNldHMuY29sdW1ucztcbiAgfVxuXG4gIHRva2VuaXplci5saW5lID0gbGluZTtcbiAgdG9rZW5pemVyLmNvbHVtbiA9IGNvbHVtbjtcbn1cblxuZnVuY3Rpb24gYWNjZXB0Q2FsbE5vZGVzKFxuICBjb21waWxlcjogSGFuZGxlYmFyc05vZGVWaXNpdG9ycyxcbiAgbm9kZToge1xuICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICBwYXJhbXM6IEhCUy5FeHByZXNzaW9uW107XG4gICAgaGFzaDogSEJTLkhhc2g7XG4gIH1cbik6IHsgcGF0aDogQVNULlBhdGhFeHByZXNzaW9uOyBwYXJhbXM6IEFTVC5FeHByZXNzaW9uW107IGhhc2g6IEFTVC5IYXNoIH0ge1xuICBsZXQgcGF0aCA9IGNvbXBpbGVyLlBhdGhFeHByZXNzaW9uKG5vZGUucGF0aCk7XG5cbiAgbGV0IHBhcmFtcyA9IG5vZGUucGFyYW1zID8gbm9kZS5wYXJhbXMubWFwKGUgPT4gY29tcGlsZXIuYWNjZXB0Tm9kZTxBU1QuRXhwcmVzc2lvbj4oZSkpIDogW107XG4gIGxldCBoYXNoID0gbm9kZS5oYXNoID8gY29tcGlsZXIuSGFzaChub2RlLmhhc2gpIDogYi5oYXNoKCk7XG5cbiAgcmV0dXJuIHsgcGF0aCwgcGFyYW1zLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRNb2RpZmllcihlbGVtZW50OiBUYWc8J1N0YXJ0VGFnJz4sIG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MgfSA9IG11c3RhY2hlO1xuXG4gIGlmIChpc0xpdGVyYWwocGF0aCkpIHtcbiAgICBsZXQgbW9kaWZpZXIgPSBge3ske3ByaW50TGl0ZXJhbChwYXRoKX19fWA7XG4gICAgbGV0IHRhZyA9IGA8JHtlbGVtZW50Lm5hbWV9IC4uLiAke21vZGlmaWVyfSAuLi5gO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEluICR7dGFnfSwgJHttb2RpZmllcn0gaXMgbm90IGEgdmFsaWQgbW9kaWZpZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2MgJiZcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICBtdXN0YWNoZS5sb2NcbiAgICApO1xuICB9XG5cbiAgbGV0IG1vZGlmaWVyID0gYi5lbGVtZW50TW9kaWZpZXIocGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MpO1xuICBlbGVtZW50Lm1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gYWRkSW5FbGVtZW50SGFzaChjdXJzb3I6IHN0cmluZywgaGFzaDogQVNULkhhc2gsIGxvYzogQVNULlNvdXJjZUxvY2F0aW9uKSB7XG4gIGxldCBoYXNJbnNlcnRCZWZvcmUgPSBmYWxzZTtcbiAgaGFzaC5wYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xuICAgIGlmIChwYWlyLmtleSA9PT0gJ2d1aWQnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0Nhbm5vdCBwYXNzIGBndWlkYCBmcm9tIHVzZXIgc3BhY2UnLCBsb2MpO1xuICAgIH1cblxuICAgIGlmIChwYWlyLmtleSA9PT0gJ2luc2VydEJlZm9yZScpIHtcbiAgICAgIGhhc0luc2VydEJlZm9yZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBsZXQgZ3VpZCA9IGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIGN1cnNvcik7XG4gIGxldCBndWlkUGFpciA9IGIucGFpcignZ3VpZCcsIGd1aWQpO1xuICBoYXNoLnBhaXJzLnVuc2hpZnQoZ3VpZFBhaXIpO1xuXG4gIGlmICghaGFzSW5zZXJ0QmVmb3JlKSB7XG4gICAgbGV0IHVuZGVmaW5lZExpdGVyYWwgPSBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQpO1xuICAgIGxldCBiZWZvcmVTaWJsaW5nID0gYi5wYWlyKCdpbnNlcnRCZWZvcmUnLCB1bmRlZmluZWRMaXRlcmFsKTtcbiAgICBoYXNoLnBhaXJzLnB1c2goYmVmb3JlU2libGluZyk7XG4gIH1cblxuICByZXR1cm4gaGFzaDtcbn1cblxuZnVuY3Rpb24gYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydChhdHRyaWJ1dGU6IEF0dHJpYnV0ZSwgcGFydDogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGF0dHJpYnV0ZS5pc0R5bmFtaWMgPSB0cnVlO1xuICBhdHRyaWJ1dGUucGFydHMucHVzaChwYXJ0KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=