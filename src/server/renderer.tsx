import { renderToString } from 'react-dom/server';

import { InternalRoutes } from '../types.ts';
import { ServerContextProvider } from '../react/ServerContextProvider.tsx';

export const renderComponentChain = async (
  allRoutes: InternalRoutes,
  loaderData: Record<string, [Response, unknown]>,
  chain: InternalRoutes,
  handleRender: (html: string) => string | Promise<string>
): Promise<Response> => {
  const match = chain[chain.length - 1].id;

  let Component = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    if (chain[i].render) {
      const Parent = chain[i].render!;
      Component = <Parent>{Component}</Parent>;
    }
  }

  // Render the component to string and return a response
  let result =
    '<!doctype html>' +
    renderToString(
      <ServerContextProvider
        loadersData={Object.fromEntries(
          Object.entries(loaderData).map(([key, tupple]) => [key, tupple[1]])
        )}
        currentMatch={match}
        routesChain={chain}
        currentRoute={chain[0]}
        allRoutes={allRoutes}
      >
        {Component}
      </ServerContextProvider>
    );
  result = await handleRender(result);

  const response = new Response(result);
  response.headers.set('Content-Type', 'text/html');
  return response;
};
