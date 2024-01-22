import { rootRoute } from './constants.ts';

export const normalizeRouteID = (route: string): string =>
  route === rootRoute ? `/${rootRoute}` : route;
