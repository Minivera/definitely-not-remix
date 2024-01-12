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
      <title suppressHydrationWarning>My blog</title>
    </head>
    <body>
      {children}
      <script type="module" src="/index.client.tsx"></script>
      <Scripts />
    </body>
  </html>
);
