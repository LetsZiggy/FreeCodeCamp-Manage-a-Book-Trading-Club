import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Redirect} from 'aurelia-router';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class User {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
    this.userLocation = '';
    this.books = [];
  }

  canActivate() {
    if(this.state.user.username === null) {
        return(new Redirect('home'));
    }
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
          // {
          //   username: 'otherUser-1',
          //   location: 'other-location-1',
          //   requests: {}
          // },
          // {
          //   username: 'otherUser-2',
          //   location: 'other-location-2',
          //   requests: {}
          // },
          {
            username: 'testUser',
            location: 'test-location',
            requests: {
              'requestUser-1': '1',
              'requestUser-2': '2'
            }
          }
        ]
      });
      this.state.books.push({
        id: 'test-id-2',
        title: 'test-book-2',
        authors: ['test-author-2', 'test-author-3'],
        image: 'http://via.placeholder.com/450x350',
        link: 'https://www.example.com/',
        owners: [
          {
            username: 'testUser',
            location: 'test-location',
            requests: {
              'requestUser-1': '1',
              'requestUser-2': '2'
            }
          },
          {
            username: 'otherUser-3',
            location: 'other-location-3',
            requests: {}
          }
        ]
      });
    }
    this.initialise();

    if(this.state.user.location) {
      this.userLocation = this.state.user.location;
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
      this.books = this.state.books.reduce((acc, v, i, a) => {
        let ownerIndex = v.owners.map((mv, mi, ma) => mv.username).indexOf(this.state.user.username);
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
    // let promiseList = [];
    let bookID = book.id;
    let ownerIndex = book.owners.map((mv, mi, ma) => mv.username).indexOf(this.state.user.username);

    book.requestList.forEach((v, i, a) => {
      // promiseList.push(this.api.cancelRequest(book, this.state.user.username, v.username));
      // book.owners[ownerIndex].requests[v.username] = '0';
      delete book.owners[ownerIndex].requests[v.username];
    });

    while(book.requestList.length) {
      book.requestList.pop();
    }

    // Promise.all(promiseList).then(async () => {
    //   let result = await this.api.removeBook(bookID, this.state.user.username);
    //   if(result.remove) {
    //     let bookIndex = null;

    //     bookIndex = this.books.map((v, i, a) => v.id).indexOf(bookID);
    //     this.books.splice(bookIndex, 1);

    //     bookIndex = this.state.books.map((v, i, a) => v.id).indexOf(bookID);
    //     this.state.books[bookIndex].owners.splice(ownerIndex, 1);
    //     if(!this.state.books[bookIndex].owners.length) {
    //       this.state.books.splice(bookIndex, 1);
    //     }
    //   }
    // });

    let result = await this.api.removeBook(bookID, this.state.user.username);
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
  }

  handleRequest(type, request, book) {
    console.log(book.elem.children[2].children[1].dataset.status);
  }

  showAddBook() {

  }
}