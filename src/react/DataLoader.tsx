import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import { match } from 'path-to-regexp';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { InternalRoute } from '../types.ts';

export interface DataLoaderProps {
  route?: string;
}

export const DataLoader: FunctionComponent<
  PropsWithChildren<DataLoaderProps>
> = ({ children, route }) => {
  const serverContext = useContext(LoaderContext);

  if (!serverContext) {
    // TODO: Handle the "no context" state
    console.error(
      'No server context detected, did you forget to wrap your app in a `ClientContextProvider`?'
    );
    return null;
  }

  const { loadersData, allRoutes, routesChain, currentRoute, currentMatch } =
    serverContext;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentLocation = window.location.pathname;
    if (!match(currentMatch, { decode: decodeURIComponent })(currentLocation)) {
      // TODO: Stop the screen from flashing when the data is in the cache
      serverContext.fetchRouteData?.(window.location.toString());
    }
  }, [
    typeof window !== 'undefined' ? window.location.pathname : undefined,
    currentMatch,
    serverContext.fetchRouteData,
  ]);

  if (typeof window !== 'undefined') {
    const currentLocation = window.location.pathname;
    if (!match(currentMatch, { decode: decodeURIComponent })(currentLocation)) {
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
  }

  if (route) {
    // If we provided an explicit route, load this one and do not touch the route chain
    return (
      <CurrentLoaderContext.Provider
        value={{
          state: 'LOADED',
          data: loadersData[route],
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
        currentMatch,
        loadersData,
        routesChain,
        allRoutes,
        currentRoute: nextRoute,
      }}
    >
      <CurrentLoaderContext.Provider
        value={{
          state: 'LOADED',
          data: currentRoute ? loadersData[currentRoute.id] : undefined,
          route: currentRoute,
        }}
      >
        {children}
      </CurrentLoaderContext.Provider>
    </LoaderContext.Provider>
  );
};
