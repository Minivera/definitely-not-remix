import { json, redirect } from './response.ts';

const importRouter = async () => {
  if (typeof window === 'undefined') {
    return import('./router.ts');
  }

  return { frameworkRouter: undefined };
};

const { frameworkRouter } = (await importRouter()) as {
  /**
   * Constructor for the framework's server router implementation. This will generate everything you need
   * to serve a node.js application and render your routes using SSR.
   */
  frameworkRouter: NonNullable<
    Awaited<ReturnType<typeof importRouter>>['frameworkRouter']
  >;
};

export { json, redirect, frameworkRouter };
