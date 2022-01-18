import b from '../builders';
import { appendChild, isLiteral, printLiteral } from '../utils';
import { Parser } from '../parser';
import SyntaxError from '../errors/syntax-error';
export class HandlebarsNodeVisitors extends Parser {
    constructor() {
        super(...arguments);
        this.cursorCount = 0;
    }
    cursor() {
        return `%cursor:${this.cursorCount++}%`;
    }
    get isTopLevel() {
        return this.elementStack.length === 0;
    }
    Program(program) {
        let body = [];
        this.cursorCount = 0;
        let node;
        if (this.isTopLevel) {
            node = b.template(body, program.blockParams, program.loc);
        } else {
            node = b.blockItself(body, program.blockParams, program.chained, program.loc);
        }
        let i,
            l = program.body.length;
        this.elementStack.push(node);
        if (l === 0) {
            return this.elementStack.pop();
        }
        for (i = 0; i < l; i++) {
            this.acceptNode(program.body[i]);
        }
        // Ensure that that the element stack is balanced properly.
        let poppedNode = this.elementStack.pop();
        if (poppedNode !== node) {
            let elementNode = poppedNode;
            throw new SyntaxError('Unclosed element `' + elementNode.tag + '` (on line ' + elementNode.loc.start.line + ').', elementNode.loc);
        }
        return node;
    }
    BlockStatement(block) {
        if (this.tokenizer['state'] === 'comment') {
            this.appendToCommentData(this.sourceForNode(block));
            return;
        }
        if (this.tokenizer['state'] !== 'comment' && this.tokenizer['state'] !== 'data' && this.tokenizer['state'] !== 'beforeData') {
            throw new SyntaxError('A block may only be used inside an HTML element or another block.', block.loc);
        }
        let { path, params, hash } = acceptCallNodes(this, block);
        let program = this.Program(block.program);
        let inverse = block.inverse ? this.Program(block.inverse) : null;
        if (path.original === 'in-element') {
            hash = addInElementHash(this.cursor(), hash, block.loc);
        }
        let node = b.block(path, params, hash, program, inverse, block.loc, block.openStrip, block.inverseStrip, block.closeStrip);
        let parentProgram = this.currentElement();
        appendChild(parentProgram, node);
    }
    MustacheStatement(rawMustache) {
        let { tokenizer } = this;
        if (tokenizer.state === 'comment') {
            this.appendToCommentData(this.sourceForNode(rawMustache));
            return;
        }
        let mustache;
        let { escaped, loc, strip } = rawMustache;
        if (isLiteral(rawMustache.path)) {
            mustache = {
                type: 'MustacheStatement',
                path: this.acceptNode(rawMustache.path),
                params: [],
                hash: b.hash(),
                escaped,
                loc,
                strip
            };
        } else {
            let { path, params, hash } = acceptCallNodes(this, rawMustache);
            mustache = b.mustache(path, params, hash, !escaped, loc, strip);
        }
        switch (tokenizer.state) {
            // Tag helpers
            case "tagOpen" /* tagOpen */:
            case "tagName" /* tagName */:
                throw new SyntaxError(`Cannot use mustaches in an elements tagname: \`${this.sourceForNode(rawMustache, rawMustache.path)}\` at L${loc.start.line}:C${loc.start.column}`, mustache.loc);
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
    }
    ContentStatement(content) {
        updateTokenizerLocation(this.tokenizer, content);
        this.tokenizer.tokenizePart(content.value);
        this.tokenizer.flushData();
    }
    CommentStatement(rawComment) {
        let { tokenizer } = this;
        if (tokenizer.state === "comment" /* comment */) {
                this.appendToCommentData(this.sourceForNode(rawComment));
                return null;
            }
        let { value, loc } = rawComment;
        let comment = b.mustacheComment(value, loc);
        switch (tokenizer.state) {
            case "beforeAttributeName" /* beforeAttributeName */:
                this.currentStartTag.comments.push(comment);
                break;
            case "beforeData" /* beforeData */:
            case "data" /* data */:
                appendChild(this.currentElement(), comment);
                break;
            default:
                throw new SyntaxError(`Using a Handlebars comment when in the \`${tokenizer['state']}\` state is not supported: "${comment.value}" on line ${loc.start.line}:${loc.start.column}`, rawComment.loc);
        }
        return comment;
    }
    PartialStatement(partial) {
        let { loc } = partial;
        throw new SyntaxError(`Handlebars partials are not supported: "${this.sourceForNode(partial, partial.name)}" at L${loc.start.line}:C${loc.start.column}`, partial.loc);
    }
    PartialBlockStatement(partialBlock) {
        let { loc } = partialBlock;
        throw new SyntaxError(`Handlebars partial blocks are not supported: "${this.sourceForNode(partialBlock, partialBlock.name)}" at L${loc.start.line}:C${loc.start.column}`, partialBlock.loc);
    }
    Decorator(decorator) {
        let { loc } = decorator;
        throw new SyntaxError(`Handlebars decorators are not supported: "${this.sourceForNode(decorator, decorator.path)}" at L${loc.start.line}:C${loc.start.column}`, decorator.loc);
    }
    DecoratorBlock(decoratorBlock) {
        let { loc } = decoratorBlock;
        throw new SyntaxError(`Handlebars decorator blocks are not supported: "${this.sourceForNode(decoratorBlock, decoratorBlock.path)}" at L${loc.start.line}:C${loc.start.column}`, decoratorBlock.loc);
    }
    SubExpression(sexpr) {
        let { path, params, hash } = acceptCallNodes(this, sexpr);
        return b.sexpr(path, params, hash, sexpr.loc);
    }
    PathExpression(path) {
        let { original, loc } = path;
        let parts;
        if (original.indexOf('/') !== -1) {
            if (original.slice(0, 2) === './') {
                throw new SyntaxError(`Using "./" is not supported in Glimmer and unnecessary: "${path.original}" on line ${loc.start.line}.`, path.loc);
            }
            if (original.slice(0, 3) === '../') {
                throw new SyntaxError(`Changing context using "../" is not supported in Glimmer: "${path.original}" on line ${loc.start.line}.`, path.loc);
            }
            if (original.indexOf('.') !== -1) {
                throw new SyntaxError(`Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths: "${path.original}" on line ${loc.start.line}.`, path.loc);
            }
            parts = [path.parts.join('/')];
        } else if (original === '.') {
            let locationInfo = `L${loc.start.line}:C${loc.start.column}`;
            throw new SyntaxError(`'.' is not a supported path in Glimmer; check for a path with a trailing '.' at ${locationInfo}.`, path.loc);
        } else {
            parts = path.parts;
        }
        let thisHead = false;
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
            parts,
            data: path.data,
            loc: path.loc
        };
    }
    Hash(hash) {
        let pairs = [];
        for (let i = 0; i < hash.pairs.length; i++) {
            let pair = hash.pairs[i];
            pairs.push(b.pair(pair.key, this.acceptNode(pair.value), pair.loc));
        }
        return b.hash(pairs, hash.loc);
    }
    StringLiteral(string) {
        return b.literal('StringLiteral', string.value, string.loc);
    }
    BooleanLiteral(boolean) {
        return b.literal('BooleanLiteral', boolean.value, boolean.loc);
    }
    NumberLiteral(number) {
        return b.literal('NumberLiteral', number.value, number.loc);
    }
    UndefinedLiteral(undef) {
        return b.literal('UndefinedLiteral', undefined, undef.loc);
    }
    NullLiteral(nul) {
        return b.literal('NullLiteral', null, nul.loc);
    }
}
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
    let hash = node.hash ? compiler.Hash(node.hash) : b.hash();
    return { path, params, hash };
}
function addElementModifier(element, mustache) {
    let { path, params, hash, loc } = mustache;
    if (isLiteral(path)) {
        let modifier = `{{${printLiteral(path)}}}`;
        let tag = `<${element.name} ... ${modifier} ...`;
        throw new SyntaxError(`In ${tag}, ${modifier} is not a valid modifier: "${path.original}" on line ${loc && loc.start.line}.`, mustache.loc);
    }
    let modifier = b.elementModifier(path, params, hash, loc);
    element.modifiers.push(modifier);
}
function addInElementHash(cursor, hash, loc) {
    let hasInsertBefore = false;
    hash.pairs.forEach(pair => {
        if (pair.key === 'guid') {
            throw new SyntaxError('Cannot pass `guid` from user space', loc);
        }
        if (pair.key === 'insertBefore') {
            hasInsertBefore = true;
        }
    });
    let guid = b.literal('StringLiteral', cursor);
    let guidPair = b.pair('guid', guid);
    hash.pairs.unshift(guidPair);
    if (!hasInsertBefore) {
        let undefinedLiteral = b.literal('UndefinedLiteral', undefined);
        let beforeSibling = b.pair('insertBefore', undefinedLiteral);
        hash.pairs.push(beforeSibling);
    }
    return hash;
}
function appendDynamicAttributeValuePart(attribute, part) {
    attribute.isDynamic = true;
    attribute.parts.push(part);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL2hhbmRsZWJhcnMtbm9kZS12aXNpdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQVAsTUFBYyxhQUFkO0FBQ0EsU0FBUyxXQUFULEVBQXNCLFNBQXRCLEVBQWlDLFlBQWpDLFFBQXFELFVBQXJEO0FBR0EsU0FBUyxNQUFULFFBQXVDLFdBQXZDO0FBQ0EsT0FBTyxXQUFQLE1BQXdCLHdCQUF4QjtBQUtBLE9BQU0sTUFBZ0Isc0JBQWhCLFNBQStDLE1BQS9DLENBQXFEO0FBQTNELGtCQUFBOztBQUtFLGFBQUEsV0FBQSxHQUFjLENBQWQ7QUE4VkQ7QUE1VkMsYUFBTTtBQUNKLGVBQU8sV0FBVyxLQUFLLFdBQUwsRUFBa0IsR0FBcEM7QUFDRDtBQUVELFFBQVksVUFBWixHQUFzQjtBQUNwQixlQUFPLEtBQUssWUFBTCxDQUFrQixNQUFsQixLQUE2QixDQUFwQztBQUNEO0FBS0QsWUFBUSxPQUFSLEVBQTRCO0FBQzFCLFlBQUksT0FBd0IsRUFBNUI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsQ0FBbkI7QUFFQSxZQUFJLElBQUo7QUFFQSxZQUFJLEtBQUssVUFBVCxFQUFxQjtBQUNuQixtQkFBTyxFQUFFLFFBQUYsQ0FBVyxJQUFYLEVBQWlCLFFBQVEsV0FBekIsRUFBc0MsUUFBUSxHQUE5QyxDQUFQO0FBQ0QsU0FGRCxNQUVPO0FBQ0wsbUJBQU8sRUFBRSxXQUFGLENBQWMsSUFBZCxFQUFvQixRQUFRLFdBQTVCLEVBQXlDLFFBQVEsT0FBakQsRUFBMEQsUUFBUSxHQUFsRSxDQUFQO0FBQ0Q7QUFFRCxZQUFJLENBQUo7QUFBQSxZQUNFLElBQUksUUFBUSxJQUFSLENBQWEsTUFEbkI7QUFHQSxhQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkI7QUFFQSxZQUFJLE1BQU0sQ0FBVixFQUFhO0FBQ1gsbUJBQU8sS0FBSyxZQUFMLENBQWtCLEdBQWxCLEVBQVA7QUFDRDtBQUVELGFBQUssSUFBSSxDQUFULEVBQVksSUFBSSxDQUFoQixFQUFtQixHQUFuQixFQUF3QjtBQUN0QixpQkFBSyxVQUFMLENBQWdCLFFBQVEsSUFBUixDQUFhLENBQWIsQ0FBaEI7QUFDRDtBQUVEO0FBQ0EsWUFBSSxhQUFhLEtBQUssWUFBTCxDQUFrQixHQUFsQixFQUFqQjtBQUNBLFlBQUksZUFBZSxJQUFuQixFQUF5QjtBQUN2QixnQkFBSSxjQUFjLFVBQWxCO0FBRUEsa0JBQU0sSUFBSSxXQUFKLENBQ0osdUJBQXVCLFlBQVksR0FBbkMsR0FBeUMsYUFBekMsR0FBeUQsWUFBWSxHQUFaLENBQWlCLEtBQWpCLENBQXVCLElBQWhGLEdBQXVGLElBRG5GLEVBRUosWUFBWSxHQUZSLENBQU47QUFJRDtBQUVELGVBQU8sSUFBUDtBQUNEO0FBRUQsbUJBQWUsS0FBZixFQUF3QztBQUN0QyxZQUFJLEtBQUssU0FBTCxDQUFlLE9BQWYsTUFBNEIsU0FBaEMsRUFBMkM7QUFDekMsaUJBQUssbUJBQUwsQ0FBeUIsS0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXpCO0FBQ0E7QUFDRDtBQUVELFlBQ0UsS0FBSyxTQUFMLENBQWUsT0FBZixNQUE0QixTQUE1QixJQUNBLEtBQUssU0FBTCxDQUFlLE9BQWYsTUFBNEIsTUFENUIsSUFFQSxLQUFLLFNBQUwsQ0FBZSxPQUFmLE1BQTRCLFlBSDlCLEVBSUU7QUFDQSxrQkFBTSxJQUFJLFdBQUosQ0FDSixtRUFESSxFQUVKLE1BQU0sR0FGRixDQUFOO0FBSUQ7QUFFRCxZQUFJLEVBQUUsSUFBRixFQUFRLE1BQVIsRUFBZ0IsSUFBaEIsS0FBeUIsZ0JBQWdCLElBQWhCLEVBQXNCLEtBQXRCLENBQTdCO0FBQ0EsWUFBSSxVQUFVLEtBQUssT0FBTCxDQUFhLE1BQU0sT0FBbkIsQ0FBZDtBQUNBLFlBQUksVUFBVSxNQUFNLE9BQU4sR0FBZ0IsS0FBSyxPQUFMLENBQWEsTUFBTSxPQUFuQixDQUFoQixHQUE4QyxJQUE1RDtBQUVBLFlBQUksS0FBSyxRQUFMLEtBQWtCLFlBQXRCLEVBQW9DO0FBQ2xDLG1CQUFPLGlCQUFpQixLQUFLLE1BQUwsRUFBakIsRUFBZ0MsSUFBaEMsRUFBc0MsTUFBTSxHQUE1QyxDQUFQO0FBQ0Q7QUFFRCxZQUFJLE9BQU8sRUFBRSxLQUFGLENBQ1QsSUFEUyxFQUVULE1BRlMsRUFHVCxJQUhTLEVBSVQsT0FKUyxFQUtULE9BTFMsRUFNVCxNQUFNLEdBTkcsRUFPVCxNQUFNLFNBUEcsRUFRVCxNQUFNLFlBUkcsRUFTVCxNQUFNLFVBVEcsQ0FBWDtBQVlBLFlBQUksZ0JBQWdCLEtBQUssY0FBTCxFQUFwQjtBQUVBLG9CQUFZLGFBQVosRUFBMkIsSUFBM0I7QUFDRDtBQUVELHNCQUFrQixXQUFsQixFQUFvRDtBQUNsRCxZQUFJLEVBQUUsU0FBRixLQUFnQixJQUFwQjtBQUVBLFlBQUksVUFBVSxLQUFWLEtBQW9CLFNBQXhCLEVBQW1DO0FBQ2pDLGlCQUFLLG1CQUFMLENBQXlCLEtBQUssYUFBTCxDQUFtQixXQUFuQixDQUF6QjtBQUNBO0FBQ0Q7QUFFRCxZQUFJLFFBQUo7QUFDQSxZQUFJLEVBQUUsT0FBRixFQUFXLEdBQVgsRUFBZ0IsS0FBaEIsS0FBMEIsV0FBOUI7QUFFQSxZQUFJLFVBQVUsWUFBWSxJQUF0QixDQUFKLEVBQWlDO0FBQy9CLHVCQUFXO0FBQ1Qsc0JBQU0sbUJBREc7QUFFVCxzQkFBTSxLQUFLLFVBQUwsQ0FBNkIsWUFBWSxJQUF6QyxDQUZHO0FBR1Qsd0JBQVEsRUFIQztBQUlULHNCQUFNLEVBQUUsSUFBRixFQUpHO0FBS1QsdUJBTFM7QUFNVCxtQkFOUztBQU9UO0FBUFMsYUFBWDtBQVNELFNBVkQsTUFVTztBQUNMLGdCQUFJLEVBQUUsSUFBRixFQUFRLE1BQVIsRUFBZ0IsSUFBaEIsS0FBeUIsZ0JBQWdCLElBQWhCLEVBQXNCLFdBQXRCLENBQTdCO0FBR0EsdUJBQVcsRUFBRSxRQUFGLENBQVcsSUFBWCxFQUFpQixNQUFqQixFQUF5QixJQUF6QixFQUErQixDQUFDLE9BQWhDLEVBQXlDLEdBQXpDLEVBQThDLEtBQTlDLENBQVg7QUFDRDtBQUVELGdCQUFRLFVBQVUsS0FBbEI7QUFDRTtBQUNBLGlCQUFBLFNBQUEsQ0FBQSxhQUFBO0FBQ0EsaUJBQUEsU0FBQSxDQUFBLGFBQUE7QUFDRSxzQkFBTSxJQUFJLFdBQUosQ0FDSixrREFBa0QsS0FBSyxhQUFMLENBQ2hELFdBRGdELEVBRWhELFlBQVksSUFGb0MsQ0FHakQsVUFBVSxJQUFJLEtBQUosQ0FBVSxJQUFJLEtBQUssSUFBSSxLQUFKLENBQVUsTUFBTSxFQUoxQyxFQUtKLFNBQVMsR0FMTCxDQUFOO0FBUUYsaUJBQUEscUJBQUEsQ0FBQSx5QkFBQTtBQUNFLG1DQUFtQixLQUFLLGVBQXhCLEVBQXlDLFFBQXpDO0FBQ0E7QUFDRixpQkFBQSxlQUFBLENBQUEsbUJBQUE7QUFDQSxpQkFBQSxvQkFBQSxDQUFBLHdCQUFBO0FBQ0UscUJBQUssbUJBQUwsQ0FBeUIsS0FBekI7QUFDQSxxQkFBSyxvQkFBTDtBQUNBLG1DQUFtQixLQUFLLGVBQXhCLEVBQXlDLFFBQXpDO0FBQ0EsMEJBQVUsWUFBVixDQUFzQixxQkFBdEIsQ0FBc0IseUJBQXRCO0FBQ0E7QUFDRixpQkFBQSwyQkFBQSxDQUFBLCtCQUFBO0FBQ0UsbUNBQW1CLEtBQUssZUFBeEIsRUFBeUMsUUFBekM7QUFDQSwwQkFBVSxZQUFWLENBQXNCLHFCQUF0QixDQUFzQix5QkFBdEI7QUFDQTtBQUVGO0FBQ0EsaUJBQUEsc0JBQUEsQ0FBQSwwQkFBQTtBQUNFLHFCQUFLLG1CQUFMLENBQXlCLEtBQXpCO0FBQ0EsZ0RBQWdDLEtBQUssZ0JBQXJDLEVBQXdELFFBQXhEO0FBQ0EsMEJBQVUsWUFBVixDQUFzQix3QkFBdEIsQ0FBc0IsNEJBQXRCO0FBQ0E7QUFDRixpQkFBQSw0QkFBQSxDQUFBLGdDQUFBO0FBQ0EsaUJBQUEsNEJBQUEsQ0FBQSxnQ0FBQTtBQUNBLGlCQUFBLHdCQUFBLENBQUEsNEJBQUE7QUFDRSxnREFBZ0MsS0FBSyxnQkFBckMsRUFBd0QsUUFBeEQ7QUFDQTtBQUVGO0FBQ0E7QUFDQTtBQUNFLDRCQUFZLEtBQUssY0FBTCxFQUFaLEVBQW1DLFFBQW5DO0FBMUNKO0FBNkNBLGVBQU8sUUFBUDtBQUNEO0FBRUQscUJBQWlCLE9BQWpCLEVBQThDO0FBQzVDLGdDQUF3QixLQUFLLFNBQTdCLEVBQXdDLE9BQXhDO0FBRUEsYUFBSyxTQUFMLENBQWUsWUFBZixDQUE0QixRQUFRLEtBQXBDO0FBQ0EsYUFBSyxTQUFMLENBQWUsU0FBZjtBQUNEO0FBRUQscUJBQWlCLFVBQWpCLEVBQWlEO0FBQy9DLFlBQUksRUFBRSxTQUFGLEtBQWdCLElBQXBCO0FBRUEsWUFBSSxVQUFVLEtBQVYsS0FBZSxTQUFuQixDQUFtQixhQUFuQixFQUFnRDtBQUM5QyxxQkFBSyxtQkFBTCxDQUF5QixLQUFLLGFBQUwsQ0FBbUIsVUFBbkIsQ0FBekI7QUFDQSx1QkFBTyxJQUFQO0FBQ0Q7QUFFRCxZQUFJLEVBQUUsS0FBRixFQUFTLEdBQVQsS0FBaUIsVUFBckI7QUFDQSxZQUFJLFVBQVUsRUFBRSxlQUFGLENBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLENBQWQ7QUFFQSxnQkFBUSxVQUFVLEtBQWxCO0FBQ0UsaUJBQUEscUJBQUEsQ0FBQSx5QkFBQTtBQUNFLHFCQUFLLGVBQUwsQ0FBcUIsUUFBckIsQ0FBOEIsSUFBOUIsQ0FBbUMsT0FBbkM7QUFDQTtBQUVGLGlCQUFBLFlBQUEsQ0FBQSxnQkFBQTtBQUNBLGlCQUFBLE1BQUEsQ0FBQSxVQUFBO0FBQ0UsNEJBQVksS0FBSyxjQUFMLEVBQVosRUFBbUMsT0FBbkM7QUFDQTtBQUVGO0FBQ0Usc0JBQU0sSUFBSSxXQUFKLENBQ0osNENBQTRDLFVBQVUsT0FBVixDQUFrQiwrQkFBK0IsUUFBUSxLQUFLLGFBQWEsSUFBSSxLQUFKLENBQVUsSUFBSSxJQUFJLElBQUksS0FBSixDQUFVLE1BQU0sRUFEckosRUFFSixXQUFXLEdBRlAsQ0FBTjtBQVhKO0FBaUJBLGVBQU8sT0FBUDtBQUNEO0FBRUQscUJBQWlCLE9BQWpCLEVBQThDO0FBQzVDLFlBQUksRUFBRSxHQUFGLEtBQVUsT0FBZDtBQUVBLGNBQU0sSUFBSSxXQUFKLENBQ0osMkNBQTJDLEtBQUssYUFBTCxDQUFtQixPQUFuQixFQUE0QixRQUFRLElBQXBDLENBQXlDLFNBQ2xGLElBQUksS0FBSixDQUFVLElBQ1osS0FBSyxJQUFJLEtBQUosQ0FBVSxNQUFNLEVBSGpCLEVBSUosUUFBUSxHQUpKLENBQU47QUFNRDtBQUVELDBCQUFzQixZQUF0QixFQUE2RDtBQUMzRCxZQUFJLEVBQUUsR0FBRixLQUFVLFlBQWQ7QUFFQSxjQUFNLElBQUksV0FBSixDQUNKLGlEQUFpRCxLQUFLLGFBQUwsQ0FDL0MsWUFEK0MsRUFFL0MsYUFBYSxJQUZrQyxDQUdoRCxTQUFTLElBQUksS0FBSixDQUFVLElBQUksS0FBSyxJQUFJLEtBQUosQ0FBVSxNQUFNLEVBSnpDLEVBS0osYUFBYSxHQUxULENBQU47QUFPRDtBQUVELGNBQVUsU0FBVixFQUFrQztBQUNoQyxZQUFJLEVBQUUsR0FBRixLQUFVLFNBQWQ7QUFFQSxjQUFNLElBQUksV0FBSixDQUNKLDZDQUE2QyxLQUFLLGFBQUwsQ0FDM0MsU0FEMkMsRUFFM0MsVUFBVSxJQUZpQyxDQUc1QyxTQUFTLElBQUksS0FBSixDQUFVLElBQUksS0FBSyxJQUFJLEtBQUosQ0FBVSxNQUFNLEVBSnpDLEVBS0osVUFBVSxHQUxOLENBQU47QUFPRDtBQUVELG1CQUFlLGNBQWYsRUFBaUQ7QUFDL0MsWUFBSSxFQUFFLEdBQUYsS0FBVSxjQUFkO0FBRUEsY0FBTSxJQUFJLFdBQUosQ0FDSixtREFBbUQsS0FBSyxhQUFMLENBQ2pELGNBRGlELEVBRWpELGVBQWUsSUFGa0MsQ0FHbEQsU0FBUyxJQUFJLEtBQUosQ0FBVSxJQUFJLEtBQUssSUFBSSxLQUFKLENBQVUsTUFBTSxFQUp6QyxFQUtKLGVBQWUsR0FMWCxDQUFOO0FBT0Q7QUFFRCxrQkFBYyxLQUFkLEVBQXNDO0FBQ3BDLFlBQUksRUFBRSxJQUFGLEVBQVEsTUFBUixFQUFnQixJQUFoQixLQUF5QixnQkFBZ0IsSUFBaEIsRUFBc0IsS0FBdEIsQ0FBN0I7QUFDQSxlQUFPLEVBQUUsS0FBRixDQUFRLElBQVIsRUFBYyxNQUFkLEVBQXNCLElBQXRCLEVBQTRCLE1BQU0sR0FBbEMsQ0FBUDtBQUNEO0FBRUQsbUJBQWUsSUFBZixFQUF1QztBQUNyQyxZQUFJLEVBQUUsUUFBRixFQUFZLEdBQVosS0FBb0IsSUFBeEI7QUFDQSxZQUFJLEtBQUo7QUFFQSxZQUFJLFNBQVMsT0FBVCxDQUFpQixHQUFqQixNQUEwQixDQUFDLENBQS9CLEVBQWtDO0FBQ2hDLGdCQUFJLFNBQVMsS0FBVCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsTUFBeUIsSUFBN0IsRUFBbUM7QUFDakMsc0JBQU0sSUFBSSxXQUFKLENBQ0osNERBQTRELEtBQUssUUFBUSxhQUFhLElBQUksS0FBSixDQUFVLElBQUksR0FEaEcsRUFFSixLQUFLLEdBRkQsQ0FBTjtBQUlEO0FBQ0QsZ0JBQUksU0FBUyxLQUFULENBQWUsQ0FBZixFQUFrQixDQUFsQixNQUF5QixLQUE3QixFQUFvQztBQUNsQyxzQkFBTSxJQUFJLFdBQUosQ0FDSiw4REFBOEQsS0FBSyxRQUFRLGFBQWEsSUFBSSxLQUFKLENBQVUsSUFBSSxHQURsRyxFQUVKLEtBQUssR0FGRCxDQUFOO0FBSUQ7QUFDRCxnQkFBSSxTQUFTLE9BQVQsQ0FBaUIsR0FBakIsTUFBMEIsQ0FBQyxDQUEvQixFQUFrQztBQUNoQyxzQkFBTSxJQUFJLFdBQUosQ0FDSixzR0FBc0csS0FBSyxRQUFRLGFBQWEsSUFBSSxLQUFKLENBQVUsSUFBSSxHQUQxSSxFQUVKLEtBQUssR0FGRCxDQUFOO0FBSUQ7QUFDRCxvQkFBUSxDQUFDLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBRCxDQUFSO0FBQ0QsU0FwQkQsTUFvQk8sSUFBSSxhQUFhLEdBQWpCLEVBQXNCO0FBQzNCLGdCQUFJLGVBQWUsSUFBSSxJQUFJLEtBQUosQ0FBVSxJQUFJLEtBQUssSUFBSSxLQUFKLENBQVUsTUFBTSxFQUExRDtBQUNBLGtCQUFNLElBQUksV0FBSixDQUNKLG1GQUFtRixZQUFZLEdBRDNGLEVBRUosS0FBSyxHQUZELENBQU47QUFJRCxTQU5NLE1BTUE7QUFDTCxvQkFBUSxLQUFLLEtBQWI7QUFDRDtBQUVELFlBQUksV0FBVyxLQUFmO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJLFNBQVMsS0FBVCxDQUFlLGVBQWYsQ0FBSixFQUFxQztBQUNuQyx1QkFBVyxJQUFYO0FBQ0Q7QUFFRCxlQUFPO0FBQ0wsa0JBQU0sZ0JBREQ7QUFFTCxzQkFBVSxLQUFLLFFBRlY7QUFHTCxrQkFBTSxRQUhEO0FBSUwsaUJBSks7QUFLTCxrQkFBTSxLQUFLLElBTE47QUFNTCxpQkFBSyxLQUFLO0FBTkwsU0FBUDtBQVFEO0FBRUQsU0FBSyxJQUFMLEVBQW1CO0FBQ2pCLFlBQUksUUFBd0IsRUFBNUI7QUFFQSxhQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxLQUFMLENBQVcsTUFBL0IsRUFBdUMsR0FBdkMsRUFBNEM7QUFDMUMsZ0JBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVg7QUFDQSxrQkFBTSxJQUFOLENBQVcsRUFBRSxJQUFGLENBQU8sS0FBSyxHQUFaLEVBQWlCLEtBQUssVUFBTCxDQUFnQixLQUFLLEtBQXJCLENBQWpCLEVBQThDLEtBQUssR0FBbkQsQ0FBWDtBQUNEO0FBRUQsZUFBTyxFQUFFLElBQUYsQ0FBTyxLQUFQLEVBQWMsS0FBSyxHQUFuQixDQUFQO0FBQ0Q7QUFFRCxrQkFBYyxNQUFkLEVBQXVDO0FBQ3JDLGVBQU8sRUFBRSxPQUFGLENBQVUsZUFBVixFQUEyQixPQUFPLEtBQWxDLEVBQXlDLE9BQU8sR0FBaEQsQ0FBUDtBQUNEO0FBRUQsbUJBQWUsT0FBZixFQUEwQztBQUN4QyxlQUFPLEVBQUUsT0FBRixDQUFVLGdCQUFWLEVBQTRCLFFBQVEsS0FBcEMsRUFBMkMsUUFBUSxHQUFuRCxDQUFQO0FBQ0Q7QUFFRCxrQkFBYyxNQUFkLEVBQXVDO0FBQ3JDLGVBQU8sRUFBRSxPQUFGLENBQVUsZUFBVixFQUEyQixPQUFPLEtBQWxDLEVBQXlDLE9BQU8sR0FBaEQsQ0FBUDtBQUNEO0FBRUQscUJBQWlCLEtBQWpCLEVBQTRDO0FBQzFDLGVBQU8sRUFBRSxPQUFGLENBQVUsa0JBQVYsRUFBOEIsU0FBOUIsRUFBeUMsTUFBTSxHQUEvQyxDQUFQO0FBQ0Q7QUFFRCxnQkFBWSxHQUFaLEVBQWdDO0FBQzlCLGVBQU8sRUFBRSxPQUFGLENBQVUsYUFBVixFQUF5QixJQUF6QixFQUErQixJQUFJLEdBQW5DLENBQVA7QUFDRDtBQWxXd0Q7QUFxVzNELFNBQVMsNkJBQVQsQ0FBdUMsUUFBdkMsRUFBeUQsS0FBekQsRUFBc0U7QUFDcEUsUUFBSSxVQUFVLEVBQWQsRUFBa0I7QUFDaEI7QUFDQTtBQUNBLGVBQU87QUFDTCxtQkFBTyxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLEdBQThCLENBRGhDO0FBRUwscUJBQVM7QUFGSixTQUFQO0FBSUQ7QUFFRDtBQUNBO0FBQ0EsUUFBSSxhQUFhLFNBQVMsS0FBVCxDQUFlLEtBQWYsRUFBc0IsQ0FBdEIsQ0FBakI7QUFDQSxRQUFJLFFBQVEsV0FBVyxLQUFYLENBQWlCLElBQWpCLENBQVo7QUFDQSxRQUFJLFlBQVksTUFBTSxNQUFOLEdBQWUsQ0FBL0I7QUFFQSxXQUFPO0FBQ0wsZUFBTyxTQURGO0FBRUwsaUJBQVMsTUFBTSxTQUFOLEVBQWlCO0FBRnJCLEtBQVA7QUFJRDtBQUVELFNBQVMsdUJBQVQsQ0FBaUMsU0FBakMsRUFBaUUsT0FBakUsRUFBOEY7QUFDNUYsUUFBSSxPQUFPLFFBQVEsR0FBUixDQUFZLEtBQVosQ0FBa0IsSUFBN0I7QUFDQSxRQUFJLFNBQVMsUUFBUSxHQUFSLENBQVksS0FBWixDQUFrQixNQUEvQjtBQUVBLFFBQUksVUFBVSw4QkFDWixRQUFRLFFBREksRUFFWixRQUFRLEtBRkksQ0FBZDtBQUtBLFdBQU8sT0FBTyxRQUFRLEtBQXRCO0FBQ0EsUUFBSSxRQUFRLEtBQVosRUFBbUI7QUFDakIsaUJBQVMsUUFBUSxPQUFqQjtBQUNELEtBRkQsTUFFTztBQUNMLGlCQUFTLFNBQVMsUUFBUSxPQUExQjtBQUNEO0FBRUQsY0FBVSxJQUFWLEdBQWlCLElBQWpCO0FBQ0EsY0FBVSxNQUFWLEdBQW1CLE1BQW5CO0FBQ0Q7QUFFRCxTQUFTLGVBQVQsQ0FDRSxRQURGLEVBRUUsSUFGRixFQU1HO0FBRUQsUUFBSSxPQUFPLFNBQVMsY0FBVCxDQUF3QixLQUFLLElBQTdCLENBQVg7QUFFQSxRQUFJLFNBQVMsS0FBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixLQUFLLFNBQVMsVUFBVCxDQUFvQyxDQUFwQyxDQUFyQixDQUFkLEdBQTZFLEVBQTFGO0FBQ0EsUUFBSSxPQUFPLEtBQUssSUFBTCxHQUFZLFNBQVMsSUFBVCxDQUFjLEtBQUssSUFBbkIsQ0FBWixHQUF1QyxFQUFFLElBQUYsRUFBbEQ7QUFFQSxXQUFPLEVBQUUsSUFBRixFQUFRLE1BQVIsRUFBZ0IsSUFBaEIsRUFBUDtBQUNEO0FBRUQsU0FBUyxrQkFBVCxDQUE0QixPQUE1QixFQUFzRCxRQUF0RCxFQUFxRjtBQUNuRixRQUFJLEVBQUUsSUFBRixFQUFRLE1BQVIsRUFBZ0IsSUFBaEIsRUFBc0IsR0FBdEIsS0FBOEIsUUFBbEM7QUFFQSxRQUFJLFVBQVUsSUFBVixDQUFKLEVBQXFCO0FBQ25CLFlBQUksV0FBVyxLQUFLLGFBQWEsSUFBYixDQUFrQixJQUF0QztBQUNBLFlBQUksTUFBTSxJQUFJLFFBQVEsSUFBSSxRQUFRLFFBQVEsTUFBMUM7QUFFQSxjQUFNLElBQUksV0FBSixDQUNKLE1BQU0sR0FBRyxLQUFLLFFBQVEsOEJBQThCLEtBQUssUUFBUSxhQUFhLE9BQzVFLElBQUksS0FBSixDQUFVLElBQUksR0FGWixFQUdKLFNBQVMsR0FITCxDQUFOO0FBS0Q7QUFFRCxRQUFJLFdBQVcsRUFBRSxlQUFGLENBQWtCLElBQWxCLEVBQXdCLE1BQXhCLEVBQWdDLElBQWhDLEVBQXNDLEdBQXRDLENBQWY7QUFDQSxZQUFRLFNBQVIsQ0FBa0IsSUFBbEIsQ0FBdUIsUUFBdkI7QUFDRDtBQUVELFNBQVMsZ0JBQVQsQ0FBMEIsTUFBMUIsRUFBMEMsSUFBMUMsRUFBMEQsR0FBMUQsRUFBaUY7QUFDL0UsUUFBSSxrQkFBa0IsS0FBdEI7QUFDQSxTQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQU87QUFDeEIsWUFBSSxLQUFLLEdBQUwsS0FBYSxNQUFqQixFQUF5QjtBQUN2QixrQkFBTSxJQUFJLFdBQUosQ0FBZ0Isb0NBQWhCLEVBQXNELEdBQXRELENBQU47QUFDRDtBQUVELFlBQUksS0FBSyxHQUFMLEtBQWEsY0FBakIsRUFBaUM7QUFDL0IsOEJBQWtCLElBQWxCO0FBQ0Q7QUFDRixLQVJEO0FBVUEsUUFBSSxPQUFPLEVBQUUsT0FBRixDQUFVLGVBQVYsRUFBMkIsTUFBM0IsQ0FBWDtBQUNBLFFBQUksV0FBVyxFQUFFLElBQUYsQ0FBTyxNQUFQLEVBQWUsSUFBZixDQUFmO0FBQ0EsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQjtBQUVBLFFBQUksQ0FBQyxlQUFMLEVBQXNCO0FBQ3BCLFlBQUksbUJBQW1CLEVBQUUsT0FBRixDQUFVLGtCQUFWLEVBQThCLFNBQTlCLENBQXZCO0FBQ0EsWUFBSSxnQkFBZ0IsRUFBRSxJQUFGLENBQU8sY0FBUCxFQUF1QixnQkFBdkIsQ0FBcEI7QUFDQSxhQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLGFBQWhCO0FBQ0Q7QUFFRCxXQUFPLElBQVA7QUFDRDtBQUVELFNBQVMsK0JBQVQsQ0FBeUMsU0FBekMsRUFBK0QsSUFBL0QsRUFBMEY7QUFDeEYsY0FBVSxTQUFWLEdBQXNCLElBQXRCO0FBQ0EsY0FBVSxLQUFWLENBQWdCLElBQWhCLENBQXFCLElBQXJCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYiBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgeyBhcHBlbmRDaGlsZCwgaXNMaXRlcmFsLCBwcmludExpdGVyYWwgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgKiBhcyBBU1QgZnJvbSAnLi4vdHlwZXMvbm9kZXMnO1xuaW1wb3J0ICogYXMgSEJTIGZyb20gJy4uL3R5cGVzL2hhbmRsZWJhcnMtYXN0JztcbmltcG9ydCB7IFBhcnNlciwgVGFnLCBBdHRyaWJ1dGUgfSBmcm9tICcuLi9wYXJzZXInO1xuaW1wb3J0IFN5bnRheEVycm9yIGZyb20gJy4uL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgT3B0aW9uIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBSZWNhc3QgfSBmcm9tICdAZ2xpbW1lci9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFRva2VuaXplclN0YXRlIH0gZnJvbSAnc2ltcGxlLWh0bWwtdG9rZW5pemVyJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEhhbmRsZWJhcnNOb2RlVmlzaXRvcnMgZXh0ZW5kcyBQYXJzZXIge1xuICBhYnN0cmFjdCBhcHBlbmRUb0NvbW1lbnREYXRhKHM6IHN0cmluZyk6IHZvaWQ7XG4gIGFic3RyYWN0IGJlZ2luQXR0cmlidXRlVmFsdWUocXVvdGVkOiBib29sZWFuKTogdm9pZDtcbiAgYWJzdHJhY3QgZmluaXNoQXR0cmlidXRlVmFsdWUoKTogdm9pZDtcblxuICBjdXJzb3JDb3VudCA9IDA7XG5cbiAgY3Vyc29yKCkge1xuICAgIHJldHVybiBgJWN1cnNvcjoke3RoaXMuY3Vyc29yQ291bnQrK30lYDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGlzVG9wTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGU7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuVGVtcGxhdGUgfCBBU1QuQmxvY2s7XG4gIFByb2dyYW0ocHJvZ3JhbTogSEJTLlByb2dyYW0pOiBBU1QuQmxvY2sgfCBBU1QuVGVtcGxhdGUge1xuICAgIGxldCBib2R5OiBBU1QuU3RhdGVtZW50W10gPSBbXTtcbiAgICB0aGlzLmN1cnNvckNvdW50ID0gMDtcblxuICAgIGxldCBub2RlO1xuXG4gICAgaWYgKHRoaXMuaXNUb3BMZXZlbCkge1xuICAgICAgbm9kZSA9IGIudGVtcGxhdGUoYm9keSwgcHJvZ3JhbS5ibG9ja1BhcmFtcywgcHJvZ3JhbS5sb2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gYi5ibG9ja0l0c2VsZihib2R5LCBwcm9ncmFtLmJsb2NrUGFyYW1zLCBwcm9ncmFtLmNoYWluZWQsIHByb2dyYW0ubG9jKTtcbiAgICB9XG5cbiAgICBsZXQgaSxcbiAgICAgIGwgPSBwcm9ncmFtLmJvZHkubGVuZ3RoO1xuXG4gICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChub2RlKTtcblxuICAgIGlmIChsID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2sucG9wKCkgYXMgQVNULkJsb2NrIHwgQVNULlRlbXBsYXRlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuYWNjZXB0Tm9kZShwcm9ncmFtLmJvZHlbaV0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGF0IHRoYXQgdGhlIGVsZW1lbnQgc3RhY2sgaXMgYmFsYW5jZWQgcHJvcGVybHkuXG4gICAgbGV0IHBvcHBlZE5vZGUgPSB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICBpZiAocG9wcGVkTm9kZSAhPT0gbm9kZSkge1xuICAgICAgbGV0IGVsZW1lbnROb2RlID0gcG9wcGVkTm9kZSBhcyBBU1QuRWxlbWVudE5vZGU7XG5cbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgJ1VuY2xvc2VkIGVsZW1lbnQgYCcgKyBlbGVtZW50Tm9kZS50YWcgKyAnYCAob24gbGluZSAnICsgZWxlbWVudE5vZGUubG9jIS5zdGFydC5saW5lICsgJykuJyxcbiAgICAgICAgZWxlbWVudE5vZGUubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgQmxvY2tTdGF0ZW1lbnQoYmxvY2s6IEhCUy5CbG9ja1N0YXRlbWVudCk6IEFTVC5CbG9ja1N0YXRlbWVudCB8IHZvaWQge1xuICAgIGlmICh0aGlzLnRva2VuaXplclsnc3RhdGUnXSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKGJsb2NrKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdjb21tZW50JyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdkYXRhJyAmJlxuICAgICAgdGhpcy50b2tlbml6ZXJbJ3N0YXRlJ10gIT09ICdiZWZvcmVEYXRhJ1xuICAgICkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAnQSBibG9jayBtYXkgb25seSBiZSB1c2VkIGluc2lkZSBhbiBIVE1MIGVsZW1lbnQgb3IgYW5vdGhlciBibG9jay4nLFxuICAgICAgICBibG9jay5sb2NcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgYmxvY2spO1xuICAgIGxldCBwcm9ncmFtID0gdGhpcy5Qcm9ncmFtKGJsb2NrLnByb2dyYW0pO1xuICAgIGxldCBpbnZlcnNlID0gYmxvY2suaW52ZXJzZSA/IHRoaXMuUHJvZ3JhbShibG9jay5pbnZlcnNlKSA6IG51bGw7XG5cbiAgICBpZiAocGF0aC5vcmlnaW5hbCA9PT0gJ2luLWVsZW1lbnQnKSB7XG4gICAgICBoYXNoID0gYWRkSW5FbGVtZW50SGFzaCh0aGlzLmN1cnNvcigpLCBoYXNoLCBibG9jay5sb2MpO1xuICAgIH1cblxuICAgIGxldCBub2RlID0gYi5ibG9jayhcbiAgICAgIHBhdGgsXG4gICAgICBwYXJhbXMsXG4gICAgICBoYXNoLFxuICAgICAgcHJvZ3JhbSxcbiAgICAgIGludmVyc2UsXG4gICAgICBibG9jay5sb2MsXG4gICAgICBibG9jay5vcGVuU3RyaXAsXG4gICAgICBibG9jay5pbnZlcnNlU3RyaXAsXG4gICAgICBibG9jay5jbG9zZVN0cmlwXG4gICAgKTtcblxuICAgIGxldCBwYXJlbnRQcm9ncmFtID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgYXBwZW5kQ2hpbGQocGFyZW50UHJvZ3JhbSwgbm9kZSk7XG4gIH1cblxuICBNdXN0YWNoZVN0YXRlbWVudChyYXdNdXN0YWNoZTogSEJTLk11c3RhY2hlU3RhdGVtZW50KTogQVNULk11c3RhY2hlU3RhdGVtZW50IHwgdm9pZCB7XG4gICAgbGV0IHsgdG9rZW5pemVyIH0gPSB0aGlzO1xuXG4gICAgaWYgKHRva2VuaXplci5zdGF0ZSA9PT0gJ2NvbW1lbnQnKSB7XG4gICAgICB0aGlzLmFwcGVuZFRvQ29tbWVudERhdGEodGhpcy5zb3VyY2VGb3JOb2RlKHJhd011c3RhY2hlKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQ7XG4gICAgbGV0IHsgZXNjYXBlZCwgbG9jLCBzdHJpcCB9ID0gcmF3TXVzdGFjaGU7XG5cbiAgICBpZiAoaXNMaXRlcmFsKHJhd011c3RhY2hlLnBhdGgpKSB7XG4gICAgICBtdXN0YWNoZSA9IHtcbiAgICAgICAgdHlwZTogJ011c3RhY2hlU3RhdGVtZW50JyxcbiAgICAgICAgcGF0aDogdGhpcy5hY2NlcHROb2RlPEFTVC5MaXRlcmFsPihyYXdNdXN0YWNoZS5wYXRoKSxcbiAgICAgICAgcGFyYW1zOiBbXSxcbiAgICAgICAgaGFzaDogYi5oYXNoKCksXG4gICAgICAgIGVzY2FwZWQsXG4gICAgICAgIGxvYyxcbiAgICAgICAgc3RyaXAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgeyBwYXRoLCBwYXJhbXMsIGhhc2ggfSA9IGFjY2VwdENhbGxOb2Rlcyh0aGlzLCByYXdNdXN0YWNoZSBhcyBIQlMuTXVzdGFjaGVTdGF0ZW1lbnQgJiB7XG4gICAgICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICAgIH0pO1xuICAgICAgbXVzdGFjaGUgPSBiLm11c3RhY2hlKHBhdGgsIHBhcmFtcywgaGFzaCwgIWVzY2FwZWQsIGxvYywgc3RyaXApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodG9rZW5pemVyLnN0YXRlKSB7XG4gICAgICAvLyBUYWcgaGVscGVyc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdPcGVuOlxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS50YWdOYW1lOlxuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYENhbm5vdCB1c2UgbXVzdGFjaGVzIGluIGFuIGVsZW1lbnRzIHRhZ25hbWU6IFxcYCR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICAgICAgcmF3TXVzdGFjaGUsXG4gICAgICAgICAgICByYXdNdXN0YWNoZS5wYXRoXG4gICAgICAgICAgKX1cXGAgYXQgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YCxcbiAgICAgICAgICBtdXN0YWNoZS5sb2NcbiAgICAgICAgKTtcblxuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lOlxuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZU5hbWU6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5maW5pc2hBdHRyaWJ1dGVWYWx1ZSgpO1xuICAgICAgICBhZGRFbGVtZW50TW9kaWZpZXIodGhpcy5jdXJyZW50U3RhcnRUYWcsIG11c3RhY2hlKTtcbiAgICAgICAgdG9rZW5pemVyLnRyYW5zaXRpb25UbyhUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmFmdGVyQXR0cmlidXRlVmFsdWVRdW90ZWQ6XG4gICAgICAgIGFkZEVsZW1lbnRNb2RpZmllcih0aGlzLmN1cnJlbnRTdGFydFRhZywgbXVzdGFjaGUpO1xuICAgICAgICB0b2tlbml6ZXIudHJhbnNpdGlvblRvKFRva2VuaXplclN0YXRlLmJlZm9yZUF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gQXR0cmlidXRlIHZhbHVlc1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5iZWZvcmVBdHRyaWJ1dGVWYWx1ZTpcbiAgICAgICAgdGhpcy5iZWdpbkF0dHJpYnV0ZVZhbHVlKGZhbHNlKTtcbiAgICAgICAgYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydCh0aGlzLmN1cnJlbnRBdHRyaWJ1dGUhLCBtdXN0YWNoZSk7XG4gICAgICAgIHRva2VuaXplci50cmFuc2l0aW9uVG8oVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVVbnF1b3RlZCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBUb2tlbml6ZXJTdGF0ZS5hdHRyaWJ1dGVWYWx1ZURvdWJsZVF1b3RlZDpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYXR0cmlidXRlVmFsdWVTaW5nbGVRdW90ZWQ6XG4gICAgICBjYXNlIFRva2VuaXplclN0YXRlLmF0dHJpYnV0ZVZhbHVlVW5xdW90ZWQ6XG4gICAgICAgIGFwcGVuZER5bmFtaWNBdHRyaWJ1dGVWYWx1ZVBhcnQodGhpcy5jdXJyZW50QXR0cmlidXRlISwgbXVzdGFjaGUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgLy8gVE9ETzogT25seSBhcHBlbmQgY2hpbGQgd2hlbiB0aGUgdG9rZW5pemVyIHN0YXRlIG1ha2VzXG4gICAgICAvLyBzZW5zZSB0byBkbyBzbywgb3RoZXJ3aXNlIHRocm93IGFuIGVycm9yLlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBtdXN0YWNoZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG11c3RhY2hlO1xuICB9XG5cbiAgQ29udGVudFN0YXRlbWVudChjb250ZW50OiBIQlMuQ29udGVudFN0YXRlbWVudCk6IHZvaWQge1xuICAgIHVwZGF0ZVRva2VuaXplckxvY2F0aW9uKHRoaXMudG9rZW5pemVyLCBjb250ZW50KTtcblxuICAgIHRoaXMudG9rZW5pemVyLnRva2VuaXplUGFydChjb250ZW50LnZhbHVlKTtcbiAgICB0aGlzLnRva2VuaXplci5mbHVzaERhdGEoKTtcbiAgfVxuXG4gIENvbW1lbnRTdGF0ZW1lbnQocmF3Q29tbWVudDogSEJTLkNvbW1lbnRTdGF0ZW1lbnQpOiBPcHRpb248QVNULk11c3RhY2hlQ29tbWVudFN0YXRlbWVudD4ge1xuICAgIGxldCB7IHRva2VuaXplciB9ID0gdGhpcztcblxuICAgIGlmICh0b2tlbml6ZXIuc3RhdGUgPT09IFRva2VuaXplclN0YXRlLmNvbW1lbnQpIHtcbiAgICAgIHRoaXMuYXBwZW5kVG9Db21tZW50RGF0YSh0aGlzLnNvdXJjZUZvck5vZGUocmF3Q29tbWVudCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHsgdmFsdWUsIGxvYyB9ID0gcmF3Q29tbWVudDtcbiAgICBsZXQgY29tbWVudCA9IGIubXVzdGFjaGVDb21tZW50KHZhbHVlLCBsb2MpO1xuXG4gICAgc3dpdGNoICh0b2tlbml6ZXIuc3RhdGUpIHtcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlQXR0cmlidXRlTmFtZTpcbiAgICAgICAgdGhpcy5jdXJyZW50U3RhcnRUYWcuY29tbWVudHMucHVzaChjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuYmVmb3JlRGF0YTpcbiAgICAgIGNhc2UgVG9rZW5pemVyU3RhdGUuZGF0YTpcbiAgICAgICAgYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50RWxlbWVudCgpLCBjb21tZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgVXNpbmcgYSBIYW5kbGViYXJzIGNvbW1lbnQgd2hlbiBpbiB0aGUgXFxgJHt0b2tlbml6ZXJbJ3N0YXRlJ119XFxgIHN0YXRlIGlzIG5vdCBzdXBwb3J0ZWQ6IFwiJHtjb21tZW50LnZhbHVlfVwiIG9uIGxpbmUgJHtsb2Muc3RhcnQubGluZX06JHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICAgICAgcmF3Q29tbWVudC5sb2NcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29tbWVudDtcbiAgfVxuXG4gIFBhcnRpYWxTdGF0ZW1lbnQocGFydGlhbDogSEJTLlBhcnRpYWxTdGF0ZW1lbnQpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBwYXJ0aWFsO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEhhbmRsZWJhcnMgcGFydGlhbHMgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUocGFydGlhbCwgcGFydGlhbC5uYW1lKX1cIiBhdCBMJHtcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmVcbiAgICAgIH06QyR7bG9jLnN0YXJ0LmNvbHVtbn1gLFxuICAgICAgcGFydGlhbC5sb2NcbiAgICApO1xuICB9XG5cbiAgUGFydGlhbEJsb2NrU3RhdGVtZW50KHBhcnRpYWxCbG9jazogSEJTLlBhcnRpYWxCbG9ja1N0YXRlbWVudCk6IG5ldmVyIHtcbiAgICBsZXQgeyBsb2MgfSA9IHBhcnRpYWxCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIHBhcnRpYWwgYmxvY2tzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBwYXJ0aWFsQmxvY2ssXG4gICAgICAgIHBhcnRpYWxCbG9jay5uYW1lXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBwYXJ0aWFsQmxvY2subG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvcihkZWNvcmF0b3I6IEhCUy5EZWNvcmF0b3IpOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3I7XG5cbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICBgSGFuZGxlYmFycyBkZWNvcmF0b3JzIGFyZSBub3Qgc3VwcG9ydGVkOiBcIiR7dGhpcy5zb3VyY2VGb3JOb2RlKFxuICAgICAgICBkZWNvcmF0b3IsXG4gICAgICAgIGRlY29yYXRvci5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3IubG9jXG4gICAgKTtcbiAgfVxuXG4gIERlY29yYXRvckJsb2NrKGRlY29yYXRvckJsb2NrOiBIQlMuRGVjb3JhdG9yQmxvY2spOiBuZXZlciB7XG4gICAgbGV0IHsgbG9jIH0gPSBkZWNvcmF0b3JCbG9jaztcblxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgIGBIYW5kbGViYXJzIGRlY29yYXRvciBibG9ja3MgYXJlIG5vdCBzdXBwb3J0ZWQ6IFwiJHt0aGlzLnNvdXJjZUZvck5vZGUoXG4gICAgICAgIGRlY29yYXRvckJsb2NrLFxuICAgICAgICBkZWNvcmF0b3JCbG9jay5wYXRoXG4gICAgICApfVwiIGF0IEwke2xvYy5zdGFydC5saW5lfTpDJHtsb2Muc3RhcnQuY29sdW1ufWAsXG4gICAgICBkZWNvcmF0b3JCbG9jay5sb2NcbiAgICApO1xuICB9XG5cbiAgU3ViRXhwcmVzc2lvbihzZXhwcjogSEJTLlN1YkV4cHJlc3Npb24pOiBBU1QuU3ViRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoIH0gPSBhY2NlcHRDYWxsTm9kZXModGhpcywgc2V4cHIpO1xuICAgIHJldHVybiBiLnNleHByKHBhdGgsIHBhcmFtcywgaGFzaCwgc2V4cHIubG9jKTtcbiAgfVxuXG4gIFBhdGhFeHByZXNzaW9uKHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbik6IEFTVC5QYXRoRXhwcmVzc2lvbiB7XG4gICAgbGV0IHsgb3JpZ2luYWwsIGxvYyB9ID0gcGF0aDtcbiAgICBsZXQgcGFydHM6IHN0cmluZ1tdO1xuXG4gICAgaWYgKG9yaWdpbmFsLmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAyKSA9PT0gJy4vJykge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICAgYFVzaW5nIFwiLi9cIiBpcyBub3Qgc3VwcG9ydGVkIGluIEdsaW1tZXIgYW5kIHVubmVjZXNzYXJ5OiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5zbGljZSgwLCAzKSA9PT0gJy4uLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBDaGFuZ2luZyBjb250ZXh0IHVzaW5nIFwiLi4vXCIgaXMgbm90IHN1cHBvcnRlZCBpbiBHbGltbWVyOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcmlnaW5hbC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgICBgTWl4aW5nICcuJyBhbmQgJy8nIGluIHBhdGhzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gR2xpbW1lcjsgdXNlIG9ubHkgJy4nIHRvIHNlcGFyYXRlIHByb3BlcnR5IHBhdGhzOiBcIiR7cGF0aC5vcmlnaW5hbH1cIiBvbiBsaW5lICR7bG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICAgICAgcGF0aC5sb2NcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHBhcnRzID0gW3BhdGgucGFydHMuam9pbignLycpXTtcbiAgICB9IGVsc2UgaWYgKG9yaWdpbmFsID09PSAnLicpIHtcbiAgICAgIGxldCBsb2NhdGlvbkluZm8gPSBgTCR7bG9jLnN0YXJ0LmxpbmV9OkMke2xvYy5zdGFydC5jb2x1bW59YDtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgYCcuJyBpcyBub3QgYSBzdXBwb3J0ZWQgcGF0aCBpbiBHbGltbWVyOyBjaGVjayBmb3IgYSBwYXRoIHdpdGggYSB0cmFpbGluZyAnLicgYXQgJHtsb2NhdGlvbkluZm99LmAsXG4gICAgICAgIHBhdGgubG9jXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cyA9IHBhdGgucGFydHM7XG4gICAgfVxuXG4gICAgbGV0IHRoaXNIZWFkID0gZmFsc2U7XG5cbiAgICAvLyBUaGlzIGlzIHRvIGZpeCBhIGJ1ZyBpbiB0aGUgSGFuZGxlYmFycyBBU1Qgd2hlcmUgdGhlIHBhdGggZXhwcmVzc2lvbnMgaW5cbiAgICAvLyBge3t0aGlzLmZvb319YCAoYW5kIHNpbWlsYXJseSBge3tmb28tYmFyIHRoaXMuZm9vIG5hbWVkPXRoaXMuZm9vfX1gIGV0YylcbiAgICAvLyBhcmUgc2ltcGx5IHR1cm5lZCBpbnRvIGB7e2Zvb319YC4gVGhlIGZpeCBpcyB0byBwdXNoIGl0IGJhY2sgb250byB0aGVcbiAgICAvLyBwYXJ0cyBhcnJheSBhbmQgbGV0IHRoZSBydW50aW1lIHNlZSB0aGUgZGlmZmVyZW5jZS4gSG93ZXZlciwgd2UgY2Fubm90XG4gICAgLy8gc2ltcGx5IHVzZSB0aGUgc3RyaW5nIGB0aGlzYCBhcyBpdCBtZWFucyBsaXRlcmFsbHkgdGhlIHByb3BlcnR5IGNhbGxlZFxuICAgIC8vIFwidGhpc1wiIGluIHRoZSBjdXJyZW50IGNvbnRleHQgKGl0IGNhbiBiZSBleHByZXNzZWQgaW4gdGhlIHN5bnRheCBhc1xuICAgIC8vIGB7e1t0aGlzXX19YCwgd2hlcmUgdGhlIHNxdWFyZSBicmFja2V0IGFyZSBnZW5lcmFsbHkgZm9yIHRoaXMga2luZCBvZlxuICAgIC8vIGVzY2FwaW5nIOKAkyBzdWNoIGFzIGB7e2Zvby5bXCJiYXIuYmF6XCJdfX1gIHdvdWxkIG1lYW4gbG9va3VwIGEgcHJvcGVydHlcbiAgICAvLyBuYW1lZCBsaXRlcmFsbHkgXCJiYXIuYmF6XCIgb24gYHRoaXMuZm9vYCkuIEJ5IGNvbnZlbnRpb24sIHdlIHVzZSBgbnVsbGBcbiAgICAvLyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgIGlmIChvcmlnaW5hbC5tYXRjaCgvXnRoaXMoXFwuLispPyQvKSkge1xuICAgICAgdGhpc0hlYWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnUGF0aEV4cHJlc3Npb24nLFxuICAgICAgb3JpZ2luYWw6IHBhdGgub3JpZ2luYWwsXG4gICAgICB0aGlzOiB0aGlzSGVhZCxcbiAgICAgIHBhcnRzLFxuICAgICAgZGF0YTogcGF0aC5kYXRhLFxuICAgICAgbG9jOiBwYXRoLmxvYyxcbiAgICB9O1xuICB9XG5cbiAgSGFzaChoYXNoOiBIQlMuSGFzaCk6IEFTVC5IYXNoIHtcbiAgICBsZXQgcGFpcnM6IEFTVC5IYXNoUGFpcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhhc2gucGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBwYWlyID0gaGFzaC5wYWlyc1tpXTtcbiAgICAgIHBhaXJzLnB1c2goYi5wYWlyKHBhaXIua2V5LCB0aGlzLmFjY2VwdE5vZGUocGFpci52YWx1ZSksIHBhaXIubG9jKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGIuaGFzaChwYWlycywgaGFzaC5sb2MpO1xuICB9XG5cbiAgU3RyaW5nTGl0ZXJhbChzdHJpbmc6IEhCUy5TdHJpbmdMaXRlcmFsKTogQVNULlN0cmluZ0xpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1N0cmluZ0xpdGVyYWwnLCBzdHJpbmcudmFsdWUsIHN0cmluZy5sb2MpO1xuICB9XG5cbiAgQm9vbGVhbkxpdGVyYWwoYm9vbGVhbjogSEJTLkJvb2xlYW5MaXRlcmFsKTogQVNULkJvb2xlYW5MaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdCb29sZWFuTGl0ZXJhbCcsIGJvb2xlYW4udmFsdWUsIGJvb2xlYW4ubG9jKTtcbiAgfVxuXG4gIE51bWJlckxpdGVyYWwobnVtYmVyOiBIQlMuTnVtYmVyTGl0ZXJhbCk6IEFTVC5OdW1iZXJMaXRlcmFsIHtcbiAgICByZXR1cm4gYi5saXRlcmFsKCdOdW1iZXJMaXRlcmFsJywgbnVtYmVyLnZhbHVlLCBudW1iZXIubG9jKTtcbiAgfVxuXG4gIFVuZGVmaW5lZExpdGVyYWwodW5kZWY6IEhCUy5VbmRlZmluZWRMaXRlcmFsKTogQVNULlVuZGVmaW5lZExpdGVyYWwge1xuICAgIHJldHVybiBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQsIHVuZGVmLmxvYyk7XG4gIH1cblxuICBOdWxsTGl0ZXJhbChudWw6IEhCUy5OdWxsTGl0ZXJhbCk6IEFTVC5OdWxsTGl0ZXJhbCB7XG4gICAgcmV0dXJuIGIubGl0ZXJhbCgnTnVsbExpdGVyYWwnLCBudWxsLCBudWwubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVSaWdodFN0cmlwcGVkT2Zmc2V0cyhvcmlnaW5hbDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGlmICh2YWx1ZSA9PT0gJycpIHtcbiAgICAvLyBpZiBpdCBpcyBlbXB0eSwganVzdCByZXR1cm4gdGhlIGNvdW50IG9mIG5ld2xpbmVzXG4gICAgLy8gaW4gb3JpZ2luYWxcbiAgICByZXR1cm4ge1xuICAgICAgbGluZXM6IG9yaWdpbmFsLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxLFxuICAgICAgY29sdW1uczogMCxcbiAgICB9O1xuICB9XG5cbiAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBuZXdsaW5lcyBwcmlvciB0b1xuICAvLyBgdmFsdWVgXG4gIGxldCBkaWZmZXJlbmNlID0gb3JpZ2luYWwuc3BsaXQodmFsdWUpWzBdO1xuICBsZXQgbGluZXMgPSBkaWZmZXJlbmNlLnNwbGl0KC9cXG4vKTtcbiAgbGV0IGxpbmVDb3VudCA9IGxpbmVzLmxlbmd0aCAtIDE7XG5cbiAgcmV0dXJuIHtcbiAgICBsaW5lczogbGluZUNvdW50LFxuICAgIGNvbHVtbnM6IGxpbmVzW2xpbmVDb3VudF0ubGVuZ3RoLFxuICB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUb2tlbml6ZXJMb2NhdGlvbih0b2tlbml6ZXI6IFBhcnNlclsndG9rZW5pemVyJ10sIGNvbnRlbnQ6IEhCUy5Db250ZW50U3RhdGVtZW50KSB7XG4gIGxldCBsaW5lID0gY29udGVudC5sb2Muc3RhcnQubGluZTtcbiAgbGV0IGNvbHVtbiA9IGNvbnRlbnQubG9jLnN0YXJ0LmNvbHVtbjtcblxuICBsZXQgb2Zmc2V0cyA9IGNhbGN1bGF0ZVJpZ2h0U3RyaXBwZWRPZmZzZXRzKFxuICAgIGNvbnRlbnQub3JpZ2luYWwgYXMgUmVjYXN0PEhCUy5TdHJpcEZsYWdzLCBzdHJpbmc+LFxuICAgIGNvbnRlbnQudmFsdWVcbiAgKTtcblxuICBsaW5lID0gbGluZSArIG9mZnNldHMubGluZXM7XG4gIGlmIChvZmZzZXRzLmxpbmVzKSB7XG4gICAgY29sdW1uID0gb2Zmc2V0cy5jb2x1bW5zO1xuICB9IGVsc2Uge1xuICAgIGNvbHVtbiA9IGNvbHVtbiArIG9mZnNldHMuY29sdW1ucztcbiAgfVxuXG4gIHRva2VuaXplci5saW5lID0gbGluZTtcbiAgdG9rZW5pemVyLmNvbHVtbiA9IGNvbHVtbjtcbn1cblxuZnVuY3Rpb24gYWNjZXB0Q2FsbE5vZGVzKFxuICBjb21waWxlcjogSGFuZGxlYmFyc05vZGVWaXNpdG9ycyxcbiAgbm9kZToge1xuICAgIHBhdGg6IEhCUy5QYXRoRXhwcmVzc2lvbjtcbiAgICBwYXJhbXM6IEhCUy5FeHByZXNzaW9uW107XG4gICAgaGFzaDogSEJTLkhhc2g7XG4gIH1cbik6IHsgcGF0aDogQVNULlBhdGhFeHByZXNzaW9uOyBwYXJhbXM6IEFTVC5FeHByZXNzaW9uW107IGhhc2g6IEFTVC5IYXNoIH0ge1xuICBsZXQgcGF0aCA9IGNvbXBpbGVyLlBhdGhFeHByZXNzaW9uKG5vZGUucGF0aCk7XG5cbiAgbGV0IHBhcmFtcyA9IG5vZGUucGFyYW1zID8gbm9kZS5wYXJhbXMubWFwKGUgPT4gY29tcGlsZXIuYWNjZXB0Tm9kZTxBU1QuRXhwcmVzc2lvbj4oZSkpIDogW107XG4gIGxldCBoYXNoID0gbm9kZS5oYXNoID8gY29tcGlsZXIuSGFzaChub2RlLmhhc2gpIDogYi5oYXNoKCk7XG5cbiAgcmV0dXJuIHsgcGF0aCwgcGFyYW1zLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRNb2RpZmllcihlbGVtZW50OiBUYWc8J1N0YXJ0VGFnJz4sIG11c3RhY2hlOiBBU1QuTXVzdGFjaGVTdGF0ZW1lbnQpIHtcbiAgbGV0IHsgcGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MgfSA9IG11c3RhY2hlO1xuXG4gIGlmIChpc0xpdGVyYWwocGF0aCkpIHtcbiAgICBsZXQgbW9kaWZpZXIgPSBge3ske3ByaW50TGl0ZXJhbChwYXRoKX19fWA7XG4gICAgbGV0IHRhZyA9IGA8JHtlbGVtZW50Lm5hbWV9IC4uLiAke21vZGlmaWVyfSAuLi5gO1xuXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYEluICR7dGFnfSwgJHttb2RpZmllcn0gaXMgbm90IGEgdmFsaWQgbW9kaWZpZXI6IFwiJHtwYXRoLm9yaWdpbmFsfVwiIG9uIGxpbmUgJHtsb2MgJiZcbiAgICAgICAgbG9jLnN0YXJ0LmxpbmV9LmAsXG4gICAgICBtdXN0YWNoZS5sb2NcbiAgICApO1xuICB9XG5cbiAgbGV0IG1vZGlmaWVyID0gYi5lbGVtZW50TW9kaWZpZXIocGF0aCwgcGFyYW1zLCBoYXNoLCBsb2MpO1xuICBlbGVtZW50Lm1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gYWRkSW5FbGVtZW50SGFzaChjdXJzb3I6IHN0cmluZywgaGFzaDogQVNULkhhc2gsIGxvYzogQVNULlNvdXJjZUxvY2F0aW9uKSB7XG4gIGxldCBoYXNJbnNlcnRCZWZvcmUgPSBmYWxzZTtcbiAgaGFzaC5wYWlycy5mb3JFYWNoKHBhaXIgPT4ge1xuICAgIGlmIChwYWlyLmtleSA9PT0gJ2d1aWQnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0Nhbm5vdCBwYXNzIGBndWlkYCBmcm9tIHVzZXIgc3BhY2UnLCBsb2MpO1xuICAgIH1cblxuICAgIGlmIChwYWlyLmtleSA9PT0gJ2luc2VydEJlZm9yZScpIHtcbiAgICAgIGhhc0luc2VydEJlZm9yZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBsZXQgZ3VpZCA9IGIubGl0ZXJhbCgnU3RyaW5nTGl0ZXJhbCcsIGN1cnNvcik7XG4gIGxldCBndWlkUGFpciA9IGIucGFpcignZ3VpZCcsIGd1aWQpO1xuICBoYXNoLnBhaXJzLnVuc2hpZnQoZ3VpZFBhaXIpO1xuXG4gIGlmICghaGFzSW5zZXJ0QmVmb3JlKSB7XG4gICAgbGV0IHVuZGVmaW5lZExpdGVyYWwgPSBiLmxpdGVyYWwoJ1VuZGVmaW5lZExpdGVyYWwnLCB1bmRlZmluZWQpO1xuICAgIGxldCBiZWZvcmVTaWJsaW5nID0gYi5wYWlyKCdpbnNlcnRCZWZvcmUnLCB1bmRlZmluZWRMaXRlcmFsKTtcbiAgICBoYXNoLnBhaXJzLnB1c2goYmVmb3JlU2libGluZyk7XG4gIH1cblxuICByZXR1cm4gaGFzaDtcbn1cblxuZnVuY3Rpb24gYXBwZW5kRHluYW1pY0F0dHJpYnV0ZVZhbHVlUGFydChhdHRyaWJ1dGU6IEF0dHJpYnV0ZSwgcGFydDogQVNULk11c3RhY2hlU3RhdGVtZW50KSB7XG4gIGF0dHJpYnV0ZS5pc0R5bmFtaWMgPSB0cnVlO1xuICBhdHRyaWJ1dGUucGFydHMucHVzaChwYXJ0KTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=