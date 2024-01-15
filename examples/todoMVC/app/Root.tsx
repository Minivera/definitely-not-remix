import { FunctionComponent, PropsWithChildren } from 'react';
import { Scripts } from '../../../src';

export const Root: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head suppressHydrationWarning>
      <meta charSet="UTF-8" suppressHydrationWarning />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
        suppressHydrationWarning
      />
      <title suppressHydrationWarning>TodoMVC</title>
      <link
        href="https://cdn.jsdelivr.net/npm/todomvc-common@1.0.5/base.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/todomvc-app-css@2.4.3/index.min.css"
        rel="stylesheet"
      />
    </head>
    <body>
      <section className="todoapp">{children}</section>
      <footer className="info">
        <p>Double-click to edit a todo</p>
      </footer>
      <script type="module" src="/index.client.tsx"></script>
      <Scripts />
    </body>
  </html>
);
