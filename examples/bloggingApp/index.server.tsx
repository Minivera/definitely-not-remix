import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ReactElement } from 'react';
import { Router } from 'wouter';
import { createServer as createViteServer } from 'vite';
import { frameworkRouter, Request } from '../../src';

import {
  IndexControllerLoader,
  IndexControllerRender,
} from './server/indexController';
import { PostsController } from './server/postsController.tsx';
import { PostController } from './server/postController.tsx';
import { UsersController } from './server/usersController.tsx';
import { Root } from './client/Root.tsx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = frameworkRouter([
  {
    route: '/',
    load: IndexControllerLoader,
    render: IndexControllerRender,
    children: [
      {
        route: 'posts',
        load: PostsController.load,
        render: PostsController.render,
        // You can use multiple actions
        post: PostsController.addPost,
        patch: PostsController.updatePost,
        delete: PostsController.deletePost,
      },
      {
        route: 'posts/:id',
        load: PostController.load,
        render: PostController.render,
        // Or use a single action like in Remix
        action: PostController.action,
      },
      {
        route: 'users',
        load: UsersController.load,
        render: UsersController.render,
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
