import { compile, match } from 'path-to-regexp';

import { InternalRoutes } from '../types.ts';

import { getLocation } from './constants.ts';

export const getRouteParams = (
  routeId: string,
  location?: string
): Record<string, string> => {
  if (!getLocation() && !location) {
    return {};
  }

  const matchedRoute = match(routeId, {
    decode: decodeURIComponent,
  })(location || getLocation());

  return matchedRoute ? (matchedRoute.params as Record<string, string>) : {};
};

export const checkRouteMatch = (routeId: string, location: string) => {
  const matchedRoute = match(routeId, {
    decode: decodeURIComponent,
  })(location);

  return !!matchedRoute;
};

export const findRouteInMap = (
  allRoutes: InternalRoutes,
  location: string,
  leafRoute?: string
): string | undefined => {
  if (leafRoute && checkRouteMatch(leafRoute, location)) {
    return leafRoute;
  }

  for (const route of allRoutes) {
    if (checkRouteMatch(route.id, location)) {
      return route.id;
    }

    const found = findRouteInMap(route.children || [], location, leafRoute);
    if (found) {
      return found;
    }
  }

  return undefined;
};

const computeRouteChainRecursive = (
  allRoutes: InternalRoutes,
  leafRoute: string,
  parents: InternalRoutes
): InternalRoutes | undefined => {
  for (const route of allRoutes) {
    if (leafRoute === route.id) {
      return parents.concat(route);
    }

    const found = computeRouteChainRecursive(
      route.children || [],
      leafRoute,
      parents.concat(route)
    );
    if (found) {
      return found;
    }
  }

  return undefined;
};

export const computeRouteChain = (
  allRoutes: InternalRoutes,
  leafRoute?: string
): InternalRoutes => {
  if (!leafRoute) {
    return [];
  }

  return computeRouteChainRecursive(allRoutes, leafRoute, []) || [];
};

export const isRouteInChain = (
  routeChain: InternalRoutes,
  routeId?: string
): boolean => routeChain.some(route => route.id === routeId);

export const compileRouteURLFromParams = (
  routeId: string,
  params: Record<string, string>
) => {
  const compiledRoute = compile(routeId, {
    encode: encodeURIComponent,
  });

  return compiledRoute(params);
};

export const compileRouteURL = (routeId: string) => {
  const routeParams = getRouteParams(routeId);

  return compileRouteURLFromParams(routeId, routeParams);
};
