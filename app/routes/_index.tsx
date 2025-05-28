import { Link, useLoaderData, type MetaFunction } from "react-router";
import { authenticate } from '~/service/session.server';

export const loader = async ({ request }: { request: Request; }) => {
  const user = await authenticate(request);
  return { user };
};

export const meta: MetaFunction = () => [{ title: "Home" }, { name: "description", content: "Hello World!" }];

const Index = () => {
  const { user } = useLoaderData();
  // console.log(user);

  return (
    <div>
      <h1>Hello World</h1>
      <div un-border=' solid blue-4' un-grid='~' >
        <button un-mx='auto' un-border='2 solid blue-4 rounded' un-p='2' un-mt='4' >
          <Link to="/logout">
            Logout
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Index;