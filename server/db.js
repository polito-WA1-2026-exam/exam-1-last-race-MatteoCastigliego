import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('RaceTheRails.sqlite', (err) => {
  if (err) throw err;
  console.log("Database successfully opened!");
});

// PRAGMA enables the use of foreign keys
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {

  /* POPULATION DB: creation of tables */

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
    name TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS line (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS event (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL UNIQUE,
    coins       INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS game (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user          INTEGER NOT NULL REFERENCES user(id),
    id_station_start INTEGER NOT NULL REFERENCES station(id),
    id_station_end   INTEGER NOT NULL REFERENCES station(id),
    score            INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stations_of_a_line (
    id_line    INTEGER NOT NULL REFERENCES line(id),
    id_station INTEGER NOT NULL REFERENCES station(id),
    position   INTEGER NOT NULL,
    PRIMARY KEY (id_line, id_station)
  )`);

  /* POPULATION DB: stations */
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Becketts')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Eau Rouge')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Parabolica')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Sainte Dévote')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Copse')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Casinò')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Lesmo 2')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Ascari')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Raidillon')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Stone')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Variante Alta')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Mirabeau')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Rascasse')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Lesmo 1')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('130R')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Wall of Champions')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Tamburello')`);

  /* POPULATION DB: lines */
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M1', 'red')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M2', 'blue')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M3', 'green')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M4', 'yellow')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M5', 'purple')`);

  /* POPULATION DB: stations_of_a_line */
  // M1 (id=1): Sainte Dévote - Mirabeau - Wall of Champions - Eau Rouge
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Sainte Dévote'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Mirabeau'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Wall of Champions'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Eau Rouge'), 4)`);

  // M2 (id=2): Rascasse - Eau Rouge - Raidillon - Becketts - Ascari
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Rascasse'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Eau Rouge'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Raidillon'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Becketts'), 4)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Ascari'), 5)`);

  // M3 (id=3): Eau Rouge - Parabolica - Variante Alta - Casinò
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Eau Rouge'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Parabolica'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Variante Alta'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Casinò'), 4)`);

  // M4 (id=4): Parabolica - Lesmo 2 - Lesmo 1 - Stone
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Parabolica'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Lesmo 2'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Lesmo 1'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Stone'), 4)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Mirabeau'), 5)`);

  // M5 (id=5): Raidillon - 130R - Tamburello - Stone - Copse
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Raidillon'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='130R'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Tamburello'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Stone'), 4)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Copse'), 5)`);

  /* POPULATION DB: events */
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Clean lap, no incidents', 0)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Puncture on the main straight', -4)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Found a coin dropped from the grandstands', 3)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Engine failure, retired from the race', -2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Slipstream boost, gaining ground fast', 1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Drive-through penalty for cutting the chicane', -3)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Overcut works perfectly, bonus lap credit', 4)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Missed the braking zone, lost positions', -1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('DRS activated, flying through sector 2', 2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Safety car deployed, time and coins lost', -2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Fastest lap bonus, extra coins awarded', 1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Red flag, race stopped, heavy penalty', -4)`);

  /* POPULATION DB: users */
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Antonia', 'Verdi', 'antoniaverdi', '0d2ed70bb3f8ee4fbf1f6a01c97d79a1', 'c74003003886c98df606da379a71fae4')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Mario', 'Rossi', 'mariorossi', 'ef54109ee0f8198a57ec29d4a204a858', '94c4863712e3c0c1f0716d38e67f3669')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Federica', 'Belli', 'federicabelli', 'f6eefdce53dfe362838d6c45f202f9ed', 'd210f4f55e4bb8544f7790236651a02a')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Matteo', 'Castigliego', 'matteocastigliego', '77fc64e6842bec46879b1eaa96c7eb32', '92f1e4de3082ed0b741ac3f2aa53c2fa')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Giulia', 'Blu', 'giuliablu', 'bc94a674bde3c49255a690f7a9337598', 'd5db29be260f0c4fc88ba4cf4a5f28bf')`);

  /* POPULATION DB: games */

});

export default db;
