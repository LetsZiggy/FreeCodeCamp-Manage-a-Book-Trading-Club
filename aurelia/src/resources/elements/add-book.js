import {inject, bindable, bindingMode} from 'aurelia-framework';

export class AddBook {
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

  closeBook() {
    this.state.user.book = null;
    this.bookSelected = null;
    document.getElementById('book').style.visibility = 'hidden';
    document.getElementById('book').style.pointerEvents = 'none';
  }

  bookToLogin() {
    this.state.user.book = this.bookSelected;
    this.router.navigateToRoute('login');
  }

  setTradeStatus(owner) {
    if(!this.state.user.username) {
      return('0');
    }
    else {
      return(owner.requests[this.state.user.username]);
    }
  }

  async tradeEvent(owner) {
    let result = null;

    if(owner.elem.dataset.status === '0') {
      result = await this.api.submitRequest(this.bookSelected.id, owner.username, this.state.user.username);
      if(result.update) {
        owner.elem.dataset.status = '1';
      }
      else {
        document.getElementById('book-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-request-error').style.display = 'none'; }, 3000);
      }
    }
    else {
      result = await this.api.cancelRequest(this.bookSelected.id, owner.username, this.state.user.username)
      if(result.update) {
        owner.elem.dataset.status = '0';
      }
      else {
        document.getElementById('book-request-error').style.display = 'block';
        setTimeout(() => { document.getElementById('book-request-error').style.display = 'none'; }, 3000);
      }
    }
  }
}