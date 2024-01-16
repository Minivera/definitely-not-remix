import { json, Request } from '../../../src';
import invariant from 'tiny-invariant';

import { getContact } from '../data.ts';

export const ContactLoader = async ({ params }: Request) => {
  invariant(params.contactId, 'Missing contactId param');
  const contact = await getContact(params.contactId);
  // FIXME: This is not implemented in the framework yet
  /* if (!contact) {
    return json('Not found', {
      status: 404,
    });
  } */

  return json({
    contact,
  });
};
