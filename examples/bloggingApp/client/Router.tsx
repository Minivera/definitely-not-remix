import { FunctionComponent } from 'react';
import { Router as Wouter, Route, Switch } from 'wouter';

import { IndexControllerRender } from '../controllers/indexController.tsx';
import { PostsController } from '../controllers/postsController.tsx';
import { PostController } from '../controllers/postController.tsx';
import { UsersController } from '../controllers/usersController.tsx';

export const Router: FunctionComponent = () => (
  <Wouter>
    <Switch>
      <Route path="/">
        <IndexControllerRender />
      </Route>
      <Route path="/posts">
        <IndexControllerRender>
          <PostsController.render />
        </IndexControllerRender>
      </Route>
      <Route path="/posts/:id">
        <IndexControllerRender>
          <PostController.render />
        </IndexControllerRender>
      </Route>
      <Route path="/users">
        <IndexControllerRender>
          <UsersController.render />
        </IndexControllerRender>
      </Route>
    </Switch>
  </Wouter>
);
