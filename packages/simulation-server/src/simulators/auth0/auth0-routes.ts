import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import type { SimulationsState } from '../../types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';
import { webMessage } from './webMessage';
import { Auth0QueryParams } from './types';
import createJWKSMock from './jwt/create-jwt-mocks';
import { ourDomain, scope } from './common';
import { epochTime, expiresAt } from '../../utils/date';

const alg = 'RS256';

// HACK: horrible spike code temp store.
const nonceMap: Record<string, string> = {};

type SimulationRequestProps = { simulationId: string; simulator: 'auth0' };

// TODO: add jwks.json endpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const jwksMock = createJWKSMock(ourDomain);

  const simulationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let { simulationId, simulator } = req.query as SimulationRequestProps;

    if (['options', 'head'].includes(req.method)) {
      return next();
    }

    if (!simulationId && !simulator) {
      ({ simulationId, simulator } = req.body);
    }

    console.dir({ simulationId, simulator });

    if (simulator !== 'auth0') {
      console.log(`no auth0 route match for ${req.url}`);
      return next();
    }

    const simulations = Object.values(atom.slice('simulations').get());
    const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    if (typeof simulation === 'undefined') {
      console.log(`no simulation for ${simulationId}`);
      return res.status(404).send('Not found');
    }

    next();
  };

  app.get('/tokens', simulationMiddleware, function (req, res) {
    return res.json(tokenStore.tokens);
  });

  app.get('/userinfo', simulationMiddleware, function (req, res) {
    return res.json({ wut: '?' });
  });

  app.get('/authorize', simulationMiddleware, (req, res) => {
    const { client_id, redirect_uri, scope, state, code_challenge, nonce } = req.query as Auth0QueryParams;

    const required = { client_id, scope, redirect_uri } as const;

    for (const key of Object.keys(required)) {
      if (!required[key as keyof typeof required]) {
        return res.status(400).send(`missing ${key}`);
      }
    }

    res.removeHeader('X-Frame-Options');

    res.set('Content-Type', 'text/html');

    const raw = webMessage({ code: code_challenge, state, redirect_uri, nonce });

    nonceMap[code_challenge] = nonce;

    return res.status(200).send(Buffer.from(raw));
  });

  app.post('/oauth/token', simulationMiddleware, function (req, res) {
    console.log('**** made it to /oauth/token ********');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client_id, code_verifier, code, grant_type, redirect_uri } = req.body;

    const issued = Date.now();

    const nonce = nonceMap[code];

    if (!nonce) {
      res.status(400).send(`no nonce in store for ${code}`);
      return;
    }

    const expires = expiresAt();

    const idToken = jwksMock.token({
      alg,
      typ: 'JWT',
      iss: ourDomain,
      exp: expires,
      iat: issued,
      mail: 'bob@gmail.com',
      aud: client_id,
      sub: 'subject field',
      nonce,
    });

    const accessToken = jwksMock.token({
      alg,
      typ: 'JWT',
      iss: ourDomain,
      exp: expires,
      iat: issued,
      aud: client_id,
    });

    return res.status(200).json({
      access_token: accessToken,
      id_token: idToken,
      scope,
      expires_in: 86400,
      token_type: 'Bearer',
    });
  });
};
