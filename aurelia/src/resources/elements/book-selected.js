import {inject, bindable, bindingMode} from 'aurelia-framework';

export class BookSelected {
  @bindable bookRequested;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) bookSelected;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) api;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) router;

  bookSelectedChanged(newValue, oldValue) {
    if(newValue) {
      let isOwner = this.state.user.book.owners.map((v, i, a) => v.username).includes(this.state.user.username);

      if(!isOwner) {
        this.state.user.book.owners.forEach((v, i, a) => {
          if(!v.requests.hasOwnProperty(this.state.user.username) || v.requests[this.state.user.username] === undefined) {
            v.requests[this.state.user.username] = '0';
          }
          if(!v.location.length) {
            v.location = 'No location given'
          }
        });
      }
    }
  }

  closeBookSelected() {
    this.bookSelected = null;
    this.state.user.book = null;
    document.getElementById('book-selected').style.visibility = 'hidden';
    document.getElementById('book-selected').style.pointerEvents = 'none';
  }

  bookToLogin() {
    this.router.navigateToRoute('login');
  }

  async handleRequest(ownerIndex, owner) {
    let result = null;

    if(owner.elem.dataset.status === '0') {
      result = await this.api.requestSubmit({ id: this.state.user.book.id }, owner.username, this.state.user.username, this.state.webSocketID);
      if(result.update) {
        owner.elem.dataset.status = '1';
        this.state.user.book.owners[ownerIndex].requests[this.state.user.username] = '1';
        this.state.user.book.submitList[ownerIndex] = true;
      }
      else {
        document.getElementById('book-selected-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-selected-request-error').style.display = 'none'; }, 3000);
      }
    }
    else {
      result = await this.api.requestCancel({ id: this.state.user.book.id }, owner.username, this.state.user.username, this.state.webSocketID);
      if(result.update) {
        owner.elem.dataset.status = '0';
        this.state.user.book.owners[ownerIndex].requests[this.state.user.username] = '0';
        this.state.user.book.submitList[ownerIndex] = false;
      }
      else {
        document.getElementById('book-selected-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-selected-request-error').style.display = 'none'; }, 3000);
      }
    }

    this.bookRequested();
  }
}