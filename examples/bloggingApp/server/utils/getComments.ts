import { Comment } from '../../types.ts';

export const getCommentByID = async (id: number) => {
  return (await fetch(
    `https://jsonplaceholder.typicode.com/comments/${id}`
  ).then(response => response.json())) as Comment;
};
