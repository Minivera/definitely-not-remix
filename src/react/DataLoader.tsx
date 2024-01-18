import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { InternalRoute } from '../types.ts';
import { compileRouteURL, getRouteParams } from './utils.ts';

export interface DataLoaderProps {
  route?: string;
  shouldReload?:
    | boolean
    | ((route: string, params: Record<string, string>) => boolean);
  shouldIgnoreCache?:
    | boolean
    | ((route: string, params: Record<string, string>) => boolean);
}

export const DataLoader: FunctionComponent<
  PropsWithChildren<DataLoaderProps>
> = ({ children, route, shouldReload, shouldIgnoreCache }) => {
  const serverContext = useContext(LoaderContext);

  if (!serverContext) {
    throw new Error(
      'No server context detected, did you forget to wrap your app in a `ClientContextProvider`?'
    );
  }

  let { loadersData, allRoutes, routesChain, currentRoute, leafRoute } =
    serverContext;

  const [loading, setLoading] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(() => ({
    location: compileRouteURL(currentRoute?.id || ''),
    params: getRouteParams(currentRoute?.id || ''),
  }));

  const actualMatch = {
    location: compileRouteURL(currentRoute?.id || ''),
    params: getRouteParams(currentRoute?.id || ''),
  };

  const shouldReloadValue = useMemo(
    () =>
      !currentRoute ||
      (typeof shouldReload === 'function' &&
        shouldReload(currentRoute!.id, currentMatch.params)) ||
      (typeof shouldReload !== 'function' &&
        typeof shouldReload !== 'undefined' &&
        shouldReload),
    [currentRoute?.id, shouldReload, currentMatch]
  );

  const shouldIgnoreCacheValue = useMemo(
    () =>
      currentRoute
        ? (typeof shouldIgnoreCache === 'function' &&
            shouldIgnoreCache(currentRoute.id, currentMatch.params)) ||
          (typeof shouldIgnoreCache !== 'function' &&
            typeof shouldIgnoreCache !== 'undefined' &&
            shouldIgnoreCache)
        : true,
    [currentRoute?.id, shouldIgnoreCache, currentMatch]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !serverContext.leafRoute) {
      return;
    }

    if (shouldReloadValue && currentRoute) {
      const newMatch = {
        location: compileRouteURL(currentRoute.id),
        params: getRouteParams(currentRoute.id),
      };
      setCurrentMatch(newMatch);

      const cachedData = serverContext.getCachedRoute?.(
        currentRoute.id,
        newMatch.params
      );

      if (!shouldIgnoreCacheValue && !!cachedData) {
        serverContext.setRouteToCache?.(currentRoute.id);
        return;
      }

      setLoading(true);

      serverContext.fetchRouteData?.(serverContext.leafRoute).then(() => {
        setLoading(false);
      });
    }
  }, [
    shouldReloadValue,
    shouldIgnoreCacheValue,
    serverContext.getCachedRoute,
    serverContext.setRouteToCache,
    serverContext.fetchRouteData,
    serverContext.leafRoute,
    setLoading,
  ]);

  if (typeof window !== 'undefined') {
    // If we don't have a route at the moment, or if we have set ourselves to reload the current route.
    if (
      (shouldReloadValue || serverContext.hasLocationChanged || loading) &&
      currentRoute
    ) {
      const cachedData = serverContext.getCachedRoute?.(
        currentRoute.id,
        actualMatch.params
      );

      // Drop the cache only if we should ignore it from the user or if we don't have a cache data.
      if (shouldIgnoreCacheValue || !cachedData) {
        return (
          <CurrentLoaderContext.Provider
            value={{
              state: 'LOADING',
            }}
          >
            {children}
          </CurrentLoaderContext.Provider>
        );
      }

      // If we have some cache we're going to invalidate soon, then use it for now
      // to avoid flashing loaders.
      loadersData = {
        ...loadersData,
        [currentRoute.id]: cachedData,
      };
    }
  }

  if (route) {
    // If we provided an explicit route, load this one and do not touch the route chain
    return (
      <CurrentLoaderContext.Provider
        value={{
          state: !loadersData ? 'LOADING' : 'LOADED',
          data: loadersData?.[route],
          route: routesChain.find(route => route.id === currentRoute?.id),
        }}
      >
        {children}
      </CurrentLoaderContext.Provider>
    );
  }

  // Otherwise, get the next route and load the loader data of the current route.
  const currentRouteIndex = routesChain.findIndex(
    route => route.id === currentRoute?.id
  );
  let nextRoute: InternalRoute | undefined;
  if (currentRouteIndex >= 0 && currentRouteIndex + 1 < routesChain.length) {
    nextRoute = routesChain[currentRouteIndex + 1];
  }

  return (
    <LoaderContext.Provider
      value={{
        ...serverContext,
        leafRoute,
        loadersData,
        routesChain,
        allRoutes,
        currentRoute: nextRoute,
      }}
    >
      <CurrentLoaderContext.Provider
        value={{
          state: !loadersData ? 'LOADING' : 'LOADED',
          data: currentRoute ? loadersData?.[currentRoute.id] : undefined,
          route: currentRoute,
        }}
      >
        {children}
      </CurrentLoaderContext.Provider>
    </LoaderContext.Provider>
  );
};
