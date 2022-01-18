'use strict';

const debug = require('debug')('broccoli-terser-sourcemap');
const defaults = require('lodash.defaultsdeep');
const fs = require('fs');
const path = require('path');
const terser = require('terser');
const getSourceMapContent = require('./get-sourcemap-content');

module.exports = async function processFile(inFile, outFile, relativePath, outDir, silent, _options) {
  let src = fs.readFileSync(inFile, 'utf-8');
  let mapName = `${path.basename(outFile).replace(/\.js$/, '')}.map`;

  let mapDir;
  if (_options.sourceMapDir) {
    mapDir = path.join(outDir, _options.sourceMapDir);
  } else {
    mapDir = path.dirname(path.join(outDir, relativePath));
  }

  let options = defaults({}, _options.terser);
  if (options.sourceMap) {
    let filename = path.basename(inFile);
    let url = _options.sourceMapDir ? `/${path.join(_options.sourceMapDir, mapName)}` : mapName;

    let publicUrl = _options.publicUrl;
    if (publicUrl) {
      url = `${publicUrl}/${url}`;
    }

    let hiddenSourceMap = _options.hiddenSourceMap;
    if (hiddenSourceMap) {
      url = '';
    }

    let sourceMap = { filename, url };

    let content = getSourceMapContent(src, path.dirname(inFile), relativePath, silent);
    if (content) {
      sourceMap.content = content;
    }

    options = defaults(options, { sourceMap });
  }

  let start = new Date();
  debug('[starting]: %s %dKB', relativePath, (src.length / 1000));

  try {
    let result = await terser.minify(src, options);
    let end = new Date();
    let total = end - start;

    if (total > 20000 && !silent) {
      console.warn(`[WARN] (broccoli-terser-sourcemap) Minifying "${relativePath}" took: ${total}ms (more than 20,000ms)`);
    }

    debug('[finished]: %s %dKB in %dms', relativePath, (result.code.length / 1000), total);

    if (options.sourceMap) {
      let newSourceMap = JSON.parse(result.map);

      newSourceMap.sources = newSourceMap.sources.map(function(path) {
        if (path === relativePath) {
          // If out output file has the same name as one of our original
          // sources, they will shadow eachother in Dev Tools. So instead we
          // alter the reference to the upstream file.
          return path.replace(/\.js$/, '-orig.js');
        } else if (path === '0') {
          // In [terser-js](https://github.com/terser-js/terser#source-map-options),
          // sources are always 0 if old sourcemaps are not provided.
          // The value passed for `sourceMap.url` is only used to set
          // `//# sourceMappingURL=out.js.map` in `result.code`.
          // The value of `filename` is only used to set `file` attribute
          // in source map file.
          // In broccoli-terser-sourcemap we know in this case we are generating
          // sourcemap for the file we are processing, changing 0 to the actual
          // file gives us the correct source.
          return relativePath;
        }
        return path;
      });
      fs.mkdirSync(mapDir, { recursive: true });
      fs.writeFileSync(path.join(mapDir, mapName), JSON.stringify(newSourceMap));
    }
    fs.writeFileSync(outFile, result.code);
  } catch (e) {
    e.filename = relativePath;
    throw e;
  }
};
