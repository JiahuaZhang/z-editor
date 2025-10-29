import { ActionFunction } from 'react-router';
import { searchAll } from '~/service/document.search.server';

export const action: ActionFunction = async ({ request }) => {
  return searchAll(request);
};
