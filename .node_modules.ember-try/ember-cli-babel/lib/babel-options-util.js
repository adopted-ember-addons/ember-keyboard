const VersionChecker = require("ember-cli-version-checker");
const resolvePackagePath = require("resolve-package-path");
const clone = require("clone");
const semver = require("semver");

const APP_BABEL_RUNTIME_VERSION = new WeakMap();

const findApp = require("./find-app");
const defaultShouldIncludeHelpers = require("./default-should-include-helpers");

/**
 * This util contains private functions required for generating babel options.
 */
function _getPresetEnv(config, project) {
  let options = config.options;

  let targets = project && project.targets;
  let presetOptions = Object.assign({}, options, {
    modules: false,
    targets,
  });

  // delete any properties added to `options.babel` that
  // are invalid for @babel/preset-env
  delete presetOptions.sourceMaps;
  delete presetOptions.plugins;
  delete presetOptions.postTransformPlugins;

  return [require.resolve("@babel/preset-env"), presetOptions];
}

function _getModulesPlugin() {
  const resolvePath = require("./relative-module-paths")
    .resolveRelativeModulePath;

  return [
    [require.resolve("babel-plugin-module-resolver"), { resolvePath }],
    [
      require.resolve("@babel/plugin-transform-modules-amd"),
      { noInterop: true },
    ],
  ];
}

function _shouldHighlightCode(parent) {
  let checker = new VersionChecker(parent).for("broccoli-middleware", "npm");
  return checker.gte("2.1.0");
}

function _getDebugMacroPlugins(config, project) {
  let addonOptions = config["ember-cli-babel"] || {};

  let disableDebugTooling = addonOptions.disableDebugTooling;
  if (disableDebugTooling) {
    return;
  }

  const isProduction = process.env.EMBER_ENV === "production";
  const isDebug = !isProduction;

  const emberDebugOptions = {
    flags: [
      {
        source: "@glimmer/env",
        flags: { DEBUG: isDebug, CI: !!process.env.CI },
      },
    ],

    debugTools: {
      isDebug,
      source: "@ember/debug",
      assertPredicateIndex: 1,
    },
  };

  const emberApplicationDeprecationsOptions = {
    // deprecated import path https://github.com/emberjs/ember.js/pull/17926#issuecomment-484987305
    externalizeHelpers: {
      global: "Ember",
    },

    debugTools: {
      isDebug,
      source: "@ember/application/deprecations",
      assertPredicateIndex: 1,
    },
  };

  let useModulesVersion;

  if (_emberVersionRequiresModulesAPIPolyfill(project)) {
    useModulesVersion = false;
  } else if (addonOptions.compileModules === false) {
    // we have to use the global form when not compiling modules, because it is often used
    // in the context of an `app.import` where there is no wrapped in an AMD module
    //
    // However, you can opt out of this behavior by explicitly specifying `disableDebugTooling`
    useModulesVersion = disableDebugTooling === false;
  } else {
    useModulesVersion = true;
  }

  if (useModulesVersion) {
    emberDebugOptions.externalizeHelpers = {
      module: "@ember/debug",
    };
    emberApplicationDeprecationsOptions.externalizeHelpers = {
      module: "@ember/application/deprecations",
    };
  } else {
    emberDebugOptions.externalizeHelpers = {
      global: "Ember",
    };
    emberApplicationDeprecationsOptions.externalizeHelpers = {
      global: "Ember",
    };
  }

  return [
    [
      require.resolve("babel-plugin-debug-macros"),
      emberDebugOptions,
      "@ember/debug stripping",
    ],
    [
      require.resolve("babel-plugin-debug-macros"),
      emberApplicationDeprecationsOptions,
      "@ember/application/deprecations stripping",
    ],
  ];
}

function _emberVersionRequiresModulesAPIPolyfill(project) {
  let checker = new VersionChecker(project).for("ember-source", "npm");
  if (!checker.exists()) {
    return true;
  }
  let result = checker.lt("3.27.0-alpha.1");

  return result;
}

