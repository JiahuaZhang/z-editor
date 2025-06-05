import { redirect, type MetaFunction } from "react-router";
import { authenticate } from '~/service/session.server';

export const loader = async ({ request }: { request: Request; }) => {
  const user = await authenticate(request);

  return redirect('/z-editor/search');
};

export const meta: MetaFunction = () => [{ title: "Home" }, { name: "description", content: "Hello World!" }];