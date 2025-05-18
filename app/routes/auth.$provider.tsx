import { ActionFunction, redirect } from 'react-router';
import { authenticator } from '~/service/auth.server';

export const loader = () => redirect('/login');

export const action: ActionFunction = async ({ request, params }) => authenticator.authenticate(params.provider ?? '', request);