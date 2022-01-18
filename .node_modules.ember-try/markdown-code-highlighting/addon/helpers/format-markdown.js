/* global hljs, marked */
import { helper } from "@ember/component/helper";
import { htmlSafe } from "@ember/string";

export function formatMarkdown([value]) {
  if (!value) {
    return;
  }

  marked.setOptions({
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    }
  });

  // highlight JS requires the following classes for code highlighting
  // hljs [LANG]. By default, marked places "lang-[LANG]" as a class on the code
  // html element. This will search and replace all instances of that class
  // with proper hljs code classes
  // ex.
  // input: ```javascript\nsomeJavascript()\n```
  // will result in a class: <code class="lang-javascript"></code>
  // and after the following replace: <code class "lang-javascript hljs javascript">...
  let parsedMarkdown = window
    .marked(value)
    .replace(/lang-(\w+)/g, "lang-$1 hljs $1");

  return new htmlSafe(parsedMarkdown);
}

export default helper(formatMarkdown);
