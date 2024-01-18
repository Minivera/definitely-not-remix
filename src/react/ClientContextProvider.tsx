import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LoaderContext, LoaderContextValue } from './loaderContext.ts';
import {
  compileRouteURL,
  compileRouteURLFromParams,
  computeRouteChain,
  findRouteInMap,
} from './utils.ts';
import { getLocation } from './constants.ts';

const fetchAllMatchingLoaders = async (route: string) => {
  // TODO: Handle errors.
  return fetch(route, {
    method: 'GET',
    headers: {
      'X-Data-Only': 'true',
    },
  }).then(res => res.json()) as Promise<LoaderContextValue>;
};

export interface ClientContextProviderProps {
  currentLocation?: string;
}

export const ClientContextProvider: FunctionComponent<
  PropsWithChildren<ClientContextProviderProps>
> = ({ currentLocation = window.location.pathname, children }) => {
  const [contextsCache, setContextsCache] = useState<
    Record<string, unknown | undefined>
  >({});
  const [currentContext, setCurrentContext] = useState<LoaderContextValue>(
    () => ({
      ...JSON.parse(
        (window as unknown as { contextData: string }).contextData || '{}'
      ),
    })
  );
  const loadedRoutes = useRef(currentContext.routesChain);

  useEffect(() => {
    // Fill the cache on first load, this should allow us to not have to reload the current
    // set of routes when we navigate.
    setContextsCache({
      ...Object.fromEntries(
        currentContext.routesChain.map(route => {
          const finalURL = compileRouteURL(route.id);

          return [finalURL, currentContext.loadersData?.[route.id]];
        })
      ),
    });
  }, []);

  const fetchRouteData = useCallback(
    async (routeId: string) => {
      const data = await fetchAllMatchingLoaders(getLocation());
      loadedRoutes.current = data.routesChain;

      setCurrentContext(data);
      setContextsCache(cache => ({
        ...cache,
        ...Object.fromEntries(
          data.routesChain.map(route => {
            const finalURL = compileRouteURL(route.id);

            return [finalURL, data.loadersData?.[route.id]];
          })
        ),
      }));

      const finalURL = compileRouteURL(routeId);
      return {
        response: data,
        location: finalURL,
      };
    },
    [contextsCache, setCurrentContext, setContextsCache]
  );

  const setRouteToCache = useCallback(
    (routeId: string) => {
      const finalURL = compileRouteURL(routeId);

      setCurrentContext(data => ({
        ...data,
        loadersData: {
          ...data.loadersData,
          [routeId]: contextsCache[finalURL],
        },
      }));
    },
    [contextsCache, setCurrentContext, setContextsCache]
  );

  const getCachedRoute = useCallback(
    (route: string, params: Record<string, string>) => {
      try {
        const finalURL = compileRouteURLFromParams(route, params);

        if (contextsCache[finalURL]) {
          return contextsCache[finalURL];
        }

        return undefined;
      } catch {
        return undefined;
      }
    },
    [contextsCache]
  );

  const invalidateCache = useCallback(async () => {
    setCurrentContext(currentContext => ({
      ...currentContext,
      loadersData: undefined,
    }));
    setContextsCache({});

    await fetchRouteData(currentContext.leafRoute || '/');
  }, [
    setContextsCache,
    setCurrentContext,
    currentContext.leafRoute,
    fetchRouteData,
  ]);

  const currentLeafRoute = findRouteInMap(
    currentContext.allRoutes,
    currentLocation,
    currentContext.leafRoute
  );

  const routesChain = useMemo(
    () => computeRouteChain(currentContext.allRoutes, currentLeafRoute),
    [currentLeafRoute, currentContext.allRoutes]
  );

  const hasLocationChanged =
    loadedRoutes.current.map(route => route.id).join('_') !==
    routesChain.map(route => route.id).join('_');

  useEffect(() => {
    if (!currentLeafRoute) {
      return;
    }

    fetchRouteData(currentLeafRoute);
  }, [currentLeafRoute]);

  return (
    <LoaderContext.Provider
      value={{
        ...currentContext,
        // Get the current leaf route, will be undefined or different than the existing leaf route
        // whenever the location changes.
        leafRoute: currentLeafRoute,
        routesChain,
        fetchRouteData,
        setRouteToCache,
        getCachedRoute,
        invalidateCache,
        hasLocationChanged,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};
