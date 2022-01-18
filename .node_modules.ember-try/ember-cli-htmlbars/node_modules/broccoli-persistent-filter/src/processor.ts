import defaultProcessor = require('./strategies/default');
import { Strategy, Context, InstrumentationSchema} from './strategies/strategy';
import Dependencies = require('./dependencies');

namespace Processor {
  export interface Options {
    persist?: boolean | undefined;
  }
}
class Processor implements Strategy {
  processor: Strategy;
  persistent: boolean;
  constructor(options: Processor.Options) {
    options = options || {};
    this.processor = defaultProcessor;
    this.persistent = !!options.persist;
  }

  setStrategy(stringProcessor: Strategy) {
    this.processor = stringProcessor;
  }

  init(ctx: Context) {
    this.processor.init(ctx);
  }

  processString(ctx: Context, contents: string, relativePath: string, forceInvalidation: boolean, instrumentation: InstrumentationSchema) {
    return this.processor.processString(ctx, contents, relativePath, forceInvalidation, instrumentation);
  }

  /**
   * Create the initial dependencies.
   * @param options options is used to pass the custom fs operations implementations
   */
  initialDependencies(rootFS: Dependencies.FSFacade, inputEncoding: string) {
    return this.processor.initialDependencies(rootFS, inputEncoding);
  }

  /**
   * Seals the dependencies and captures the dependency state.
   * May cache the dependency information for the next process.
   * @param dependencies {Parameters<typeof defaultProcessor['sealDependencies']>[0]} The dependencies to seal.
   * @returns {void}
   */
  sealDependencies(dependencies: Dependencies) {
    this.processor.sealDependencies(dependencies);
  }
}

export = Processor;
