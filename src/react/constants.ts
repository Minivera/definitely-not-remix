export const getLocation = () =>
  typeof window !== 'undefined'
    ? window.location.pathname
    : (global as unknown as { requestURL: URL }).requestURL.pathname;

export const getURL = () =>
  typeof window !== 'undefined'
    ? new URL(window.location.toString())
    : (global as unknown as { requestURL: URL }).requestURL;
