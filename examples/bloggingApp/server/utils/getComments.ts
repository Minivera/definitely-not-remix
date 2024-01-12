import { Comment } from '../../types.ts';

export const getCommentByID = async (id: string) => {
  return (await fetch(
    `https://jsonplaceholder.typicode.com/comments/${id}`
  ).then(response => response.json())) as Comment;
};
