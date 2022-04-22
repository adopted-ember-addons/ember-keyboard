'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    /**
     * `ember-classic` scenario should not use `useWorkspaces`
     * as only test-app need to get classic flags.
     * Otherwise, this scenario would fail.
     */
    useWorkspaces: process.argv.every((a) => !a.includes('ember-classic')),
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            'ember-cli': '~3.8.0',
            'ember-on-modifier': '^1.0.1',
            'ember-source': '~3.8.0',
            'ember-test-selectors': '^5.5.0',
          },
        },
      },
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-cli': '~3.12.0',
            'ember-source': '~3.12.0',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.6',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.8',
          },
        },
      },
      {
        name: 'ember-4.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.0.1',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
      {
        name: 'ember-modifier-2.x',
        npm: {
          devDependencies: {
            'ember-modifier': '^2.0.0',
          },
        },
      },
      {
        name: 'ember-modifier-3.1',
        npm: {
          devDependencies: {
            'ember-modifier': '~3.1.0',
          },
        },
      },
      {
        name: 'ember-modifier-4.x',
        npm: {
          devDependencies: {
            'ember-modifier': '^4.0.0-beta.0',
          },
        },
      },
    ],
  };
};
