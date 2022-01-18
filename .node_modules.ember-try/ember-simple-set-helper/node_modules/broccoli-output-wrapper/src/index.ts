import * as fs from 'fs';
import { isAbsolute, resolve } from 'path';
import { readFileSync, existsSync, readdirSync, lstatSync, statSync, writeFileSync, appendFileSync, rmdirSync, mkdirSync } from 'fs';

const logger = require('heimdalljs-logger')('broccoli:outputWrapper');

const WHITELISTEDOPERATION = new Set([
  'readFileSync',
  'existsSync',
  'lstatSync',
  'readdirSync',
  'statSync',
  'writeFileSync',
  'appendFileSync',
  'rmdirSync',
  'mkdirSync'
]);

function handleFs(target: any, propertyName: string, node: any, relativePath: string, ...fsArguments: Array<string>) {
  if (isAbsolute(relativePath)) {
    throw new Error(`Relative path is expected, path ${relativePath} is an absolute path.`);
  }
  let outputPath = resolve(node.outputPath + '/' + relativePath);
  if (!outputPath.includes(node.outputPath)) {
    throw new Error(`Traversing above the outputPath is not allowed. Relative path ${relativePath} traverses beyond ${node.outputPath}`);
  }
  if(WHITELISTEDOPERATION.has(propertyName)) {
    logger.debug(`[operation:${propertyName}] at ${outputPath}`);
    return target[propertyName](outputPath, ...fsArguments);
  } else {
    throw new Error(`Operation ${propertyName} is not allowed to use. Allowed operations are ${Array.from(WHITELISTEDOPERATION).toString()}`);
  }
}

function outputWrapper (node: any): outputWrapper.FSOutput {
  return new Proxy(fs, {
    get(target: any, propertyName: string): any {
      return handleFs.bind(this, target, propertyName, node);
    }
  });
}
export = outputWrapper;

namespace outputWrapper {
  export interface FSOutput {
    readFileSync: typeof readFileSync,
    existsSync: typeof existsSync,
    lstatSync: typeof lstatSync,
    readdirSync: typeof readdirSync,
    statSync: typeof statSync,
    writeFileSync: typeof writeFileSync,
    appendFileSync: typeof appendFileSync,
    rmdirSync: typeof rmdirSync,
    mkdirSync: typeof mkdirSync
  }
}