import { createContext } from 'react';
import { InternalRoute, InternalRoutes } from '../types.ts';

export interface LoaderContextValue {
  loadersData: Record<string, unknown>;
  currentMatch: string;
  allRoutes: InternalRoutes;
  routesChain: InternalRoutes;
  currentRoute?: InternalRoute;
}

export const LoaderContext = createContext<LoaderContextValue | null>(null);

export interface CurrentLoaderContextValue {
  data?: unknown;
  route?: InternalRoute;
}

export const CurrentLoaderContext = createContext<CurrentLoaderContextValue>(
  {}
);
