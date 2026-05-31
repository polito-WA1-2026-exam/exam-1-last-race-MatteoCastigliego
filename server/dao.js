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


