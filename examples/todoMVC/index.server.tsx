import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ReactElement } from 'react';
import { createServer as createViteServer } from 'vite';
import { frameworkRouter, Request } from '../../src';

import { Root } from './app/Root.tsx';
import { TodoAction, TodoLoader } from './controllers/todoController.ts';
import { TodoView } from './views/todoView.tsx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = frameworkRouter([
  {
    route: '/',
    load: TodoLoader,
    action: TodoAction,
    render: TodoView,
  },
]);

const main = async () => {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: __dirname,
  });

  router.use(vite.middlewares);

  router
    .serve(8080, {
      appWrapper: (_: Request, app: ReactElement | null) => <Root>{app}</Root>,
      handleRender: (request: Request, html) => {
        return vite.transformIndexHtml(request.originalUrl, html);
      },
    })
    .then(() => {
      console.log('Server listening on http://localhost:8080');
    });
};

main();
