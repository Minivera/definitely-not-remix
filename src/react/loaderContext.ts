import { createContext } from 'react';
import { InternalRoute, InternalRoutes } from '../types.ts';

export interface LoaderContextValue {
  loadersData?: Record<string, unknown>;
  // Last route in the current route chain, which defines the current branch of the tree we're loading.
  // If undefined, it means the current route chain is invalid and should be reloaded.
  leafRoute?: string;
  allRoutes: InternalRoutes;
  routesChain: InternalRoutes;
  // Currently handled route in the route chain, used to fetch which loader data we're looking at in the React
  // tree. Whenever we render a new DataLoader, this will update to the next route in the chain.
  // Undefined when we hit the last route of the chain.
  currentRoute?: InternalRoute;
}

export interface ExtendedContextValue extends LoaderContextValue {
  fetchRouteData?: (route: string) => Promise<{
    response: LoaderContextValue;
    location: string;
  }>;
  setRouteToCache?: (route: string) => unknown | undefined;
  getCachedRoute?: (
    route: string,
    params: Record<string, string>
  ) => unknown | undefined;
  invalidateCache?: () => Promise<void>;
  hasLocationChanged?: boolean;
}

export const LoaderContext = createContext<ExtendedContextValue | null>(null);

export interface CurrentLoaderContextValue {
  state: 'LOADED' | 'LOADING' | 'MISSING';
  data?: unknown;
  route?: InternalRoute;
}

export const CurrentLoaderContext = createContext<CurrentLoaderContextValue>({
  state: 'MISSING',
});
