import { Request as ExpressRequest } from 'express';
import { ComponentType, PropsWithChildren } from 'react';

/**
 * A utility type that redefines the internally used Request type. Use to type controller and loader functions that
 * receive a request.
 */
export type Request = ExpressRequest;

/**
 * The type definition for a generic controller function, which you can assign to any function or interface property to
 * type it as a backend action function.
 */
export type ControllerFunction = (
  request: Request
) => Response | Promise<Response>;

/**
 * The type definition for the response returned by a loader. This response must be of this type for the function to be
 * inferred as a valid loader and correctly type hooks such as `useLoaderData`. You may return responses yourself, but
 * we recommend using utility functions such as `json` and `redirect` to return this type.
 */
export type LoaderResponse<Data = unknown> = Response & {
  data: Data;
};

/**
 * The context provided to a loader as its second parameter. This includes the data loaded from any parent route if the
 * current loader is part of a loader chain. Use it to type a loader function's parameters instead of using
 * `LoaderFunction` directly.
 */
export interface LoaderContext {
  parentData: Record<string, unknown>;
}

/**
 * Type for a loader function in one of your controllers. Do not assign this type directly to your loader functions
 * as TypeScript limitations will break the type inference of the `useLoaderData` hook. This type can be used to assign
 * a loader function to another variable or an interface property.
 */
export type LoaderFunction<Data = unknown> = (
  request: Request,
  context: LoaderContext & Record<string, unknown>
) => LoaderResponse<Data> | Promise<LoaderResponse<Data>>;

/**
 * The type utility to extract the returned body's type from the loader. When using a function such as `json`, the
 * loader will return a `LoaderResponse` type, which can then be used to infer the type of the data returned by a loader
 * for hooks such as `useRouteData`.
 */
export type LoaderReturnValue<
  LoaderType extends LoaderFunction = LoaderFunction,
> = Awaited<ReturnType<LoaderType>>['data'] | null;

/**
 * The utility type for a component using loader data. This type is only used for the `render` property of a route
 * if you configure it. You can assign it as the type for your render component, though any valid component type with
 * a children property will work.
 */
export type LoaderComponent = ComponentType<PropsWithChildren>;

/**
 * The type definition for a server route given to the `frameworkRouter` function. This route defines all the possible
 * loaders, rendered, and actions the route can use. See each property's documentation for more details.
 *
 * @example
 * const routes: Routes = [
 *   {
 *     route: '',
 *     render: ({ children }) => <div>{children}</div>,
 *     loader: () => json({ foo: 'bar' }),
 *     children: [
 *       {
 *         route: '/hello',
 *         render: () => <h1>Hello, world!</h1>,
 *         loader: (_, { parentData }) => json({ test: parentData.foo }),
 *         children: []
 *       },
 *     ],
 *   },
 * ];
 *
 * // When navigating to the route `/hello`, the server would render:
 * // `<div><h1>Hello, world!</h1></div>`
 * // and the leaf loader would return `{ test: 'bar' }` as its body.
 */
export interface Route {
  /**
   * The route's path, relative to its parent if any. The path may start with a `/` or omit it, the router will
   * properly join the routes either way. Leave empty to define a root route.
   */
  route: string;

  /**
   * The render function for the route. When called on the server, this function will be as part of the React SSR
   * process. If the route has any children, those children will be given as the `children` property of the component
   * as a tree. They can be rendered like any other React elements.
   */
  render?: LoaderComponent;

  /**
   * The loader function for the route. It will be called when the current route's full path is rendered, or when a
   * client data loader is asking for route data. The loader should return a valid response, or thrown an error
   * response. The returned response will be encoded to JSON and returned to the client. Anything you throw will be
   * handled like a failed HTTP call.
   *
   * The loader function will receive it's direct parent's data when called, if it has any. This allows you to reuse
   * previously loaded data and avoid repetition. Loaders are called in order, starting with the application root and
   * moving down the routing tree's branch to this current route.
   *
   * If no `render` is provided, this loader will be used for every `GET` call to this route. This can be used to define
   * API-only endpoints.
   */
  load?: LoaderFunction;

  /**
   * A backend action called whenever an HTTP request is sent to the route's full path. If the route has defined a
   * loader, the loader will handle `GET` requests and any other verb will be handled by this action. If no loader is
   * added to this route, the action will handle all verbs.
   *
   * Use this action to cause mutations or side-effects, like you would any other API endpoints. You may also define
   * routes with only actions to create API only routes. Finally, if the action is called as part of a form's submit,
   * the returned responses will be handled as if this was a loader.
   */
  action?: ControllerFunction;

  /**
   * This will handle HTTP calls to this route's full path using the `GET` verb. Use if you need more granularity in how
   * you handle the verb handlers. Defining this property on a route with an `action` will trigger an error since you
   * may only define an action, or individual verbs, not both.
   *
   * For the `GET` verb, the loader will take precedence. If you define a loader, this will never be called.
   */
  get?: ControllerFunction;

  /**
   * This will handle HTTP calls to this route's full path using the `POST` verb. Use if you need more granularity in how
   * you handle the verb handlers. Defining this property on a route with an `action` will trigger an error since you
   * may only define an action, or individual verbs, not both.
   */
  post?: ControllerFunction;

  /**
   * This will handle HTTP calls to this route's full path using the `PUT` verb. Use if you need more granularity in how
   * you handle the verb handlers. Defining this property on a route with an `action` will trigger an error since you
   * may only define an action, or individual verbs, not both.
   */
  put?: ControllerFunction;

  /**
   * This will handle HTTP calls to this route's full path using the `DELETE` verb. Use if you need more granularity in how
   * you handle the verb handlers. Defining this property on a route with an `action` will trigger an error since you
   * may only define an action, or individual verbs, not both.
   */
  delete?: ControllerFunction;

  /**
   * This will handle HTTP calls to this route's full path using the `PATCH` verb. Use if you need more granularity in how
   * you handle the verb handlers. Defining this property on a route with an `action` will trigger an error since you
   * may only define an action, or individual verbs, not both.
   */
  patch?: ControllerFunction;

  /**
   * Routes are handled as a tree, which each branch defining the various segments of a full route path. The children
   * property is used to define child routes, whose path are relative to this route.
   */
  children?: Routes;
}

/**
 * An array of `Route` elements, used to define either a list of routes in the tree, or a chain of routes when looking
 * at a branch.
 */
export type Routes = Route[];

/**
 * DO NOT USE, internal only.
 */
export interface InternalRoute extends Route {
  id: string;
  children?: InternalRoutes;
}

/**
 * DO NOT USE, internal only.
 */
export type InternalRoutes = InternalRoute[];
