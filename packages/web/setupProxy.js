// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/oauth',
    createProxyMiddleware({
      target: 'https://localhost:3000',
      changeOrigin: true,
      logLevel: 'debug',
      protocolRewrite: 'http',
    }),
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
