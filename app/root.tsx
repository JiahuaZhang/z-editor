import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from 'react-router';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

export default function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Global loading bar */}
        {isLoading && (
          <div
            un-fixed="~"
            un-top="0"
            un-left="0"
            un-right="0"
            un-h="1"
            un-bg="blue-5"
            un-z="50"
            un-animate="pulse"
          />
        )}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
