const env = process.env;
const { Client } = require('pg');

const connection = new Client({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_DATABASE,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
});

connection.connect();

connection.query("SET search_path = \"asap\"", (err, res) => {
    console.log(err, res);
});

module.exports = connection;