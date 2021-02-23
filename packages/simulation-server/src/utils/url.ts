export const urlJoin = (...path: string[]): string => ['', ...path].map((x) => x.replace(/\//, '')).join('/');

const port = process.env.PORT || 3000;

export const fullUrl = (...path: string[]): string =>
  // TODO: get real protocol etc.
  `http://localhost:${port}${urlJoin(...path)}`;
