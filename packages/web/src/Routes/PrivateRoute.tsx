import { useAuth0 } from '@auth0/auth0-react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { LoadingOverlay } from '@cutting/component-library';

export const PrivateRoute = ({ children, ...rest }: RouteProps): JSX.Element => {
  const { isLoading, error, isAuthenticated } = useAuth0();

  if (isLoading) {
    return <LoadingOverlay busy={true} />;
  }

  if (error) {
    return <div>Oh no....{error.message}</div>;
  }

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
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
