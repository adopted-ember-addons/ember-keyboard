"use strict";

import fs = require('fs-extra');
import path = require('path');
import nodefs = require('fs');
const broccoliNodeInfo = require('broccoli-node-info');
import {
  InputNode
} from 'broccoli-node-api';

import {
  readFileSync,
  existsSync,
  lstatSync,
  statSync,
  readdirSync,
  readdir
} from 'fs';

import { entries, Options, Entry } from 'walk-sync';

const WHITELISTEDOPERATION = new Set([
  'readFileSync',
  'existsSync',
  'lstatSync',
  'statSync',
  'readdirSync',
  'readdir',
  'readFileMeta',
  'entries',
  'at',
  'relativePathTo'
]);

function getRootAndPrefix(node: any): FSMerger.FSMergerObject {
  let root = '';
  let prefix = '';
  let getDestinationPath = undefined;
  if (typeof node == 'string') {
    root = node;
  } else if(node.root) {
    root = node.root;
  } else {
    let { nodeType, sourceDirectory } = broccoliNodeInfo.getNodeInfo(node);
    root = nodeType == 'source' ? sourceDirectory : node.outputPath;
  }
  root = path.normalize(root);
  return {
    root,
    absRootWithSep: path.resolve(root) + path.sep,
    prefix: node.prefix || prefix,
    getDestinationPath: node.getDestinationPath || getDestinationPath
  }
}

function getValues(object: {[key:string]: any}) {
  if (Object.values) {
    return Object.values(object);
  } else {
    return Object.keys(object).map(function(key) {
      return object[key];
    });
  }
}

function handleOperation(this: FSMerger & {[key: string]: any}, { target, propertyName }: {
    target: {[key: string]: any};
    propertyName: string;
  }, relativePath: string, ...fsArguments: any[]) {
  if (!this.MAP) {
    this._generateMap();
  }
  let fullPath = relativePath
  let byPassAbsPathCheck = false;
  switch (propertyName) {
    case 'relativePathTo':
    case 'at':
      byPassAbsPathCheck = true;
      break;

    case 'entries':
      if (!relativePath) {
        byPassAbsPathCheck = true;
      }
      break;
  }

  if (byPassAbsPathCheck || !path.isAbsolute(relativePath)) {
    // if property is present in the FSMerge do not hijack it with fs operations
    if (this[propertyName]) {
      return this[propertyName](relativePath, ...fsArguments);
    }
    let { _dirList } = this;
    for (let i=_dirList.length-1; i > -1; i--) {
      let { root } = this.PREFIXINDEXMAP[i];
      let tempPath = root + '/' + relativePath;
      if(fs.existsSync(tempPath)) {
        fullPath = tempPath;
      }
    }
  }
  return target[propertyName](fullPath, ...fsArguments);
}

class FSMerger {
  _dirList: FSMerger.Node[];
  MAP: { [key: string]: FSMerger.FSMergerObject } | null;
  PREFIXINDEXMAP: { [key: number]: FSMerger.FSMergerObject };
  LIST: FSMerger.FSMergerObject[];
  _atList: FSMerger[];
  fs: FSMerger.FS

  constructor(trees: FSMerger.Node[] | FSMerger.Node) {
    this._dirList = Array.isArray(trees) ? trees : [trees];
    this.MAP = null;
    this.PREFIXINDEXMAP = {};
    this.LIST = [];
    this._atList = [];
    let self: FSMerger & {[key: string]: any} = this;
    this.fs = <any>new Proxy(nodefs, {
      get(target, propertyName: string) {
        if(WHITELISTEDOPERATION.has(propertyName)) {
          return handleOperation.bind(self, {target, propertyName})
        } else {
          throw new Error(`Operation ${propertyName} is not allowed with FSMerger.fs. Allowed operations are ${Array.from(WHITELISTEDOPERATION).toString()}`);
        }
      }
    });
  }

