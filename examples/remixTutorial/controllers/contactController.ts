import { json, Request } from '../../../src';
import invariant from 'tiny-invariant';

import { getContact } from '../models/data.ts';

export const ContactLoader = async ({ params }: Request) => {
  invariant(params.contactId, 'Missing contactId param');
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw json('Not found', {
      status: 404,
    });
  }

  return json({
    contact,
  });
};
