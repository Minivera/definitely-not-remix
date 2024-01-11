import { useContext } from 'react';

import { LoaderFunction, LoaderReturnValue } from '../types.ts';

import { CurrentLoaderContext, LoaderContext } from './loaderContext.ts';

export const useLoaderData = <T extends LoaderFunction = LoaderFunction>() => {
  const loaderContext = useContext(CurrentLoaderContext);

  return loaderContext.data as NonNullable<LoaderReturnValue<T>>;
};

export const useRouteLoaderData = <T extends LoaderFunction = LoaderFunction>(
  route: string
) => {
  const loaderContext = useContext(LoaderContext);

  return loaderContext?.loadersData[route] as LoaderReturnValue<T>;
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
