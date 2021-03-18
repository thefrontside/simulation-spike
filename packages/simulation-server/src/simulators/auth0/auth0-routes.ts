import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import type { SimulationsState } from '../../types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';
import { webMessage } from './webMessage';
import { Auth0QueryParams } from './types';
import createJWKSMock from './jwt/create-jwt-mocks';
import { Domain, scope } from './common';
import { expiresAt } from '../../utils/date';
import { redirect } from './redirect';

const alg = 'RS256';

// HACK: horrible spike code temp store.
const nonceMap: Record<string, string> = {};

// type SimulationRequestProps = { simulationId: string; simulator: 'auth0' };

// TODO: add jwks.json endpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const jwksMock = createJWKSMock(Domain);

  const simulationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // const { simulationId, simulator } = req.query as SimulationRequestProps;

    console.dir(req.method);

    // if (['options', 'head'].includes(req.method)) {
    //   return next();
    // }

    // if (!simulationId && !simulator) {
    //   ({ simulationId, simulator } = req.body);
    // }

    // if (simulator !== 'auth0') {
    //   console.log(`no auth0 route match for ${req.url}`);
    //   return next();
    // }

    // const simulations = Object.values(atom.slice('simulations').get());
    // const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    // if (typeof simulation === 'undefined') {
    //   console.log(`no simulation for ${simulationId}`);
    //   return res.status(404).send('Not found');
    // }

    // console.log(`>>>>>>> ${req.url} <<<<<<<<<<<<<<<<<<`);
    // console.dir({ query: req.query });
    // console.dir({ headers: req.headers });
    // console.dir({ body: req.body });
    // console.log(`>>>>>>> ${req.url} <<<<<<<<<<<<<<<<<<`);

    next();
  };

  app.get('/tokens', simulationMiddleware, function (req, res) {
    return res.json(tokenStore.tokens);
  });

  app.get('/userinfo', simulationMiddleware, function (req, res) {
    return res.json({ wut: '?' });
  });

  app.get('/authorize', simulationMiddleware, (req, res) => {
    console.log('-----------------------');
    console.dir(req.query);
    console.log('-----------------------');
    const {
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      nonce,
      response_mode,
    } = req.query as Auth0QueryParams;

    const required = { client_id, scope, redirect_uri, response_mode } as const;

    for (const key of Object.keys(required)) {
      if (!required[key as keyof typeof required]) {
        return res.status(400).send(`missing ${key}`);
      }
    }

    res.removeHeader('X-Frame-Options');

    res.set('Content-Type', 'text/html');

    const raw =
      response_mode === 'web_message'
        ? webMessage({ code: code_challenge, state, redirect_uri, nonce })
        : redirect({ state });

    nonceMap[code_challenge] = nonce;

    if (response_mode === 'web_message') {
      return res.status(200).send(Buffer.from(raw));
    }

    return res.status(302).redirect(`http://localhost:5000/login?state=${state}&redirect_uri=${redirect_uri}`);
  });

  app.get('/u/login', (_, res) => {
    res.status(200).redirect(`http://localhost:5000/login`);
  });

  const loginPostHandler = (req: Request, res: Response) => {
    const { code, state } = req.query as { code: string; state: string };
    res.status(302).redirect(`http://localhost:5000?code=${code}&state=${state}`);
  };

  app.post('/u/login', simulationMiddleware, loginPostHandler);

  app.post('/co/authenticate', simulationMiddleware, function (req, res) {
    res.send(200).json({ ok: true });
  });

  app.post('/oauth/token', simulationMiddleware, function (req, res) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client_id, code_verifier, code, grant_type, redirect_uri } = req.body;

    const issued = Date.now();

    const nonce = nonceMap[code];

    if (!nonce) {
      return res.status(400).send(`no nonce in store for ${code}`);
    }

    const expires = expiresAt();

    const idToken = jwksMock.token({
      alg,
      typ: 'JWT',
      iss: Domain,
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
      iss: Domain,
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
