import type { FC } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button, LoadingOverlay } from '@cutting/component-library';
import { Link } from 'react-router-dom';

import styles from './UnAuthorised.module.scss';

export const UnAuthorised: FC = () => {
  const { loginWithPopup, isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return <LoadingOverlay busy={true} />;
  }

  if (error) {
    return <div>drat....{error.message}</div>;
  }

  return (
    <section className={styles.container}>
      <h1>You are {isAuthenticated ? 'authenticated' : 'unauthenticated'}</h1>
      <p>
        {!isAuthenticated && (
          <Button buttonStyle="primary" onClick={loginWithPopup}>
            Log In
          </Button>
        )}
        {isAuthenticated && (
          <strong>
            <Link to="/">Ok, now go to authorised</Link>
          </strong>
        )}
      </p>
    </section>
  );
};
