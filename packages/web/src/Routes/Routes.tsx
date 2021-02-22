import { FC } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { Login } from 'src/components/Login/Login';
import { createBrowserHistory } from 'history';
import { PrivateRoute } from './PrivateRoute';
import { Main } from 'src/components/Main/Main';

export const Routes: FC = ({ children }) => (
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <PrivateRoute path="/">
        <Main />
      </PrivateRoute>
    </Switch>
    {children}
  </Router>
);
