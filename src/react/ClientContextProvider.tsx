import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';

import { LoaderContext, LoaderContextValue } from './loaderContext.ts';

const fetchAllMatchingLoaders = async (route: string) => {
  // TODO: Handle errors.
  return fetch(route, {
    method: 'GET',
    headers: {
      'X-Data-Only': 'true',
    },
  }).then(res => res.json());
};

export const ClientContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [contextsCache, setContextsCache] = useState<
    Record<string, LoaderContextValue>
  >(() => ({
    [window.location.toString()]: JSON.parse(
      (window as unknown as { contextData: string }).contextData || '{}'
    ),
  }));
  const [currentContext, setCurrentContext] = useState<LoaderContextValue>(
    () => ({
      ...JSON.parse(
        (window as unknown as { contextData: string }).contextData || '{}'
      ),
      matchedRoute: window.location.toString(),
    })
  );

  const fetchRouteData = useCallback(
    async (route: string) => {
      if (contextsCache[route]) {
        setCurrentContext(contextsCache[route]);
        return;
      }

      const data = await fetchAllMatchingLoaders(route);
      setCurrentContext(data);
      setContextsCache(cache => ({
        ...cache,
        [route]: data,
      }));
    },
    [contextsCache, setCurrentContext, setContextsCache]
  );

  const getCachedRoute = useCallback(
    (route: string) => {
      if (contextsCache[route]) {
        return contextsCache[route];
      }

      return undefined;
    },
    [contextsCache]
  );

  const invalidateCache = useCallback(async () => {
    setCurrentContext(currentContext => ({
      ...currentContext,
      loadersData: undefined,
    }));
    setContextsCache({});

    const data = await fetchAllMatchingLoaders(window.location.toString());
    setCurrentContext(data);
    setContextsCache(cache => ({
      ...cache,
      [window.location.toString()]: data,
    }));
  }, [setContextsCache, setCurrentContext, window.location, fetchRouteData]);

  return (
    <LoaderContext.Provider
      value={{
        ...currentContext,
        fetchRouteData,
        getCachedRoute,
        invalidateCache,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
