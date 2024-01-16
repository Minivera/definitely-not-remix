import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ReactElement } from 'react';
import { createServer as createViteServer } from 'vite';
import { frameworkRouter, Request } from '../../src';
import { Router } from 'wouter';

import { Root } from './app/Root.tsx';
import { Root as RootView } from './views/root.tsx';
import { Index } from './views/_index.tsx';
import { Contact } from './views/contact.tsx';
import { RootAction, RootLoader } from './controllers/rootController.ts';
import { ContactLoader } from './controllers/contactController.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = frameworkRouter([
  {
    route: '/',
    load: RootLoader,
    action: RootAction,
    render: RootView,
    children: [
      {
        route: '/contacts/:contactId',
        load: ContactLoader,
        render: Contact,
      },
      {
        route: '*',
        render: Index,
      },
    ],
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
      appWrapper: (request: Request, app: ReactElement | null) => (
        <Root>
          <Router ssrPath={request.path}>{app}</Router>
        </Root>
      ),
      handleRender: (request: Request, html) => {
        return vite.transformIndexHtml(request.originalUrl, html);
      },
    })
    .then(() => {
      console.log('Server listening on http://localhost:8080');
    });
};

main();
