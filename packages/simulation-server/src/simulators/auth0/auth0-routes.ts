import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import { tokenStore } from './auth0simulator';
import { SimulationsState } from 'src/types';
import { Slice } from '@bigtest/atom';
import { Request, Response, NextFunction } from 'express';

export const addRoutes = (atom: Slice<SimulationsState>) => (app: Express): void => {
  const middleware = (req: Request, res: Response, next: NextFunction) => {
    // console.dir('middleware');

    if (!req.url.startsWith('/auth0')) {
      next();
      return;
    }

    const simulationId = req.params['simulation_id'];
    const simulations = Object.values(atom.slice('simulations').get());
    const simulation = simulations.find(({ simulation }) => simulation.uuid === simulationId);

    if (typeof simulation === 'undefined') {
      console.dir(`no simulation for ${simulationId}`);
      res.status(401).send('unauthorised');
      return;
    }

    next();
  };

  app.get('/auth0/:simulation_id/tokens', middleware, function (req, res) {
    return res.json(tokenStore.tokens);
  });

  app.get('/auth0/:simulation_id/authorize', middleware, (req, res) => {
    console.log('/authorize');
    console.dir(req.url);
    console.dir(req.url.search);

    res.status(401).send('unauthorised');
  });

  app.post('/auth0/:simulation_id/token', middleware, function (req, res) {
    if (!req.body.email || !req.body.password) {
      console.log('Body is invalid!');
      return res.status(400).send('Email or password is missing!');
    }

    const token = jwt.sign(
      {
        user_id: `auth0|${req.body.email}`,
      },
      'auth0-mock',
    );
    console.log(`Signed token for ${req.body.email}`);
    return res.json({ token });
  });

  app.post('/auth0/:simulation_id/tokeninfo', middleware, function (req, res) {
    if (!req.body.id_token) {
      console.log('No token given in the body!');
      return res.status(401).send('missing id_token');
    }
    const data = jwt.decode(req.body.id_token);
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(`Return token data from ${(data as any).user_id}`);
      return res.json(data);
    } else {
      console.log('The token was invalid and could not be decoded!');
      return res.status(401).send('invalid id_token');
    }
  });
};
