import { json, LoaderComponent, DataLoader, useLoaderData } from '../../../src';

import { App } from '../client/App';
import { CompletePost } from '../types.ts';

import { getAllPosts } from './utils/getPosts.ts';
import { getAllUsers } from './utils/getUsers.ts';
import { FunctionComponent, PropsWithChildren } from 'react';

export const IndexControllerLoader = async () => {
  const lastFivePosts = await getAllPosts(5);
  const users = await getAllUsers();

  return json({
    posts: lastFivePosts.map<CompletePost>(post => ({
      ...post,
      user: users.find(user => user.id === post.userId),
    })),
    users,
  });
};

export const Component: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const { posts, users } = useLoaderData<typeof IndexControllerLoader>();

  return (
    <App users={users} posts={posts}>
      {children}
    </App>
  );
};

export const IndexControllerRender: LoaderComponent = ({ children }) => {
  return (
    <DataLoader>
      <Component>{children}</Component>
    </DataLoader>
  );
};
