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
    if(!this.state.books.length) {
      this.state.books.push({
        id: 'test-id-1',
        title: 'test-book-1',
        authors: ['test-author-1'],
        image: 'http://via.placeholder.com/250x350',
        link: 'https://www.example.com/',
        owners: [
          {
            username: 'requestUser',
            location: 'test-location test-location',
            requests: {
              'testUser': '1'
            }
          }
        ]
      });
      this.state.books.push({
        id: 'test-id-2',
        title: 'test-book-2',
        authors: ['test-author-2'],
        image: 'http://via.placeholder.com/175x300',
        link: 'https://www.example.com/',
        owners: [
          {
            username: 'requestUser',
            location: '',
            requests: {
              'testUser': '2'
            }
          }
        ]
      });
      this.state.books.push({
        id: 'test-id-3',
        title: 'test-book-3',
        authors: ['test-author-3'],
        image: 'http://via.placeholder.com/375x300',
        link: 'https://www.example.com/',
        owners: [
          {
            username: 'requestUser',
            location: '',
            requests: {
              'testUser': '0'
            }
          }
        ]
      });
      this.state.books.push({
        id: 'test-id-4',
        title: 'test-book-4',
        authors: ['test-author-4'],
        image: 'http://via.placeholder.com/300x450',
        link: 'https://www.example.com/',
        owners: [
          {
            username: 'testUser',
            location: 'test-location',
            requests: {
              'requestUser': '0'
            }
          }
        ]
      });
    }
    this.initialise();

    if(this.state.user.book) {
      this.showBook(this.state.user.book);
    }
  }

  detached() {
  }

  async initialise() {
    if(!this.state.books.length) {
      let response = await this.api.getBookshelf();
      this.state.books = response.bookshelf.map((v, i, a) => v);
    }

    if(this.state.books.length) {
      this.books = this.state.books.map((v, i, a) => v);
      this.books.forEach((v, i, a) => {
        v.ownerList = v.owners.map((mv, mi, ma) => mv.username);
      });
    }

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

    document.getElementById('book').style.visibility = 'visible';
    document.getElementById('book').style.pointerEvents = 'auto';
    document.getElementById('book-request-error').style.display = 'none';
  }
}