# Simulation Spike

Monorepo with the main spike code in the [simulation-server](./packages/simulation-server) package.

## Quick start

```bash
# starts code watcher, control api and simulators

yarn quick-start
```

## SSL

For auth0 integration, localhost needs to run under ssl, I used [mkcert](https://github.com/FiloSottile/mkcert)......and it just worked.

```bash
brew install mkcert
brew install nss # for firefox

mkcert -install -cert-file localhost -key-file localhost
```