import '@cutting/component-library/dist/component-library.cjs.development.css';
import type { FC } from 'react';
import { ApplicationLayout } from '@cutting/component-library';
import { QueryClientProvider, QueryClient } from 'react-query';
import styles from './App.module.scss';
import { Routes } from './Routes/Routes';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth } from './auth0_config';
import { history } from 'src/history/history';

const queryClient = new QueryClient();

console.dir(Auth.domain);

const Auth0: FC = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRedirectCallback = (appState: any) => {
    console.dir(appState);
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={Auth.domain}
      clientId={Auth.clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export const App: FC = ({ children }) => {
  return (
    <ApplicationLayout className={styles.container}>
      <Auth0>
        <Routes>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </Routes>
      </Auth0>
    </ApplicationLayout>
  );
};
