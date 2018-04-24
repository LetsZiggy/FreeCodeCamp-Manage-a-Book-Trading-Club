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
  }

  canActivate() {
    if(this.state.user.username === null) {
        return(new Redirect('home'));
    }
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

    this.books = this.state.books.reduce((acc, v, i, a) => {
      if(v.owner ===  this.state.user.username) {
        acc.push(v);
      }

      return(acc);
    }, []);

    document.getElementById('filter-input').disabled = false;
    document.getElementById('filter-input').focus();
  }

  showBook(book) {
    this.book = book;
    
    document.getElementById('book').style.visibility = 'visible';
    document.getElementById('book').style.pointerEvents = 'auto';
  }
}