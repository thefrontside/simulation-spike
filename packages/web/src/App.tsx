import '@cutting/component-library/dist/component-library.cjs.development.css';
import type { FC } from 'react';
import { ApplicationLayout } from '@cutting/component-library';
import { QueryClientProvider, QueryClient } from 'react-query';

import styles from './App.module.scss';
import { Routes } from './Routes/Routes';
import { Auth0Provider } from '@auth0/auth0-react';
import { Auth } from './auth0_config';

const queryClient = new QueryClient();

export const App: FC = ({ children }) => {
  return (
    <Auth0Provider domain={Auth.domain} clientId={Auth.clientId} redirectUri={window.location.origin}>
      <QueryClientProvider client={queryClient}>
        <ApplicationLayout className={styles.container}>
          <Routes>{children}</Routes>
        </ApplicationLayout>
      </QueryClientProvider>
    </Auth0Provider>
  );
};
