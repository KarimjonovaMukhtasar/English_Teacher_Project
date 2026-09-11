/**
 * Cross-browser Fullscreen API Utility
 * Provides complete support for standard W3C Fullscreen API as well as WebKit
 * (Safari macOS / iOS / iPadOS) and legacy Gecko/MS vendor implementations.
 */

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.webkitCurrentFullScreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export async function requestFullscreenCompat(
  element: HTMLElement = document.documentElement
): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  try {
    const el = element as any;
    let promise: any;
    if (el.requestFullscreen) {
      promise = el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      promise = el.webkitRequestFullscreen();
    } else if (el.webkitRequestFullScreen) {
      promise = el.webkitRequestFullScreen();
    } else if (el.webkitEnterFullscreen) {
      promise = el.webkitEnterFullscreen();
    } else if (el.mozRequestFullScreen) {
      promise = el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      promise = el.msRequestFullscreen();
    } else {
      return false;
    }

    if (promise && typeof promise.then === 'function') {
      await promise;
    }
    return true;
  } catch (err) {
    console.warn('Fullscreen request rejected or not supported:', err);
    return false;
  }
}

export async function exitFullscreenCompat(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  try {
    const doc = document as any;
    if (!isFullscreenActive()) return true;

    let promise: any;
    if (doc.exitFullscreen) {
      promise = doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      promise = doc.webkitExitFullscreen();
    } else if (doc.webkitCancelFullScreen) {
      promise = doc.webkitCancelFullScreen();
    } else if (doc.mozCancelFullScreen) {
      promise = doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      promise = doc.msExitFullscreen();
    } else {
      return false;
    }

    if (promise && typeof promise.then === 'function') {
      await promise;
    }
    return true;
  } catch (err) {
    console.warn('Fullscreen exit error:', err);
    return false;
  }
}

export async function toggleFullscreenCompat(
  element: HTMLElement = document.documentElement
): Promise<boolean> {
  if (isFullscreenActive()) {
    return await exitFullscreenCompat();
  } else {
    return await requestFullscreenCompat(element);
  }
}

export function addFullscreenChangeListener(
  callback: (isFullscreen: boolean) => void
): () => void {
  if (typeof document === 'undefined') return () => {};

  const handler = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
    }
    callback(isFullscreenActive());
  };

  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange',
  ];

  events.forEach((evt) => {
    document.addEventListener(evt, handler);
  });

  return () => {
    events.forEach((evt) => {
      document.removeEventListener(evt, handler);
    });
  };
}
