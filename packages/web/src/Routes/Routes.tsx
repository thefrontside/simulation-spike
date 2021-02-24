import { FC } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Login } from 'src/components/Login/Login';
import { createBrowserHistory } from 'history';
import { PrivateRoute } from './PrivateRoute';
import { Main } from 'src/components/Main/Main';
import { UnAuthorised } from 'src/components/UnAuthorised/UnAuthorised';

export const Routes: FC = ({ children }) => (
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/unauthorised">
        <UnAuthorised />
      </Route>
      <PrivateRoute path="/">
        <Main />
      </PrivateRoute>
    </Switch>
    {children}
  </Router>
);
