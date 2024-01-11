import { frameworkRouter, Request } from '../../src';
import { createServer as createViteServer } from 'vite';

import {
  IndexControllerLoader,
  IndexControllerRender,
} from './server/indexController';
import { PostsController } from './server/postsController.tsx';

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
        post: PostsController.addPost,
      },
      /* {
        route: 'posts/:id',
        load: PostController.load,
        render: PostController.render,
        // Can use a single action like in Remix
        action: PostController.action,
        children: [
          {
            route: 'comments/:commentId',
            load: CommentController.load,
            render: CommentController.render,
            // Or use multiple actions
            post: CommentController.addComment,
            patch: CommentController.updateComment,
            delete: CommentController.deleteComment,
          },
        ],
      },
      {
        route: 'users',
        load: UserController.load,
        render: UserController.render,
      }, */
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
      handleRender: (request: Request, html) => {
        return vite.transformIndexHtml(request.originalUrl, html);
      },
    })
    .then(() => {
      console.log('Server listening on http://localhost:8080');
    });
};

main();
