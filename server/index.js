import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import './db.js';
import { getUser, getStations, getLines, getEvents, getRankings } from './dao.js';

/* init */
const app = express();
const port = 3001;

/* middlewares */
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

/* passport section */
passport.use(new LocalStrategy(async (username, password, cb) => {
  const user = await getUser(username, password);
  if (!user) return cb(null, false, 'Incorrect username or password.');
  return cb(null, user);
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

app.use(session({
  secret: 'race-the-rails-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.authenticate('session'));

/* authentication middleware */
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authorized' });
};

/* routes section */

// POST /api/sessions — login
app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current — check session
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: "Not authenticated"});
});

// DELETE /api/sessions/current — logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => res.end());
});

// network routes, to access in these section the login is required 

// GET /api/stations — get all stations
app.get('/api/stations', isLoggedIn, async (req, res) => {
  try {
    const stations = await getStations();
    res.json(stations);
  } catch {
    res.status(500).json({ error: 'Error during getting list of stations!' });
  }
});

// GET /api/lines — get all lines
app.get('/api/lines', isLoggedIn, async (req, res) => {
  try {
    const lines = await getLines();
    res.json(lines);
  } catch {
    res.status(500).json({ error: 'Error during getting list of lines!' });
  }
});

// GET /api/events — all events
app.get('/api/events', isLoggedIn, async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Error during getting list of events!' });
  }
});

// GET /api/ranking — general rankings
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRankings();
    res.json(ranking);
  } catch {
    res.status(500).json({ error: 'Error during getting list of rankings!' });
  }
});

/* start the server */
app.listen(port, () => {console.log(`Server listening at http://localhost:${port}`)});
