export const getLocation = () =>
  typeof window !== 'undefined'
    ? window.location.href.substring(window.location.origin.length)
    : (
        global as unknown as { requestLocation: string }
      ).requestLocation.toString();
