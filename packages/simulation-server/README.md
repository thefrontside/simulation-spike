# Simulation Server

Main spike code containing the control api graphql server.

# SSL

The auth0 simulator needed to run over https.  [mkcert](https://github.com/FiloSottile/mkcert) makes this pretty easy:

```bash
brew install mkcert
brew install nss  # for firefox

mkcert -install   # Created a new local CA at the location returned from `mkcert -CAROOT`
mkcert localhost  # Using the local CA at CAROOT, create a new certificate valid for the following names
cd ./certs
openssl rsa -in ./localhost-key.pem -out ./localhost-key-pkcs1.pem # convert to RSA token
```

## quick start
```bash
yarn watch
```