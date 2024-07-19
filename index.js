const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const moment = require("moment");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");

app.use(cors());
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL DB");
});

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/", (req, res) => {
  res.send("Listening");
});

app.post("/signup", jsonParser, (req, res) => {
  const sqlSearch = `SELECT userId FROM login ORDER BY userId DESC LIMIT 1`;
  const sql = `INSERT INTO login VALUES (?)`;
  var latestUserID = 1;

  db.query(sqlSearch, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data[0]) latestUserID = parseInt(data[0].userId) + 1;
    userPassword = req.body.values.password.toString();

    const saltRounds = 10; // Typically a value between 10 and 12
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.log(err);
        return;
      }
      salt;

      bcrypt.hash(userPassword, salt, (err, hash) => {
        if (err) {
          console.log(err);
          return;
        }

        // Hashing successful, 'hash' contains the hashed password
        const values = [
          latestUserID,
          req.body.values.uname,
          req.body.values.email,
          hash,
          moment().format("YYYY-MM-DD HH:mm:ss"),
          moment().format("YYYY-MM-DD HH:mm:ss"),
          1,
        ];

        db.query(sql, [values], (err, data) => {
          if (err) {
            return res.json(err);
          }
          return res.json(data);
        });
      });
    });
  });
});

app.post("/login", jsonParser, (req, res) => {
  const sqlSearch = `SELECT userId, password FROM login WHERE email = ?`;
  const sqlUpdate = `UPDATE login SET lastModified = ? WHERE userId = ?`;
  const values = [req.body.values.email];
  var updateValues = [];

  db.query(sqlSearch, values, (err, data) => {
    if (err) {
      return res.json({ message: "Could not find user" });
    }
    if (!data[0]) {
        return res.json({ message: "Email address incorrect" });
    }
    bcrypt.compare(
      req.body.values.password.toString(),
      data[0].password.toString(),
      (err, result) => {
        if (err) {
          // Handle error
          console.error("Error comparing passwords:", err);
          return;
        }
        if (result) {
          // Passwords match, authentication successful
          updateValues = [
            moment().format("YYYY-MM-DD HH:mm:ss"),
            data[0].userId,
          ];
          db.query(sqlUpdate, updateValues, (err, data) => {
            if (err) {
              return res.json({ message: "Update Error" });
            }
          });
          return res.json({ message: "Login Successful" });
        } else {
          // Passwords don't match, authentication failed
          return res.json({ message: "Password incorrect" });
        }
      }
    );
  });
});

app.listen(process.env.PORT, () => {
  console.log("Listening");
});
