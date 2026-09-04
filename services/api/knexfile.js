require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5433,
      user: process.env.DB_USER || 'nirvana',
      password: process.env.DB_PASSWORD || 'nirvana_secret',
      database: process.env.DB_NAME || 'nirvana',
    },
    migrations: {
      directory: './src/db/migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
};
