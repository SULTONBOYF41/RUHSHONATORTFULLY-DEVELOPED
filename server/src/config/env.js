const dotenv = require('dotenv');
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key',
    dbPath: process.env.DB_PATH || 'data/ruxshona.db',
};

module.exports = config;
