const broccoliFeatures = Object.freeze({
  persistentOutputFlag: true,
  sourceDirectories: true,
});

interface DirectoryOptions {
  annotation?: string,
  name?: string
}

interface BroccoliFeatures {
  persistentOutputFlag?: boolean,
  sourceDirectories?: boolean
}

interface BroccoliGetInfo {
  nodeType: string,
  sourceDirectory: string,
  watched: boolean,
  instantiationStack: string | undefined,
  name: string,
  annotation: string | undefined,
}

type ReadTreeCallback = (sourceDirectory: string) => void;

import * as path from 'path';

class Directory {
  _directoryPath: string;
  _watched: boolean;
  _name: string;
  _annotation: string | undefined;
  _instantiationStack: string | undefined;
  __broccoliFeatures__: BroccoliFeatures;

  constructor(directoryPath: string, watched?: boolean | string, options?: DirectoryOptions) {
    if (typeof directoryPath !== 'string') {
      throw new Error('Expected a path (string), got ' + directoryPath);
    }

    this._directoryPath = path.resolve(directoryPath);

    this._watched = !!watched;

    options = options || {};
    this._name = options.name || (this.constructor && this.constructor.name) || 'Directory';
    this._annotation = options.annotation;

    // Remember current call stack (minus "Error" line)
    let errorStack = new Error().stack;
    if (errorStack === 'string') {
      errorStack = errorStack.replace(/[^\n]*\n/, '');
    }

    this._instantiationStack = errorStack;
    this.__broccoliFeatures__ = broccoliFeatures;
  }

  __broccoliGetInfo__(builderFeatures?: BroccoliFeatures): BroccoliGetInfo {
    if (builderFeatures == null) {
      builderFeatures = { persistentOutputFlag: true, sourceDirectories: true };
    }

    if (!builderFeatures.persistentOutputFlag || !builderFeatures.sourceDirectories) {
      throw new Error(
        'Minimum builderFeatures required: { persistentOutputFlag: true, sourceDirectories: true }'
      );
    }

    return {
      nodeType: 'source',
      sourceDirectory: this._directoryPath,
      watched: this._watched,
      instantiationStack: this._instantiationStack,
      name: this._name,
      annotation: this._annotation,
    };
  }

  read(readTree: ReadTreeCallback) {
    // Go through same interface as real Broccoli builder, so we don't have
    // separate code paths

    let pluginInterface = this.__broccoliGetInfo__();

    if (pluginInterface.watched) {
      return readTree(pluginInterface.sourceDirectory);
    } else {
      return pluginInterface.sourceDirectory;
    }
  }

  cleanup() {}
}

class WatchedDir extends Directory {
  constructor(directoryPath: string, options?: DirectoryOptions) {
    super(directoryPath, true, options);
  }
};

class UnwatchedDir extends Directory {
  constructor(directoryPath: string, options?: DirectoryOptions) {
    super(directoryPath, false, options);
  }
};

export = { Directory, WatchedDir, UnwatchedDir };
