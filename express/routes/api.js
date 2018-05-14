const https = require('https');
const express = require('express');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const createID = require('./services/create-id.js');
const handleHashing = require('./services/handle-hashing.js');
const {setLocation, addBook, removeBook, requestSubmit, requestCancel, requestAccept, requestDone} = require('../ws.js');

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
    let updateUser = await collectionUsers.findOneAndUpdate({ username: req.body.username }, { $set: { location: req.body.location } });
    let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
    let findOne = await collectionIDs.findOne({ type: 'books' }, { projection: { _id: 0, type: 0 } });

    let bookIDs = Object.entries(findOne.list).reduce((acc, [k, v]) => {
      if(v.includes(req.body.username)) {
        acc.push(k);
      }
      return(acc);
    }, []);

    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let updateMany = await collectionBooks.updateMany({ id: { $in: bookIDs }, 'owners.username': req.body.username }, { $set: { 'owners.$.location': req.body.location } });
    client.close();

    setLocation(req.body.wsID, { username: req.body.username, location: req.body.location });
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

router.post('/book/add', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
    let findOne = await collectionIDs.findOne({ type: 'books' }, { projection: { _id: 0, type: 0 } });
    let currentBook = findOne.list.hasOwnProperty(req.body.book.id);
    let query = `list.${req.body.book.id}`;

    if(currentBook) {
      findOne = await collectionIDs.updateOne({ type: 'books' }, { $push: { [query]: req.body.username } });
    }
    else {
      findOne = await collectionIDs.updateOne({ type: 'books' }, { $set: { [query]: [req.body.username] } });
    }

    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let addBook = null;

    if(currentBook) {
      addBook = await collectionBooks.updateOne({ id: req.body.book.id }, { $push: { owners: { username: req.body.username, location: req.body.location, requests: {} } } })
    }
    else {
      addBook = await collectionBooks.insertOne({
        id: req.body.book.id,
        title: req.body.book.title,
        authors: req.body.book.authors,
        image: req.body.book.image,
        link: req.body.book.link,
        owners: [{ username: req.body.username, location: req.body.location, requests: {} }]
      });
    }

    client.close();
    let book = {};

    if(currentBook) {
      book.id = req.body.book.id;
      book.owner = [{ username: req.body.username, location: req.body.location, requests: {} }];
    }
    else {
      book.id = req.body.book.id;
      book.title = req.body.book.title;
      book.authors = req.body.book.authors;
      book.image = req.body.book.image;
      book.link = req.body.book.link;
      book.owners = [{ username: req.body.username, location: req.body.location, requests: {} }];
    }

    addBook(req.body.wsID, book);
    res.json({ add: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ add: false });
  }
});

router.post('/book/remove', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
    let findOne = await collectionIDs.findOne({ type: 'books' }, { projection: { _id: 0, type: 0 } });
    let userLength = findOne.list[req.body.book.id].length;
    let query = `list.${req.body.book.id}`;

    if(userLength === 1) {
      findOne = await collectionIDs.updateOne({ type: 'books' }, { $unset: { [query]: '' } });
    }
    else {
      findOne = await collectionIDs.updateOne({ type: 'books' }, { $pull: { [query]: req.body.username } });
    }

    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let removeBook = null;

    if(userLength === 1) {
      removeBook = await collectionBooks.deleteOne({ id: req.body.book.id });
    }
    else {
      removeBook = await collectionBooks.updateOne({ id: req.body.book.id }, { $pull: { owners: { username: req.body.username } } });
    }

    client.close();

    res.json({ remove: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ remove: false });
  }
});

router.post('/request/submit', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let query = `owners.$.requests.${req.body.requester}`;
    let updateOne = await collectionBooks.updateOne({ id: req.body.book.id, 'owners.username': req.body.owner }, { $set: { [query]: '1' } });
    client.close();

    res.json({ update: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ remove: false });
  }
});

router.post('/request/accept', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let query = `owners.$.requests.${req.body.requester}`;
    let updateOne = await collectionBooks.updateOne({ id: req.body.book.id, 'owners.username': req.body.owner }, { $set: { [query]: '2' } });
    client.close();

    res.json({ update: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ remove: false });
  }
});

router.post('/request/cancel', async (req, res, next) => {
  if(req.cookies.id) {
    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionBooks = await db.collection('manage-a-book-trading-club-books');
    let query = `owners.$.requests.${req.body.requester}`;
    let updateOne = await collectionBooks.updateOne({ id: req.body.book.id, 'owners.username': req.body.owner }, { $unset: { [query]: '' } });
    client.close();

    res.json({ update: true });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ remove: false });
  }
});

router.post('/request/done', async (req, res, next) => {
  if(req.cookies.id) {
    let operations = null;

    let client = await mongo.connect(dbURL);
    let db = await client.db(process.env.DBNAME);
    let collectionIDs = await db.collection('manage-a-book-trading-club-ids');
    let query =`list.${req.body.book.id}`;

    operations = [
      {
        updateOne: {
          filter: { type: 'books' },
          update: { $push: { [query]: req.body.requester } }
        }
      },
      {
        updateOne: {
          filter: { type: 'books' },
          update: { $pull: { [query]: req.body.owner } }
        }
      }
    ];

    let bulkUpdateID = await collectionIDs.bulkWrite(operations, { ordered: false });
    let collectionUsers = await db.collection('manage-a-book-trading-club-users');
    let findOne = await collectionUsers.findOne({ username: req.body.requester }, { projection: { _id: 0, id: 0, username: 0, password: 0, email: 0 } });
    let collectionBooks = await db.collection('manage-a-book-trading-club-books');

    operations = [
      {
        updateOne: {
          filter: { id: req.body.book.id },
          update: { $push: { owners: { username: req.body.requester, location: findOne.location, requests: {} } } }
        }
      },
      {
        updateOne: {
          filter: { id: req.body.book.id },
          update: { $pull: { owners: { username: req.body.owner } } }
        }
      }
    ];

    let bulkUpdateBook = await collectionBooks.bulkWrite(operations, { ordered: false });
    client.close();

    res.json({ update: true, location: findOne.location });
  }
  else {
    res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true });
    // res.cookie('id', '', { expires: new Date(), path: '/', httpOnly: true, secure: true });
    res.json({ remove: false });
  }
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
