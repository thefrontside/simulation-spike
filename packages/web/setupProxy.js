// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/auth0',
    createProxyMiddleware(
      (pathname) => {
        return pathname.includes('auth0');
      },
      { target: 'http://localhost:3000', protocolRewrite: 'http', changeOrigin: true, logLevel: 'debug' },
    ),
  );
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      logLevel: 'debug',
    }),
  );
};
