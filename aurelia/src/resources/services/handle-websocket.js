export function handleWebsocket(message, state) {
  switch(message.type) {
    case 'id':
      handleTypeID(message.data, state);
      break;

    case 'setLocation':
      handleTypeSetLocation(message.data, state);
      break;

    case 'addBook':
      handleTypeAddBook(message.data, state);
      break;

    case 'removeBook':
      handleTypeRemoveBook(message.data, state);
      break;

    case 'requestSubmit':
      handleTypeRequestSubmit(message.data, state);
      break;

    case 'requestAccept':
      handleTypeRequestAccept(message.data, state);
      break;

    case 'requestCancel':
      handleTypeRequestCancel(message.data, state);
      break;

    case 'requestDone':
      handleTypeRequestDone(message.data, state);
      break;
  }
}

function handleTypeID(data, state) {
  state.webSocketID = data;
  if(state.user.username) {
    state.webSocket.send(JSON.stringify({ type: 'login', username: state.user.username }));
  }
}

function handleTypeSetLocation(data, state) {
  state.books.forEach((v, i, a) => {
    let ownerIndex = v.owners.map((mv, mi, ma) => mv.username).indexOf(data.username);

    if(ownerIndex !== -1) {
      v.owners[ownerIndex].location = data.location;
    }
  });
}

function handleTypeAddBook(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.id);

  if(bookIndex !== -1) {
    state.books[bookIndex].owners.push(data.owner);
    state.books[bookIndex].submitList = [];
    state.books[bookIndex].ownerList = state.books[bookIndex].owners.map((mv, mi, ma) => mv.username) || [];
  }
  else {
    data.submitList = [];
    data.ownerList = data.owners.map((v, i, a) => v.username) || [];
    state.books.push(data);
  }
}

function handleTypeRemoveBook(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.book);
  let ownerIndex = state.books[bookIndex].owners.map((v, i, a) => v.username).indexOf(data.username);

  if(state.books[bookIndex].owners.length === 1) {
    if(state.user.book && state.user.book.id === data.book) {
      state.user.book = null;
      document.getElementById('book-selected').style.visibility = 'hidden';
      document.getElementById('book-selected').style.pointerEvents = 'none';
    }

    state.books.splice(bookIndex, 1);
  }
  else {
    state.books[bookIndex].owners.splice(ownerIndex, 1);
  }
}
function handleTypeRequestSubmit(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.book);
  let ownerIndex = state.books[bookIndex].owners.map((v, i, a) => v.username).indexOf(data.owner);

  state.books[bookIndex].owners[ownerIndex].requests[data.requester] = '1';
}

function handleTypeRequestAccept(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.book);
  let ownerIndex = state.books[bookIndex].owners.map((v, i, a) => v.username).indexOf(data.owner);

  state.books[bookIndex].owners[ownerIndex].requests[data.requester] = '2';
}

function handleTypeRequestCancel(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.book);
  let ownerIndex = state.books[bookIndex].owners.map((v, i, a) => v.username).indexOf(data.owner);

  if(state.books[bookIndex].owners[ownerIndex].requests.hasOwnProperty(data.requester)) { 
    state.user.book.owners[ownerIndex].requests[data.requester] = '0';
    state.user.book.submitList[ownerIndex] = false;
  }
}

function handleTypeRequestDone(data, state) {
  let bookIndex = state.books.map((v, i, a) => v.id).indexOf(data.book);
  let ownerIndex = state.books[bookIndex].owners.map((v, i, a) => v.username).indexOf(data.owner);

  state.books[bookIndex].owners.push({ username: data.requester, location: data.location, requests: {} });
  state.books[bookIndex].owners.splice(ownerIndex, 1);
  state.books[bookIndex].submitList = [];
  state.books[bookIndex].ownerList = state.books[bookIndex].owners.map((v, i, a) => v.username) || [];

  if(state.user.book && state.user.book.id === data.book) {
    state.user.book = null;
    document.getElementById('book-selected').style.visibility = 'hidden';
    document.getElementById('book-selected').style.pointerEvents = 'none';
  }
}