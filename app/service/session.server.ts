import { createCookieSessionStorage, redirect } from 'react-router';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.VITE_COOKIES_SECRET ?? 'your-secret-key'],
    secure: process.env.NODE_ENV === 'production',
  },
});

type GoogleUserMetadata = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  picture: string;
  provider_id: string;
  sub: string;
};

type GoogleUserIdentity = {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: GoogleUserMetadata;
  provider: 'google';
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
  email: string;
};

export type GoogleUser = {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: 'google';
    providers: ['google'];
  };
  user_metadata: GoogleUserMetadata;
  identities: GoogleUserIdentity[];
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
};

export const authenticate = async (request: Request): Promise<GoogleUser> => {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const user = session.get("user") as GoogleUser | undefined;

  if (!user || !user.id) {
    throw redirect('/login', { headers: { "Set-Cookie": await sessionStorage.destroySession(session), } });
  }

  return user;
};