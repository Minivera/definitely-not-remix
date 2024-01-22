import { json, Request, redirect } from '../../../src';

import { createEmptyContact, getContacts } from '../data.ts';

export const RootLoader = async (request: Request) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const contacts = await getContacts(q);

  return json({
    q,
    contacts,
  });
};

export const RootAction = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};
