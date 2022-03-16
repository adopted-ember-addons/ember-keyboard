import { marked } from 'marked';
import hljs from 'highlight.js';
import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function formatMarkdown([value]) {
  if (!value) {
    return;
  }

  // Set options
  // `highlight` example uses https://highlightjs.org
  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
  });

  let parsedMarkdown = marked.parse(value);

  return htmlSafe(parsedMarkdown);
}

export default helper(formatMarkdown);
