import { DataLoader, LoaderComponent } from '../../../src';

import { App } from '../app/App.tsx';

export const TodoView: LoaderComponent = () => (
  <DataLoader>
    <App />
  </DataLoader>
);
