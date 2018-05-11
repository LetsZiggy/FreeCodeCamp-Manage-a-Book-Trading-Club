import {inject, bindable, bindingMode} from 'aurelia-framework';

export class BookSelected {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) bookSelected;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) api;
  @bindable({ defaultBindingMode: bindingMode.oneWay }) router;

  bookSelectedChanged(newValue, oldValue) {
    if(newValue) {
      let isOwner = this.bookSelected.owners.map((v, i, a) => v.username).includes(this.state.user.username);

      if(!isOwner) {
        this.bookSelected.owners.forEach((v, i, a) => {
          if(!v.requests.hasOwnProperty(this.state.user.username)) {
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
    this.state.user.book = null;
    this.bookSelected = null;
    document.getElementById('book-selected').style.visibility = 'hidden';
    document.getElementById('book-selected').style.pointerEvents = 'none';
  }

  bookToLogin() {
    this.state.user.book = this.bookSelected;
    this.router.navigateToRoute('login');
  }

  async handleRequest(ownerIndex, owner) {
    let result = null;

    if(owner.elem.dataset.status === '0') {
      result = await this.api.requesterSubmit(this.bookSelected.id, owner.username, this.state.user.username);
      if(result.update) {
        owner.elem.dataset.status = '1';
        this.bookSelected.owners[ownerIndex].requests[this.state.user.username] = '1';
      }
      else {
        document.getElementById('book-selected-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-selected-request-error').style.display = 'none'; }, 3000);
      }
    }
    else {
      result = await this.api.requesterCancel(this.bookSelected.id, owner.username, this.state.user.username)
      if(result.update) {
        owner.elem.dataset.status = '0';
        this.bookSelected.owners[ownerIndex].requests[this.state.user.username] = '0';
      }
      else {
        document.getElementById('book-selected-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-selected-request-error').style.display = 'none'; }, 3000);
      }
    }
  }
}