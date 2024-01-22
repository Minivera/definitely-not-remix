import express from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { join as pathJoin } from 'node:path/posix';

import { InternalRoutes } from '../types.ts';

import { rootRoute } from './constants.ts';
import { normalizeRouteID } from './utils.ts';

type AwaitableRequest = IncomingMessage & {
  awaiter: (val: Response | null) => void;
};

export const resolveAllMatchingLoaders = async (
  request: express.Request,
  path: string,
  chain: InternalRoutes
): Promise<Record<string, [Response, unknown]>> => {
  const dataForMatch: Record<string, [Response, unknown]> = {};

  const subApp = express();

  for (const route of chain) {
    if (!route.load) {
      continue;
    }

    subApp.get(normalizeRouteID(route.id), async (req, res) => {
      if (!route.load) {
        return;
      }

      try {
        const result = await route.load(req, {
          parentData: Object.fromEntries(
            Object.entries(dataForMatch).map(([key, tupple]) => [
              key,
              tupple[1],
            ])
          ),
        });
        if (
          result.status === 200 &&
          result.headers.has('X-Data-Source') &&
          result.headers.get('X-Data-Source') === 'loader'
        ) {
          if (
            result.headers.get('Content-Type')?.includes('application/json')
          ) {
            dataForMatch[route.id] = [result, await result.json()];
          } else {
            dataForMatch[route.id] = [result, await result.text()];
          }
        }

        (req as unknown as AwaitableRequest).awaiter(result);
      } catch (err) {
        if (err instanceof Response) {
          (req as unknown as AwaitableRequest).awaiter(err);
        } else {
          (req as unknown as AwaitableRequest).awaiter(null);
        }
      }

      res.end();
    });
  }

  subApp.all('*', (req, res) => {
    // Handle 404 more gracefully
    (req as unknown as AwaitableRequest).awaiter(null);
    res.status(404);
    res.end();
  });

  const makeRequest = async (fullUrl: string) => {
    const newRequest = new IncomingMessage(new Socket());
    newRequest.rawHeaders = request.rawHeaders;
    const requestURL = new URL(
      fullUrl,
      `${request.protocol}://${request.hostname}`
    );

    requestURL.search = new URL(
      request.originalUrl,
      `${request.protocol}://${request.hostname}`
    ).search;

    newRequest.url = requestURL.toString();
    newRequest.method = 'GET';

    const response = new ServerResponse(newRequest);

    const awaitedResponse = await new Promise<Response | null>(resolve => {
      (newRequest as AwaitableRequest).awaiter = resolve;
      (
        subApp as unknown as {
          handle: (
            req: IncomingMessage,
            res: ServerResponse,
            next?: () => void
          ) => void;
        }
      ).handle(newRequest, response);
    });

    if (awaitedResponse && !awaitedResponse.ok) {
      // If the response was not a valid 20X response, then the user wants to handle the errors.
      // Throw here so express will catch the error and handle it on its own. We should not handle
      // errors on react on the server. Let the user create their own error handler.
      // TODO: Maybe it wouldn't be too magical to build a bridge between the error and React's error boundaries?
      throw awaitedResponse;
    }
  };

  await makeRequest(rootRoute);

  let pathParts = path.split('/');
  let wholePath = '/';
  do {
    const [pathPart, ...rest] = pathParts;
    pathParts = rest;

    wholePath = pathJoin(wholePath, pathPart);

    await makeRequest(wholePath);
  } while (pathParts.length);

  return dataForMatch;
};
