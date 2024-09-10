const mysql = require('mysql');
require('dotenv').config()

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT
});

connection.connect((err) => {
  if (err) throw err
});

module.exports = connection;