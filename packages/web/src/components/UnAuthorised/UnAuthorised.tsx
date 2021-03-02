import type { FC } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@cutting/component-library';

export const UnAuthorised: FC = () => {
  const { loginWithPopup } = useAuth0();

  return (
    <section>
      <h1>Unauthorised</h1>
      <p>
        <Button buttonStyle="primary" onClick={loginWithPopup}>
          Log In
        </Button>
      </p>
    </section>
  );
};
