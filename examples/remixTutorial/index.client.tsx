import { hydrateRoot } from 'react-dom/client';

import { ClientContextProvider } from '../../src';

import { Root } from './app/Root.tsx';
import { Router } from './app/Router.tsx';

hydrateRoot(
  document,
  <ClientContextProvider>
    <Root>
      <Router />
    </Root>
  </ClientContextProvider>
);
