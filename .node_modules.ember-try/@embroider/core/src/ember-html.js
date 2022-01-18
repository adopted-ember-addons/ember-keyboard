"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNewline = exports.PreparedEmberHTML = void 0;
const jsdom_1 = require("jsdom");
const fs_1 = require("fs");
class NodeRange {
    constructor(initial) {
        this.start = initial.ownerDocument.createTextNode('');
        initial.parentElement.insertBefore(this.start, initial);
        this.end = initial;
    }
    clear() {
        while (this.start.nextSibling !== this.end) {
            this.start.parentElement.removeChild(this.start.nextSibling);
        }
    }
    insert(node) {
        this.end.parentElement.insertBefore(node, this.end);
    }
}
function immediatelyAfter(node) {
    let newMarker = node.ownerDocument.createTextNode('');
    node.parentElement.insertBefore(newMarker, node.nextSibling);
    return new NodeRange(newMarker);
}
class PreparedEmberHTML {
    constructor(asset) {
        this.asset = asset;
        this.dom = new jsdom_1.JSDOM(fs_1.readFileSync(asset.sourcePath, 'utf8'));
        let html = asset.prepare(this.dom);
        this.javascript = new NodeRange(html.javascript);
        this.styles = new NodeRange(html.styles);
        this.implicitScripts = new NodeRange(html.implicitScripts);
        this.implicitStyles = new NodeRange(html.implicitStyles);
        this.testJavascript = html.testJavascript ? new NodeRange(html.testJavascript) : immediatelyAfter(html.javascript);
        this.implicitTestScripts = html.implicitTestScripts
            ? new NodeRange(html.implicitTestScripts)
            : immediatelyAfter(html.implicitScripts);
        this.implicitTestStyles = html.implicitTestStyles
            ? new NodeRange(html.implicitTestStyles)
            : immediatelyAfter(html.implicitStyles);
    }
    allRanges() {
        return [
            this.javascript,
            this.styles,
            this.implicitScripts,
            this.implicitStyles,
            this.implicitTestScripts,
            this.implicitTestStyles,
            this.testJavascript,
        ];
    }
    clear() {
        for (let range of this.allRanges()) {
            range.clear();
        }
    }
    // this takes the src relative to the application root, we adjust it so it's
    // root-relative via the configured rootURL
    insertScriptTag(location, relativeSrc, opts) {
        let newTag = this.dom.window.document.createElement(opts && opts.tag ? opts.tag : 'script');
        newTag.setAttribute('src', this.asset.rootURL + relativeSrc);
        if (opts && opts.type) {
            newTag.setAttribute('type', opts.type);
        }
        location.insert(this.dom.window.document.createTextNode('\n'));
        location.insert(newTag);
    }
    // this takes the href relative to the application root, we adjust it so it's
    // root-relative via the configured rootURL
    insertStyleLink(location, relativeHref) {
        let newTag = this.dom.window.document.createElement('link');
        newTag.rel = 'stylesheet';
        newTag.href = this.asset.rootURL + relativeHref;
        location.insert(this.dom.window.document.createTextNode('\n'));
        location.insert(newTag);
    }
}
exports.PreparedEmberHTML = PreparedEmberHTML;
function insertNewline(at) {
    at.parentElement.insertBefore(at.ownerDocument.createTextNode('\n'), at);
}
exports.insertNewline = insertNewline;
//# sourceMappingURL=ember-html.js.map