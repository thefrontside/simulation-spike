import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import type { SimulationsState } from '../../types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';
import { webMessage } from './webMessage';
import { Auth0QueryParams } from './types';
import createJWKSMock from './jwt/create-jwt-mocks';
import { ourDomain, audience, scope } from './common';

const alg = 'RS256';

// TODO: add jwks.json endpoint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const jwksMock = createJWKSMock(ourDomain);

  const simulationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (['auth0', 'gateway'].every((url) => req.url.startsWith(`/${url}`) === false)) {
      console.dir(`redirecting ${req.url}`);
      console.dir(req.headers);
      next();
      return;
    }

    console.log(`>>>>>>> ${req.url} <<<<<<<<<<<<<<<<<<`);
    console.dir({ query: req.query });
    console.dir({ headers: req.headers });
    console.dir({ body: req.body });
    console.log(`>>>>>>> ${req.url} <<<<<<<<<<<<<<<<<<`);

    // const simulationId = req.params['simulation_id'];

    // const simulations = Object.values(atom.slice('simulations').get());
    // const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    // if (typeof simulation === 'undefined') {
    //   console.log(`no simulation for ${simulationId}`);
    //   res.status(404).send('Not found');
    //   return;
    // }

    next();
  };

  app.get('/auth0/:simulation_id/tokens', simulationMiddleware, function (req, res) {
    return res.json(tokenStore.tokens);
  });

  app.get('/auth0/:simulation_id/userinfo', simulationMiddleware, function (req, res) {
    return res.json({ wut: '?' });
  });

  // const user = {
  //   nickname: 'paul.cowan',
  //   name: 'paul.cowan@cutting.scot',
  //   picture:
  //     'https://s.gravatar.com/avatar/2bf8a82df6ec1a5022df12ec6e5e280e?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fpa.png',
  //   updated_at: '2021-03-01T23:52:18.944Z',
  //   email: 'paul.cowan@cutting.scot',
  //   email_verified: true,
  //   sub: 'auth0|603607f0286beb00699a58d2',
  // };

  app.get('/auth0/:simulation_id/authorize', simulationMiddleware, (req, res) => {
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

    return res.status(200).send(Buffer.from(raw));
  });

  app.post('/auth0/:simulation_id/oauth/token', simulationMiddleware, function (req, res) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client_id, code_verifier, code, grant_type, redirect_uri } = req.body;
    const hours = 1;

    const expiresIn = hours * 60 * 60 * 1000;

    const issued = Date.now();

    const accessToken = jwksMock.token({
      alg,
      typ: 'JWT',
      iss: ourDomain,
      exp: expiresIn.toString(),
      iat: issued.toString(),
      aud: audience,
    });

    const idToken = jwksMock.token({
      alg,
      typ: 'JWT',
      iss: ourDomain,
      exp: expiresIn.toString(),
      iat: issued.toString(),
      mail: 'bob@gmail.com',
      aud: audience,
      sub: 'subject field',
    });

    const result = {
      access_token: accessToken,
      id_token: idToken,
      scope,
      expires_in: 86400,
      token_type: 'Bearer',
    };

    return res.status(200).json(result);
  });
};
