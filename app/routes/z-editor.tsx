import { Outlet, useLoaderData } from 'react-router';
import { UserPanel } from '~/components/UserPanel';
import { authenticate } from '~/service/session.server';

export const loader = async ({ request }: { request: Request; }) => {
  const user = await authenticate(request);
  return { user };
};

const Page = () => {
  const { user } = useLoaderData();

  return <div un-h='100vh' >
    <UserPanel user={user} />
    <Outlet />
  </div>;
};

export default Page;
