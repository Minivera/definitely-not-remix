import { FunctionComponent, PropsWithChildren } from 'react';

import { User } from '../types.ts';

export interface AppProps {
  users?: User[];
}

export const App: FunctionComponent<PropsWithChildren<AppProps>> = ({
  children,
}) => {
  return (
    <div>
      <h1>Welcome to my blog</h1>
      {children}
    </div>
  );
};
