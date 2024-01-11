import { FunctionComponent, PropsWithChildren } from 'react';
import {
  ControllerFunction,
  json,
  LoaderComponent,
  LoaderFunction,
  LoaderReturnValue,
  useLoaderData,
  DataLoader,
} from '../../../src';

import { App } from '../client/App';

import { getAllPosts } from './utils/getPosts.ts';
import { CompletePost, User } from '../types.ts';
import { IndexControllerLoader } from './indexController.tsx';

interface LoaderData {
  posts: CompletePost[];
  users: User[];
}

export const PostsController: {
  load: LoaderFunction<LoaderData>;
  render: LoaderComponent;
  component: FunctionComponent<PropsWithChildren>;
  addPost: ControllerFunction;
} = {
  load: async (_request, context) => {
    const allPosts = await getAllPosts();
    const users =
      (
        context.parentData['/'] as LoaderReturnValue<
          typeof IndexControllerLoader
        >
      )?.users || [];

    return json({
      posts: allPosts.map<CompletePost>(post => ({
        ...post,
        user: users.find(user => user.id === post.userId),
      })),
      users,
    });
  },

  render: ({ children }) => {
    const Component = PostsController.component;

    return (
      <DataLoader>
        <Component>{children}</Component>
      </DataLoader>
    );
  },

  component: ({ children }) => {
    const { posts, users } = useLoaderData<typeof PostsController.load>();

    return (
      <App users={users} posts={posts}>
        {children}
      </App>
    );
  },

  addPost: () => {},
};
