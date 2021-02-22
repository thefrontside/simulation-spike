import '@cutting/component-library/dist/component-library.cjs.development.css';
import type { FC } from 'react';
import { ApplicationLayout } from '@cutting/component-library';
import { QueryClientProvider, QueryClient } from 'react-query';

import styles from './App.module.scss';
import { Routes } from './Routes/Routes';

const queryClient = new QueryClient();

export const App: FC = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationLayout heading="Log in" className={styles.container}>
        <Routes>{children}</Routes>
      </ApplicationLayout>
    </QueryClientProvider>
  );
};
