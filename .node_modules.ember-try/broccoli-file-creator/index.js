'use strict';

const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');
const mkdirp = require('mkdirp');

module.exports = function(filename, content, options) {
  return new Creator(filename, content, options);
};

class Creator extends Plugin {
  constructor (filename, content, _options) {
    const options = _options || {
      encoding: 'utf8'
    };

    super([], {
      annotation: options.annotation || constructor.name + filename,
      persistentOutput: true
    });

    this.content = content;
    this.filename = filename;
    this.fileOptions = options;

    this._built = false;
  }

  build() {
    if (this._built) {
      return;
    }

    const outputFilePath = path.join(this.outputPath, this.filename);
    mkdirp.sync(path.dirname(outputFilePath));

    return new Promise(resolve => {
      resolve(typeof this.content === 'function' ? this.content() : this.content);
    }).then(content => {
      fs.writeFileSync(outputFilePath, content, this.fileOptions);
      this._built = true;
    });
  }
};

module.exports.Class = Creator;
