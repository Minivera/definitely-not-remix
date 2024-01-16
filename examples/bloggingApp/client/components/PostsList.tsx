import { FunctionComponent } from 'react';
import { Link } from 'wouter';

import { CompletePost } from '../../types.ts';

export interface PostsListProps {
  posts: CompletePost[];
}

export const PostsList: FunctionComponent<PostsListProps> = ({ posts }) =>
  posts ? (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h3>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </h3>
          <p>{post.body}</p>
          <Link href="/users">By {post.user?.name || 'Unknown'}</Link>
        </li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  );
