import { useLoaderData, type MetaFunction } from "react-router";
import { UserPanel } from '~/components/UserPanel';
import { authenticate } from '~/service/session.server';

export const loader = async ({ request }: { request: Request; }) => {
  const user = await authenticate(request);
  return { user };
};

export const meta: MetaFunction = () => [{ title: "Home" }, { name: "description", content: "Hello World!" }];

const Index = () => {
  const { user } = useLoaderData();
  console.log(user);

  return (
    <div>
      <UserPanel user={user} />
      <h1>Hello world!</h1>
    </div>
  );
};

export default Index;