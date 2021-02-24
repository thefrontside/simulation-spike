import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import type { SimulationsState } from '../../types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';
import { iframeResponse } from './htmlResponse';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    console.dir('middleware');

    // if (!req.url.startsWith('/auth0')) {
    //   next();
    //   return;
    // }

    // const simulationId = req.params['simulation_id'];
    // const simulations = Object.values(atom.slice('simulations').get());
    // const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    // if (typeof simulation === 'undefined') {
    //   console.dir(`no simulation for ${simulationId}`);
    //   res.status(401).send('unauthorised');
    //   return;
    // }

    next();
  };

  app.get('/auth0/:simulation_id/tokens', middleware, function (req, res) {
    console.dir('tokens');
    return res.json(tokenStore.tokens);
  });

  app.get('/auth0/:simulation_id/authorize', middleware, (req, res) => {
    console.log('/authorize');
    console.dir(req.query);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client_id, redirect_uri, scope, state } = req.query;

    if (!redirect_uri) {
      return res.status(403).send('unauthorised');
    }
    // const oauth = {
    //   id_token: string;
    //   access_token: string;
    //   refresh_token?: string;
    //   expires_in: number;
    //   scope;
    // }

    res.set('Content-Type', 'text/html');
    return res.status(200).send(Buffer.from(iframeResponse({ code: 'aaaa', state: state as string })));
  });

  app.post('/auth0/:simulation_id/oauth/token', middleware, function (req, res) {
    // const response = {
    //   grant_type: 'password',
    //   username,
    //   password,
    //   audience,
    //   scope,
    //   client_id,
    //   client_secret,
    // };
    return res.status(401).send('unauthorised');
  });
};
