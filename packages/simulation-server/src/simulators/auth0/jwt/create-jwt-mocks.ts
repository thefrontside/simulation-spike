import { createJWKS, createKeyPair, signJwt } from './tools';

export type JWKSMock = {
  kid(): string;
  token(token: Record<string, unknown>): string;
};

const createJWKSMock = (jwksOrigin: string): JWKSMock => {
  const keypair = createKeyPair();
  const { privateKey } = keypair;
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin,
  });
  return {
    kid() {
      return JWKS.keys[0].kid;
    },
    token(token = {}) {
      return signJwt(privateKey, token, this.kid());
    },
  };
};

export default createJWKSMock;
