import { json } from '../../../src';

import { createEmptyContact, getContacts } from '../data.ts';

export const RootLoader = async () => {
  const contacts = await getContacts();

  return json({
    contacts,
  });
};

export const RootAction = async () => {
  const contact = await createEmptyContact();
  return json({ contact });
};
