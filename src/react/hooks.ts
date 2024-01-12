import { useCallback, useContext } from 'react';
import { compile, match } from 'path-to-regexp';

import { LoaderFunction, LoaderReturnValue } from '../types.ts';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';

export const useIsLoading = () => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.state !== 'LOADED';
};

export const useInvalidate = () => {
  const loaderContext = useContext(LoaderContext);

  console.log(loaderContext);
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

export const useIsParentRoute = (route?: string): boolean => {
  const loaderContext = useContext(LoaderContext);
  const currentLoaderContext = useContext(CurrentLoaderContext);

  const currentRoute = currentLoaderContext.route?.id || route;
  if (!currentRoute) {
    return false;
  }

  return loaderContext?.currentMatch !== currentRoute;
};

export const useFetch = (
  route?: string
): ((fetchInit: RequestInit) => Promise<Response>) => {
  const invalidate = useInvalidate();

  const currentLoaderContext = useContext(CurrentLoaderContext);

  return useCallback(
    async (fetchInit: RequestInit) => {
      const uncompiledRoute = route || currentLoaderContext.route?.id || '';

      const matchedRoute = match(uncompiledRoute, {
        decode: decodeURIComponent,
      })(window.location.toString());
      const compiledRoute = compile(uncompiledRoute, {
        encode: encodeURIComponent,
      });

      const finalURL = compiledRoute(matchedRoute ? matchedRoute.params : {});

      return fetch(finalURL, fetchInit).then(res => {
        invalidate();
        return res;
      });
    },
    [invalidate, route, currentLoaderContext]
  );
};
