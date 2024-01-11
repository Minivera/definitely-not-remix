import { FunctionComponent, PropsWithChildren } from 'react';

import { CompletePost, User } from '../types.ts';
import { useIsParentRoute, Scripts } from '../../../src';

export interface AppProps {
  posts?: CompletePost[];
  users?: User[];
}

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>My blog</title>
    </head>
    <body>
      {children}
      <script type="module" src="./index.client.ts"></script>
      <Scripts />
    </body>
  </html>
);

export const App: FunctionComponent<PropsWithChildren<AppProps>> = ({
  posts,
  children,
}) => {
  const isParent = useIsParentRoute();

  if (isParent) {
    return (
      <Layout>
        <div>
          <h1>Welcome to my blog</h1>
          {children}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1>Welcome to my blog</h1>
        <h2>Last five posts</h2>
        {posts ? (
          <ul>
            {posts.map(post => (
              <li key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <a href="/users">By {post.user?.name || 'Unknown'}</a>
              </li>
            ))}
          </ul>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </Layout>
  );
};
