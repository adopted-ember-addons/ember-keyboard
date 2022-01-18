"use strict";

module.exports = {
  name: require("./package").name,
  included(app) {
    this._super.included(app);

    app.import("node_modules/highlightjs/highlight.pack.js");
    app.import("node_modules/marked/lib/marked.js");
  }
};
