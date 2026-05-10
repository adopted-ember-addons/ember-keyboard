import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import { getComponentTemplate } from '@ember/component';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import { setTesting } from '@embroider/macros';
import KeyboardService from '#src/services/keyboard.js';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

function remapKeys(modules, { extractTemplates = false } = {}) {
  const result = {};
  for (const [key, mod] of Object.entries(modules)) {
    const newKey = key.replace(/^\.\.\/demo-app\//, './');
    if (extractTemplates && mod.default) {
      const tpl = getComponentTemplate(mod.default);
      if (tpl) {
        result[newKey] = { default: tpl };
        continue;
      }
    }
    result[newKey] = mod;
  }
  return result;
}

class TestApp extends EmberApp {
  modules = {
    './router': Router,
    './services/keyboard': KeyboardService,
    './config/environment': {
      default: {
        emberKeyboard: {
          listeners: [
            'keyUp',
            'keyDown',
            'keyPress',
            'click',
            'mouseDown',
            'mouseUp',
            'touchStart',
            'touchEnd',
          ],
        },
      },
    },
    ...remapKeys(
      import.meta.glob('../demo-app/components/**/*', { eager: true }),
    ),
    ...remapKeys(
      import.meta.glob('../demo-app/controllers/**/*', { eager: true }),
    ),
    ...remapKeys(import.meta.glob('../demo-app/helpers/**/*', { eager: true })),
    ...remapKeys(import.meta.glob('../demo-app/routes/**/*', { eager: true })),
    ...remapKeys(
      import.meta.glob('../demo-app/services/**/*', { eager: true }),
    ),
    ...remapKeys(
      import.meta.glob('../demo-app/templates/**/*', { eager: true }),
      { extractTemplates: true },
    ),
    ...remapKeys(
      import.meta.glob('../demo-app/custom-elements/**/*', { eager: true }),
    ),
  };
}

Router.map(function () {
  this.route('test-scenario', function () {
    this.route('mouse-down');
    this.route('touch');
    this.route('keyboard');
    this.route('on-key-helper-examples');
    this.route('on-key-modifier-examples');
  });
});

export function start() {
  setTesting(true);
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );
  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  qunitStart();
}
