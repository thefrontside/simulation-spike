import { FC } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Login } from 'src/components/Login/Login';
import { history } from 'src/history/history';
import { PrivateRoute } from 'src/Routes/PrivateRoute';
import { Main } from 'src/components/Main/Main';

import { UnAuthorised } from 'src/components/UnAuthorised/UnAuthorised';

export const Routes: FC = ({ children }) => (
  <Router history={history}>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>

      <Route path="/unauthorised">
        <UnAuthorised />
      </Route>
      <PrivateRoute path="/" exact>
        <Main />
      </PrivateRoute>
    </Switch>
    {children}
  </Router>
);
