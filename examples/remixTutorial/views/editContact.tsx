import { FunctionComponent } from 'react';
import { DataLoader, LoaderComponent, useLoaderData } from '../../../src';
import { useLocation, useRoute } from 'wouter';

import { ContactLoader } from '../controllers/contactController.ts';

const EditContactComponent: FunctionComponent = () => {
  const { contact } = useLoaderData<typeof ContactLoader>();
  const [, setLocation] = useLocation();

  return (
    <form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button
          type="button"
          onClick={() => setLocation(`/contacts/${contact.id}`)}
        >
          Cancel
        </button>
      </p>
    </form>
  );
};

export const EditContact: LoaderComponent = () => {
  const [matched, params] = useRoute('/contacts/:contactId/edit');

  return (
    <DataLoader
      shouldReload={(_, loaderParams) =>
        !matched || loaderParams.contactId !== params.contactId
      }
    >
      <EditContactComponent />
    </DataLoader>
  );
};
