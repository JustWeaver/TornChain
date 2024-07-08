const pgp = require('pg-promise')();

let dbInstance;

const getDbInstance = () => {
  if (!dbInstance) {
    dbInstance = pgp({
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: process.env.PGSSL === 'true'
    });
  }
  return dbInstance;
};

const db = getDbInstance();

const createTables = async () => {
  await db.none(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      api_key TEXT NOT NULL,
      keep_logged_in BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.none(`
    CREATE TABLE IF NOT EXISTS members (
      id BIGINT PRIMARY KEY,
      name TEXT NOT NULL,
      level INT,
      days_in_faction INT,
      last_action TEXT,
      last_action_timestamp BIGINT,
      position TEXT,
      status TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.none(`
    CREATE TABLE IF NOT EXISTS chains (
      id BIGINT PRIMARY KEY,
      chain INT,
      respect FLOAT,
      start_time BIGINT,
      end_time BIGINT
    );
  `);

  console.log("Tables created");
};

createTables().catch(error => console.log(error));
module.exports = db;
