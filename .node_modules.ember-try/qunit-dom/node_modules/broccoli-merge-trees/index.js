'use strict';

const Plugin = require('broccoli-plugin');
const MergeTrees = require('merge-trees');

class BroccoliMergeTrees extends Plugin {
  constructor(inputNodes, options = {}) {
    let name = 'broccoli-merge-trees:' + (options.annotation || '');
    if (!Array.isArray(inputNodes)) {
      throw new TypeError(name + ': Expected array, got: [' + inputNodes +']');
    }
    super(inputNodes, {
      persistentOutput: true,
      needsCache: false,
      annotation: options.annotation
    });

    this.inputNodes = inputNodes;
    this.options = options;
  }

  build() {
    if (this.mergeTrees == null) {
      // Defer instantiation until the first build because we only
      // have this.inputPaths and this.outputPath once we build.
      let outputPath = `${this.outputPath}${this.options.destDir ? '/' + this.options.destDir : ''}`;
      this.mergeTrees = new MergeTrees(this.inputPaths, outputPath, {
        overwrite: this.options.overwrite,
        annotation: this.options.annotation
      });
    }

    try {
      this.mergeTrees.merge();
    } catch(err) {
      if (err !== null && typeof err === 'object') {
        let nodesList = this.inputNodes.map((node, i) => `  ${i+1}.  ${node.toString()}`).join('\n');
        let message = `${this.toString()} error while merging the following:\n${nodesList}`;

        err.message = `${message}\n${err.message}`;
      }
      throw err;
    }
  }
}

module.exports = function mergeTrees(...params) {
  return new BroccoliMergeTrees(...params);
};

module.exports.MergeTrees = BroccoliMergeTrees;
