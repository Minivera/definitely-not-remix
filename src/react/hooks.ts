import { useCallback, useContext } from 'react';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';
import { compileRouteURL } from './utils.ts';

import { LoaderFunction, LoaderReturnValue } from '../types.ts';

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

export const useFetch = (
  route?: string
): ((fetchInit: RequestInit) => Promise<Response>) => {
  const invalidate = useInvalidate();

  const currentLoaderContext = useContext(CurrentLoaderContext);

  return useCallback(
    async (fetchInit: RequestInit) => {
      const uncompiledRoute = route || currentLoaderContext.route?.id || '';
      const finalURL = compileRouteURL(uncompiledRoute);

      return fetch(finalURL, fetchInit).then(res => {
        invalidate();
        return res;
      });
    },
    [invalidate, route, currentLoaderContext]
  );
};
