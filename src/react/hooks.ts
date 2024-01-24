import { useCallback, useContext, useMemo } from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { compileRouteURL } from './utils.ts';

import { LoaderFunction, LoaderReturnValue } from '../types.ts';
import { getURL } from './constants.ts';

/**
 * Returns if the nearest `DataLoader` is currently loading some data from the server. Will return true only if that
 * loader, or any of its parents, are loading. Any children loading data will not affect this hook.
 *
 * @example
 * const Parent = () => (
 *   // This renders for the route `/users/:userId`
 *   <DataLoader>
 *     <Child />
 *   </DataLoader>
 * );
 *
 * const Child = () => {
 *   // This will return true if the `Parent` loader ends up reloading.
 *   const data = useIsLoading();
 *
 *   return (...);
 * };
 */
export const useIsLoading = () => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.state !== 'LOADED';
};

/**
 * Returns a memoized function that will fully invalidate the cache and loaders, leading to a complete reload of the
 * application's data layer. Use after completing a data mutation that requires cleaning the data layer.
 */
export const useInvalidate = () => {
  const loaderContext = useContext(LoaderContext);

  return useCallback(loaderContext?.invalidateCache || (() => {}), [
    loaderContext?.invalidateCache,
  ]);
};

/**
 * Returns the loaded data for the current route in the branch. This will look at the nearest `DataLoader` component
 * and fetch the data loaded from that loader.
 *
 * @example
 * const Parent = () => (
 *   // This renders for the route `/users/:userId`
 *   <DataLoader>
 *     <Child />
 *   </DataLoader>
 * );
 *
 * const Child = () => {
 *   // This will get the data for the `/users/:userId` route's loader
 *   const data = useLoaderData();
 *
 *   return (...);
 * };
 */
export const useLoaderData = <T extends LoaderFunction = LoaderFunction>() => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.data as NonNullable<LoaderReturnValue<T>>;
};

/**
 * Returns the loaded data for a specific route defined in the server router. Use this if you want to load data
 * outside the normal loader tree.
 *
 * @example
 * const Parent = () => (
 *   // This renders for the route `/users/:userId`
 *   <DataLoader>
 *     <Child />
 *   </DataLoader>
 * );
 *
 * const Child = () => {
 *   // This will get the data for the `/users` route even if the nearest `DataLoader` has changed our current position
 *   // in the branch to `/users/:userId`
 *   const data = useRouteLoaderData('/users');
 *
 *   return (...);
 * };
 */
export const useRouteLoaderData = <T extends LoaderFunction = LoaderFunction>(
  route: string
) => {
  const loaderContext = useContext(LoaderContext);

  return loaderContext?.loadersData?.[route] as LoaderReturnValue<T>;
};

/**
 * Returns the location's full URL. This is useful when not using a router capable of returning the complete location
 * data, such as the search query or hashbang. This is node-safe and will return the correct location of the request
 * when called on the server.
 */
export const useLocationURL = () => {
  return getURL();
};

/**
 * Returns a memoized getter to get the correct action to assign to a form element if you want to submit the current
 * route's segment as the form's action, with an additional action appended to it. This will look at the nearest
 * `DataLoader` parent, then use that parent's route as the source of the action.
 *
 * @example
 * const Parent = () => (
 *   // This renders for the route `/users/:userId`
 *   <DataLoader>
 *     <Child />
 *   </DataLoader>
 * );
 *
 * const Child = () => {
 *   const getAction = useGetAction();
 *
 *   return (
 *     // The action will be `/users/:userId/edit`
 *     <form action={getAction('edit')}>
 *       {...}
 *     </form>
 *   );
 * };
 *
 * @param {string} route If provided, the route parameter will be used instead of the current loaded route. This can be
 * any of the known routes given to the server router that are currently on the branch.
 */
export const useGetAction = (route?: string) => {
  const currentLoaderContext = useContext(CurrentLoaderContext);

  const routeURL = useMemo(() => {
    const uncompiledRoute = route || currentLoaderContext.route?.id || '';
    return compileRouteURL(uncompiledRoute);
  }, [route]);

  return useCallback(
    (action?: string) => {
      return action
        ? `${routeURL.startsWith('/') ? '' : '/'}${routeURL}${
            routeURL.endsWith('/') ? '' : '/'
          }${action}`
        : `${routeURL.startsWith('/') ? '' : '/'}${routeURL}`;
    },
    [routeURL]
  );
};

/**
 * Returns a memoized function to send an HTTP call to the current route in the branch using the `fetch` API. This is a
 * utility hook that saves you from having to track the URL you want to fetch. Use with dynamic forms or when triggering
 * async fetch to action.
 *
 * Note that sending a call to a `GET` verb on a route will trigger the loader only if no `render` is defined.
 * Otherwise, it will return the route's HTML.
 *
 * @example
 * const Parent = () => (
 *   // This renders for the route `/users/:userId`
 *   <DataLoader>
 *     <Child />
 *   </DataLoader>
 * );
 *
 * const Child = () => {
 *   const fetch = useFetch();
 *
 *   return (
 *     // Fetch will call POST on `/users/:userId`
 *     <button onClick={() => {
 *       fetch({ method: 'POST' });
 *     }}>Save</button>
 *   );
 * };
 *
 * @param {string} route If provided, the route parameter will be used instead of the current loaded route. This can be
 * any of the known routes given to the server router that are currently on the branch.
 */
export const useFetch = (
  route?: string
): ((fetchInit: RequestInit & { search?: string }) => Promise<Response>) => {
  const invalidate = useInvalidate();

  const currentLoaderContext = useContext(CurrentLoaderContext);

  return useCallback(
    async (fetchInit: RequestInit & { search?: string }) => {
      const uncompiledRoute = route || currentLoaderContext.route?.id || '';
      const finalURL = compileRouteURL(uncompiledRoute);

      return fetch(
        `${finalURL.startsWith('/') ? '' : '/'}${finalURL}${
          fetchInit.search ? `?${fetchInit.search}` : ''
        }`,
        fetchInit
      ).then(res => {
        invalidate();
        return res;
      });
    },
    [invalidate, route, currentLoaderContext]
  );
};
