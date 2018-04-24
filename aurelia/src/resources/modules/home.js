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
    this.books = null;
    this.book = null;
  }

  attached() {
    this.initialise();

    if(this.state.user.book) {
      this.showBook(this.state.user.book);
    }
  }

  detached() {
  }

  async initialise() {
    if(!this.state.books.length) {
      let response = await this.api.getBooks();
      this.state.books = response.map((v, i, a) => v);
    }

    this.books = this.state.books.map((v, i, a) => v);

    document.getElementById('filter-input').disabled = false;
    document.getElementById('filter-input').focus();
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
    this.book = book;
    
    document.getElementById('book').style.visibility = 'visible';
    document.getElementById('book').style.pointerEvents = 'auto';
  }
}