import b, { SYNTHETIC } from '../builders';
import { appendChild, parseElementBlockParams } from '../utils';
import { HandlebarsNodeVisitors } from './handlebars-node-visitors';
import SyntaxError from '../errors/syntax-error';
import builders from '../builders';
import traverse from '../traversal/traverse';
import print from '../generation/print';
import Walker from '../traversal/walker';
import * as handlebars from 'handlebars';
import { assign } from '@glimmer/util';
import { EntityParser } from 'simple-html-tokenizer';
export const voidMap = Object.create(null);
let voidTagNames = 'area base br col command embed hr img input keygen link meta param source track wbr';
voidTagNames.split(' ').forEach(tagName => {
    voidMap[tagName] = true;
});
export class TokenizerEventHandlers extends HandlebarsNodeVisitors {
    constructor() {
        super(...arguments);
        this.tagOpenLine = 0;
        this.tagOpenColumn = 0;
    }
    reset() {
        this.currentNode = null;
    }
    // Comment
    beginComment() {
        this.currentNode = b.comment('');
        this.currentNode.loc = {
            source: null,
            start: b.pos(this.tagOpenLine, this.tagOpenColumn),
            end: null
        };
    }
    appendToCommentData(char) {
        this.currentComment.value += char;
    }
    finishComment() {
        this.currentComment.loc.end = b.pos(this.tokenizer.line, this.tokenizer.column);
        appendChild(this.currentElement(), this.currentComment);
    }
    // Data
    beginData() {
        this.currentNode = b.text();
        this.currentNode.loc = {
            source: null,
            start: b.pos(this.tokenizer.line, this.tokenizer.column),
            end: null
        };
    }
    appendToData(char) {
        this.currentData.chars += char;
    }
    finishData() {
        this.currentData.loc.end = b.pos(this.tokenizer.line, this.tokenizer.column);
        appendChild(this.currentElement(), this.currentData);
    }
    // Tags - basic
    tagOpen() {
        this.tagOpenLine = this.tokenizer.line;
        this.tagOpenColumn = this.tokenizer.column;
    }
    beginStartTag() {
        this.currentNode = {
            type: 'StartTag',
            name: '',
            attributes: [],
            modifiers: [],
            comments: [],
            selfClosing: false,
            loc: SYNTHETIC
        };
    }
    beginEndTag() {
        this.currentNode = {
            type: 'EndTag',
            name: '',
            attributes: [],
            modifiers: [],
            comments: [],
            selfClosing: false,
            loc: SYNTHETIC
        };
    }
    finishTag() {
        let { line, column } = this.tokenizer;
        let tag = this.currentTag;
        tag.loc = b.loc(this.tagOpenLine, this.tagOpenColumn, line, column);
        if (tag.type === 'StartTag') {
            this.finishStartTag();
            if (voidMap[tag.name] || tag.selfClosing) {
                this.finishEndTag(true);
            }
        } else if (tag.type === 'EndTag') {
            this.finishEndTag(false);
        }
    }
    finishStartTag() {
        let { name, attributes: attrs, modifiers, comments, selfClosing } = this.currentStartTag;
        let loc = b.loc(this.tagOpenLine, this.tagOpenColumn);
        let element = b.element({ name, selfClosing }, { attrs, modifiers, comments, loc });
        this.elementStack.push(element);
    }
    finishEndTag(isVoid) {
        let tag = this.currentTag;
        let element = this.elementStack.pop();
        let parent = this.currentElement();
        validateEndTag(tag, element, isVoid);
        element.loc.end.line = this.tokenizer.line;
        element.loc.end.column = this.tokenizer.column;
        parseElementBlockParams(element);
        appendChild(parent, element);
    }
    markTagAsSelfClosing() {
        this.currentTag.selfClosing = true;
    }
    // Tags - name
    appendToTagName(char) {
        this.currentTag.name += char;
    }
    // Tags - attributes
    beginAttribute() {
        let tag = this.currentTag;
        if (tag.type === 'EndTag') {
            throw new SyntaxError(`Invalid end tag: closing tag must not have attributes, ` + `in \`${tag.name}\` (on line ${this.tokenizer.line}).`, tag.loc);
        }
        this.currentAttribute = {
            name: '',
            parts: [],
            isQuoted: false,
            isDynamic: false,
            start: b.pos(this.tokenizer.line, this.tokenizer.column),
            valueStartLine: 0,
            valueStartColumn: 0
        };
    }
    appendToAttributeName(char) {
        this.currentAttr.name += char;
    }
    beginAttributeValue(isQuoted) {
        this.currentAttr.isQuoted = isQuoted;
        this.currentAttr.valueStartLine = this.tokenizer.line;
        this.currentAttr.valueStartColumn = this.tokenizer.column;
    }
    appendToAttributeValue(char) {
        let parts = this.currentAttr.parts;
        let lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.type === 'TextNode') {
            lastPart.chars += char;
            // update end location for each added char
            lastPart.loc.end.line = this.tokenizer.line;
            lastPart.loc.end.column = this.tokenizer.column;
        } else {
            // initially assume the text node is a single char
            let loc = b.loc(this.tokenizer.line, this.tokenizer.column, this.tokenizer.line, this.tokenizer.column);
            // the tokenizer line/column have already been advanced, correct location info
            if (char === '\n') {
                loc.start.line -= 1;
                loc.start.column = lastPart ? lastPart.loc.end.column : this.currentAttr.valueStartColumn;
            } else {
                loc.start.column -= 1;
            }
            let text = b.text(char, loc);
            parts.push(text);
        }
    }
    finishAttributeValue() {
        let { name, parts, isQuoted, isDynamic, valueStartLine, valueStartColumn } = this.currentAttr;
        let value = assembleAttributeValue(parts, isQuoted, isDynamic, this.tokenizer.line);
        value.loc = b.loc(valueStartLine, valueStartColumn, this.tokenizer.line, this.tokenizer.column);
        let loc = b.loc(this.currentAttr.start.line, this.currentAttr.start.column, this.tokenizer.line, this.tokenizer.column);
        let attribute = b.attr(name, value, loc);
        this.currentStartTag.attributes.push(attribute);
    }
    reportSyntaxError(message) {
        throw new SyntaxError(`Syntax error at line ${this.tokenizer.line} col ${this.tokenizer.column}: ${message}`, b.loc(this.tokenizer.line, this.tokenizer.column));
    }
}
function assembleAttributeValue(parts, isQuoted, isDynamic, line) {
    if (isDynamic) {
        if (isQuoted) {
            return assembleConcatenatedValue(parts);
        } else {
            if (parts.length === 1 || parts.length === 2 && parts[1].type === 'TextNode' && parts[1].chars === '/') {
                return parts[0];
            } else {
                throw new SyntaxError(`An unquoted attribute value must be a string or a mustache, ` + `preceeded by whitespace or a '=' character, and ` + `followed by whitespace, a '>' character, or '/>' (on line ${line})`, b.loc(line, 0));
            }
        }
    } else {
        return parts.length > 0 ? parts[0] : b.text('');
    }
}
function assembleConcatenatedValue(parts) {
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part.type !== 'MustacheStatement' && part.type !== 'TextNode') {
            throw new SyntaxError('Unsupported node in quoted attribute value: ' + part['type'], part.loc);
        }
    }
    return b.concat(parts);
}
function validateEndTag(tag, element, selfClosing) {
    let error;
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
const syntax = {
    parse: preprocess,
    builders,
    print,
    traverse,
    Walker
};
export function preprocess(html, options = {}) {
    let mode = options.mode || 'precompile';
    let ast;
    if (typeof html === 'object') {
        ast = html;
    } else {
        let parseOptions = options.parseOptions || {};
        if (mode === 'codemod') {
            parseOptions.ignoreStandalone = true;
        }
        ast = handlebars.parse(html, parseOptions);
    }
    let entityParser = undefined;
    if (mode === 'codemod') {
        entityParser = new EntityParser({});
    }
    let program = new TokenizerEventHandlers(html, entityParser).acceptTemplate(ast);
    if (options && options.plugins && options.plugins.ast) {
        for (let i = 0, l = options.plugins.ast.length; i < l; i++) {
            let transform = options.plugins.ast[i];
            let env = assign({}, options, { syntax }, { plugins: undefined });
            let pluginResult = transform(env);
            traverse(program, pluginResult.visitor);
        }
    }
    return program;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvcGFyc2VyL3Rva2VuaXplci1ldmVudC1oYW5kbGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLENBQVAsSUFBWSxTQUFaLFFBQTZCLGFBQTdCO0FBQ0EsU0FBUyxXQUFULEVBQXNCLHVCQUF0QixRQUFxRCxVQUFyRDtBQUNBLFNBQVMsc0JBQVQsUUFBdUMsNEJBQXZDO0FBR0EsT0FBTyxXQUFQLE1BQXdCLHdCQUF4QjtBQUVBLE9BQU8sUUFBUCxNQUFxQixhQUFyQjtBQUNBLE9BQU8sUUFBUCxNQUFxQix1QkFBckI7QUFDQSxPQUFPLEtBQVAsTUFBa0IscUJBQWxCO0FBQ0EsT0FBTyxNQUFQLE1BQW1CLHFCQUFuQjtBQUNBLE9BQU8sS0FBSyxVQUFaLE1BQTRCLFlBQTVCO0FBQ0EsU0FBUyxNQUFULFFBQXVCLGVBQXZCO0FBRUEsU0FBUyxZQUFULFFBQTZCLHVCQUE3QjtBQUVBLE9BQU8sTUFBTSxVQUVULE9BQU8sTUFBUCxDQUFjLElBQWQsQ0FGRztBQUlQLElBQUksZUFDRixxRkFERjtBQUVBLGFBQWEsS0FBYixDQUFtQixHQUFuQixFQUF3QixPQUF4QixDQUFnQyxXQUFVO0FBQ3hDLFlBQVEsT0FBUixJQUFtQixJQUFuQjtBQUNELENBRkQ7QUFJQSxPQUFNLE1BQU8sc0JBQVAsU0FBc0Msc0JBQXRDLENBQTREO0FBQWxFLGtCQUFBOztBQUNVLGFBQUEsV0FBQSxHQUFjLENBQWQ7QUFDQSxhQUFBLGFBQUEsR0FBZ0IsQ0FBaEI7QUF3TlQ7QUF0TkMsWUFBSztBQUNILGFBQUssV0FBTCxHQUFtQixJQUFuQjtBQUNEO0FBRUQ7QUFFQSxtQkFBWTtBQUNWLGFBQUssV0FBTCxHQUFtQixFQUFFLE9BQUYsQ0FBVSxFQUFWLENBQW5CO0FBQ0EsYUFBSyxXQUFMLENBQWlCLEdBQWpCLEdBQXVCO0FBQ3JCLG9CQUFRLElBRGE7QUFFckIsbUJBQU8sRUFBRSxH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O1xuaW1wb3J0IHsgYXBwZW5kQ2hpbGQsIHBhcnNlRWxlbWVudEJsb2NrUGFyYW1zIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgSGFuZGxlYmFyc05vZGVWaXNpdG9ycyB9IGZyb20gJy4vaGFuZGxlYmFycy1ub2RlLXZpc2l0b3JzJztcbmltcG9ydCAqIGFzIEFTVCBmcm9tICcuLi90eXBlcy9ub2Rlcyc7XG5pbXBvcnQgKiBhcyBIQlMgZnJvbSAnLi4vdHlwZXMvaGFuZGxlYmFycy1hc3QnO1xuaW1wb3J0IFN5bnRheEVycm9yIGZyb20gJy4uL2Vycm9ycy9zeW50YXgtZXJyb3InO1xuaW1wb3J0IHsgVGFnIH0gZnJvbSAnLi4vcGFyc2VyJztcbmltcG9ydCBidWlsZGVycyBmcm9tICcuLi9idWlsZGVycyc7XG5pbXBvcnQgdHJhdmVyc2UgZnJvbSAnLi4vdHJhdmVyc2FsL3RyYXZlcnNlJztcbmltcG9ydCBwcmludCBmcm9tICcuLi9nZW5lcmF0aW9uL3ByaW50JztcbmltcG9ydCBXYWxrZXIgZnJvbSAnLi4vdHJhdmVyc2FsL3dhbGtlcic7XG5pbXBvcnQgKiBhcyBoYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnO1xuaW1wb3J0IHsgYXNzaWduIH0gZnJvbSAnQGdsaW1tZXIvdXRpbCc7XG5pbXBvcnQgeyBOb2RlVmlzaXRvciB9IGZyb20gJy4uL3RyYXZlcnNhbC92aXNpdG9yJztcbmltcG9ydCB7IEVudGl0eVBhcnNlciB9IGZyb20gJ3NpbXBsZS1odG1sLXRva2VuaXplcic7XG5cbmV4cG9ydCBjb25zdCB2b2lkTWFwOiB7XG4gIFt0YWdOYW1lOiBzdHJpbmddOiBib29sZWFuO1xufSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmxldCB2b2lkVGFnTmFtZXMgPVxuICAnYXJlYSBiYXNlIGJyIGNvbCBjb21tYW5kIGVtYmVkIGhyIGltZyBpbnB1dCBrZXlnZW4gbGluayBtZXRhIHBhcmFtIHNvdXJjZSB0cmFjayB3YnInO1xudm9pZFRhZ05hbWVzLnNwbGl0KCcgJykuZm9yRWFjaCh0YWdOYW1lID0+IHtcbiAgdm9pZE1hcFt0YWdOYW1lXSA9IHRydWU7XG59KTtcblxuZXhwb3J0IGNsYXNzIFRva2VuaXplckV2ZW50SGFuZGxlcnMgZXh0ZW5kcyBIYW5kbGViYXJzTm9kZVZpc2l0b3JzIHtcbiAgcHJpdmF0ZSB0YWdPcGVuTGluZSA9IDA7XG4gIHByaXZhdGUgdGFnT3BlbkNvbHVtbiA9IDA7XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IG51bGw7XG4gIH1cblxuICAvLyBDb21tZW50XG5cbiAgYmVnaW5Db21tZW50KCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLmNvbW1lbnQoJycpO1xuICAgIHRoaXMuY3VycmVudE5vZGUubG9jID0ge1xuICAgICAgc291cmNlOiBudWxsLFxuICAgICAgc3RhcnQ6IGIucG9zKHRoaXMudGFnT3BlbkxpbmUsIHRoaXMudGFnT3BlbkNvbHVtbiksXG4gICAgICBlbmQ6IChudWxsIGFzIGFueSkgYXMgQVNULlBvc2l0aW9uLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0NvbW1lbnREYXRhKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudENvbW1lbnQudmFsdWUgKz0gY2hhcjtcbiAgfVxuXG4gIGZpbmlzaENvbW1lbnQoKSB7XG4gICAgdGhpcy5jdXJyZW50Q29tbWVudC5sb2MuZW5kID0gYi5wb3ModGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgdGhpcy5jdXJyZW50Q29tbWVudCk7XG4gIH1cblxuICAvLyBEYXRhXG5cbiAgYmVnaW5EYXRhKCkge1xuICAgIHRoaXMuY3VycmVudE5vZGUgPSBiLnRleHQoKTtcbiAgICB0aGlzLmN1cnJlbnROb2RlLmxvYyA9IHtcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIHN0YXJ0OiBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pLFxuICAgICAgZW5kOiAobnVsbCBhcyBhbnkpIGFzIEFTVC5Qb3NpdGlvbixcbiAgICB9O1xuICB9XG5cbiAgYXBwZW5kVG9EYXRhKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudERhdGEuY2hhcnMgKz0gY2hhcjtcbiAgfVxuXG4gIGZpbmlzaERhdGEoKSB7XG4gICAgdGhpcy5jdXJyZW50RGF0YS5sb2MuZW5kID0gYi5wb3ModGhpcy50b2tlbml6ZXIubGluZSwgdGhpcy50b2tlbml6ZXIuY29sdW1uKTtcblxuICAgIGFwcGVuZENoaWxkKHRoaXMuY3VycmVudEVsZW1lbnQoKSwgdGhpcy5jdXJyZW50RGF0YSk7XG4gIH1cblxuICAvLyBUYWdzIC0gYmFzaWNcblxuICB0YWdPcGVuKCkge1xuICAgIHRoaXMudGFnT3BlbkxpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIHRoaXMudGFnT3BlbkNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgfVxuXG4gIGJlZ2luU3RhcnRUYWcoKSB7XG4gICAgdGhpcy5jdXJyZW50Tm9kZSA9IHtcbiAgICAgIHR5cGU6ICdTdGFydFRhZycsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgbW9kaWZpZXJzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIHNlbGZDbG9zaW5nOiBmYWxzZSxcbiAgICAgIGxvYzogU1lOVEhFVElDLFxuICAgIH07XG4gIH1cblxuICBiZWdpbkVuZFRhZygpIHtcbiAgICB0aGlzLmN1cnJlbnROb2RlID0ge1xuICAgICAgdHlwZTogJ0VuZFRhZycsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgbW9kaWZpZXJzOiBbXSxcbiAgICAgIGNvbW1lbnRzOiBbXSxcbiAgICAgIHNlbGZDbG9zaW5nOiBmYWxzZSxcbiAgICAgIGxvYzogU1lOVEhFVElDLFxuICAgIH07XG4gIH1cblxuICBmaW5pc2hUYWcoKSB7XG4gICAgbGV0IHsgbGluZSwgY29sdW1uIH0gPSB0aGlzLnRva2VuaXplcjtcblxuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG4gICAgdGFnLmxvYyA9IGIubG9jKHRoaXMudGFnT3BlbkxpbmUsIHRoaXMudGFnT3BlbkNvbHVtbiwgbGluZSwgY29sdW1uKTtcblxuICAgIGlmICh0YWcudHlwZSA9PT0gJ1N0YXJ0VGFnJykge1xuICAgICAgdGhpcy5maW5pc2hTdGFydFRhZygpO1xuXG4gICAgICBpZiAodm9pZE1hcFt0YWcubmFtZV0gfHwgdGFnLnNlbGZDbG9zaW5nKSB7XG4gICAgICAgIHRoaXMuZmluaXNoRW5kVGFnKHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGFnLnR5cGUgPT09ICdFbmRUYWcnKSB7XG4gICAgICB0aGlzLmZpbmlzaEVuZFRhZyhmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZmluaXNoU3RhcnRUYWcoKSB7XG4gICAgbGV0IHsgbmFtZSwgYXR0cmlidXRlczogYXR0cnMsIG1vZGlmaWVycywgY29tbWVudHMsIHNlbGZDbG9zaW5nIH0gPSB0aGlzLmN1cnJlbnRTdGFydFRhZztcbiAgICBsZXQgbG9jID0gYi5sb2ModGhpcy50YWdPcGVuTGluZSwgdGhpcy50YWdPcGVuQ29sdW1uKTtcbiAgICBsZXQgZWxlbWVudCA9IGIuZWxlbWVudCh7IG5hbWUsIHNlbGZDbG9zaW5nIH0sIHsgYXR0cnMsIG1vZGlmaWVycywgY29tbWVudHMsIGxvYyB9KTtcbiAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKGVsZW1lbnQpO1xuICB9XG5cbiAgZmluaXNoRW5kVGFnKGlzVm9pZDogYm9vbGVhbikge1xuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG5cbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpIGFzIEFTVC5FbGVtZW50Tm9kZTtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5jdXJyZW50RWxlbWVudCgpO1xuXG4gICAgdmFsaWRhdGVFbmRUYWcodGFnLCBlbGVtZW50LCBpc1ZvaWQpO1xuXG4gICAgZWxlbWVudC5sb2MuZW5kLmxpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIGVsZW1lbnQubG9jLmVuZC5jb2x1bW4gPSB0aGlzLnRva2VuaXplci5jb2x1bW47XG5cbiAgICBwYXJzZUVsZW1lbnRCbG9ja1BhcmFtcyhlbGVtZW50KTtcbiAgICBhcHBlbmRDaGlsZChwYXJlbnQsIGVsZW1lbnQpO1xuICB9XG5cbiAgbWFya1RhZ0FzU2VsZkNsb3NpbmcoKSB7XG4gICAgdGhpcy5jdXJyZW50VGFnLnNlbGZDbG9zaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFRhZ3MgLSBuYW1lXG5cbiAgYXBwZW5kVG9UYWdOYW1lKGNoYXI6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudFRhZy5uYW1lICs9IGNoYXI7XG4gIH1cblxuICAvLyBUYWdzIC0gYXR0cmlidXRlc1xuXG4gIGJlZ2luQXR0cmlidXRlKCkge1xuICAgIGxldCB0YWcgPSB0aGlzLmN1cnJlbnRUYWc7XG4gICAgaWYgKHRhZy50eXBlID09PSAnRW5kVGFnJykge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICBgSW52YWxpZCBlbmQgdGFnOiBjbG9zaW5nIHRhZyBtdXN0IG5vdCBoYXZlIGF0dHJpYnV0ZXMsIGAgK1xuICAgICAgICAgIGBpbiBcXGAke3RhZy5uYW1lfVxcYCAob24gbGluZSAke3RoaXMudG9rZW5pemVyLmxpbmV9KS5gLFxuICAgICAgICB0YWcubG9jXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudEF0dHJpYnV0ZSA9IHtcbiAgICAgIG5hbWU6ICcnLFxuICAgICAgcGFydHM6IFtdLFxuICAgICAgaXNRdW90ZWQ6IGZhbHNlLFxuICAgICAgaXNEeW5hbWljOiBmYWxzZSxcbiAgICAgIHN0YXJ0OiBiLnBvcyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pLFxuICAgICAgdmFsdWVTdGFydExpbmU6IDAsXG4gICAgICB2YWx1ZVN0YXJ0Q29sdW1uOiAwLFxuICAgIH07XG4gIH1cblxuICBhcHBlbmRUb0F0dHJpYnV0ZU5hbWUoY2hhcjogc3RyaW5nKSB7XG4gICAgdGhpcy5jdXJyZW50QXR0ci5uYW1lICs9IGNoYXI7XG4gIH1cblxuICBiZWdpbkF0dHJpYnV0ZVZhbHVlKGlzUXVvdGVkOiBib29sZWFuKSB7XG4gICAgdGhpcy5jdXJyZW50QXR0ci5pc1F1b3RlZCA9IGlzUXVvdGVkO1xuICAgIHRoaXMuY3VycmVudEF0dHIudmFsdWVTdGFydExpbmUgPSB0aGlzLnRva2VuaXplci5saW5lO1xuICAgIHRoaXMuY3VycmVudEF0dHIudmFsdWVTdGFydENvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgfVxuXG4gIGFwcGVuZFRvQXR0cmlidXRlVmFsdWUoY2hhcjogc3RyaW5nKSB7XG4gICAgbGV0IHBhcnRzID0gdGhpcy5jdXJyZW50QXR0ci5wYXJ0cztcbiAgICBsZXQgbGFzdFBhcnQgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcblxuICAgIGlmIChsYXN0UGFydCAmJiBsYXN0UGFydC50eXBlID09PSAnVGV4dE5vZGUnKSB7XG4gICAgICBsYXN0UGFydC5jaGFycyArPSBjaGFyO1xuXG4gICAgICAvLyB1cGRhdGUgZW5kIGxvY2F0aW9uIGZvciBlYWNoIGFkZGVkIGNoYXJcbiAgICAgIGxhc3RQYXJ0LmxvYy5lbmQubGluZSA9IHRoaXMudG9rZW5pemVyLmxpbmU7XG4gICAgICBsYXN0UGFydC5sb2MuZW5kLmNvbHVtbiA9IHRoaXMudG9rZW5pemVyLmNvbHVtbjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gaW5pdGlhbGx5IGFzc3VtZSB0aGUgdGV4dCBub2RlIGlzIGEgc2luZ2xlIGNoYXJcbiAgICAgIGxldCBsb2MgPSBiLmxvYyhcbiAgICAgICAgdGhpcy50b2tlbml6ZXIubGluZSxcbiAgICAgICAgdGhpcy50b2tlbml6ZXIuY29sdW1uLFxuICAgICAgICB0aGlzLnRva2VuaXplci5saW5lLFxuICAgICAgICB0aGlzLnRva2VuaXplci5jb2x1bW5cbiAgICAgICk7XG5cbiAgICAgIC8vIHRoZSB0b2tlbml6ZXIgbGluZS9jb2x1bW4gaGF2ZSBhbHJlYWR5IGJlZW4gYWR2YW5jZWQsIGNvcnJlY3QgbG9jYXRpb24gaW5mb1xuICAgICAgaWYgKGNoYXIgPT09ICdcXG4nKSB7XG4gICAgICAgIGxvYy5zdGFydC5saW5lIC09IDE7XG4gICAgICAgIGxvYy5zdGFydC5jb2x1bW4gPSBsYXN0UGFydCA/IGxhc3RQYXJ0LmxvYy5lbmQuY29sdW1uIDogdGhpcy5jdXJyZW50QXR0ci52YWx1ZVN0YXJ0Q29sdW1uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jLnN0YXJ0LmNvbHVtbiAtPSAxO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGV4dCA9IGIudGV4dChjaGFyLCBsb2MpO1xuICAgICAgcGFydHMucHVzaCh0ZXh0KTtcbiAgICB9XG4gIH1cblxuICBmaW5pc2hBdHRyaWJ1dGVWYWx1ZSgpIHtcbiAgICBsZXQgeyBuYW1lLCBwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgdmFsdWVTdGFydExpbmUsIHZhbHVlU3RhcnRDb2x1bW4gfSA9IHRoaXMuY3VycmVudEF0dHI7XG4gICAgbGV0IHZhbHVlID0gYXNzZW1ibGVBdHRyaWJ1dGVWYWx1ZShwYXJ0cywgaXNRdW90ZWQsIGlzRHluYW1pYywgdGhpcy50b2tlbml6ZXIubGluZSk7XG4gICAgdmFsdWUubG9jID0gYi5sb2ModmFsdWVTdGFydExpbmUsIHZhbHVlU3RhcnRDb2x1bW4sIHRoaXMudG9rZW5pemVyLmxpbmUsIHRoaXMudG9rZW5pemVyLmNvbHVtbik7XG5cbiAgICBsZXQgbG9jID0gYi5sb2MoXG4gICAgICB0aGlzLmN1cnJlbnRBdHRyLnN0YXJ0LmxpbmUsXG4gICAgICB0aGlzLmN1cnJlbnRBdHRyLnN0YXJ0LmNvbHVtbixcbiAgICAgIHRoaXMudG9rZW5pemVyLmxpbmUsXG4gICAgICB0aGlzLnRva2VuaXplci5jb2x1bW5cbiAgICApO1xuXG4gICAgbGV0IGF0dHJpYnV0ZSA9IGIuYXR0cihuYW1lLCB2YWx1ZSwgbG9jKTtcblxuICAgIHRoaXMuY3VycmVudFN0YXJ0VGFnLmF0dHJpYnV0ZXMucHVzaChhdHRyaWJ1dGUpO1xuICB9XG5cbiAgcmVwb3J0U3ludGF4RXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgYFN5bnRheCBlcnJvciBhdCBsaW5lICR7dGhpcy50b2tlbml6ZXIubGluZX0gY29sICR7dGhpcy50b2tlbml6ZXIuY29sdW1ufTogJHttZXNzYWdlfWAsXG4gICAgICBiLmxvYyh0aGlzLnRva2VuaXplci5saW5lLCB0aGlzLnRva2VuaXplci5jb2x1bW4pXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlbWJsZUF0dHJpYnV0ZVZhbHVlKFxuICBwYXJ0czogKEFTVC5NdXN0YWNoZVN0YXRlbWVudCB8IEFTVC5UZXh0Tm9kZSlbXSxcbiAgaXNRdW90ZWQ6IGJvb2xlYW4sXG4gIGlzRHluYW1pYzogYm9vbGVhbixcbiAgbGluZTogbnVtYmVyXG4pIHtcbiAgaWYgKGlzRHluYW1pYykge1xuICAgIGlmIChpc1F1b3RlZCkge1xuICAgICAgcmV0dXJuIGFzc2VtYmxlQ29uY2F0ZW5hdGVkVmFsdWUocGFydHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXG4gICAgICAgIHBhcnRzLmxlbmd0aCA9PT0gMSB8fFxuICAgICAgICAocGFydHMubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgcGFydHNbMV0udHlwZSA9PT0gJ1RleHROb2RlJyAmJlxuICAgICAgICAgIChwYXJ0c1sxXSBhcyBBU1QuVGV4dE5vZGUpLmNoYXJzID09PSAnLycpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgIGBBbiB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhIHN0cmluZyBvciBhIG11c3RhY2hlLCBgICtcbiAgICAgICAgICAgIGBwcmVjZWVkZWQgYnkgd2hpdGVzcGFjZSBvciBhICc9JyBjaGFyYWN0ZXIsIGFuZCBgICtcbiAgICAgICAgICAgIGBmb2xsb3dlZCBieSB3aGl0ZXNwYWNlLCBhICc+JyBjaGFyYWN0ZXIsIG9yICcvPicgKG9uIGxpbmUgJHtsaW5lfSlgLFxuICAgICAgICAgIGIubG9jKGxpbmUsIDApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXJ0cy5sZW5ndGggPiAwID8gcGFydHNbMF0gOiBiLnRleHQoJycpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VtYmxlQ29uY2F0ZW5hdGVkVmFsdWUocGFydHM6IChBU1QuTXVzdGFjaGVTdGF0ZW1lbnQgfCBBU1QuVGV4dE5vZGUpW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBwYXJ0OiBBU1QuQmFzZU5vZGUgPSBwYXJ0c1tpXTtcblxuICAgIGlmIChwYXJ0LnR5cGUgIT09ICdNdXN0YWNoZVN0YXRlbWVudCcgJiYgcGFydC50eXBlICE9PSAnVGV4dE5vZGUnKSB7XG4gICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoXG4gICAgICAgICdVbnN1cHBvcnRlZCBub2RlIGluIHF1b3RlZCBhdHRyaWJ1dGUgdmFsdWU6ICcgKyBwYXJ0Wyd0eXBlJ10sXG4gICAgICAgIHBhcnQubG9jXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBiLmNvbmNhdChwYXJ0cyk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW5kVGFnKFxuICB0YWc6IFRhZzwnU3RhcnRUYWcnIHwgJ0VuZFRhZyc+LFxuICBlbGVtZW50OiBBU1QuRWxlbWVudE5vZGUsXG4gIHNlbGZDbG9zaW5nOiBib29sZWFuXG4pIHtcbiAgbGV0IGVycm9yO1xuXG4gIGlmICh2b2lkTWFwW3RhZy5uYW1lXSAmJiAhc2VsZkNsb3NpbmcpIHtcbiAgICAvLyBFbmdUYWcgaXMgYWxzbyBjYWxsZWQgYnkgU3RhcnRUYWcgZm9yIHZvaWQgYW5kIHNlbGYtY2xvc2luZyB0YWdzIChpLmUuXG4gICAgLy8gPGlucHV0PiBvciA8YnIgLz4sIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIHRoYXQgaGVyZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZFxuICAgIC8vIHRocm93IGFuIGVycm9yIGZvciB0aG9zZSBjYXNlcy5cbiAgICBlcnJvciA9ICdJbnZhbGlkIGVuZCB0YWcgJyArIGZvcm1hdEVuZFRhZ0luZm8odGFnKSArICcgKHZvaWQgZWxlbWVudHMgY2Fubm90IGhhdmUgZW5kIHRhZ3MpLic7XG4gIH0gZWxzZSBpZiAoZWxlbWVudC50YWcgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9yID0gJ0Nsb3NpbmcgdGFnICcgKyBmb3JtYXRFbmRUYWdJbmZvKHRhZykgKyAnIHdpdGhvdXQgYW4gb3BlbiB0YWcuJztcbiAgfSBlbHNlIGlmIChlbGVtZW50LnRhZyAhPT0gdGFnLm5hbWUpIHtcbiAgICBlcnJvciA9XG4gICAgICAnQ2xvc2luZyB0YWcgJyArXG4gICAgICBmb3JtYXRFbmRUYWdJbmZvKHRhZykgK1xuICAgICAgJyBkaWQgbm90IG1hdGNoIGxhc3Qgb3BlbiB0YWcgYCcgK1xuICAgICAgZWxlbWVudC50YWcgK1xuICAgICAgJ2AgKG9uIGxpbmUgJyArXG4gICAgICBlbGVtZW50LmxvYy5zdGFydC5saW5lICtcbiAgICAgICcpLic7XG4gIH1cblxuICBpZiAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoZXJyb3IsIGVsZW1lbnQubG9jKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmb3JtYXRFbmRUYWdJbmZvKHRhZzogVGFnPCdTdGFydFRhZycgfCAnRW5kVGFnJz4pIHtcbiAgcmV0dXJuICdgJyArIHRhZy5uYW1lICsgJ2AgKG9uIGxpbmUgJyArIHRhZy5sb2MuZW5kLmxpbmUgKyAnKSc7XG59XG5cbi8qKlxuICBBU1RQbHVnaW5zIGNhbiBtYWtlIGNoYW5nZXMgdG8gdGhlIEdsaW1tZXIgdGVtcGxhdGUgQVNUIGJlZm9yZVxuICBjb21waWxhdGlvbiBiZWdpbnMuXG4qL1xuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW5CdWlsZGVyIHtcbiAgKGVudjogQVNUUGx1Z2luRW52aXJvbm1lbnQpOiBBU1RQbHVnaW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQVNUUGx1Z2luIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2aXNpdG9yOiBOb2RlVmlzaXRvcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBU1RQbHVnaW5FbnZpcm9ubWVudCB7XG4gIG1ldGE/OiBvYmplY3Q7XG4gIHN5bnRheDogU3ludGF4O1xufVxuaW50ZXJmYWNlIEhhbmRsZWJhcnNQYXJzZU9wdGlvbnMge1xuICBzcmNOYW1lPzogc3RyaW5nO1xuICBpZ25vcmVTdGFuZGFsb25lPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcmVwcm9jZXNzT3B0aW9ucyB7XG4gIG1ldGE/OiB1bmtub3duO1xuICBwbHVnaW5zPzoge1xuICAgIGFzdD86IEFTVFBsdWdpbkJ1aWxkZXJbXTtcbiAgfTtcbiAgcGFyc2VPcHRpb25zPzogSGFuZGxlYmFyc1BhcnNlT3B0aW9ucztcblxuICAvKipcbiAgICBVc2VmdWwgZm9yIHNwZWNpZnlpbmcgYSBncm91cCBvZiBvcHRpb25zIHRvZ2V0aGVyLlxuXG4gICAgV2hlbiBgJ2NvZGVtb2QnYCB3ZSBkaXNhYmxlIGFsbCB3aGl0ZXNwYWNlIGNvbnRyb2wgaW4gaGFuZGxlYmFyc1xuICAgICh0byBwcmVzZXJ2ZSBhcyBtdWNoIGFzIHBvc3NpYmxlKSBhbmQgd2UgYWxzbyBhdm9pZCBhbnlcbiAgICBlc2NhcGluZy91bmVzY2FwaW5nIG9mIEhUTUwgZW50aXR5IGNvZGVzLlxuICAgKi9cbiAgbW9kZT86ICdjb2RlbW9kJyB8ICdwcmVjb21waWxlJztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTeW50YXgge1xuICBwYXJzZTogdHlwZW9mIHByZXByb2Nlc3M7XG4gIGJ1aWxkZXJzOiB0eXBlb2YgYnVpbGRlcnM7XG4gIHByaW50OiB0eXBlb2YgcHJpbnQ7XG4gIHRyYXZlcnNlOiB0eXBlb2YgdHJhdmVyc2U7XG4gIFdhbGtlcjogdHlwZW9mIFdhbGtlcjtcbn1cblxuY29uc3Qgc3ludGF4OiBTeW50YXggPSB7XG4gIHBhcnNlOiBwcmVwcm9jZXNzLFxuICBidWlsZGVycyxcbiAgcHJpbnQsXG4gIHRyYXZlcnNlLFxuICBXYWxrZXIsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2VzcyhodG1sOiBzdHJpbmcsIG9wdGlvbnM6IFByZXByb2Nlc3NPcHRpb25zID0ge30pOiBBU1QuVGVtcGxhdGUge1xuICBsZXQgbW9kZSA9IG9wdGlvbnMubW9kZSB8fCAncHJlY29tcGlsZSc7XG5cbiAgbGV0IGFzdDogSEJTLlByb2dyYW07XG4gIGlmICh0eXBlb2YgaHRtbCA9PT0gJ29iamVjdCcpIHtcbiAgICBhc3QgPSBodG1sO1xuICB9IGVsc2Uge1xuICAgIGxldCBwYXJzZU9wdGlvbnMgPSBvcHRpb25zLnBhcnNlT3B0aW9ucyB8fCB7fTtcblxuICAgIGlmIChtb2RlID09PSAnY29kZW1vZCcpIHtcbiAgICAgIHBhcnNlT3B0aW9ucy5pZ25vcmVTdGFuZGFsb25lID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3QgPSBoYW5kbGViYXJzLnBhcnNlKGh0bWwsIHBhcnNlT3B0aW9ucykgYXMgSEJTLlByb2dyYW07XG4gIH1cblxuICBsZXQgZW50aXR5UGFyc2VyID0gdW5kZWZpbmVkO1xuICBpZiAobW9kZSA9PT0gJ2NvZGVtb2QnKSB7XG4gICAgZW50aXR5UGFyc2VyID0gbmV3IEVudGl0eVBhcnNlcih7fSk7XG4gIH1cblxuICBsZXQgcHJvZ3JhbSA9IG5ldyBUb2tlbml6ZXJFdmVudEhhbmRsZXJzKGh0bWwsIGVudGl0eVBhcnNlcikuYWNjZXB0VGVtcGxhdGUoYXN0KTtcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnBsdWdpbnMgJiYgb3B0aW9ucy5wbHVnaW5zLmFzdCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gb3B0aW9ucy5wbHVnaW5zLmFzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxldCB0cmFuc2Zvcm0gPSBvcHRpb25zLnBsdWdpbnMuYXN0W2ldO1xuICAgICAgbGV0IGVudiA9IGFzc2lnbih7fSwgb3B0aW9ucywgeyBzeW50YXggfSwgeyBwbHVnaW5zOiB1bmRlZmluZWQgfSk7XG5cbiAgICAgIGxldCBwbHVnaW5SZXN1bHQgPSB0cmFuc2Zvcm0oZW52KTtcblxuICAgICAgdHJhdmVyc2UocHJvZ3JhbSwgcGx1Z2luUmVzdWx0LnZpc2l0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9ncmFtO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==