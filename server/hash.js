import crypto from 'crypto';

const users = [
  { name: 'Matteo',   surname: 'Castigliego',  username: 'matteocastigliego', password: 'matteo'   },
  { name: 'Mario',    surname: 'Rossi',        username: 'mariorossi',        password: 'mario'    },
  { name: 'Antonia',  surname: 'Verdi',        username: 'antoniaverdi',      password: 'antonia'  },
  { name: 'Federica', surname: 'Belli',        username: 'federicabelli',     password: 'federica' },
  { name: 'Giulia',   surname: 'Blu',          username: 'giuliablu',         password: 'giulia'   },
];

for (const u of users) {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(u.password, salt, 16, (err, hash) => {
    if (err) throw err;
    console.log(`INSERT OR IGNORE INTO user (name, surname, username, password, salt) VALUES ('${u.name}', '${u.surname}', '${u.username}', '${hash.toString('hex')}', '${salt}');`);
  });
}
