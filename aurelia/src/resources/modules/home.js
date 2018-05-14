import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {handleWebsocket} from '../services/handle-websocket';
import {state} from '../services/state';

@inject(Router, ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @observable filter = '';

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.books = [];
    this.bookSelected = null;
  }

  attached() {
    this.initialise();
    if(this.state.user.book) { this.showBook(this.state.user.book); }
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
          v.submitList = v.owners.map((mv, mi, ma) => mv.requests.hasOwnProperty(this.state.user.username)) || [];
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
      this.books = this.state.books.map((v, i, a) => v);
    }

    if(document.getElementById('filter-input')) {
      document.getElementById('filter-input').disabled = false;
      document.getElementById('filter-input').focus();
    }
  }

  filterChanged(newValue, oldValue) {
    if(newValue.length) {
      this.books = this.state.books.filter((v, i, a) => v.title.toLowerCase().includes(newValue.toLowerCase()));
    }
    else {
      this.books = this.state.books.map((v, i, a) => v);
    }
  }

  showBook(book) {
    let isOwner = book.ownerList.includes(this.state.user.username);
    book.showList = {};

    if(!this.state.user.username) {
      book.showList.detailNotLogin = true;
      book.showList.detailIsOwner = false;
      book.showList.detailTradableList = false;
    }
    else if(isOwner) {
      book.showList.detailNotLogin = false;
      book.showList.detailIsOwner = true;
      book.showList.detailTradableList = false;
    }
    else if(!isOwner) {
      book.showList.detailNotLogin = false;
      book.showList.detailIsOwner = false;
      book.showList.detailTradableList = true;
    }
    else {
      book.showList.detailNotLogin = false;
      book.showList.detailIsOwner = false;
      book.showList.detailTradableList = false;
    }

    this.state.user.book = book;
    this.bookSelected = book.id;
    document.getElementById('book-selected').style.visibility = 'visible';
    document.getElementById('book-selected').style.pointerEvents = 'auto';
    document.getElementById('book-selected-request-error').style.display = 'none';
  }
}