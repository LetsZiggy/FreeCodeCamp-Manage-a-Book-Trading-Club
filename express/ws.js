const WebSocket = require('ws');
const createID = require('./routes/services/create-id.js');
let wss = null;
let wssClients = {};

function webSocketInitialise(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    let id = createID(wssClients);
    wssClients[id] = ws;

    ws.isAlive = true;
    ws.id = id;
    ws.username = null;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (message) => {
      message = JSON.parse(message);

      switch(message.type) {
        case 'login':
          ws.username = message.username
          break;

        case 'logout':
          ws.username = null;
          break;
      }
    });

    ws.send(JSON.stringify({ type: 'id', data: id }));
  });

  let connectionCheck = setInterval(() => {
    wss.clients.forEach((client) => {
      if(!client.isAlive) { return(client.terminate()); }
      client.isAlive = false;
      client.ping(null, false, true);
    });
  }, 30000);
}

function wsSetLocation(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'setLocation',
        data: data
      }));
    }
  });
}

function wsAddBook(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'addBook',
        data: data
      }));
    }
  });
}

function wsRemoveBook(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'removeBook',
        data: data
      }));
    }
  });
}

function wsRequestSubmit(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'requestSubmit',
        data: data
      }));
    }
  });
}

function wsRequestAccept(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'requestAccept',
        data: data
      }));
    }
  });
}

function wsRequestCancel(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'requestCancel',
        data: data
      }));
    }
  });
}

function wsRequestDone(id, data) {
  wss.clients.forEach((client) => {
    if(client.id !== id) {
      client.send(JSON.stringify({
        type: 'requestDone',
        data: data
      }));
    }
  });
}

module.exports = {
  webSocketInitialise: webSocketInitialise,
  wsSetLocation: wsSetLocation,
  wsAddBook: wsAddBook,
  wsRemoveBook: wsRemoveBook,
  wsRequestSubmit: wsRequestSubmit,
  wsRequestAccept: wsRequestAccept,
  wsRequestCancel: wsRequestCancel,
  wsRequestDone: wsRequestDone
}
