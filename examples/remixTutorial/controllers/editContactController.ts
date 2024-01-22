import { ControllerFunction, redirect } from '../../../src';
import invariant from 'tiny-invariant';

import { updateContact } from '../data';

export const EditContactAction: ControllerFunction = async request => {
  const { params } = request;

  invariant(params.contactId, 'Missing contactId param');

  const updates = request.body;

  await updateContact(params.contactId, updates);
  return redirect(`/contacts/${params.contactId}`);
};
