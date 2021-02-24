import { FC } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Login } from 'src/components/Login/Login';
import { createBrowserHistory } from 'history';

import { UnAuthorised } from 'src/components/UnAuthorised/UnAuthorised';

const history = createBrowserHistory();

export const Routes: FC = ({ children }) => (
  <Router history={history}>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/unauthorised">
        <UnAuthorised />
      </Route>
    </Switch>
    {children}
  </Router>
);
