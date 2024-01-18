import { FunctionComponent } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Router as Wouter, useLocation } from 'wouter';

import { Router } from './client/Router';
import { ClientContextProvider } from '../../src';

import { Root } from './client/Root.tsx';

export const RouterPoweredApp: FunctionComponent = () => {
  const [location] = useLocation();

  return (
    <ClientContextProvider currentLocation={location}>
      <Root>
        <Router />
      </Root>
    </ClientContextProvider>
  );
};

hydrateRoot(
  document,
  <Wouter>
    <RouterPoweredApp />
  </Wouter>
);
