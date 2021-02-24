import { createBrowserHistory, createMemoryHistory } from 'history';

const env = process.env.NODE_ENV ?? 'development';

export const history = env === 'test' ? createMemoryHistory() : createBrowserHistory();
