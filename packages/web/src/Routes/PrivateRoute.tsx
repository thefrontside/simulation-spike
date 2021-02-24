import { useAuth } from 'src/hooks/useAuth';
import { Redirect, Route, RouteProps } from 'react-router-dom';

export const PrivateRoute = ({ children, ...rest }: RouteProps): JSX.Element => {
  const auth = useAuth();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/unauthorised',
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};
