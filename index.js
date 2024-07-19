const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "jq88esfx",
    database: "sample_signup"
});

app.post("/signup", (req, res) => {
    const sql = `INSERT INTO login VALUES (?)`;
    const values = [
        req.body.uname,
        req.body.email,
        req.body.password,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss'),
        1
    ];

    db.query(sql, [values], (err, data) => {
        if(err){
            return res.json(err);
        }
        return res.json(data);
    })
});

app.listen(65319, () => {
    console.log("Listening");
});