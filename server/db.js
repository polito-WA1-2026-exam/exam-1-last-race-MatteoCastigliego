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
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Porta Nuova')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Porta Susa')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Marconi')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Fermi')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Bengasi')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Nizza')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Dante')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Re Umberto')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Vinzaglio')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Lingotto')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Bernini')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Massaua')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('XVII Dicembre')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Spezia')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Racconigi')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Rivoli')`);
  db.run(`INSERT OR IGNORE INTO station (name) VALUES ('Marche')`);

  /* POPULATION DB: lines */
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M1', 'red')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M2', 'blue')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M3', 'green')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M4', 'yellow')`);
  db.run(`INSERT OR IGNORE INTO line (name, color) VALUES ('M5', 'purple')`);

  /* POPULATION DB: stations_of_a_line */
  // M1 (id=1): Fermi - Massaua - Rivoli - Porta Susa
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Fermi'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Massaua'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Rivoli'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (1, (SELECT id FROM station WHERE name='Porta Susa'), 4)`);

  // M2 (id=2): XVII Dicembre - Porta Susa - Vinzaglio - Porta Nuova - Re Umberto
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='XVII Dicembre'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Porta Susa'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Vinzaglio'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Porta Nuova'), 4)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (2, (SELECT id FROM station WHERE name='Re Umberto'), 5)`);

  // M3 (id=3): Porta Susa - Marconi - Bernini - Nizza
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Porta Susa'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Marconi'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Bernini'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (3, (SELECT id FROM station WHERE name='Nizza'), 4)`);

  // M4 (id=4): Marconi - Dante - Spezia - Lingotto
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Marconi'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Dante'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Spezia'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (4, (SELECT id FROM station WHERE name='Lingotto'), 4)`);

  // M5 (id=5): Vinzaglio - Racconigi - Marche - Lingotto - Bengasi
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Vinzaglio'), 1)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Racconigi'), 2)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Marche'), 3)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Lingotto'), 4)`);
  db.run(`INSERT OR IGNORE INTO stations_of_a_line (id_line, id_station, position) VALUES (5, (SELECT id FROM station WHERE name='Bengasi'), 5)`);

  /* POPULATION DB: events */
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Smooth journey, no incidents', 0)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Pickpocketed on the train', -4)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Found a wallet on the seat', 3)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Technical failure, delayed and fined', -2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Kind passenger pays for your ticket', 1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Ticket inspection, no valid ticket', -3)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Forgotten bag full of coins on the seat', 4)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Wrong platform, lost time and money', -1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Friendly conductor upgrades your seat', 2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Emergency stop, missed connection fee', -2)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Street performer tips you back generously', 1)`);
  db.run(`INSERT OR IGNORE INTO event (description, coins) VALUES ('Signal failure, emergency exit fee', -4)`);

  /* POPULATION DB: users */
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Antonia', 'Verdi', 'antoniaverdi', '0d2ed70bb3f8ee4fbf1f6a01c97d79a1', 'c74003003886c98df606da379a71fae4')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Mario', 'Rossi', 'mariorossi', 'ef54109ee0f8198a57ec29d4a204a858', '94c4863712e3c0c1f0716d38e67f3669')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Federica', 'Belli', 'federicabelli', 'f6eefdce53dfe362838d6c45f202f9ed', 'd210f4f55e4bb8544f7790236651a02a')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Matteo', 'Castigliego', 'matteocastigliego', '77fc64e6842bec46879b1eaa96c7eb32', '92f1e4de3082ed0b741ac3f2aa53c2fa')`);
  db.run(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('Giulia', 'Blu', 'giuliablu', 'bc94a674bde3c49255a690f7a9337598', 'd5db29be260f0c4fc88ba4cf4a5f28bf')`);

  /* POPULATION DB: games */

});

export default db;
