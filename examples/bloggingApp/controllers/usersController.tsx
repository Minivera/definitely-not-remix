import { FunctionComponent, PropsWithChildren } from 'react';
import { Link } from 'wouter';
import {
  json,
  LoaderComponent,
  LoaderFunction,
  LoaderReturnValue,
  useLoaderData,
  DataLoader,
  useIsLoading,
} from '../../../src';

import { User } from '../types.ts';

import { IndexControllerLoader } from './indexController.tsx';
import { UsersList } from '../client/components/UsersList.tsx';

interface LoaderData {
  users: User[];
}

export const UsersController: {
  load: LoaderFunction<LoaderData>;
  render: LoaderComponent;
  component: FunctionComponent<PropsWithChildren>;
} = {
  load: async (_request, context) => {
    const users =
      (
        context.parentData['/'] as LoaderReturnValue<
          typeof IndexControllerLoader
        >
      )?.users || [];

    return json({
      users,
    });
  },

  render: ({ children }) => {
    return (
      <DataLoader>
        <UsersController.component>{children}</UsersController.component>
      </DataLoader>
    );
  },

  component: () => {
    const loading = useIsLoading();
    const { users } = useLoaderData<typeof UsersController.load>() || {};

    if (loading) {
      return <>Loading...</>;
    }

    return (
      <>
        <h2>All Users</h2>
        <Link to="/">{'<-'} Back to Home</Link>
        <UsersList users={users} />
      </>
    );
  },
};
