export const state = {
  login: {
    chance: 2,
    delay: 0,
    timer: 0,
    interval: null
  },
  user: {
    username: null,
    expire: null,
    interval: null,
    location: '',
    book: null
  },
  webSocketID: null,
  webSocket: null,
  toUpdate: null,
  books: []
};