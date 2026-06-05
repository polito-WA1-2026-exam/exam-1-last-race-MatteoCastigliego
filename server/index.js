import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import './db.js';
import { getUser, getStations, getLines, getEvents, getRankings, getGame, createGame, updateScore, getStationsOfLines, getSegments, getStationFromId } from './dao.js';

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

/* route validation logic */
const pairKey = (a, b) => [a, b].sort((x, y) => x - y).join('-');
// builds a map where the key is the id of the line and the value is the list of the stations ordered per-position
// example: {id_line, [id_station, position]} 
const buildLineMap = (stationsOfLines) => {
  const lineMap = new Map();
  for (const row of stationsOfLines) {
    if (!lineMap.get(row.id_line)) lineMap.set(row.id_line, []);
    lineMap.get(row.id_line).push({ id: row.id_station, position: row.position });
  }
  for (const [id, stations] of lineMap) stations.sort((a, b) => a.position - b.position);
  return lineMap;
};

const prepareNetwork = (stationsOfLines) => {
  const lineMap = buildLineMap(stationsOfLines);
  const lineSets = new Map();
  const stationLineCount = new Map();

  for (const [lineId, sorted] of lineMap) {
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i].id, b = sorted[i + 1].id;
      const key = pairKey(a, b);
      if (!lineSets.has(key)) lineSets.set(key, new Set());
      lineSets.get(key).add(lineId);
      for (const id of [a, b]) {
        stationLineCount.set(id, (stationLineCount.get(id) || 0) + 1);
      }
    }
  }

  const interchanges = new Set(
    [...stationLineCount.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
  );

  return { lineSets, interchanges };
};

const buildGraph = (stationsOfLines) => {
  const lineMap = buildLineMap(stationsOfLines);
  const graph = new Map();
  for (const [lineId, sorted] of lineMap) {
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i].id, b = sorted[i + 1].id;
      if (!graph.has(a)) graph.set(a, new Set());
      if (!graph.has(b)) graph.set(b, new Set());
      graph.get(a).add(b);
      graph.get(b).add(a);
    }
  }
  return graph;
};

const validateRoute = (segments, startId, endId, { lineSets, interchanges }) => {
  if (!segments?.length) return false;

  const route = [startId];
  for (const seg of segments) {
    const last = route[route.length - 1];
    if (seg.from === last) route.push(seg.to);
    else if (seg.to === last) route.push(seg.from);
    else return false;
  }
  if (route[route.length - 1] !== endId) return false;

  let activeLines = lineSets.get(pairKey(route[0], route[1]));
  if (!activeLines?.size) return false;

  for (let i = 1; i < route.length - 1; i++) {
    const nextLines = lineSets.get(pairKey(route[i], route[i + 1]));
    if (!nextLines?.size) return false;
    const shared = new Set([...activeLines].filter(l => nextLines.has(l)));
    activeLines = shared.size > 0 ? shared : interchanges.has(route[i]) ? nextLines : null;
    if (!activeLines) return false;
  }

  return true;
};

/* BFS: returns minimum stops between two stations, -1 if unreachable */
const bfs = (graph, startId) => {
  const dist = new Map([[startId, 0]]);
  const queue = [startId];
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of graph.get(curr)) {
      if (!dist.has(neighbor)) {
        dist.set(neighbor, dist.get(curr) + 1);
        queue.push(neighbor);
      }
    }
  }
  return dist;
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

// GET /api/segments — all adjacent station pairs
app.get('/api/segments', isLoggedIn, async (req, res) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch {
    res.status(500).json({ error: 'Error while finding segments' });
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

// GET /api/game/:id — take a game
app.get('/api/game/:id', isLoggedIn, async (req, res) => {
  try {
    const game = await getGame(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found!' });
    res.json(game);
  } catch {
    res.status(500).json({ error: 'Error during getting the game!' });
  }
});

app.post('/api/game', isLoggedIn, async (req, res) => {
  try {
    const stations = await getStations();
    const stationsOfLines = await getStationsOfLines();
    const graph = buildGraph(stationsOfLines);

    const stationMap = new Map(stations.map(s => [s.id, s]));
    const validPairs = [];

    for (const [startId] of graph) {
      const dist = bfs(graph, startId);
      for (const [endId, d] of dist) {
        if (d >= 3) validPairs.push({ start: stationMap.get(startId), end: stationMap.get(endId) });
      }
    }

    if (validPairs.length === 0) return res.status(500).json({ error: 'No valid pairs found!' });
    const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
    const gameId = await createGame(req.user.id, pair.start.id, pair.end.id);
    res.status(201).json({ gameId, startStation: pair.start, endStation: pair.end });

  } catch {
    res.status(500).json({ error: 'Error while creating new game!' });
  }
});

// POST /api/game/:id/execute — validate route and execute game steps
app.post('/api/game/:id/execute', isLoggedIn, async (req, res) => {
  try {
    const game = await getGame(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found!' });
    if (game.id_user !== req.user.id) return res.status(403).json({ error: 'Unrecognised user or user not logged in!' });
    if (game.score !== null) return res.status(400).json({ error: 'Game already completed!' });

    const segments = req.body.segments; // list of 'source-destination' pairs selected by the user, like: [{ from: id, to: id }, ...]
    const events = await getEvents();
    const stationsOfLines = await getStationsOfLines();

    const network = prepareNetwork(stationsOfLines);
    const isValid = validateRoute(segments, game.id_station_start, game.id_station_end, network);

    let finalScore = 0;
    let steps = [];

    if (isValid) {
      let coins = 20; // the game must start with 20 available coins
      for (const seg of segments) {
        const event = events[Math.floor(Math.random() * events.length)]; // same function used before, used to select a random event during the path
        coins += event.coins;
        steps.push({ from: await getStationFromId(seg.from), to: await getStationFromId(seg.to), event: event.description, coinsChange: event.coins, total: coins });
      }
      finalScore = Math.max(0, coins);
    }

    await updateScore(game.id, finalScore);
    res.json({ valid: isValid, steps, finalScore });

  } catch {
    res.status(500).json({ error: 'Error during execution of the game!' });
  }
});

/* start the server */
app.listen(port, () => {console.log(`Server listening at http://localhost:${port}`)});
