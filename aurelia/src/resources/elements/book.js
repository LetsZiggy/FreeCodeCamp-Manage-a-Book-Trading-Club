import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {state} from '../services/state';

@inject(Router)
export class Book {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) book;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router) {
    this.router = Router;
  }

  attached() {
  }

  bookChanged(newValue, oldValue) {
    console.log(newValue, oldValue);
  }

  closeBook() {
    this.state.user.book = null;
    document.getElementById('book').style.visibility = 'hidden';
    document.getElementById('book').style.pointerEvents = 'none';
  }

  bookAction() {
    if(!this.state.user.username) {
      this.state.user.book = this.book;
      this.router.navigateToRoute('login');
    }
    else {
      if(this.book.owner) {
        // offer to trade
      }
      else {
        // request for trade
      }
    }
  }
}

