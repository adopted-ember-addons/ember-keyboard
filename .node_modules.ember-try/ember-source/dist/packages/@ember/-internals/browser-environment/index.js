// check if window exists and actually is the global
var hasDom = typeof self === 'object' && self !== null && self.Object === Object && typeof Window !== 'undefined' && self.constructor === Window && typeof document === 'object' && document !== null && self.document === document && typeof location === 'object' && location !== null && self.location === location && typeof history === 'object' && history !== null && self.history === history && typeof navigator === 'object' && navigator !== null && self.navigator === navigator && typeof navigator.userAgent === 'string';

const window = hasDom ? self : null;
const location$1 = hasDom ? self.location : null;
const history$1 = hasDom ? self.history : null;
const userAgent = hasDom ? self.navigator.userAgent : 'Lynx (textmode)';
const isChrome = hasDom ? Boolean(window.chrome) && !window.opera : false;
const isFirefox = hasDom ? typeof InstallTrigger !== 'undefined' : false;

export { window, location$1 as location, history$1 as history, userAgent, isChrome, isFirefox, hasDom as hasDOM };
