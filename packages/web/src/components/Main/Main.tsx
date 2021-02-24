import { useAuth0 } from '@auth0/auth0-react';
import { FC } from 'react';
import styles from './Main.module.scss';
import { Button } from '@cutting/component-library';

export const Main: FC = () => {
  const { logout } = useAuth0();

  return (
    <section className={styles.main}>
      <h1>Authenticated</h1>
      <div>
        <Button buttonStyle="primary" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </section>
  );
};
