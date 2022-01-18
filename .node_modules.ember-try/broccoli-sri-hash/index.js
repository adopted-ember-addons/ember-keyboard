var CachingWriter = require('broccoli-caching-writer');
var sriToolbox = require('sri-toolbox');
var fs = require('fs');
var crypto = require('crypto');
var symlinkOrCopy = require('symlink-or-copy').sync;
var Promise = require('rsvp').Promise; // node 0.10
var path = require('path');

var STYLE_CHECK = /\srel=["\'][^"]*stylesheet[^"]*["\']/;
var SRC_CHECK = /\ssrc=["\']([^"\']+)["\']/;
var HREF_CHECK = /\shref=["\']([^"\']+)["\']/;
var BASE_CHECK = new RegExp('<base[^>]*href=["\']([^"]*)["\'][^>]*>', 'g');
var SCRIPT_CHECK = new RegExp('<script[^>]*src=["\']([^"]*)["\'][^>]*>', 'g');
var LINT_CHECK = new RegExp('<link[^>]*href=["\']([^"]*)["\'][^>]*>', 'g');
var INTEGRITY_CHECK = new RegExp('integrity=["\']');
var CROSS_ORIGIN_CHECK = new RegExp('crossorigin=["\']([^"\']+)["\']');
var MD5_CHECK = /^(.*)[-]([a-z0-9]{32})([.].*)$/;
var mkdirp = require('mkdirp');

function SRIHashAssets(inputNodes, options) {
  if (!(this instanceof SRIHashAssets)) {
    return new SRIHashAssets(inputNodes, options);
  }

  this.options = options || {};
  this.context = this.options.context || {};
  var nodes = inputNodes;
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }

  CachingWriter.call(this, nodes, {
    // disabled to ensure all files are synced forward
    // I suspect additions to BCW are needed, or a slightly different plugin
    // to handle this more elegantly.
    // Leaving this comment here as a reminder. -sp
    //
    // cacheInclude: [
    //   /\.html$/,
    //   /\.js$/,
    //   /\.css$/
    // ]
  });

  if (!('paranoiaCheck' in this.options)) {
    this.options.paranoiaCheck = false;
  }

  if (!('fingerprintCheck' in this.options)) {
    this.options.fingerprintCheck = true;
  }

  if ('origin' in this.options) {
    if ('prefix' in this.options && !('crossorigin' in this.options)) {
      if (this.options.prefix.indexOf(this.options.origin, 0) === 0) {
        this.options.crossorigin = false;
      }
    }
  }
}

SRIHashAssets.prototype = Object.create(CachingWriter.prototype);
SRIHashAssets.prototype.constructor = SRIHashAssets;

SRIHashAssets.prototype.getBaseHREF = function getBaseHREF(string) {
  var baseTag = string.match(BASE_CHECK);
  if (baseTag && baseTag[0]) {
    var href = baseTag[0].match(HREF_CHECK);
    var relativePath = href && href[1];

    if (!relativePath) { return null; }

    // do not support `<base href="../../">`
    if (!relativePath[0] === '/') { return null; }

    return this.inputPaths[0] + relativePath;
  }

  return null;
};

SRIHashAssets.prototype.addSRI = function addSRI(string, srcDir) {
  var plugin = this;
  var base = this.getBaseHREF(string);

  return string.replace(SCRIPT_CHECK, function srcMatch(match) {

    var src = match.match(SRC_CHECK);
    var filePath;

    if (!src) {
      return match;
    }

    filePath = src[1];

    return plugin.mungeOutput(match, filePath, base || srcDir);
  }).replace(LINT_CHECK, function hrefMatch(match) {
    var href = match.match(HREF_CHECK);
    var isStyle = STYLE_CHECK.test(match);
    var filePath;

    if (!isStyle || !href) {
      return match;
    }

    filePath = href[1];

    return plugin.mungeOutput(match, filePath, base || srcDir);
  });
};

SRIHashAssets.prototype.readFile = function readFile(dirname, file) {
  var assetSource;

  try {
    assetSource = fs.readFileSync(dirname + '/' + file, 'utf8');
  } catch(e) {
    return null;
  }

  return assetSource;
};

/*
  If 'paranoiaCheck' is enabled then it will check a file only contains ASCII characters
    - will return true if paranoiaCheck is disabled
    - will return true if ASCII only
    - will return false if non ASCII chars are present
  This relates to an issue that is either within OpenSSL or Chrome itself due to an encoding issue:
   https://code.google.com/p/chromium/issues/detail?id=527286
*/
SRIHashAssets.prototype.paranoiaCheck = function paranoiaCheck(assetSource) {
  var i;
  var checkResult = true;

  if (this.options.paranoiaCheck === true) {
    for (i = 0; i < assetSource.length; i++) {
      if (assetSource.charCodeAt(i) > 127) {
        checkResult = false;
        break;
      }
    }
  }

  return checkResult;
};

SRIHashAssets.prototype.generateIntegrity = function generateIntegrity(output, file, dirname, external) {
  var assetSource = this.readFile(dirname, file);
  var selfCloseCheck = /\s*\/>$/;
  var integrity;
  var append;
  var outputWithIntegrity;

  if (assetSource === null) {
    return output;
  }

  if (this.paranoiaCheck(assetSource) === false) {
    return output;
  }


  integrity = sriToolbox.generate({
    algorithms: ['sha256', 'sha512']
  }, assetSource);

  append = ' integrity="' + integrity + '"';

  if (external && this.options.crossorigin) {
    if (!CROSS_ORIGIN_CHECK.test(output)) {
      append = append + ' crossorigin="' + this.options.crossorigin + '" ';
    }
  }

  if (selfCloseCheck.test(output)) {
    outputWithIntegrity = output.replace(selfCloseCheck, append + ' />');
  } else {
    outputWithIntegrity = output.replace(/\s*[>]$/, append + ' >');
  }
  return outputWithIntegrity;
};

SRIHashAssets.prototype.checkExternal = function checkExternal(output, file, dirname) {
  var md5Matches = file.match(MD5_CHECK);
  var md5sum = crypto.createHash('md5');
  var assetSource;
  var filePath;

  if (!('prefix' in this.options) || !('crossorigin' in this.options) || md5Matches === null) {
    return output;
  }

  filePath = file.replace(this.options.prefix, '');

  if (filePath === file) {
    return output;
  }

  assetSource = this.readFile(dirname, filePath);
  if (assetSource === null) {
    filePath = md5Matches[1].replace(this.options.prefix, '') + md5Matches[3];
    assetSource = this.readFile(dirname, filePath);
    if (assetSource === null) {
      return output;
    }
  }

  md5sum.update(assetSource, 'utf8');
  if (this.options.fingerprintCheck === false || md5Matches[2] === md5sum.digest('hex')) {
    return this.generateIntegrity(output, filePath, dirname, true);
  }
  return output;
};

SRIHashAssets.prototype.mungeOutput = function mungeOutput(output, filePath, srcDir) {
  var newOutput = output;

  if (/^https?:\/\//.test(filePath)) {
    return this.checkExternal(output, filePath, srcDir);
  }

  if (!INTEGRITY_CHECK.test(output)) {
    newOutput = this.generateIntegrity(output, filePath, srcDir);
  }

  return newOutput;
};

SRIHashAssets.prototype.processHTMLFile = function processFile(entry) {
  var srcDir = path.dirname(entry.fullPath);
  var fileContent = this.addSRI(fs.readFileSync(entry.fullPath, 'utf8'), srcDir);
  var fullPath = this.outputPath + '/' + entry.relativePath;

  mkdirp.sync(path.dirname(fullPath));

  fs.writeFileSync(fullPath, fileContent);
};

SRIHashAssets.prototype.processOtherFile = function(entry) {
  var fullPath = this.outputPath + '/' + entry.relativePath;
  mkdirp.sync(path.dirname(fullPath));
  symlinkOrCopy(entry.fullPath, fullPath);
};

SRIHashAssets.prototype.build = function () {
  var html = [];
  var other = [];

  this.listEntries().forEach(function(entry) {
    if (/\.html$/.test(entry.relativePath)) {
      html.push(entry);
    } else {
      other.push(entry);
    }
  });

  return Promise.all([
    Promise.all(html.map(this.processHTMLFile.bind(this))),
    Promise.all(other.map(this.processOtherFile.bind(this)))
  ]);
};

module.exports = SRIHashAssets;
