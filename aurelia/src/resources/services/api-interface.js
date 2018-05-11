import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      config.withBaseUrl('http://localhost:3000/api')
      // config.withBaseUrl('https://letsziggy-freecodecamp-dynamic-web-application-04.glitch.me/api')
            .withInterceptor({
              request(request) {
                return request;
              },
              requestError(requestError) {
                console.log(requestError);
                return requestError;
              },
              response(response) {
                return response;
              },
              responseError(responseError) {
                console.log(responseError);
                return responseError;
              }
      });
    });
    this.http = HttpClient;
  }

  getBookshelf() {
    return(
      this.http.fetch(`/bookshelf`, {
                 method: 'GET',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  searchTitle(title) {
    // return(
    //   this.http.fetch(`/book/search`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ title: title })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({
      search : true,
      books : [
        {
          id: 'test-id-temp-1',
          title: 'test-book-temp-1',
          authors: ['author'],
          image: 'http://via.placeholder.com/250x300',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-2',
          title: 'test-book-temp-2',
          authors: ['author'],
          image: 'http://via.placeholder.com/300x250',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-3',
          title: 'test-book-temp-3',
          authors: ['author'],
          image: 'http://via.placeholder.com/350x250',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-4',
          title: 'test-book-temp-4',
          authors: ['author'],
          image: 'http://via.placeholder.com/300x300',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-4',
          title: 'test-book-temp-4',
          authors: ['author'],
          image: 'http://via.placeholder.com/250x250',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-5',
          title: 'test-book-temp-5',
          authors: ['author'],
          image: 'http://via.placeholder.com/375x250',
          link: 'https://www.example.com'
        },
        {
          id: 'test-id-temp-6',
          title: 'test-book-temp-6',
          authors: ['author'],
          image: 'http://via.placeholder.com/350x275',
          link: 'https://www.example.com'
        }
      ]
    });
  }

  addBook(book, username, location) {
    // return(
    //   this.http.fetch(`/book/add`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, username: username, location: location })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ add: true });
  }

  removeBook(book, username) {
    // return(
    //   this.http.fetch(`/book/remove`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, username: username })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ remove: true });
  }

  setLocation(location, username) {
    // return(
    //   this.http.fetch(`/user/location`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ location: location, username: username })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  requesterSubmit(book, owner, requester) {
    // return(
    //   this.http.fetch(`/request/submit`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, owner: owner, requester: requester })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  requesterCancel(book, owner, requester) {
    // return(
    //   this.http.fetch(`/request/cancel`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, owner: owner, requester: requester })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  ownerAccept(book, owner, requester) {
    // return(
    //   this.http.fetch(`/request/accept`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, owner: owner, requester: requester })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  ownerDone(book, owner, requester) {
    // return(
    //   this.http.fetch(`/request/done`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, owner: owner, requester: requester })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  ownerCancel(book, owner, requester) {
    // return(
    //   this.http.fetch(`/request/cancel`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //               'Accept': 'application/json',
    //               'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify({ book: book, owner: owner, requester: requester })
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
    return({ update: true });
  }

  getUserNames(username) {
    return(
      this.http.fetch(`/user/checkname`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ username: username })
               })
               .then(response => response.json())
               .then(data => data.taken)
    );
  }

  createUser(user) {
    return(
      this.http.fetch(`/user/create`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(user)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  getUser(user) {
    let date = new Date();
    date.setDate(date.getDate() + 1);
    return({ get: true, expire: date, username: 'testUser' });
    // return(
    //   this.http.fetch(`/user/login`, {
    //              method: 'POST',
    //              credentials: 'same-origin',
    //              headers: {
    //                'Accept': 'application/json',
    //                'Content-Type': 'application/json'
    //              },
    //              body: JSON.stringify(user)
    //            })
    //            .then(response => response.json())
    //            .then(data => data)
    // );
  }

  logoutUser() {
    return(
      this.http.fetch(`/user/logout`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json'
                 }
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  editUser(user) {
    return(
      this.http.fetch(`/user/edit`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(user)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }
}

function getBookshelf(data) {
  let books = data.reduce((acc, v, i, a) => {
    let book = {};

    book.id = v.id;
    book.title = v.title;
    book.authors = v.authors;
    book.image = v.image;
    book.link = v.link;
    book.owners = v.owners;

    acc.push(book);

    return(acc);
  }, []);

  return(books);
}

function processSearch(data) {
  let books = [];

  books = data.items.reduce((acc, v, i, a) => {
    let book = processBook(v);

    if(book !== null) {
      acc.push(book);
    }

    return(acc);
  }, []);

  return(books);
}

function processBook(data) {
  if(v.volumeInfo.hasOwnProperty('imageLinks')) {
    let book = {};

    book.id = v.id || '';
    book.title = v.volumeInfo.title || '';
    book.authors = v.volumeInfo.authors || [];
    book.image = v.volumeInfo.hasOwnProperty('imageLinks') ? v.volumeInfo.imageLinks.thumbnail : '';
    book.link = v.volumeInfo.infoLink;
    book.owners = {};
    /*
    {
      ownerUsername: {
        requesterUsername: stage
      }
    }
    */

    return(book);
  }
  else {
    return(null)
  }
}