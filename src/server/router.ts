import express, { Express } from 'express';
import { join as pathJoin } from 'node:path/posix';

import {
  ControllerFunction,
  Routes,
  Route,
  InternalRoute,
  InternalRoutes,
  Request,
} from '../types.ts';

import { writeExpressResponse } from './response.ts';
import { resolveAllMatchingLoaders } from './loaders.ts';
import { renderComponentChain } from './renderer.tsx';

export interface RouterOptions {
  mode?: 'developement' | 'production';
}

const convertRouteToInternal = (
  route: Route,
  parents: Routes
): InternalRoute => ({
  ...route,
  id: pathJoin(...parents.map(parent => parent.route).concat(route.route)),
  children: route.children?.map(child =>
    convertRouteToInternal(child, [...parents, route])
  ),
});

class Router {
  private routes: InternalRoutes;
  // @ts-expect-error TS6133
  private options: RouterOptions;

  private app: Express;

  constructor(routes: Routes, options: RouterOptions) {
    this.routes = routes.map(route => convertRouteToInternal(route, []));
    this.options = options;

    this.app = express();
  }

  use(middleware: express.Handler) {
    this.app.use(middleware);
  }

  async serve(
    port: number,
    options?: {
      handleRender?: (
        request: Request,
        html: string
      ) => string | Promise<string>;
    }
  ) {
    // TODO: Validate that all routes must start with a forward slash
    const addRouteToRouter = (
      route: InternalRoute,
      parents: InternalRoutes
    ) => {
      if (route.render || route.load) {
        this.app.get(route.id, async (req, res) => {
          if (
            (route.load && !route.render) ||
            (route.load && req.header('X-Data-Only') === 'true')
          ) {
            const loadedData = await resolveAllMatchingLoaders(req, req.path, [
              ...parents,
              route,
            ]);
            const result = loadedData[route.id];
            return writeExpressResponse(res, result[0]);
          }

          // Component nesting. We should load all parent routes first to get the data, then
          // render backwards to get the components and add them as "children" of the parent component.
          const loadedData = await resolveAllMatchingLoaders(req, req.path, [
            ...parents,
            route,
          ]);

          // TODO: We'll want to provide the loaded data through a custom context provider and not through the render function
          // TODO: since that won't convert well to the client side of things.
          const result = await renderComponentChain(
            this.routes,
            loadedData,
            [...parents, route],
            html =>
              options?.handleRender ? options?.handleRender(req, html) : html
          );
          return writeExpressResponse(res, result);
        });
      }

      if (route.action) {
        const actionFunc = route.action;
        this.app.all(route.id, async (req, res) => {
          const result = await actionFunc(req);
          return writeExpressResponse(res, result);
        });
      }

      ['get', 'post', 'put', 'delete', 'patch'].forEach(method => {
        if (typeof route[method as keyof Route] === 'undefined') {
          return;
        }

        if (route.action || (method === 'get' && route.render)) {
          throw new Error(
            'Do not combine individual methods with `action` or `render`.'
          );
        }

        const actualFunc = route[method as keyof Route] as ControllerFunction;
        this.app[method as keyof Express](
          route.id,
          async (req: express.Request, res: express.Response) => {
            const result = await actualFunc(req);
            return writeExpressResponse(res, result);
          }
        );
      });

      route.children?.forEach(childRoute => {
        addRouteToRouter(childRoute, parents.concat(route));
      });
    };

    this.routes.forEach(route => {
      addRouteToRouter(route, []);
    });

    // TODO: Add more stuff here, make it pretty
    return new Promise<void>(resolve => this.app.listen(port, resolve));
  }
}

type frameworkRouterSignatures = {
  (routes: Routes): Router;
  (routes: Routes, options: RouterOptions): Router;
};

export const frameworkRouter: frameworkRouterSignatures = (
  routes: Routes,
  options?: RouterOptions
) => {
  return new Router(routes, options || {});
};
