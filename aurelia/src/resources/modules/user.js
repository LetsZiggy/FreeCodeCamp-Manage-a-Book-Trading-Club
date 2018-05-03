import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(Router, ApiInterface)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.userLocation = '';
  }

  canActivate() {
    if(this.state.user.username === null) {
        return(new Redirect('home'));
    }
  }

  attached() {
    this.initialise();
  }

  detached() {
  }

  async initialise() {
    if(!this.state.books.length) {
      let response = await this.api.getBooks();
      this.state.books = response.map((v, i, a) => v);
    }

    this.books = this.state.books.reduce((acc, v, i, a) => {
      if(v.owners.includes(this.state.user.username)) {
        acc.push(v);
      }

      return(acc);
    }, []);
  }

  addBook() {

  }

  removeBook(id) {
    // remove this.state.user.username from this.state.books[id].owner
    // remove this.state.user.username from this.books[id].owner
    // if no more owner, remove book data
  }

  openMessage(request) {

  }
}