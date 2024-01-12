import { FunctionComponent, useContext } from 'react';
import { LoaderContext } from './loaderContext.ts';

export const Scripts: FunctionComponent = () => {
  const globalContext = useContext(LoaderContext);

  return (
    <script
      type="module"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `window.contextData = ${
          typeof window === 'undefined'
            ? JSON.stringify(
                JSON.stringify({
                  ...globalContext,
                  currentRoute: globalContext?.routesChain[0],
                })
              )
            : JSON.stringify(
                (window as unknown as { contextData: unknown }).contextData
              )
        };`,
      }}
    />
  );
};
