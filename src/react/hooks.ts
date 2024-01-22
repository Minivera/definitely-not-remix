import { useCallback, useContext, useMemo } from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { compileRouteURL } from './utils.ts';

import { LoaderFunction, LoaderReturnValue } from '../types.ts';
import { getURL } from './constants.ts';

export const useIsLoading = () => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.state !== 'LOADED';
};

export const useInvalidate = () => {
  const loaderContext = useContext(LoaderContext);

  return useCallback(loaderContext?.invalidateCache || (() => {}), [
    loaderContext?.invalidateCache,
  ]);
};

export const useLoaderData = <T extends LoaderFunction = LoaderFunction>() => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.data as NonNullable<LoaderReturnValue<T>>;
};

export const useRouteLoaderData = <T extends LoaderFunction = LoaderFunction>(
  route: string
) => {
  const loaderContext = useContext(LoaderContext);

  return loaderContext?.loadersData?.[route] as LoaderReturnValue<T>;
};

export const useLocationURL = () => {
  return getURL();
};

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
