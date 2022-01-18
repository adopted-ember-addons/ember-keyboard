'use strict';
const semver = require('semver');

function discoverAddons(addon, testWaiterAddons) {
  let testWaiterAddon = addon.addons.find(addon => addon.name === 'ember-test-waiters');

  if (testWaiterAddon) {
    testWaiterAddons.push(testWaiterAddon);
  }

  addon.addons.forEach(addon => discoverAddons(addon, testWaiterAddons));

  return testWaiterAddons;
}

function findLatestVersion(addons) {
  let latestVersion = addons[0];

  addons.forEach(addon => {
    if (semver.gt(addon.pkg.version, latestVersion.pkg.version)) {
      latestVersion = addon;
    }
  });

  return latestVersion;
}

function forceHighlander(project) {
  let testWaiterAddons = discoverAddons(project, []);
  let latestVersion = findLatestVersion(testWaiterAddons);
  let noop = () => {};

  return testWaiterAddons
    .map(addon => {
      if (addon === latestVersion) {
        return;
      }

      addon.treeFor = noop;
      addon.included = noop;

      return addon;
    })
    .filter(Boolean);
}

module.exports = {
  discoverAddons,
  findLatestVersion,
  forceHighlander,
};
