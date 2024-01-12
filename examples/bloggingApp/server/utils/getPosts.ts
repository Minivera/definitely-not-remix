import { Post, Comment } from '../../types.ts';

export const getAllPosts = async (count?: number) => {
  const posts = (await fetch('https://jsonplaceholder.typicode.com/posts').then(
    response => response.json()
  )) as Post[];

  return count ? posts.slice(0, count) : posts;
};

export const getPostByID = async (id: string) => {
  return (await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`).then(
    response => response.json()
  )) as Post;
};

export const getPostComments = async (id: string, count?: number) => {
  const comments = (await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}/comments`
  ).then(response => response.json())) as Comment[];

  return count ? comments.slice(0, count) : comments;
};
