import { FunctionComponent } from 'react';
import { Router as Wouter, Route, Switch } from 'wouter';

import { Index } from '../views/_index.tsx';
import { Contact } from '../views/contact.tsx';
import { Root } from '../views/root.tsx';

export const Router: FunctionComponent = () => (
  <Wouter>
    <Switch>
      <Route path="/">
        <Root>
          <Index />
        </Root>
      </Route>
      <Route path="/contacts/:contactId">
        <Root>
          <Contact />
        </Root>
      </Route>
      <Route>
        <Root>
          <Index />
        </Root>
      </Route>
    </Switch>
  </Wouter>
);
