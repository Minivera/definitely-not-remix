import { FunctionComponent } from 'react';
import {
  DataLoader,
  LoaderComponent,
  useGetAction,
  useLoaderData,
} from '../../../src';
import { useRoute } from 'wouter';

import { ContactRecord } from '../data.ts';
import { ContactLoader } from '../controllers/contactController.ts';
import { Form } from '../app/Form.tsx';

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, 'favorite'>;
}> = ({ contact }) => {
  const favorite = contact.favorite;

  return (
    <Form method="POST">
      <button
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        name="favorite"
        value={favorite ? 'false' : 'true'}
      >
        {favorite ? '★' : '☆'}
      </button>
    </Form>
  );
};

export const ContactComponent: FunctionComponent = () => {
  const { contact } = useLoaderData<typeof ContactLoader>() || {
    contact: null,
  };
  const getFormAction = useGetAction();

  if (!contact) {
    return <div id="contact">Loading...</div>;
  }

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>
      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{' '}
          <Favorite contact={contact} />
        </h1>
        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}
        {contact.notes ? <p>{contact.notes}</p> : null}
        <div>
          <form action={getFormAction('edit')}>
            <button type="submit">Edit</button>
          </form>
          <form
            action={getFormAction('destroy')}
            method="POST"
            onSubmit={event => {
              const response = confirm(
                'Please confirm you want to delete this record.'
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Contact: LoaderComponent = () => {
  const [matched, params] = useRoute('/contacts/:contactId');

  return (
    <DataLoader
      shouldReload={(_, loaderParams) =>
        !matched || loaderParams.contactId !== params.contactId
      }
    >
      <ContactComponent />
    </DataLoader>
  );
};
