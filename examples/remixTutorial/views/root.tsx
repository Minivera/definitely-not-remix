import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import {
  DataLoader,
  LoaderComponent,
  useGetAction,
  useIsLoading,
  useLoaderData,
} from '../../../src';
import { useLocation } from 'wouter';

import { RootLoader } from '../controllers/rootController.ts';
import { ActiveLink } from '../app/ActiveLink.tsx';
import { Form } from '../app/Form.tsx';

export const RootComponent: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const loading = useIsLoading();
  const { contacts, q } = useLoaderData<typeof RootLoader>() || {
    contacts: [],
  };
  const getFormAction = useGetAction();

  const [query, setQuery] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    setQuery(q);
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>Remix Contacts</h1>
        <div>
          <Form
            id="search-form"
            role="search"
            onChange={(submit, event) => {
              const query = (event.target as HTMLInputElement).value;

              event.preventDefault();
              setQuery(query);
              setLocation(`${location}?q=${query}`, { replace: true });
              // Defrost doesn't do any debouncing
              submit(event);
            }}
          >
            <input
              aria-label="Search contacts"
              id="q"
              name="q"
              placeholder="Search"
              type="search"
              defaultValue={query || ''}
            />
            <div aria-hidden hidden={!loading} id="search-spinner" />
          </Form>
          <form action={getFormAction()} method="POST">
            <button type="submit">New</button>
          </form>
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
                  <ActiveLink to={`/contacts/${contact.id}`}>
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{' '}
                    {contact.favorite ? <span>★</span> : null}
                  </ActiveLink>
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
      <div id="detail" className={loading ? 'loading' : ''}>
        {children}
      </div>
    </>
  );
};

export const Root: LoaderComponent = ({ children }) => (
  <DataLoader>
    <RootComponent>{children}</RootComponent>
  </DataLoader>
);
