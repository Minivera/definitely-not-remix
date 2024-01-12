import { Post } from '../../types.ts';

export const createPost = async (newPost: Post) => {
  return (await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(newPost),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }).then(response => response.json())) as Post;
};

export const updatePost = async (postID: string, payload: Post) => {
  return (await fetch(`https://jsonplaceholder.typicode.com/posts/${postID}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  }).then(response => response.json())) as Post;
};

export const deletePost = async (postID: string) => {
  return await fetch(`https://jsonplaceholder.typicode.com/posts/${postID}`, {
    method: 'DELETE',
  }).then(response => response.ok);
};
