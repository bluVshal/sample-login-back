const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const moment = require('moment');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const db = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "jq88esfx",
    database: "sample_signup"
});

app.get("/", (req, res) => {
    res.send("Listening");
})

app.post("/signup", jsonParser, (req, res) => {
    const sqlSearch = `SELECT userId FROM login ORDER BY userId DESC LIMIT 1`;
    const sql = `INSERT INTO login VALUES (?)`;
    var latestUserID = 0;
    
    db.query(sqlSearch, (err, data) => {
        if(err){
            console.log(err);
        }       
        latestUserID = parseInt(data[0].userId) + 1;

        const values = [
            latestUserID,
            req.body.values.uname,
            req.body.values.email,
            req.body.values.password,
            moment().format('YYYY-MM-DD HH:mm:ss'),
            moment().format('YYYY-MM-DD HH:mm:ss'),
            1
        ];
    
        db.query(sql, [values], (err, data) => {
            if(err){
                return res.json(err);
            }
            return res.json(data);
        });
    });
});

app.post("/login", jsonParser, (req, res) => {
    const sqlSearch = `SELECT userId FROM login WHERE email = ? AND password = ?`;
    const values = [
        req.body.email,
        req.body.password,
    ];
    db.query(sqlSearch, values, (err, data) => {
        if(err){
            return res.json(err);
        }
        return res.json(data);
    });
});

app.listen(65319, () => {
    console.log("Listening");
});