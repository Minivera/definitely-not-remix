import { createContext } from 'react';
import { InternalRoute, InternalRoutes } from '../types.ts';

export interface LoaderContextValue {
  loadersData: Record<string, unknown>;
  currentMatch: string;
  allRoutes: InternalRoutes;
  routesChain: InternalRoutes;
  currentRoute?: InternalRoute;

  fetchRouteData?: (route: string) => Promise<void>;
}

export const LoaderContext = createContext<LoaderContextValue | null>(null);

export interface CurrentLoaderContextValue {
  state: 'LOADED' | 'LOADING' | 'MISSING';
  data?: unknown;
  route?: InternalRoute;
}

export const CurrentLoaderContext = createContext<CurrentLoaderContextValue>({
  state: 'MISSING',
});
