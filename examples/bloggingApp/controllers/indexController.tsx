import { FunctionComponent, PropsWithChildren } from 'react';
import { Link } from 'wouter';
import {
  json,
  LoaderComponent,
  DataLoader,
  useLoaderData,
  useIsParentRoute,
  useIsLoading,
} from '../../../src';

import { App } from '../client/App';
import { CompletePost } from '../types.ts';
import { PostsList } from '../client/components/PostsList.tsx';

import { getAllPosts } from './utils/getPosts.ts';
import { getAllUsers } from './utils/getUsers.ts';

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
  const loading = useIsLoading();
  const { posts, users } = useLoaderData<typeof IndexControllerLoader>() || {};
  const isParent = useIsParentRoute();

  if (isParent) {
    return <App>{children}</App>;
  }

  if (loading) {
    return <App users={users}>Loading...</App>;
  }

  return (
    <App users={users}>
      <h2>Last five posts</h2>
      <nav>
        <Link href="/posts">All posts</Link> <Link to="/users">All users</Link>
      </nav>
      <PostsList posts={posts} />
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
