import { FunctionComponent, PropsWithChildren } from 'react';
import { Link } from 'wouter';
import {
  ControllerFunction,
  json,
  LoaderComponent,
  LoaderFunction,
  LoaderReturnValue,
  useLoaderData,
  DataLoader,
  useIsLoading,
} from '../../../src';

import { CompletePost, User } from '../types.ts';
import { PostsList } from '../client/components/PostsList.tsx';

import { getAllPosts } from './utils/getPosts.ts';
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
  updatePost: ControllerFunction;
  deletePost: ControllerFunction;
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
    return (
      <DataLoader>
        <PostsController.component>{children}</PostsController.component>
      </DataLoader>
    );
  },

  component: () => {
    const loading = useIsLoading();
    const { posts } = useLoaderData<typeof PostsController.load>() || {};

    if (loading) {
      return <>Loading...</>;
    }

    return (
      <>
        <h2>All posts</h2>
        <Link to="/">{'<-'} Back to Home</Link>
        <PostsList posts={posts} />
      </>
    );
  },

  addPost: () => {},
  updatePost: () => {},
  deletePost: () => {},
};
