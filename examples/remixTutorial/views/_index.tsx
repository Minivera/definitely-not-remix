import { LoaderComponent, DataLoader } from '../../../src';

export const Index: LoaderComponent = () => (
  <DataLoader>
    <p id="index-page">
      This is a demo for Remix.
      <br />
      Check out <a href="https://remix.run">the docs at remix.run</a>.
    </p>
  </DataLoader>
);
