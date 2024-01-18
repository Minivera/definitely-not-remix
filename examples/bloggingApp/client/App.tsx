import { FunctionComponent, PropsWithChildren } from 'react';

import { User } from '../types.ts';

export interface AppProps {
  currentUser?: User;
}

export const App: FunctionComponent<PropsWithChildren<AppProps>> = ({
  currentUser,
  children,
}) => {
  return (
    <div>
      <h1>
        Welcome to my blog{currentUser ? `, ${currentUser.username}` : ''}
      </h1>
      {children}
    </div>
  );
};
