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

import { CompletePost, Comment } from '../types.ts';

import { getPostByID, getPostComments } from './utils/getPosts.ts';
import { IndexControllerLoader } from './indexController.tsx';

interface LoaderData {
  post: CompletePost;
  comments: Comment[];
}

export const PostController: {
  load: LoaderFunction<LoaderData>;
  render: LoaderComponent;
  component: FunctionComponent<PropsWithChildren>;
  action: ControllerFunction;
} = {
  load: async (request, context) => {
    const postID = request.params.id;

    const currentPost = await getPostByID(postID);
    const comments = await getPostComments(postID, 5);
    const users =
      (
        context.parentData['/'] as LoaderReturnValue<
          typeof IndexControllerLoader
        >
      )?.users || [];

    return json({
      post: {
        ...currentPost,
        user: users.find(user => user.id === currentPost.userId),
      },
      comments,
    });
  },

  render: ({ children }) => {
    return (
      <DataLoader>
        <PostController.component>{children}</PostController.component>
      </DataLoader>
    );
  },

  component: () => {
    const loading = useIsLoading();
    const { post, comments } =
      useLoaderData<typeof PostController.load>() || {};

    if (loading) {
      return <>Loading...</>;
    }

    return (
      <>
        <Link to="/posts">{'<-'} Back to posts</Link>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <Link to="/users">By {post.user?.name || 'Unknown'}</Link>
        <ul style={{ marginLeft: 15 }}>
          {comments.map(comment => (
            <li key={comment.id}>
              <h3>{comment.name}</h3>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
      </>
    );
  },

  action: () => {},
};
