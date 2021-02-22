import ReactDOM from 'react-dom';
import type { FC } from 'react';
import { StrictMode } from 'react';
import { App } from './App';

export const root = document.getElementById('root');

const render = (Component: FC) => {
  ReactDOM.render(
    <StrictMode>
      <Component />
    </StrictMode>,
    root,
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => import('./App').then((m) => render(m.App)));
}
