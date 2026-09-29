const mysql = require("mysql2");

const fs = require("fs");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (process.env.DB_SSL === "true") {
  dbConfig.ssl = {
    ca:
      process.env.DB_SSL_CA ||
      (process.env.DB_SSL_CA_PATH
        ? fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf8")
        : undefined),
    rejectUnauthorized: true,
  };
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }

  console.log("MySQL connected successfully!");
});

module.exports = db;