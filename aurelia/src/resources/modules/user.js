import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {handleWebsocket} from '../services/handle-websocket';
import {state} from '../services/state';

@inject(ApiInterface)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.userLocation = null;
    this.books = [];
  }

  canActivate() {
    if(this.state.user.username === null) {
        return(new Redirect('home'));
    }
  }

  attached() {
    this.initialise();
    this.userLocation = this.state.user.location ? this.state.user.location : '';
    this.state.webSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      handleWebsocket(message, this.state);

      if(message.type !== 'id') {
        this.initialise();
      }
    };
  }

  detached() {
  }

  async initialise(reset=false) {
    if(!this.state.books.length || reset) {
      // if(this.state.toUpdate) {
      //   clearInterval(this.state.toUpdate);
      //   this.state.toUpdate = null;
      // }

      let response = await this.api.getBookshelf();
      if(response.get) {
        this.state.books = response.bookshelf.map((v, i, a) => {
          v.ownerList = v.owners.map((mv, mi, ma) => mv.username) || [];
          return(v);
        });
      }
      else {
        this.state.books = [];
      }
    }

    if(!this.state.toUpdate) {
      this.state.toUpdate = setInterval(async () => {
        this.initialise(true);
      }, 600000);
    }

    if(this.state.books.length) {
      while(this.books.length) { this.books.pop(); }
      this.books = this.state.books.reduce((acc, v, i, a) => {
        let ownerIndex = v.ownerList.indexOf(this.state.user.username);
        if(ownerIndex !== -1) {
          v.requestList = Object.entries(v.owners[ownerIndex].requests).map(([mk, mv]) => [mk, mv]).reduce((raac, rv, ri, ra) => {
            if(rv[1] === '1' || rv[1] === '2') {
              raac.push({ username: rv[0], status: rv[1] });
            }
            return(raac);
          }, []);
          acc.push(v);
        }
        return(acc);
      }, []);
    }
  }

  async setLocation(input, button) {
    let inputElem = document.getElementById(input);
    let buttonElem = document.getElementById(button);

    if(inputElem.value !== '' && inputElem.value !== this.state.user.location) {
      let result = await this.api.setLocation(inputElem.value, this.state.user.username, this.state.webSocketID);

      if(result.update) {
        this.state.user.location = inputElem.value;
        buttonElem.classList.add('saved');

        setTimeout(() => {
          buttonElem.classList.remove('saved');
        }, 1000);

        this.state.books.forEach((v, i, a) => {
          let ownerIndex = v.owners.map((mv, mi, ma) => mv.username).indexOf(this.state.user.username);

          if(ownerIndex !== -1) {
            v.owners[ownerIndex].location = inputElem.value;
          }
        });

        this.initialise();
      }
    }
    else {
      inputElem.value = this.state.user.location;
      inputElem.focus();
      buttonElem.classList.add('not-saved');

      setTimeout(() => {
        buttonElem.classList.remove('not-saved');
      }, 1000);
    }

    return(true);
  }

  showRequests(book) {
    let labels = document.getElementsByClassName('book-has-requests');
    let checkboxes = document.getElementsByClassName('book-checkbox');
    let label = document.getElementById(`label-open-${book.id}`);
    let checkbox = document.getElementById(`checkbox-${book.id}`);
    let isChecked = checkbox.checked;

    Array.from(checkboxes).forEach((v, i, a) => {
      v.checked = false;
    });

    Array.from(labels).forEach((v, i, a) => {
      v.innerHTML = 'Show Requests';
    });

    if(!isChecked) {
      checkbox.checked = true;
      label.innerHTML = 'Hide Requests';
    }

    return(true);
  }

  async removeBook(book) {
    let bookID = book.id;
    let ownerIndex = book.owners.map((mv, mi, ma) => mv.username).indexOf(this.state.user.username);

    while(book.requestList.length) {
      book.requestList.pop();
    }

    book.ownerList.splice(ownerIndex, 1);

    let result = await this.api.removeBook({ id: bookID }, this.state.user.username, this.state.webSocketID);
    if(result.remove) {
      let bookIndex = null;

      bookIndex = this.books.map((v, i, a) => v.id).indexOf(bookID);
      this.books.splice(bookIndex, 1);

      bookIndex = this.state.books.map((v, i, a) => v.id).indexOf(bookID);
      this.state.books[bookIndex].owners.splice(ownerIndex, 1);
      if(!this.state.books[bookIndex].owners.length) {
        this.state.books.splice(bookIndex, 1);
      }
    }

    return(true);
  }

  async handleRequest(type, requestIndex, book) {
    let ownerIndex = book.owners.map((mv, mi, ma) => mv.username).indexOf(this.state.user.username);
    let requester = book.requestList[requestIndex].username;
    
    if(type === 'accept') {
      let result = await this.api.requestAccept({ id: book.id }, this.state.user.username, book.requestList[requestIndex].username, this.state.webSocketID);

      if(result.update) {
        book.elem.children[2].children[requestIndex + 1].dataset.status = '2';
        book.requestList[requestIndex].status = '2';
        book.owners[ownerIndex].requests[requester] = '2';
      }
    }
    else if(type === 'done') {
      let result = await this.api.requestDone({ id: book.id }, this.state.user.username, book.requestList[requestIndex].username, this.state.webSocketID);

      if(result.update) {
        let bookID = book.id;

        book.owners.push({ username: requester, location: result.location, requests: {} });

        book.requestList.forEach((v, i, a) => {
          delete book.owners[ownerIndex].requests[v.username];
        });

        while(book.requestList.length) {
          book.requestList.pop();
        }

        let bookIndex = null;

        bookIndex = this.books.map((v, i, a) => v.id).indexOf(bookID);
        this.books.splice(bookIndex, 1);

        bookIndex = this.state.books.map((v, i, a) => v.id).indexOf(bookID);
        this.state.books[bookIndex].owners.splice(ownerIndex, 1);
      }
    }
    else {
      let result = await this.api.requestCancel({ id: book.id }, this.state.user.username, book.requestList[requestIndex].username, this.state.webSocketID);
      if(result.update) {
        book.elem.children[2].children[requestIndex + 1].dataset.status = '0';
        book.requestList[requestIndex].status = '0';
        book.owners[ownerIndex].requests[requester] = '0';

        book.requestList.splice(requestIndex, 1);
        delete book.owners[ownerIndex].requests[requester];
      }
    }

    return(true);
  }

  showAddBook() {
    document.getElementById('add-book').style.visibility = 'visible';
    document.getElementById('add-book').style.pointerEvents = 'auto';
    document.getElementById('add-book-form-input').focus();
  }
}