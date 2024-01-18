import { FunctionComponent, PropsWithChildren, Children } from 'react';
import { Link } from 'wouter';
import {
  json,
  LoaderComponent,
  DataLoader,
  useLoaderData,
  useIsLoading,
} from '../../../src';

import { App } from '../client/App';
import { CompletePost } from '../types.ts';
import { PostsList } from '../client/components/PostsList.tsx';

import { getAllPosts } from './utils/getPosts.ts';
import { getAllUsers, getCurrentUser } from './utils/getUsers.ts';

export const IndexControllerLoader = async () => {
  const lastFivePosts = await getAllPosts(5);
  const users = await getAllUsers();

  const currentUser = await getCurrentUser();

  return json({
    posts: lastFivePosts.map<CompletePost>(post => ({
      ...post,
      user: users.find(user => user.id === post.userId),
    })),
    users,
    currentUser,
  });
};

export const Component: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const loading = useIsLoading();
  const { posts, currentUser } =
    useLoaderData<typeof IndexControllerLoader>() || {};

  if (loading) {
    return <App>Loading...</App>;
  }

  if (Children.count(children) > 0) {
    return <App currentUser={currentUser}>{children}</App>;
  }

  return (
    <App currentUser={currentUser}>
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
