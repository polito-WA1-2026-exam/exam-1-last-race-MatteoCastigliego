import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import './db.js';
import { getUser, getStations, getLines, getEvents, getRankings, getGame, createGame, updateScore, getStationsOfLines } from './dao.js';

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
const validateRoute = (segments, startStationId, endStationId, stationsOfLines) => {
  if (!segments || segments.length === 0) return false;
  if (segments[0].from !== startStationId) return false;
  if (segments[segments.length - 1].to !== endStationId) return false;

  //  lineMap: { lineId: [stationId ordinati per position] }
  const lineMap = {};
  for (const row of stationsOfLines) {
    if (!lineMap[row.id_line]) lineMap[row.id_line] = [];
    lineMap[row.id_line].push({ stationId: row.id_station, position: row.position });
  }
  for (const lineId in lineMap) {
    lineMap[lineId].sort((a, b) => a.position - b.position);
  }

  // interchange lines
  const stationLineCount = {};
  for (const row of stationsOfLines) {
    stationLineCount[row.id_station] = (stationLineCount[row.id_station] || 0) + 1;
  }
  const isInterchange = (stationId) => stationLineCount[stationId] > 1;

  // finds all lines where a segment is valis { from, to }
  const getLinesForSegment = (from, to) => {
    const result = [];
    for (const lineId in lineMap) {
      const ids = lineMap[lineId].map(s => s.stationId);
      const fromIdx = ids.indexOf(from);
      const toIdx = ids.indexOf(to);
      if (fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1) {
        result.push(lineId);
      }
    }
    return result;
  };

  // keeps track of the current line validating segment-by-segment
  let currentLines = getLinesForSegment(segments[0].from, segments[0].to);
  if (currentLines.length === 0) return false;

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.from !== segments[i - 1].to) return false;

    const nextLines = getLinesForSegment(seg.from, seg.to);
    if (nextLines.length === 0) return false;

    const commonLines = currentLines.filter(l => nextLines.includes(l));
    if (commonLines.length > 0) {
      currentLines = commonLines; // same line, no change
    } else {
      if (!isInterchange(seg.from)) return false; // out of interchange
      currentLines = nextLines;
    }
  }

  return true;
};

/* BFS: returns minimum stops between two stations, -1 if unreachable */
const bfs = (graph, startId, endId) => {
  const visited = new Set();
  const queue = [[startId, 0]];
  while (queue.length > 0) {
    const [current, dist] = queue.shift();
    if (current === endId) return dist;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of (graph[current] || [])) {
      if (!visited.has(neighbor)) queue.push([neighbor, dist + 1]);
    }
  }
  return -1;
};

/* build adjacency graph from stationsOfLines */
const buildGraph = (stationsOfLines) => {
  const lineMap = {};
  for (const row of stationsOfLines) {
    if (!lineMap[row.id_line]) lineMap[row.id_line] = [];
    lineMap[row.id_line].push({ id: row.id_station, position: row.position });
  }
  const graph = {};
  for (const lineId in lineMap) {
    const sorted = lineMap[lineId].sort((a, b) => a.position - b.position);
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i].id;
      const b = sorted[i + 1].id;
      if (!graph[a]) graph[a] = [];
      if (!graph[b]) graph[b] = [];
      graph[a].push(b);
      graph[b].push(a);
    }
  }
  return graph;
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

    // finds all valid pairs (distance >= 3)
    const valid_pairs = [];
    for (let i = 0; i < stations.length; i++) {
      for (let j = 0; j < stations.length; j++) {
        if (i === j) continue;
        const dist = bfs(graph, stations[i].id, stations[j].id);
        if (dist >= 3) valid_pairs.push({ start: stations[i], end: stations[j] });
      }
    }

    // no pairs => impossible start the game, returns status error 500
    if (valid_pairs.length === 0) return res.status(500).json({ error: 'There are not pairs of stations with discance major than 3!' });

    // does not return so there are pairs of stations which distance is major than 3 => enjoy the game
    const pair = valid_pairs[Math.floor(Math.random() * valid_pairs.length)]; // select random pair
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

    const isValid = validateRoute(segments, game.id_station_start, game.id_station_end, stationsOfLines); // checks validity of the path selected by the user

    let finalScore = 0;
    let steps = [];

    if (isValid) {
      let coins = 20; // the game must start with 20 available coins
      for (const seg of segments) {
        const event = events[Math.floor(Math.random() * events.length)]; // same function used before, used to select a random event during the path
        coins += event.coins;
        steps.push({ from: seg.from, to: seg.to, event: event.description, coinsChange: event.coins, total: coins });
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
