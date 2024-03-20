import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { InternalRoute } from '../types.ts';
import { compileRouteURL, getRouteParams } from './utils.ts';

/**
 * The properties accepted by the `DataLoader` component.
 */
export interface DataLoaderProps {
  /**
   * Optional prop to overwrite the loaded route to any route in the current branch.
   *
   * It is recommended to use the  `useRouteLoaderData` first if you only need access to the data in a single location
   * as it has the same capabilities. This will change the current route segment for all children `DataLoaders`, which
   * allows you to start chaining again, see the example.
   *
   * @example
   * // Given this router
   * const router = frameworkRouter([
   *   {
   *     route: '/users',
   *     render: Parent,
   *     children: [
   *       {
   *         route: '/:userId',
   *         render: ComponentWithData,
   *       },
   *     ],
   *   },
   * ]);
   *
   * const Parent = () => (
   *   // This loads the `/users` branch segment's data
   *   <DataLoader><ComponentWithData /></DataLoader>
   * );
   *
   * const ComponentWithData = () => (
   *   // This loads the `/users/:userID` branch segment's data
   *   <DataLoader><Child /></DataLoader>
   * );
   *
   * const Child = () => (
   *   // This loads the `/users` branch segment's data and sets it as the current node in the branch
   *   <DataLoader route="/users"><Other /></DataLoader>
   * );
   *
   * const Child = () => (
   *   // This loads the `/users/:userID` branch segment's data, again
   *   <DataLoader route="/users"><Other /></DataLoader>
   * );
   */
  route?: string;

  /**
   * Function or boolean that will be checked on every update of the `DataLoader`. If this is true on an update,
   * the loader will request an update to its stored data from the `ClientContextProvider` and start the loading
   * process. By default, if the requested data is cached, it will display the cached data as it loads.
   */
  shouldReload?:
    | boolean
    | ((route: string, params: Record<string, string>) => boolean);

  /**
   * Function or boolean that will be checked whenever the component is loading, and we detect that we have data cached,
   * to see if we should use the cache we've found. If it returns true, the cache will be ignored and the data will be
   * loaded as normal.
   */
  shouldIgnoreCache?:
    | boolean
    | ((route: string, params: Record<string, string>) => boolean);
}

/**
 * The DataLoader component will prepare the loader data for all children of the React tree to make it available to
 * hooks called in children components. Loader data is accessed using the route chain provided by the server for the
 * current location.
 *
 * For example, this router:
 *
 * ```
 * const router = frameworkRouter([
 *   {
 *     route: '/',
 *     children: [
 *       {
 *         route: '/users',
 *         children: [
 *           {
 *             route: '/:userId',
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * ]);
 * ```
 *
 * If the user opens the route `/`, the loader chain, or branch, would only consist of the route `{ route: '/' }`. In
 * this case, the first DataLoader component encountered would load the data from the loader of route `/` and any
 * subsequent data loader will load nothing as we've reached the end of the branch.
 *
 * If the user instead opens the route `/users/:userId`, then the branch would be an array of:
 * `[{ route: '/' }, { route: '/users' }, { route: '/users/:userId' }]`
 *
 * We could define a tree of DataLoader in the React application to load the loader data of each route in the chain,
 * like this:
 *
 * ```
 * <DataLoader> // Loads `/`
 *   <ComponentConsumingData>
 *     <DataLoader> // Loads `/users`
 *       <ComponentConsumingMoreData>
 *          {...}
 *       </ComponentConsumingMoreData>
 *     </DataLoader>
 *   </ComponentConsumingData>
 * </DataLoader>
 * ```
 */
export const DataLoader: FunctionComponent<
  PropsWithChildren<DataLoaderProps>
> = ({ children, route, shouldReload, shouldIgnoreCache }) => {
  const serverContext = useContext(LoaderContext);

  if (!serverContext) {
    throw new Error(
      'No server context detected, did you forget to wrap your app in a `ClientContextProvider`?'
    );
  }

  let { loadersData, allRoutes, routesChain, currentRoute, leafRoute } =
    serverContext;

  const [loading, setLoading] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(() => ({
    location: compileRouteURL(currentRoute?.id || ''),
    params: getRouteParams(currentRoute?.id || ''),
  }));

  const actualMatch = {
    location: compileRouteURL(currentRoute?.id || ''),
    params: getRouteParams(currentRoute?.id || ''),
  };

  const shouldReloadValue = useMemo(
    () =>
      !currentRoute ||
      (typeof shouldReload === 'function' &&
        shouldReload(currentRoute!.id, currentMatch.params)) ||
      (typeof shouldReload !== 'function' &&
        typeof shouldReload !== 'undefined' &&
        shouldReload),
    [currentRoute?.id, shouldReload, currentMatch]
  );

  const shouldIgnoreCacheValue = useMemo(
    () =>
      currentRoute
        ? (typeof shouldIgnoreCache === 'function' &&
            shouldIgnoreCache(currentRoute.id, currentMatch.params)) ||
          (typeof shouldIgnoreCache !== 'function' &&
            typeof shouldIgnoreCache !== 'undefined' &&
            shouldIgnoreCache)
        : true,
    [currentRoute?.id, shouldIgnoreCache, currentMatch]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !serverContext.leafRoute) {
      return;
    }

    if (shouldReloadValue && currentRoute) {
      const newMatch = {
        location: compileRouteURL(currentRoute.id),
        params: getRouteParams(currentRoute.id),
      };
      setCurrentMatch(newMatch);

      const cachedData = serverContext.getCachedRoute?.(
        currentRoute.id,
        newMatch.params
      );

      if (!shouldIgnoreCacheValue && !!cachedData) {
        serverContext.setRouteToCache?.(currentRoute.id);
        return;
      }

      setLoading(true);

      serverContext.fetchRouteData?.(serverContext.leafRoute).then(() => {
        setLoading(false);
      });
    }
  }, [
    shouldReloadValue,
    shouldIgnoreCacheValue,
    serverContext.getCachedRoute,
    serverContext.setRouteToCache,
    serverContext.fetchRouteData,
    serverContext.leafRoute,
    setLoading,
  ]);

  if (typeof window !== 'undefined') {
    // If we don't have a route at the moment, or if we have set ourselves to reload the current route.
    if (
      (shouldReloadValue || serverContext.hasLocationChanged || loading) &&
      currentRoute
    ) {
      const cachedData = serverContext.getCachedRoute?.(
        currentRoute.id,
        actualMatch.params
      );

      // Drop the cache only if we should ignore it from the user or if we don't have a cache data.
      if (shouldIgnoreCacheValue || !cachedData) {
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
      loadersData = {
        ...loadersData,
        [currentRoute.id]: cachedData,
      };
    }
  }

  if (route) {
    // If we provided an explicit route, load this one and move the route chain
    currentRoute = routesChain.find(route => route.id === currentRoute?.id);
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
        leafRoute,
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
