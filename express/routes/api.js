const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const createID = require('./services/create-id.js');
const handleHashing = require('./services/handle-hashing.js');
// const {} = require('../ws.js');

const dbURL = `mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBURL}/${process.env.DBNAME}`;
const google = `https://www.googleapis.com/books/v1/volumes?maxResults=20&orderBy=relevance&q=`;

router.get('/bookshelf', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionBooks = await db.collection('manage-a-book-trading-club-books');
  let findBookshelf = await collectionBooks.find({}, { projection: { _id: 0 } }).toArray();
  client.close();

  res.json({ get: true, bookshelf: findBookshelf });
});

router.post('/user/location', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('manage-a-book-trading-club-users');
    let update = await collectionUsers.findOneAndUpdate({ username: req.body.username }, { $set: { location: req.body.location } });

    res.json({ update: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ update: false });
  }
});

router.post('/book/search', async (req, res, next) => {
  let title = req.body.title.split(' ').join('+');
  let body = [];
  let result = [];

  https.get(`${google}${title}`, (response) => {
      response.on('data', (data) => {
        body.push(data.toString());
      });
      response.on('end', () => {
        body = JSON.parse(body.join('')).items;
        result = body.reduce((acc, v, i, a) => {
          if(v.volumeInfo.imageLinks && v.volumeInfo.imageLinks.thumbnail) {
            acc.push({ id: v.id, title: v.volumeInfo.title, authors: v.volumeInfo.authors, image: v.volumeInfo.imageLinks.thumbnail, link: v.volumeInfo.infoLink });
          }
          return(acc);
        }, []);

        if(result.length) {
          res.json({ search : true, books : result });
        }
        else {
          res.json({ search : false });
        }
      });
    }).on('error', (err) => { res.json({ search: false }); console.log(err); throw err; });
});

router.post('/user/checkname', async (req, res, next) => {
  let client = await mongo.connect(dbURL);
  let db = await client.db(process.env.DBNAME);
  let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
  let findID = await collectionIDs.findOne({ type: 'users' }, { _id: 0, type: 0 });
  client.close();

  let takenUsernames = Object.entries(findID).map((v, i, a) => v[1]);
  if(takenUsernames.indexOf(req.body.username) === -1) {
    res.json({ taken: false });
  }
  else {
    res.json({ taken: true });
  }
});

router.post('/user/create', async (req, res, next) => {
  if(!req.cookies.id) {
    let data = {};
    data.username = req.body.username;
    data.location = '';
    data.email = handleHashing(req.body.email);
    data.password = handleHashing(req.body.password);

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
    let findID = await collectionIDs.findOne({ type: 'users' }, { _id: 0, type: 0 });
    let id = createID(findID.list);
    data.id = id;
    let query = `list.${id}`;
    let insertID = await collectionIDs.findOneAndUpdate({ type: 'users' }, { $set: { [query]: req.body.username } });
    let collectionUsers = await db.collection('manage-a-book-trading-club-users');
    let insertUser = await collectionUsers.insertOne(data);
    client.close();

    let date = new Date();
    date.setDate(date.getDate() + 1);
    res.cookie('id', id, { expires: date, path: '/', httpOnly: true });
    // res.cookie('id', id, { expires: date, path: '/', httpOnly: true, secure: true });

    res.json({ create: true, expire: date.getTime(), location: '' });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ create: false });
  }
});

router.post('/user/login', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('manage-a-book-trading-club-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });
    client.close();

    if(!findUser) {
      res.json({ get: false });
    }
    else {
      let password = await handleHashing(req.body.password, findUser.password.salt);

      if(password.hash !== findUser.password.hash) {
        res.json({ get: false }); 
      }
      else {
        let date = new Date();
        date.setDate(date.getDate() + 1);
        res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
        // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
        res.json({ get: true, expire: date.getTime(), location: findUser.location });
      }
    }
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ get: false });
  }
});

router.post('/user/logout', async (req, res, next) => {
  res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
  // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
  res.json({ logout: true });
});

router.post('/user/edit', async (req, res, next) => {
  if(!req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionUsers = await db.collection('manage-a-book-trading-club-users');
    let findUser = await collectionUsers.findOne({ username: req.body.username });
    let email = await handleHashing(req.body.email, findUser.email.salt);

    if(!findUser || email.hash !== findUser.email.hash) {
      client.close();
      res.json({ update: false });
    }
    else {
      let password = await handleHashing(req.body.password);
      let updateUser = await collectionUsers.updateOne({ username: req.body.username }, { $set: { password: { hash: password.hash, salt: password.salt } } });
      client.close();

      let date = new Date();
      date.setDate(date.getDate() + 1);
      res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true });
      // res.cookie('id', findUser.id, { expires: date, path: '/', httpOnly: true, secure: true });
      res.json({ update: true, expire: date.getTime(), location: findUser.location });
    }
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ update: false });
  }
});

module.exports = router;

// let request = https.request(
//   {
//     host: `www.alphavantage.co`,
//     path: `/query?apikey=${process.env.ALPHA_VANTAGE}&function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${v}`,
//     headers: { Accept: 'application/json' }
//   },
//   (response) => {
//     response.setEncoding('utf8');
//     response.on('data', (data) => { body.push(data.toString()); });
//     response.on('end', () => {
//       let data = JSON.parse(body.join(''));
//       resolve(data);
//     });
//   }
// );

// request.on('error', (error) => { console.log(error); throw error; });
// request.end();