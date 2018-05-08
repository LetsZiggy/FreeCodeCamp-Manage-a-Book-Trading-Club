export const state = {
  login: {
    chance: 2,
    delay: 0,
    timer: 0,
    interval: null
  },
  user: {
    username: 'testUser',
    // username: null,
    expire: null,
    interval: null,
    location: null,
    book: null
  },
  webSocket: null,
  books: []
};