import { FunctionComponent, useContext } from 'react';
import { LoaderContext } from './loaderContext.ts';

export const Scripts: FunctionComponent = () => {
  const globalContext = useContext(LoaderContext);

  return (
    <script
      type="module"
      dangerouslySetInnerHTML={{
        __html: `window.contextData = ${JSON.stringify(
          JSON.stringify(globalContext)
        )};`,
      }}
    />
  );
};
