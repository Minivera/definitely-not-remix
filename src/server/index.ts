import { json, redirect } from './response.ts';

const importRouter = async () => {
  if (typeof window === 'undefined') {
    return import('./router.ts');
  }

  return { frameworkRouter: undefined };
};

const { frameworkRouter } = (await importRouter()) as {
  frameworkRouter: NonNullable<
    Awaited<ReturnType<typeof importRouter>>['frameworkRouter']
  >;
};

export { json, redirect, frameworkRouter };
