import { FunctionComponent, useContext } from 'react';
import { LoaderContext } from './loaderContext.ts';

/**
 * This returns a script to be injected into the head of the document to store the server context
 * for reuse in the client part of the application. This does nothing outside of SSR.
 */
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
