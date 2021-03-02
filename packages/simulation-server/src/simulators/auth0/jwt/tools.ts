import * as base64url from 'base64-url';
import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';
import * as forge from 'node-forge';
import NodeRSA from 'node-rsa';
import { PrivateKeyPem, PublicKeyPem } from './keys';

type KeyPair = {
  privateKey: forge.pki.rsa.PrivateKey;
  publicKey: forge.pki.rsa.PublicKey;
};

export interface JWKS {
  keys: [
    {
      alg: string;
      kty: string;
      use: string;
      x5c: [string];
      n: string;
      e: string;
      kid: string;
      x5t: string;
    },
  ];
}

export const createCertificate = ({
  publicKey,
  privateKey,
  jwksOrigin,
}: {
  publicKey: forge.pki.PublicKey;
  privateKey: forge.pki.PrivateKey;
  jwksOrigin?: string;
}): string => {
  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = '123';
  const attrs = [
    {
      name: 'commonName',
      value: `${jwksOrigin}`,
    },
  ];
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject(attrs);
  cert.sign(privateKey);
  return forge.pki.certificateToPem(cert);
};

const getCertThumbprint = (certificate: string) => {
  const shasum = createHash('sha1');
  const der = Buffer.from(certificate).toString('binary');
  shasum.update(der);
  return shasum.digest('base64');
};

export const createJWKS = ({
  privateKey,
  publicKey,
  jwksOrigin,
}: {
  privateKey: forge.pki.PrivateKey;
  publicKey: forge.pki.PublicKey;
  jwksOrigin?: string;
}): JWKS => {
  const helperKey = new NodeRSA();
  helperKey.importKey(forge.pki.privateKeyToPem(privateKey));
  const { n: modulus, e: exponent } = helperKey.exportKey('components');
  const certPem = createCertificate({
    jwksOrigin,
    privateKey,
    publicKey,
  });
  const certDer = forge.util.encode64(
    forge.asn1.toDer(forge.pki.certificateToAsn1(forge.pki.certificateFromPem(certPem))).getBytes(),
  );
  const thumbprint = base64url.encode(getCertThumbprint(certDer));
  return {
    keys: [
      {
        alg: 'RSA256',
        e: String(exponent),
        kid: thumbprint,
        kty: 'RSA',
        n: modulus.toString('base64'),
        use: 'sig',
        x5c: [certDer],
        x5t: thumbprint,
      },
    ],
  };
};

export const createKeyPair = (): KeyPair => {
  const privateKey = forge.pki.privateKeyFromPem(PrivateKeyPem);
  const publicKey = forge.pki.publicKeyFromPem(PublicKeyPem);
  return {
    privateKey,
    publicKey,
  };
};

export interface JwtPayload {
  sub?: string;
  iss?: string;
  aud?: string;
  exp?: string;
  nbf?: string;
  iat?: string;
  jti?: string;
}

export const signJwt = (privateKey: forge.pki.PrivateKey, jwtPayload: JwtPayload, kid?: string): string => {
  const bufferedJwt = Buffer.from(JSON.stringify(jwtPayload));
  return sign(bufferedJwt, forge.pki.privateKeyToPem(privateKey), {
    algorithm: 'RS256',
    header: { kid },
  });
};
