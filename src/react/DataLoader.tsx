import { FunctionComponent, PropsWithChildren, useContext } from 'react';
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
    // TODO: Write client code
    return null;
  }

  const { loadersData, allRoutes, routesChain, currentRoute, currentMatch } =
    serverContext;

  // TODO: We'll need to handle routing and check if we can't find the correct route chain for the current window
  // TODO: location.

  if (route) {
    // If we provided an explicit route, load this one and do not touch the route chain
    return (
      <CurrentLoaderContext.Provider
        value={{
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
          data: currentRoute ? loadersData[currentRoute.id] : undefined,
          route: currentRoute,
        }}
      >
        {children}
      </CurrentLoaderContext.Provider>
    </LoaderContext.Provider>
  );
};
