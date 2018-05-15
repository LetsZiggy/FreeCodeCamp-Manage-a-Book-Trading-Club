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
    return(
      this.http.fetch(`/book/search`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ title: title })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  addBook(book, username, location, wsID) {
    return(
      this.http.fetch(`/book/add`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, username: username, location: location, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  removeBook(book, username, wsID) {
    return(
      this.http.fetch(`/book/remove`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  requestSubmit(book, owner, requester, wsID) {
    return(
      this.http.fetch(`/request/submit`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, owner: owner, requester: requester, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  requestAccept(book, owner, requester, wsID) {
    return(
      this.http.fetch(`/request/accept`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, owner: owner, requester: requester, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  requestCancel(book, owner, requester, wsID) {
    return(
      this.http.fetch(`/request/cancel`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, owner: owner, requester: requester, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  requestDone(book, owner, requester, wsID) {
    return(
      this.http.fetch(`/request/done`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ book: book, owner: owner, requester: requester, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  setLocation(location, username, wsID) {
    return(
      this.http.fetch(`/user/location`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({ location: location, username: username, wsID: wsID })
               })
               .then(response => response.json())
               .then(data => data)
    );
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
    return(
      this.http.fetch(`/user/login`, {
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