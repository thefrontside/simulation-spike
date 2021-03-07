import '@cutting/component-library/dist/component-library.cjs.development.css';
import type { FC } from 'react';
import { ApplicationLayout } from '@cutting/component-library';
import { QueryClientProvider, QueryClient } from 'react-query';
import styles from './App.module.scss';
import { Routes } from './Routes/Routes';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth } from './auth0_config';
import { history } from 'src/history/history';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

const queryClient = new QueryClient();

const Auth0: FC = ({ children }) => {
  const onRedirectCallback = (appState: { returnTo?: string }) => {
    console.dir({ appState });
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={Auth.domain}
      clientId={Auth.clientId}
      redirectUri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
      scope="openid profile email"
      authorizeTimeoutInSeconds={5}
      simulator={Auth.simulator}
      simulationId={Auth.simulationId}
    >
      {children}
    </Auth0Provider>
  );
};

export const App: FC = ({ children }) => {
  return (
    <ApplicationLayout className={styles.container}>
      <ErrorBoundary>
        <Auth0>
          <Routes>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </Routes>
        </Auth0>
      </ErrorBoundary>
    </ApplicationLayout>
  );
};
