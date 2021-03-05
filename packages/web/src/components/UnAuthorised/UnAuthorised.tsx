import type { FC } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, LoadingOverlay } from '@cutting/component-library';

export const UnAuthorised: FC = () => {
  const { loginWithPopup, isAuthenticated, isLoading, error } = useAuth0();

  console.log({ isAuthenticated, isLoading });

  if (isLoading) {
    return <LoadingOverlay busy={true} />;
  }

  if (error) {
    console.error(error);
    return <div>drat....{error.message}</div>;
  }

  return (
    <section>
      <h1>Unauthorised</h1>
      <p>
        <Button buttonStyle="primary" onClick={() => loginWithPopup()}>
          Log In
        </Button>
      </p>
    </section>
  );
};
