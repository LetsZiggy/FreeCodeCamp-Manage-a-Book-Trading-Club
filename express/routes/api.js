const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
// const {} = require('../ws.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;

// Add here

module.exports = router;
