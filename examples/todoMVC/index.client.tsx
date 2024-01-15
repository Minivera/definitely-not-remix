import { hydrateRoot } from 'react-dom/client';

import { ClientContextProvider } from '../../src';

import { Root } from './app/Root.tsx';
import { TodoView } from './views/todoView.tsx';

hydrateRoot(
  document,
  <ClientContextProvider>
    <Root>
      <TodoView />
    </Root>
  </ClientContextProvider>
);
