import { runInDebug } from '@ember/debug';

let platform;

export default function getPlatform(userAgent = navigator.userAgent) {
  // allow mocking of userAgent in tests, memoize for speed in production
  runInDebug(() => {
    platform = null;
  });

  if (!platform) {
    let osName = "Unknown OS";
    if (navigator.userAgent.indexOf("Win") != -1) osName = "Windows";
    if (navigator.userAgent.indexOf("Mac") != -1) osName = "Macintosh";
    if (navigator.userAgent.indexOf("Linux") != -1) osName = "Linux";
    if (navigator.userAgent.indexOf("Android") != -1) osName = "Android";
    if (navigator.userAgent.indexOf("like Mac") != -1) osName = "iOS";
    platform = osName;
  }
  return platform;
}