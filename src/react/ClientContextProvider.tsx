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
  return fetch(
    `${route}${window.location.search.length ? window.location.search : ''}`,
    {
      method: 'GET',
      headers: {
        'X-Data-Only': 'true',
      },
    }
  ).then(res => res.json()) as Promise<LoaderContextValue>;
};

/**
 * Properties of the `ClientContextProvider`.
 */
export interface ClientContextProviderProps {
  /**
   * Current location of the application if the application is using any kind of client router.
   * The provider will update all the loaded data based on the URL if this property changes when it
   * renders.
   */
  currentLocation?: string;
}

/**
 * Provider to add the loader context to the application. This provider is required to use the `DataLoader`
 * functionality and any of the hooks. You can omit it if you're building an application without any server
 * data backing it up.
 *
 * The provider is not route-aware and will not update the loaded data based on the current URL or history stack.
 * The `currentLocation` prop must be used to provide the provider with the current location if you're writing a router
 * powered application, such as one using React-Router or Wouter. Make sure to render the provider as a children of
 * your router for it to receive updates when the route changes.
 */
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
    if (!currentLeafRoute || !hasLocationChanged) {
      return;
    }

    fetchRouteData(currentLeafRoute);
  }, [currentLeafRoute, hasLocationChanged]);

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
