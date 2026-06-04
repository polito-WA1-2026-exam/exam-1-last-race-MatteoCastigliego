import crypto from 'crypto';
import db from './db.js';

/* USERS */

const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = { id: row.id, username: row.username, name: row.name };
        crypto.scrypt(password, row.salt, 16, (err, hashedPassword) => {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM station';
    db.all(sql, [], (err, rows) => {
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
};

const getLines = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM line';
    db.all(sql, [], (err, rows) => {
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
};

const getEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM event';
    db.all(sql, [], (err, rows) => {
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
};

const getRankings = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT user.username, MAX(game.score) AS best_score FROM game JOIN user ON user.id=game.id_user WHERE game.score IS NOT NULL GROUP BY user.id ORDER BY best_score DESC';
    db.all(sql, [], (err, rows) => {
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
};

const createGame = (userId, startStationId, endStationId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO game (id_user, id_station_start, id_station_end) VALUES (?, ?, ?)';
    db.run(sql, [userId, startStationId, endStationId], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const updateScore = (gameId, score) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE game SET score = ? WHERE id = ?';
    db.run(sql, [score, gameId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getGame = (gameId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM game WHERE id = ?';
    db.get(sql, [gameId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getStationsOfLines = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM stations_of_a_line';
    db.all(sql, [], (err, rows) => {
      if(err){
        reject(err);
      }else{
        resolve(rows);
      }
    });
  });
};

const getSegments = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT s1.id AS 'from', s1.name AS fromName, s2.id AS 'to', s2.name AS toName
      FROM stations_of_a_line sol1
      JOIN stations_of_a_line sol2 ON sol1.id_line = sol2.id_line AND sol1.position + 1 = sol2.position
      JOIN station s1 ON s1.id = sol1.id_station
      JOIN station s2 ON s2.id = sol2.id_station
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export { getUser, getStations, getLines, getEvents, getRankings, createGame, updateScore, getGame, getStationsOfLines, getSegments };