function _emberDataVersionRequiresPackagesPolyfill(project) {
  let checker = new VersionChecker(project);
  let dep = checker.for("ember-data");
  let hasEmberData = dep.exists();

  if (hasEmberData) {
    if (!dep.version) {
      throw new Error("EmberData missing version");
    }
    return semver.lt(dep.version, "3.12.0-alpha.0");
  }
  return false;
}
function _getEmberModulesAPIPolyfill(config, parent, project) {
  let addonOptions = config["ember-cli-babel"] || {};

  if (addonOptions.disableEmberModulesAPIPolyfill) {
    return;
  }

  let useModulesVersion;

  if (_emberVersionRequiresModulesAPIPolyfill(project)) {
    useModulesVersion = false;
  } else if (addonOptions.compileModules === false) {
    // we have to use the global form when not compiling modules, because it is often used
    // in the context of an `app.import` where there is no wrapped in an AMD module
    //
    // However, you can opt out of this behavior by explicitly specifying `disableEmberModulesAPIPolyfill`
    useModulesVersion = addonOptions.disableEmberModulesAPIPolyfill === false;
  } else {
    useModulesVersion = true;
  }

  // we have to use the global form when not compiling modules, because it is often used
  // in the context of an `app.import` where there is no wrapped in an AMD module
  if (!useModulesVersion) {
    const ignore = _getEmberModulesAPIIgnore(parent, project);

    return [
      [require.resolve("babel-plugin-ember-modules-api-polyfill"), { ignore }],
    ];
  }
}

function _getEmberModulesAPIIgnore(parent, project) {
  const ignore = {
    "@ember/debug": ["assert", "deprecate", "warn"],
    "@ember/application/deprecations": ["deprecate"],
  };

  if (_shouldIgnoreEmberString(parent, project)) {
    ignore["@ember/string"] = [
      "fmt",
      "loc",
      "w",
      "decamelize",
      "dasherize",
      "camelize",
      "classify",
      "underscore",
      "capitalize",
      "setStrings",
      "getStrings",
      "getString",
    ];
  }

  if (_shouldIgnoreJQuery(parent, project)) {
    ignore["jquery"] = ["default"];
  }

  return ignore;
}

function _isProjectName(dependency, project) {
  return project.name && project.name() === dependency;
}

function _isTransitiveDependency(dependency, parent, project) {
  return (
    !(dependency in parent.dependencies()) &&
    !(dependency in project.dependencies())
  );
}

function _shouldIgnoreEmberString(parent, project) {
  let packageName = "@ember/string";
  if (_isProjectName(packageName, project)) {
    return true;
  }
  if (_isTransitiveDependency(packageName, parent, project)) {
    return false;
  }

  let checker = new VersionChecker(parent).for(packageName, "npm");

  return checker.exists();
}

function _shouldIgnoreJQuery(parent, project) {
  let packageName = "@ember/jquery";
  if (_isProjectName(packageName, project)) {
    return true;
  }
  if (_isTransitiveDependency(packageName, parent, project)) {
    return false;
  }

  let checker = new VersionChecker(parent).for(packageName, "npm");

  return checker.gte("0.6.0");
}

function _getEmberDataPackagesPolyfill(config, parent) {
  let addonOptions = config["ember-cli-babel"] || {};

  if (addonOptions.disableEmberDataPackagesPolyfill) {
    return;
  }
  // Don't convert ember-data itself or any @ember-data packages!
  if (
    typeof parent.name === "string" &&
    (parent.name === "ember-data" || parent.name.startsWith("@ember-data/"))
  ) {
    return;
  }

  if (_emberDataVersionRequiresPackagesPolyfill(parent)) {
    return [[require.resolve("babel-plugin-ember-data-packages-polyfill")]];
  }
}
function _getHelpersPlugin(project) {
  return [
    [
      require.resolve("@babel/plugin-transform-runtime"),
      {
        version: _getHelperVersion(project),
        regenerator: false,
        useESModules: true,
      },
    ],
  ];
}
function _getHelperVersion(project) {
  if (!APP_BABEL_RUNTIME_VERSION.has(project)) {
    let checker = new VersionChecker(project);
    APP_BABEL_RUNTIME_VERSION.set(
      project,
      checker.for("@babel/runtime", "npm").version
    );
  }

  return APP_BABEL_RUNTIME_VERSION.get(project);
}

function _buildClassFeaturePluginConstraints(constraints, config, parent, project) {
  // With versions of ember-cli-typescript < 4.0, class feature plugins like
  // @babel/plugin-proposal-class-properties were run before the TS transform.
  if (!_shouldHandleTypeScript(config, parent, project)) {
    constraints.before = constraints.before || [];
    constraints.before.push("@babel/plugin-transform-typescript");
  }

  return constraints;
}

