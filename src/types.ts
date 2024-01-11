import { Request as ExpressRequest } from 'express';
import { ComponentType, PropsWithChildren } from 'react';

export type Request = ExpressRequest;

export type ControllerFunction = (
  request: Request
) => Response | Promise<Response>;

export type LoaderResponse<Data = unknown> = Response & {
  data: Data;
};

export interface LoaderContext {
  parentData: Record<string, unknown>;
}

export type LoaderFunction<Data = unknown> = (
  request: Request,
  context: LoaderContext & Record<string, unknown>
) => LoaderResponse<Data> | Promise<LoaderResponse<Data>>;

export type LoaderReturnValue<
  LoaderType extends LoaderFunction = LoaderFunction,
> = Awaited<ReturnType<LoaderType>>['data'] | null;

export type LoaderComponent = ComponentType<PropsWithChildren>;

export interface Route {
  route: string;

  render?: LoaderComponent;
  load?: LoaderFunction;

  action?: ControllerFunction;
  get?: ControllerFunction;
  post?: ControllerFunction;
  put?: ControllerFunction;
  delete?: ControllerFunction;
  patch?: ControllerFunction;

  children?: Routes;
}

export type Routes = Route[];

export interface InternalRoute extends Route {
  id: string;
  children?: InternalRoutes;
}

export type InternalRoutes = InternalRoute[];