  readFileSync(filePath:string, options?: { encoding?: string | null; flag?: string; } | string | null): FSMerger.FileContent | undefined {
    if (!this.MAP) {
      this._generateMap();
    }
    let { _dirList } = this;
    for (let i=_dirList.length-1; i > -1; i--) {
      let { root } = this.PREFIXINDEXMAP[i];
      let fullPath = root + '/' + filePath;
      if(fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, options);
      }
    }
    return fs.readFileSync(filePath, options);
  }

  at(index: number): FSMerger {
    if(!this._atList[index]) {
      this._atList[index] = new FSMerger(this._dirList[index]);
    }
    return this._atList[index]
  }

  /**
   * Given an absolute path, returns a relative path suitable for using with the
   * other methods in this FSMerger. Does not emit paths starting with `../`;
   * paths outside this merged FS are instead returned as `null`.
   *
   * Note: If this FSMerger has a path that is inside another path, the first
   * one that contains the path will be used.
   *
   * Note 2: This method does not check whether the absolute path exists.
   *
   * @param absolutePath An absolute path to make relative.
   * @returns null if the path is not within any filesystem tree.
   */
  relativePathTo(absolutePath: string): { relativePath: string, at: number } | null {
    if (!path.isAbsolute(absolutePath)) {
      throw new Error(`relativePathTo expects an absolute path: ${absolutePath}`);
    }
    if (!this.MAP) {
      this._generateMap();
    }
    absolutePath = path.normalize(absolutePath);
    for (let i = 0; i < this.LIST.length; i++) {
      if (absolutePath.startsWith(this.LIST[i].absRootWithSep)) {
        return {
          relativePath: path.relative(this.LIST[i].absRootWithSep, absolutePath),
          at: i,
        }
      }
    }
    return null;
  }

  _generateMap(): void {
    this.MAP = this._dirList.reduce((map:{ [key: string]: FSMerger.FSMergerObject }, tree: FSMerger.Node, index: number) => {
      let parsedTree: FSMerger.FSMergerObject = getRootAndPrefix(tree);
      this.LIST.push(parsedTree);
      map[parsedTree.root] = parsedTree;
      this.PREFIXINDEXMAP[index] = parsedTree;
      return map;
    }, {});
  }

  readFileMeta (filePath: string, options?: FSMerger.FileMetaOption): FSMerger.FileMeta | undefined {
    if (!this.MAP) {
      this._generateMap();
    }
    let { _dirList } = this;
    let { basePath = '' } = options || {};
    basePath = basePath && path.normalize(basePath);
    if (this.MAP && this.MAP[basePath]) {
      let { root, prefix, getDestinationPath } = this.MAP[basePath];
      return {
        path: path.join(root, filePath),
        prefix: prefix,
        getDestinationPath: getDestinationPath
      }
    }
    for (let i=_dirList.length-1; i > -1; i--) {
      let { root, prefix, getDestinationPath } = this.PREFIXINDEXMAP[i];
      let fullPath = path.join(root, filePath);
      if (basePath == root || fs.existsSync(fullPath)) {
        return {
          path: fullPath,
          prefix: prefix,
          getDestinationPath: getDestinationPath
        };
      }
    }
  }

  readdirSync(dirPath: string, options?: { encoding?: string | null; withFileTypes?: false } | string | null): string[] | Buffer[] {
    if (!this.MAP) {
      this._generateMap();
    }
    let { _dirList } = this;
    let result = new Set<string>();
    let errorCount = 0;
    let fullDirPath = '';
    for (let i=0; i < _dirList.length; i++) {
      let { root } = this.PREFIXINDEXMAP[i];
      fullDirPath = root + '/' + dirPath;
      fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
      if(fs.existsSync(fullDirPath)) {
        for (let entry of fs.readdirSync(fullDirPath, options)) {
          result.add(<any>entry);
        }
      } else {
        errorCount += 1;
      }
    }
    if (errorCount == _dirList.length) {
      fs.readdirSync(fullDirPath);
    }
    return [...result];
  }

  readdir(dirPath: string,
    options: { encoding?: string | null; withFileTypes?: false } | string | undefined | null,
    callback: (err: NodeJS.ErrnoException | null, files?: string[] | Buffer[]) => void): void
  {
    if (!this.MAP) {
      this._generateMap();
    }

    if (typeof options === 'function') {
      callback = options;
      options = 'utf-8';
    }
    let result = new Set<string>();
    let { _dirList } = this;
    let fullDirPath = '';
    let existingPath = [];
    for (let i=0; i < _dirList.length; i++) {
      let { root } = this.PREFIXINDEXMAP[i];
      fullDirPath = root + '/' + dirPath;
      fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
      if(fs.existsSync(fullDirPath)) {
        existingPath.push(fullDirPath);
      }
    }
    if (!existingPath.length) {
      nodefs.readdir(fullDirPath, options, callback);
    }
    let readComplete = 0;
    for (let i = 0; i < existingPath.length; i++) {
      nodefs.readdir(existingPath[i], <any>options, (err: NodeJS.ErrnoException | null , list: string[]) => {
        readComplete += 1;
        if (list) {
          for (let r of list) {
            result.add(r);
          }
        }
        if (readComplete == existingPath.length || err) {
          if (err) {
            callback(err);
          } else {
            callback(null, [...result]);
          }
        }
      });
    }
  }

  entries(dirPath: string = '', options?: Options): Entry[] {
    if (!this.MAP) {
      this._generateMap();
    }
    let { _dirList } = this;
    let result: Entry[] = [], errorCount = 0;
    let hashStore = {};
    for (let i=0; i < _dirList.length; i++) {
      let { root, prefix, getDestinationPath } = this.PREFIXINDEXMAP[i];
      if (!root) {
        throw new Error('FSMerger must be instatiated with string or BroccoliNode or Object with root');
      }
      let fullDirPath = dirPath ? root + '/' + dirPath : root;
      fullDirPath = fullDirPath.replace(/(\/|\/\/)$/, '');
      if(fs.existsSync(fullDirPath)) {
        let curEntryList = entries(fullDirPath, options);
        hashStore = curEntryList.reduce((hashStoreAccumulated: {[key: string]: Entry}, entry: Entry) => {
          let relativePath:string = getDestinationPath ? getDestinationPath(entry.relativePath) : entry.relativePath;
          relativePath = prefix ? path.join(prefix, relativePath) : relativePath;
          hashStoreAccumulated[relativePath] = entry;
          return hashStoreAccumulated;
        }, hashStore);
      } else {
        errorCount++;
      }
    }

    if (errorCount === _dirList.length) {
      return entries(dirPath);
    }
    result = getValues(hashStore);
    result.sort((entryA, entryB) => (entryA.relativePath > entryB.relativePath) ? 1 : -1);
    return result;
  }
}

export = FSMerger;
namespace FSMerger {

  export type FS =
    Pick<typeof nodefs, 'readFileSync' | 'readdirSync' | 'readdir' | 'existsSync' | 'lstatSync' | 'statSync'>
    & Pick<FSMerger, 'at' | 'readFileMeta' | 'entries' | 'relativePathTo'>;

  export type FSMergerObject = {
    root: string;
    absRootWithSep: string;
    prefix: string | undefined;
    getDestinationPath: Function | undefined
  }

  export type FileContent = string | Buffer | null;

  export type FileMeta = {
    path: string;
    prefix: string | undefined;
    getDestinationPath: Function | undefined
  }

  export type FileMetaOption = {
    basePath: string
  }
  export type Node = FSMergerObject | InputNode;

}