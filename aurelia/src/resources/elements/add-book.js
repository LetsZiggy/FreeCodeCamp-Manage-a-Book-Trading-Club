import {bindable, bindingMode} from 'aurelia-framework';

let inputVal = null;

export class AddBook {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) api;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) books;

  constructor() {
    this.results = [];
    this.resultSelected = null;
  }

  closeAddBook() {
    inputVal = null;
    document.getElementById('add-book').style.visibility = 'hidden';
    document.getElementById('add-book').style.pointerEvents = 'none';
  }

  handleKeydown(event) {
    let value = document.getElementById('add-book-form-input').value;
    let regex = new RegExp('^[-_a-zA-Z0-9 \.]$');
    let specialKeys = ['Enter', 'Shift', 'Alt', 'Control', 'Backspace', 'Insert', 'Del', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'Tab', 'Up', 'ArrowUp', 'Down', 'ArrowDown', 'Left', 'ArrowLeft', 'Right', 'ArrowRight', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];

    if(event.key === 'Enter' && (!value.length || value === inputVal)) {
      return(false);
    }
    else if(regex.test(event.key) || specialKeys.includes(event.key)) {
      if(event.key === 'Enter') {
        this.searchBookTitle();
        return(false);
      }
      else {
        inputVal = value;
        return(true);
      }
    }
    else {
      return(false);
    }
  }

  async searchBookTitle() {
    let value = document.getElementById('add-book-form-input').value;
    let result = await this.api.searchTitle(value);

    if(result.search) {
      this.results = result.books.map((v, i, a) => v);
    }
    else {
      document.getElementById('add-book-request-error').style.display = 'block';
      setTimeout(() => { document.getElementById('add-book-request-error').style.display = 'none'; }, 3000);
    }
  }

  addBookSelect(result) {
    let isSelected = result.elem.children[0].checked;
    let checkboxes = document.getElementsByClassName('result-checkbox');
    let confirmButton = document.getElementById('add-button-confirm');

    Array.from(checkboxes).forEach((v, i, a) => {
      v.checked = false;
    });

    if(!isSelected) {
      result.elem.children[0].checked = true;
      this.resultSelected = result.id;
      confirmButton.disabled = false;
    }
    else {
      this.resultSelected = null;
      confirmButton.disabled = true;
    }
  }

  addButtonConfirm() {
    let selected = this.results.find((v, i, a) => v.id === this.resultSelected);
    let result = this.api.addBook(
                   {
                     id: selected.id,
                     title: selected.title,
                     authors: selected.authors,
                     image: selected.image,
                     link: selected.link
                   },
                   this.state.user.username,
                   this.state.user.location
                 );
    if(result.add) {
      let bookIndex = this.state.books.map((v, i, a) => v.id).indexOf(selected.id);
      let book = {
        id: selected.id,
        title: selected.title,
        authors: selected.authors,
        image: selected.image,
        link: selected.link,
        ownerList: [this.state.user.username],
        requestList: [],
        owners: [
          {
            username: this.state.user.username,
            location: this.state.user.location,
            requests: {}
          }
        ]
      };

      if(bookIndex === -1) {
        this.state.books.push(book);
        this.books.push(book);
      }
      else {
        this.state.books[bookIndex].owners.push({
          username: this.state.user.username,
          location: this.state.user.location,
          requests: {}
        });
        this.state.books[bookIndex].ownerList.push(this.state.user.username);
        this.state.books[bookIndex].requestList = [];
        this.books.push(this.state.books[bookIndex]);
      }

      this.closeAddBook();
    }
    else {
      document.getElementById('add-book-request-error').style.display = 'block';
      setTimeout(() => { document.getElementById('add-book-request-error').style.display = 'none'; }, 3000);
    }
  }
}