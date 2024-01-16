import { ReactElement } from 'react';
import express, { Express } from 'express';
import { join as pathJoin } from 'node:path/posix';
import multer from 'multer';

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
import { renderComponentChain, renderLoaderChain } from './renderer.tsx';

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

const upload = multer();

class Router {
  private readonly routes: InternalRoutes;
  // @ts-expect-error TS6133
  private readonly options: RouterOptions;

  private readonly app: Express;

  constructor(routes: Routes, options: RouterOptions) {
    this.routes = routes.map(route => convertRouteToInternal(route, []));
    this.options = options;

    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  use(middleware: express.Handler) {
    this.app.use(middleware);
  }

  async serve(
    port: number,
    options?: {
      appWrapper?: (
        request: Request,
        component: ReactElement | null
      ) => ReactElement | null;
      handleRender?: (
        request: Request,
        html: string
      ) => string | Promise<string>;
    }
  ) {
    const addRouteToRouter = (
      route: InternalRoute,
      parents: InternalRoutes
    ) => {
      if (route.render || route.load) {
        this.app.get(route.id, async (req, res) => {
          if (route.load && !route.render) {
            const loadedData = await resolveAllMatchingLoaders(req, req.path, [
              ...parents,
              route,
            ]);
            const result = loadedData[route.id];
            return writeExpressResponse(res, result[0]);
          }

          // TODO: We should allow us to fetch a single loader data when we only need to refresh one loader out of
          // TODO: a whole route chain. If we detect we fetch a new path, let's fetch everything. If instead we
          // TODO: change a leaf, then let's only update that leaf and its children. We should keep the state management
          // TODO: on the frontend and only handle dataloading and responses.
          if (route.load && req.header('X-Data-Only') === 'true') {
            const loadedData = await resolveAllMatchingLoaders(req, req.path, [
              ...parents,
              route,
            ]);

            return writeExpressResponse(
              res,
              renderLoaderChain(this.routes, loadedData, [...parents, route])
            );
          }

          // Component nesting. We should load all parent routes first to get the data, then
          // render backwards to get the components and add them as "children" of the parent component.
          const loadedData = await resolveAllMatchingLoaders(req, req.path, [
            ...parents,
            route,
          ]);

          const result = await renderComponentChain(
            this.routes,
            loadedData,
            [...parents, route],
            html =>
              options?.handleRender ? options?.handleRender(req, html) : html,
            app => (options?.appWrapper ? options?.appWrapper(req, app) : app)
          );
          return writeExpressResponse(res, result);
        });
      }

      if (route.action) {
        const actionFunc = route.action;
        this.app.all(route.id, upload.none(), async (req, res) => {
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
