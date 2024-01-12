import { hydrateRoot } from 'react-dom/client';

import { Router } from './client/Router';
import { ClientContextProvider } from '../../src';

import { Root } from './client/Root.tsx';

hydrateRoot(
  document,
  <ClientContextProvider>
    <Root>
      <Router />
    </Root>
  </ClientContextProvider>
);