function _addDecoratorPlugins(plugins, options, config, parent, project) {
  const { hasPlugin, addPlugin } = require("ember-cli-babel-plugin-helpers");

  if (hasPlugin(plugins, "@babel/plugin-proposal-decorators")) {
    if (parent === project) {
      project.ui.writeWarnLine(
        `${_parentName(
          parent
        )} has added the decorators plugin to its build, but ember-cli-babel provides these by default now! You can remove the transforms, or the addon that provided them, such as @ember-decorators/babel-transforms. Ember supports the stage 1 decorator spec and transforms, so if you were using stage 2, you'll need to ensure that your decorators are compatible, or convert them to stage 1.`
      );
    }
  } else {
    addPlugin(
      plugins,
      [require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }],
      _buildClassFeaturePluginConstraints(
        {
          before: ["@babel/plugin-proposal-class-properties"],
        },
        config,
        parent,
        project
      )
    );
  }

  if (hasPlugin(plugins, "@babel/plugin-proposal-class-properties")) {
    if (parent === project) {
      project.ui.writeWarnLine(
        `${_parentName(
          parent
        )} has added the class-properties plugin to its build, but ember-cli-babel provides these by default now! You can remove the transforms, or the addon that provided them, such as @ember-decorators/babel-transforms.`
      );
    }
  } else {
    addPlugin(
      plugins,
      [
        require.resolve("@babel/plugin-proposal-class-properties"),
        { loose: options.loose || false },
      ],
      _buildClassFeaturePluginConstraints(
        {
          after: ["@babel/plugin-proposal-decorators"],
        },
        config,
        parent,
        project
      )
    );
  }

  if (hasPlugin(plugins, "babel-plugin-filter-imports")) {
    let checker = new VersionChecker(parent).for(
      "babel-plugin-filter-imports",
      "npm"
    );

    if (checker.lt("3.0.0")) {
      addPlugin(
        plugins,
        require.resolve("./dedupe-internal-decorators-plugin"),
        {
          after: ["babel-plugin-filter-imports"],
        }
      );
    }
  }

  return plugins;
}

function _addTypeScriptPlugin(plugins, parent, project) {
  const { hasPlugin, addPlugin } = require("ember-cli-babel-plugin-helpers");

  if (hasPlugin(plugins, "@babel/plugin-transform-typescript")) {
    if (parent === project) {
      project.ui.writeWarnLine(
        `${_parentName(
          parent
        )} has added the TypeScript transform plugin to its build, but ember-cli-babel provides this by default now when ember-cli-typescript >= 4.0 is installed! You can remove the transform, or the addon that provided it.`
      );
    }
  } else {
    addPlugin(
      plugins,
      [
        require.resolve("@babel/plugin-transform-typescript"),
        { allowDeclareFields: true },
      ],
      {
        before: [
          "@babel/plugin-proposal-class-properties",
          "@babel/plugin-proposal-private-methods",
          "@babel/plugin-proposal-decorators",
        ],
      }
    );
  }
  return plugins;
}

function _parentName(parent) {
  let parentName;

  if (parent) {
    if (typeof parent.name === "function") {
      parentName = parent.name();
    } else {
      parentName = parent.name;
    }
  }

  return parentName;
}

function _getExtensions(config, parent, project) {
  let shouldHandleTypeScript = _shouldHandleTypeScript(config, parent, project);
  let emberCLIBabelConfig = config["ember-cli-babel"] || {};
  return (
    emberCLIBabelConfig.extensions ||
    (shouldHandleTypeScript ? ["js", "ts"] : ["js"])
  );
}

function _shouldIncludeDecoratorPlugins(config) {
  let customOptions = config["ember-cli-babel"] || {};

  return customOptions.disableDecoratorTransforms !== true;
}

