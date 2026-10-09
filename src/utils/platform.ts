import { runInDebug } from '@ember/debug';

export type Platform =
  | 'Windows'
  | 'Macintosh'
  | 'Linux'
  | 'Android'
  | 'iOS'
  | 'Unknown OS';

let platform: Platform | null | undefined;

export default function getPlatform(
  userAgent: string = navigator.userAgent,
): Platform {
  // allow mocking of userAgent in tests, memoize for speed in production
  runInDebug(() => {
    platform = null;
  });

  if (!platform) {
    let osName: Platform = 'Unknown OS';
    if (userAgent.indexOf('Win') != -1) osName = 'Windows';
    if (userAgent.indexOf('Mac') != -1) osName = 'Macintosh';
    if (userAgent.indexOf('Linux') != -1) osName = 'Linux';
    if (userAgent.indexOf('Android') != -1) osName = 'Android';
    if (userAgent.indexOf('like Mac') != -1) osName = 'iOS';
    platform = osName;
  }
  return platform;
}
