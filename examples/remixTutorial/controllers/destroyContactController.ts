import { ControllerFunction, redirect } from '../../../src';
import invariant from 'tiny-invariant';

import { deleteContact } from '../models/data.ts';

export const DestroyContactAction: ControllerFunction = async request => {
  const { params } = request;

  invariant(params.contactId, 'Missing contactId param');

  await deleteContact(params.contactId);
  return redirect(`/`);
};
