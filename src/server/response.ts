import express from 'express';
import { LoaderResponse } from '../types.ts';

export const json = <Data = never>(
  value: Data,
  responseInit?: ResponseInit
): LoaderResponse<Data> => {
  const headers = new Headers(responseInit?.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('X-Data-Source', 'loader');

  const response = new Response(JSON.stringify(value), {
    ...responseInit,
    headers,
  }) as LoaderResponse<Data>;
  response.data = value;

  // Return the data as a JSON payload
  return response;
};

export const redirect = (
  location: string,
  responseInit?: ResponseInit
): LoaderResponse<unknown> => {
  const headers = new Headers(responseInit?.headers);
  headers.set('Location', location);

  // Return the data as a JSON payload
  return new Response(undefined, {
    ...responseInit,
    status: 301,
    headers,
  }) as LoaderResponse<unknown>;
};

export const writeExpressResponse = async (
  res: express.Response,
  nodeResponse: Response
) => {
  res.statusMessage = nodeResponse.statusText;
  res.status(nodeResponse.status);

  for (const [key, value] of nodeResponse.headers.entries()) {
    res.append(key, value);
  }

  if (nodeResponse.headers.get('Content-Type')?.match(/text\/event-stream/i)) {
    res.flushHeaders();
  }

  if (nodeResponse.body) {
    const reader = nodeResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          res.end();
          break;
        }

        res.write(value);
      }
    } catch (error: unknown) {
      res.destroy(error as Error);
      throw error;
    }
  } else {
    res.end();
  }
};
