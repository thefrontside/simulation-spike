# SSL

the auth0 simulator requires express to be running over ssl

```bash
openssl req -x509 -newkey rsa:4096 -keyout server_key.pem -out server_cert.pem -nodes -days 365 -subj "/CN=localhost/O=Client\ Certificate\ Demo"
```

## keep chrome happy

```bash
chrome://flags/#allow-insecure-localhost
```

I used [this guide](https://medium.com/@sevcsik/authentication-using-https-client-certificates-3c9d270e8326).