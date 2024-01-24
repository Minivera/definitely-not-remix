import { FunctionComponent } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Router as Wouter, useLocation } from 'wouter';
import {
  ClientContextProvider,
  redirect,
  json,
  DataLoader,
  frameworkRouter,
  Scripts,
} from '../../src';

import { Root } from './app/Root.tsx';
import { Router } from './app/Router';

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
