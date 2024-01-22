import { FunctionComponent } from 'react';
import { Router as Wouter, Route, Switch } from 'wouter';

import { Index } from '../views/_index.tsx';
import { Contact } from '../views/contact.tsx';
import { Root } from '../views/root.tsx';
import { EditContact } from '../views/editContact.tsx';

export const Router: FunctionComponent = () => (
  <Wouter>
    <Root>
      <Switch>
        <Route path="/">
          <Index />
        </Route>
        <Route path="/contacts/:contactId">
          <Contact />
        </Route>
        <Route path="/contacts/:contactId/edit">
          <EditContact />
        </Route>
        <Route>
          <Index />
        </Route>
      </Switch>
    </Root>
  </Wouter>
);
