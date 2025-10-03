function getCmdKey (platform) {
  if (typeof FastBoot === 'undefined') {
    if (platform === undefined) {
      platform = navigator.platform;
    }
    if (platform.indexOf('Mac') > -1) {
      return 'meta';
    } else {
      return 'ctrl';
    }
  }
}

export { getCmdKey as default };
