import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('RaceTheRails.sqlite', (err) => {
  if (err) throw err;
  console.log("Database successfully opened!");
});

// PRAGMA enables the use of foreign keys
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS user (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL,
    surname  TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    salt     TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS station (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS line (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    color TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS event (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    coins       INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user          INTEGER NOT NULL REFERENCES user(id),
    id_station_start INTEGER NOT NULL REFERENCES station(id),
    id_station_end   INTEGER NOT NULL REFERENCES station(id),
    score            INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_segments (
    id_game      INTEGER NOT NULL REFERENCES game(id),
    step_number  INTEGER NOT NULL,
    from_station INTEGER NOT NULL REFERENCES station(id),
    to_station   INTEGER NOT NULL REFERENCES station(id),
    PRIMARY KEY (id_game, step_number)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game_steps (
    id_game     INTEGER NOT NULL REFERENCES game(id),
    step_number INTEGER NOT NULL,
    id_event    INTEGER NOT NULL REFERENCES event(id),
    coins       INTEGER NOT NULL,
    PRIMARY KEY (id_game, step_number)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stations_of_a_line (
    id_line    INTEGER NOT NULL REFERENCES line(id),
    id_station INTEGER NOT NULL REFERENCES station(id),
    position   INTEGER NOT NULL,
    PRIMARY KEY (id_line, id_station)
  )`);

});

export default db;
