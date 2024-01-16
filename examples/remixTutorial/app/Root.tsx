import { FunctionComponent, PropsWithChildren } from 'react';
import { Scripts } from '../../../src';

export const Root: FunctionComponent<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head suppressHydrationWarning>
      <meta suppressHydrationWarning charSet="utf-8" />
      <meta
        suppressHydrationWarning
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <link href="/styles/app.css" rel="stylesheet" suppressHydrationWarning />
    </head>
    <body>
      {children}
      <script type="module" src="/index.client.tsx"></script>
      <Scripts />
    </body>
  </html>
);
