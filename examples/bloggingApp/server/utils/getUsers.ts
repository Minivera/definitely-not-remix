import { User } from '../../types.ts';

export const getAllUsers = async (count?: number) => {
  const users = (await fetch('https://jsonplaceholder.typicode.com/users').then(
    response => response.json()
  )) as User[];

  return count ? users.slice(0, count) : users;
};
