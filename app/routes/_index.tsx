import { useLoaderData, type MetaFunction } from "react-router";
import { authenticate } from '~/service/auth.server';

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
      <h1>Hello World</h1>
    </div>
  );
};

export default Index;