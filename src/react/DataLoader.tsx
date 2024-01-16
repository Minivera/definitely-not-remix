import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { InternalRoute } from '../types.ts';

export interface DataLoaderProps {
  route?: string;
}

export const DataLoader: FunctionComponent<
  PropsWithChildren<DataLoaderProps>
> = ({ children, route }) => {
  const [matchedRoute, setMatchedRoute] = useState(() =>
    typeof window !== 'undefined' ? window.location.toString() : undefined
  );
  const serverContext = useContext(LoaderContext);

  if (!serverContext) {
    // TODO: Handle the "no context" state
    console.error(
      'No server context detected, did you forget to wrap your app in a `ClientContextProvider`?'
    );
    return null;
  }

  let { loadersData, allRoutes, routesChain, currentRoute, currentMatch } =
    serverContext;

  const routeMatched =
    typeof window !== 'undefined'
      ? matchedRoute === window.location.toString()
      : true;

  // TODO: Drop this whole thing in favor of asking the consumer when the loaders should update
  // TODO: and when we should rely on the cache.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!routeMatched || !currentRoute) {
      serverContext.fetchRouteData?.(window.location.toString()).then(() => {
        setMatchedRoute(window.location.toString());
      });
    }
  }, [
    routeMatched,
    currentRoute,
    serverContext.fetchRouteData,
    setMatchedRoute,
  ]);

  if (typeof window !== 'undefined') {
    if (!routeMatched) {
      const cachedData = serverContext.getCachedRoute?.(
        window.location.toString()
      );
      if (!cachedData) {
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
      loadersData = cachedData.loadersData;
      allRoutes = cachedData.allRoutes;
      routesChain = cachedData.routesChain;
      currentRoute = cachedData.currentRoute;
      currentMatch = cachedData.currentMatch;
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
        currentMatch,
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
