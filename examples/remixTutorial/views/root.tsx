import { FunctionComponent, PropsWithChildren } from 'react';
import {
  DataLoader,
  LoaderComponent,
  useIsLoading,
  useLoaderData,
} from '../../../src';
import { Link } from 'wouter';

import { RootLoader } from '../controllers/rootController.ts';
import { Form } from '../app/Form.tsx';

export const RootComponent: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const loading = useIsLoading();
  const { contacts } = useLoaderData<typeof RootLoader>() || { contacts: [] };

  return (
    <>
      <div id="sidebar">
        <h1>Remix Contacts</h1>
        <div>
          <form id="search-form" role="search">
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div aria-hidden hidden={true} id="search-spinner" />
          </form>
          <Form method="POST">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {loading && (
            <p>
              <i>Loading...</i>
            </p>
          )}
          {!loading && contacts.length ? (
            <ul>
              {contacts.map(contact => (
                <li key={contact.id}>
                  <Link to={`/contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{' '}
                    {contact.favorite ? <span>★</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail">{children}</div>
    </>
  );
};

export const Root: LoaderComponent = ({ children }) => (
  <DataLoader>
    <RootComponent>{children}</RootComponent>
  </DataLoader>
);
