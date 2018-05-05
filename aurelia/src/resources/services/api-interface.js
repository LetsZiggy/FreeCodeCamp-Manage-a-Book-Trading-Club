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

  submitRequest(book, owner, requester) {
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

  cancelRequest(book, owner, requester) {
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