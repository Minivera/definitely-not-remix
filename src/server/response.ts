import express from 'express';
import { LoaderResponse } from '../types.ts';

/**
 * Creates a complete framework response that returns a JSON body for a client request. This is a utility function
 * tht will return everything you need to return JSON from a loader or an action call, including headers.
 * @param value {any} The value to add as the request's body, stringifyed to JSON.
 * @param responseInit {ResponseInit | undefined} The init parameters for a normal node.js response, which will be used
 * to construct the response returned.
 */
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

/**
 * Creates a complete framework response that returns a redirect that can be followed by browsers or clients. It will
 * set the location to the given location and add no body to the response. If you want to add more headers or
 * properties, set them manually in the responseInit.
 * @param location {string} The location to redirect to for the redirect response, see the official HTTP docs.
 * @param responseInit {ResponseInit | undefined} The init parameters for a normal node.js response, which will be used
 * to construct the response returned
 */
export const redirect = (
  location: string,
  responseInit?: ResponseInit
): LoaderResponse<unknown> => {
  const headers = new Headers(responseInit?.headers);
  headers.set('Location', location);

  return new Response(undefined, {
    ...responseInit,
    status: 301,
    headers,
  }) as LoaderResponse<unknown>;
};

export const writeExpressResponse = async (
  res: express.Response,
  nodeResponse: Response
): Promise<express.Response> => {
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

  return res;
};
