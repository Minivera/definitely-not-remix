import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
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
import { deletePost, updatePost } from './utils/mutatePosts.ts';

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
    const [matched, params] = useRoute('/posts/:id');

    return (
      <DataLoader
        shouldReload={(_, loaderParams) =>
          !matched || loaderParams.id !== params.id
        }
      >
        <PostController.component>{children}</PostController.component>
      </DataLoader>
    );
  },

  component: () => {
    const [, navigate] = useLocation();
    const loading = useIsLoading();
    const { post, comments } =
      useLoaderData<typeof PostController.load>() || {};

    const [edit, setEdit] = useState(false);
    const [title, setTitle] = useState(post?.title || '');
    const [body, setBody] = useState(post?.body || '');
    const [message, setMessage] = useState<string | null>(null);

    if (loading) {
      return <>Loading...</>;
    }

    return (
      <>
        <Link href="/posts">{'<-'} Back to posts</Link>
        <div>
          <form
            onSubmit={event => {
              event.preventDefault();

              fetch(window.location.toString(), {
                method: 'POST',
                body: new FormData(
                  event.currentTarget,
                  (event.nativeEvent as SubmitEvent).submitter
                ),
              })
                .then(res => res.json())
                .then(res => {
                  if (res.ok) {
                    if (res.action === 'delete') {
                      navigate('/posts');
                      return;
                    }

                    if (res.action === 'save') {
                      setMessage(`Post ${res.updated.id} saved successfully.`);
                      setEdit(false);
                      setTitle(res.updated.title);
                      setBody(res.updated.body);
                      return;
                    }
                  }

                  setMessage(`Failed to save post`);
                });
            }}
          >
            {edit ? (
              <>
                <div>
                  <label htmlFor="title">Title</label>
                  <br />
                  <input
                    name="title"
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
                    name="body"
                    id="body"
                    onChange={e => setBody(e.target.value)}
                    value={body}
                  />
                </div>
              </>
            ) : (
              <>
                <h2>{title}</h2>
                <p>{body}</p>
              </>
            )}
            <div>
              {edit ? (
                <>
                  <button name="action" type="submit" value="save">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={event => {
                      setEdit(false);
                      event.preventDefault();
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={event => {
                      setEdit(true);
                      event.preventDefault();
                    }}
                  >
                    Edit
                  </button>
                  <button name="action" type="submit" value="delete">
                    Delete
                  </button>
                </>
              )}
            </div>
            {message && (
              <div>
                <br />
                {message}
              </div>
            )}
          </form>
        </div>
        <br />
        <Link href="/users">By {post.user?.name || 'Unknown'}</Link>
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

  action: async request => {
    const postId = request.params.id;

    if (request.body.action === 'delete') {
      await deletePost(postId);

      return json({
        ok: true,
        action: request.body.action,
      });
    }

    if (request.body.action === 'save') {
      const updated = await updatePost(postId, {
        id: Number.parseInt(postId),
        title: request.body.title,
        body: request.body.body,
        userId: 1,
      });

      return json({
        ok: true,
        action: request.body.action,
        updated,
      });
    }

    return json({
      ok: false,
      action: request.body.action,
      error: 'Unknown action',
    });
  },
};
