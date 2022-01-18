/* globals Ember */
/* eslint-disable ember/new-module-imports */

import { assert, deprecate } from '@ember/debug';

(() => {
  'use strict';

  // Ember < 3.13 had the export typoed, this ensures both the correct location
  // and the typoed location work properly
  Ember._modifierManagerCapabilties = Ember._modifierManagerCapabilities = function(managerAPI) {
    if (!managerAPI) {
      managerAPI = '3.13';

      deprecate(
        'Modifier manager capabilities now require you to pass a valid version when being generated. Valid versions include: 3.13',
        false,
        {
          until: '3.17.0',
          id: 'implicit-modifier-manager-capabilities',
        }
      );
    }

    assert('Invalid modifier manager compatibility specified', managerAPI === '3.13');

    // Ember 3.13 added a feature for disabling auto-tracking, but it is
    // impossible to polyfill the `false` version of that
    return {};
  };
})();
