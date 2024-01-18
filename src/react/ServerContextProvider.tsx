import { FunctionComponent, PropsWithChildren } from 'react';

import { InternalRoute, InternalRoutes } from '../types.ts';

import { LoaderContext } from './loaderContext.ts';

export interface ServerContextProviderProps {
  loadersData: Record<string, unknown>;
  leafRoute: string;
  allRoutes: InternalRoutes;
  routesChain: InternalRoutes;
  currentRoute?: InternalRoute;
}

export const ServerContextProvider: FunctionComponent<
  PropsWithChildren<ServerContextProviderProps>
> = ({
  children,
  loadersData,
  leafRoute,
  currentRoute,
  routesChain,
  allRoutes,
}) => (
  <LoaderContext.Provider
    value={{
      leafRoute,
      loadersData,
      currentRoute,
      routesChain,
      allRoutes,
    }}
  >
    {children}
  </LoaderContext.Provider>
);
