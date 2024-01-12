import { FunctionComponent } from 'react';

import { User } from '../../types.ts';

export interface UsersListProps {
  users: User[];
}

export const UsersList: FunctionComponent<UsersListProps> = ({ users }) =>
  users ? (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <h3>{user.name}</h3>
          <span>
            {user.username} - {user.email}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <div>Loading...</div>
  );
