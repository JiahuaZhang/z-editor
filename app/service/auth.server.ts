import { jwtDecode } from 'jwt-decode';
import { createCookieSessionStorage, redirect } from 'react-router';
import { Authenticator } from 'remix-auth';
import { FacebookStrategy, GoogleStrategy, SocialsProvider } from 'remix-auth-socials';

export type GoogleUser = {
  type: 'google';
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

export type FacebookUser = {
  type: 'facebook';
  email: string;
  name: string;
};

export type User = GoogleUser | FacebookUser;

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

export const authenticator = new Authenticator<User>();

const getCallback = (provider: string) => `${process.env.VITE_BASE_URL}/auth/${provider}/callback`;

const googleStrategy = new GoogleStrategy<GoogleUser>(
  {
    clientId: process.env.VITE_GOOGLE_CLIENT_ID!,
    clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET!,
    redirectURI: getCallback(SocialsProvider.GOOGLE),
  },
  async ({ request, tokens }) => {
    const profile = jwtDecode(tokens.idToken());
    const { email, name, picture, given_name, family_name, iat, exp } = profile as any;
    return { type: 'google', email, name, picture, given_name, family_name, iat, exp } as GoogleUser;
  }
);

const facebookStrategy = new FacebookStrategy(
  {
    clientId: process.env.VITE_FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.VITE_FACEBOOK_SECRET!,
    redirectURI: getCallback(SocialsProvider.FACEBOOK),
  },
  async ({ request, tokens }) => {
    console.log(request, tokens);
    return {} as FacebookUser;
  }
);

authenticator.use(googleStrategy);
authenticator.use(facebookStrategy);

export const authenticate = async (request: Request) => {
  const session = await sessionStorage.getSession(request.headers.get("cookie"));
  const user = session.get("user");
  if (user) return user;

  throw redirect('/login', { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } });
};