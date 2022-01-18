import { Context, ProcessStringResult, Strategy } from './strategy';
import Dependencies = require('../dependencies');
import assertNever from '../util/assertNever';

const DefaultStrategy: Strategy = {
  init() { },
  async processString(ctx: Context, contents: string, relativePath: string): Promise<string> {
    let output = await ctx.processString(contents, relativePath)
    let normalizedValue: ProcessStringResult;

    if (typeof output === 'string') {
      normalizedValue = { output }
    } else {
      normalizedValue = output;
    }

    let result = await ctx.postProcess(normalizedValue, relativePath);

    if (result === undefined) {
      assertNever(result, 'You must return an object from `Filter.prototype.postProcess`.');
    }

    return result.output;
  },

  /**
   * By default initial dependencies are empty.
   */
  initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string): Dependencies {
    // Dependencies start out empty and sealed as if they came from
    // the previous build iteration.
    return (new Dependencies(rootFS, inputEncoding)).seal().captureDependencyState();
  },

  /**
   * Seals the dependencies and captures the dependency state.
   * @param dependencies {Dependencies} The dependencies to seal.
   */
  sealDependencies(dependencies: Dependencies): void {
    dependencies.seal().captureDependencyState();
  }
};

export = DefaultStrategy;