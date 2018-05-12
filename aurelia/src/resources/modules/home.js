import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
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
  }

  detached() {
  }

  async initialise() {
    if(!this.state.books.length) {
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

    if(this.state.books.length) {
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
    this.bookSelected = book;

    let isOwner = this.bookSelected.owners.map((v, i, a) => v.username).includes(this.state.user.username);

    this.bookSelected.showList = {};

    if(!this.state.user.username) {
      this.bookSelected.showList.detailNotLogin = true;
      this.bookSelected.showList.detailIsOwner = false;
      this.bookSelected.showList.detailTradableList = false;
    }
    else if(isOwner) {
      this.bookSelected.showList.detailNotLogin = false;
      this.bookSelected.showList.detailIsOwner = true;
      this.bookSelected.showList.detailTradableList = false;
    }
    else if(!isOwner) {
      this.bookSelected.showList.detailNotLogin = false;
      this.bookSelected.showList.detailIsOwner = false;
      this.bookSelected.showList.detailTradableList = true;
    }
    else {
      this.bookSelected.showList.detailNotLogin = false;
      this.bookSelected.showList.detailIsOwner = false;
      this.bookSelected.showList.detailTradableList = false;
    }

    document.getElementById('book-selected').style.visibility = 'visible';
    document.getElementById('book-selected').style.pointerEvents = 'auto';
    document.getElementById('book-selected-request-error').style.display = 'none';
  }
}