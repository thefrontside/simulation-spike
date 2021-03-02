import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import type { SimulationsState } from '../../types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';
import { authorizationResponse } from './htmlResponse';
import { Auth0QueryParams } from './types';
import createJWKSMock from './jwt/create-jwt-mocks';

const jwksOrigin = 'https://localhost:5000';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const jwksMock = createJWKSMock(jwksOrigin);

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    if (['auth0', 'gateway'].every((url) => req.url.startsWith(`/${url}`) === false)) {
      console.dir(`redirecting ${req.url}`);
      console.dir(req.headers);
      next();
      return;
    }

    const simulationId = req.params['simulation_id'];

    const simulations = Object.values(atom.slice('simulations').get());
    const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    if (typeof simulation === 'undefined') {
      console.log(`no simulation for ${simulationId}`);
      res.status(404).send('Not found');
      return;
    }

    next();
  };

  app.get('/auth0/:simulation_id/tokens', middleware, function (req, res) {
    return res.json(tokenStore.tokens);
  });

  app.get('/auth0/:simulation_id/userinfo', middleware, function (req, res) {
    return res.json({ wut: '?' });
  });

  app.get('/auth0/:simulation_id/authorize', middleware, (req, res) => {
    console.log('/authorize');
    console.dir(req.query);
    console.dir(req.headers);

    const { client_id, redirect_uri, scope, state, code_challenge } = req.query as Auth0QueryParams;

    if (!client_id) {
      return res.status(400).send('no client_id');
    }

    if (!scope) {
      return res.status(400).send('no scope');
    }

    if (!redirect_uri) {
      return res.status(403).send('unauthorised');
    }

    res.set('Content-Type', 'text/html');

    const raw = authorizationResponse({ code: code_challenge, state, redirect_uri });

    return res.status(200).send(Buffer.from(raw));
  });

  app.post('/auth0/:simulation_id/oauth/token', middleware, function (req, res) {
    console.log('>>>>>>> /oauth/token <<<<<<<<<<<<<<<<<<');
    console.dir(req.query);
    console.dir(req.headers);
    console.dir(req.body);
    console.log('>>>>>>> /oauth/token <<<<<<<<<<<<<<<<<<');

    const hours = 1;

    const expiresIn = hours * 60 * 60 * 1000;

    const issued = Date.now();

    const accessToken = jwksMock.token({
      alg: 'RS256',
      typ: 'JWT',
      iss: 'https://adfs.mycompany.com/adfs/services/trust',
      exp: expiresIn,
      iat: issued,
    });

    const idToken = jwksMock.token({
      alg: 'RS256',
      typ: 'JWT',
      iss: 'https://adfs.mycompany.com/adfs/services/trust',
      exp: expiresIn,
      iat: issued,
      mail: 'example@mycompany.com',
    });

    const result = {
      access_token: accessToken,
      id_token: idToken,
      scope: 'openid profile email',
      expires_in: 86400,
      token_type: 'Bearer',
    };

    console.dir(result);

    return res.status(200).json(result);
  });
};
