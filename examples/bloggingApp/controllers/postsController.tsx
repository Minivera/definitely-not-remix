import { FunctionComponent, PropsWithChildren, useState } from 'react';
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
  useFetch,
} from '../../../src';

import { CompletePost, Post, User } from '../types.ts';
import { PostsList } from '../client/components/PostsList.tsx';

import { getAllPosts } from './utils/getPosts.ts';
import { IndexControllerLoader } from './indexController.tsx';
import { createPost } from './utils/mutatePosts.ts';

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
    return (
      <DataLoader>
        <PostsController.component>{children}</PostsController.component>
      </DataLoader>
    );
  },

  component: () => {
    const loading = useIsLoading();
    const { posts } = useLoaderData<typeof PostsController.load>() || {};
    const createPost = useFetch();

    const [success, setSuccess] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    return (
      <>
        <h2>All posts</h2>
        <Link to="/">{'<-'} Back to Home</Link>
        <form
          onSubmit={event => {
            setSuccess(null);

            createPost({
              method: 'POST',
              body: JSON.stringify({
                id: posts.length,
                title,
                body,
                userId: 1,
              } as Post),
            })
              .then(res => res.json())
              .then(res => {
                setTitle('');
                setBody('');

                setSuccess(
                  res.ok
                    ? `Successfully created post ${res.created.id}`
                    : 'Error'
                );
              });

            event.preventDefault();
          }}
        >
          <h3>Add a new post</h3>
          <div>
            <label htmlFor="title">Title</label>
            <br />
            <input
              type="text"
              id="title"
              onChange={e => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <div>
            <label htmlFor="body">Content</label>
            <br />
            <textarea
              id="body"
              onChange={e => setBody(e.target.value)}
              value={body}
            />
          </div>
          {success && <div>{success}</div>}
          <input type="submit" value="Submit" />
        </form>
        {loading ? <>Loading...</> : <PostsList posts={posts} />}
      </>
    );
  },

  addPost: async request => {
    const body = request.body as Post;

    const created = await createPost(body);

    return json({
      ok: true,
      created,
    });
  },
};
