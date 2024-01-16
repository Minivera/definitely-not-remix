import express from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { join as pathJoin } from 'node:path/posix';

import { InternalRoutes } from '../types.ts';

type AwaitableRequest = IncomingMessage & {
  awaiter: (val: unknown) => void;
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

    subApp.get(route.id, async (req, res) => {
      if (!route.load) {
        return;
      }

      const result = await route.load(req, {
        parentData: Object.fromEntries(
          Object.entries(dataForMatch).map(([key, tupple]) => [key, tupple[1]])
        ),
      });
      // TODO: Handle returned and thrown errors by the loaders
      if (
        result.status === 200 &&
        result.headers.has('X-Data-Source') &&
        result.headers.get('X-Data-Source') === 'loader'
      ) {
        if (result.headers.get('Content-Type')?.includes('application/json')) {
          dataForMatch[route.id] = [result, await result.json()];
        } else {
          dataForMatch[route.id] = [result, await result.text()];
        }
      }

      (req as unknown as AwaitableRequest).awaiter(null);
      res.end();
    });
  }

  subApp.all('*', (req, res) => {
    // Handle 404 more gracefully
    (req as unknown as AwaitableRequest).awaiter(null);
    res.status(404);
    res.end();
  });

  let pathParts = path.split('/');
  let wholePath = '/';
  do {
    const [pathPart, ...rest] = pathParts;
    pathParts = rest;

    wholePath = pathJoin(wholePath, pathPart);

    const newRequest = new IncomingMessage(new Socket());
    newRequest.rawHeaders = request.rawHeaders;
    newRequest.url = new URL(
      wholePath,
      `${request.protocol}://${request.hostname}`
    ).toString();
    newRequest.method = 'GET';

    const response = new ServerResponse(newRequest);

    await new Promise(resolve => {
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
  } while (pathParts.length);

  return dataForMatch;
};
