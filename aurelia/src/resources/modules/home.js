import {inject, bindable, bindingMode, observable} from 'aurelia-framework';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;
  @observable filter = '';

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.books = null;
    this.book = null;
  }

  activate(params, routeConfig, navigationInstruction) {

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

    // this.setWebsocket();
  }

  setWebsocket() {
    this.state.webSocket = new WebSocket(`ws://localhost:3000`);
    // this.state.webSocket = new WebSocket(`wss://letsziggy-freecodecamp-dynamic-web-application-04.glitch.me`);

    this.state.webSocket.onopen = (event) => {
      console.log('open');
    };

    this.state.webSocket.onclose = (event) => {
      this.state.webSocket = null;
      console.log('close');
    };

    this.state.webSocket.onerror = (event) => {
      this.state.webSocket = null;
      console.log('error');
    };

    this.state.webSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);

      if(message.type === 'add') {}

      if(message.type === 'remove') {}
    };
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