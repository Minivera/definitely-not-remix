import { redirect } from '../../../src';

export const NotFoundLoader = async () => {
  return redirect('/');
};
