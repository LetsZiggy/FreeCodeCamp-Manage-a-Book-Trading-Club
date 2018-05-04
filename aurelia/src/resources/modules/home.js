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
            location: 'location',
            requests: {
              // 'requestUser': 0
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
              'testUser': '1'
            }
          }
        ]
      });
      this.state.books.push({
        id: 'test-id-3',
        title: 'test-book-3',
        authors: ['test-author-3'],
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

    console.log();
  }

  detached() {
  }

  async initialise() {
    if(!this.state.books.length) {
      let response = await this.api.getBooks();
      this.state.books = response.map((v, i, a) => v);
    }

    this.books = this.state.books.map((v, i, a) => v);
    this.books.forEach((v, i, a) => {
      v.ownerList = v.owners.map((mv, mi, ma) => mv.username);
    });

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

    // let detailNotLogin = document.getElementById('book-detail-notlogin');
    // let detailIsOwner = document.getElementById('book-detail-isowner');
    // let detailTradableList = document.getElementById('book-detail-tradable-list');

    // if(!this.state.user.username) {
    //   detailNotLogin.dataset.show = true;
    //   detailIsOwner.dataset.show = false;
    //   detailTradableList.dataset.show = false;
    // }
    // else if(isOwner) {
    //   detailNotLogin.dataset.show = false;
    //   detailIsOwner.dataset.show = true;
    //   detailTradableList.dataset.show = false;
    // }
    // else if(!isOwner) {
    //   detailNotLogin.dataset.show = false;
    //   detailIsOwner.dataset.show = false;
    //   detailTradableList.dataset.show = true;
    // }
    // else {
    //   detailNotLogin.dataset.show = false;
    //   detailIsOwner.dataset.show = false;
    //   detailTradableList.dataset.show = false;
    // }
    
    document.getElementById('book').style.visibility = 'visible';
    document.getElementById('book').style.pointerEvents = 'auto';
  }
}