/**
 * Returns whether we should handle TypeScript (based on the existence of
 * `ember-cli-typescript` as a depenency). It's worth noting that we parse
 * the `package.json` deps/devDeps directly (rather than using `addons` on
 * the parent) because it's possible for `ember-cli-typescript` not to exist
 * on the addons array, even if it is a dependency.
 *
 * Some more context:
 *
 * `ember-cli-typescript` returns a stable cache key so its possible for it to
 * be deduped as part of `ember-engines`. The reason this is important is because
 * `ember-engines` dedupe is _stateful_ so it's possible for `ember-cli-typescript`
 * to not be part of the addons array when `ember-cli-babel` is running.
 *
 * For more info on `ember-engines` dedupe logic:
 * https://github.com/ember-engines/ember-engines/blob/master/packages/ember-engines/lib/utils/deeply-non-duplicated-addon.js#L35
 *
 * @name _shouldHandleTypeScript
 * @returns {boolean}
 */
function _shouldHandleTypeScript(config, parent, project) {
  let emberCLIBabelConfig = config["ember-cli-babel"] || {};

  if (typeof emberCLIBabelConfig.enableTypeScriptTransform === "boolean") {
    return emberCLIBabelConfig.enableTypeScriptTransform;
  }

  let pkg = parent.pkg;

  if (!pkg) {
    return false;
  }

  let dependencies;

  // consider `dependencies` and `devDependencies` if the parent is the project
  // (`ember-cli` uses both in this case), otherwise only care about `dependencies`
  if (parent === project) {
    dependencies = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  } else {
    dependencies = pkg.dependencies || {};
  }

  let tsDependency = dependencies["ember-cli-typescript"];

  if (tsDependency !== undefined) {
    let tsPkgPath = resolvePackagePath("ember-cli-typescript", parent.root);

    if (tsPkgPath === null) {
      return false;
    }

    let tsPkg = require(tsPkgPath);
    return semver.gte(tsPkg.version, "4.0.0-alpha.1");
  }

  return false;
}

function _getAddonProvidedConfig(addonOptions) {
  let options = clone(addonOptions.babel || {});

  let plugins = options.plugins || [];
  let postTransformPlugins = options.postTransformPlugins || [];

  return {
    options,
    plugins,
    postTransformPlugins,
  };
}

function _shouldCompileModules(options, project) {
  let addonOptions = options["ember-cli-babel"];

  if (addonOptions && "compileModules" in addonOptions) {
    return addonOptions.compileModules;
  } else {
    return semver.gt(project.emberCLIVersion(), "2.12.0-alpha.1");
  }
}

function _getAppOptions(appInstance) {
  let app = findApp(appInstance);

  return (app && app.options) || {};
}

function _shouldIncludeHelpers(options, appInstance) {
  let parent = appInstance.parent;
  let project = appInstance.project;
  let appOptions = _getAppOptions(appInstance);
  let customOptions = appOptions["ember-cli-babel"];

  let shouldIncludeHelpers = false;

  if (!_shouldCompileModules(options, project)) {
    // we cannot use external helpers if we are not transpiling modules
    return false;
  } else if (customOptions && "includeExternalHelpers" in customOptions) {
    shouldIncludeHelpers = customOptions.includeExternalHelpers === true;
  } else {
    // Check the project to see if we should include helpers based on heuristics.
    shouldIncludeHelpers = defaultShouldIncludeHelpers(project);
  }

  let appEmberCliBabel = project.addons.find(
    (a) => a.name === "ember-cli-babel"
  );
  let appEmberCliBabelVersion =
    appEmberCliBabel && appEmberCliBabel.pkg && appEmberCliBabel.pkg.version;

  if (
    appEmberCliBabelVersion &&
    semver.gte(appEmberCliBabelVersion, "7.3.0-beta.1")
  ) {
    return shouldIncludeHelpers;
  } else if (shouldIncludeHelpers) {
    project.ui.writeWarnLine(
      `${_parentName(
        parent
      )} attempted to include external babel helpers to make your build size smaller, but your root app's ember-cli-babel version is not high enough. Please update ember-cli-babel to v7.3.0-beta.1 or later.`
    );
  }

  return false;
}

module.exports = {
  _addDecoratorPlugins,
  _addTypeScriptPlugin,
  _getAddonProvidedConfig,
  _shouldCompileModules,
  _shouldIncludeHelpers,
  _shouldHandleTypeScript,
  _shouldIncludeDecoratorPlugins,
  _getExtensions,
  _parentName,
  _getHelpersPlugin,
  _getDebugMacroPlugins,
  _getEmberModulesAPIPolyfill,
  _getEmberDataPackagesPolyfill,
  _getModulesPlugin,
  _getPresetEnv,
  _shouldHighlightCode,
};
