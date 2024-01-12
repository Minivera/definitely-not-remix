import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';

import { LoaderContext, LoaderContextValue } from './loaderContext.ts';

const fetchAllMatchingLoaders = async (route: string) => {
  // TODO: Handle errors.
  return fetch(route, {
    method: 'GET',
    headers: {
      'X-Data-Only': 'true',
    },
  }).then(res => res.json());
};

export const ClientContextProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [contextsCache, setContextsCache] = useState<
    Record<string, LoaderContextValue>
  >(() => ({
    [window.location.toString()]: JSON.parse(
      (window as unknown as { contextData: string }).contextData || '{}'
    ),
  }));
  const [currentContext, setCurrentContext] = useState<LoaderContextValue>(() =>
    JSON.parse(
      (window as unknown as { contextData: string }).contextData || '{}'
    )
  );

  const fetchRouteData = useCallback(
    async (route: string) => {
      if (contextsCache[route]) {
        setCurrentContext(contextsCache[route]);
        return;
      }

      const data = await fetchAllMatchingLoaders(route);
      setCurrentContext(data);
      setContextsCache(cache => ({
        ...cache,
        [route]: data,
      }));
    },
    [contextsCache, setCurrentContext, setContextsCache]
  );

  return (
    <LoaderContext.Provider value={{ ...currentContext, fetchRouteData }}>
      {children}
    </LoaderContext.Provider>
  );
};
