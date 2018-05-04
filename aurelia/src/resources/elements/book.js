import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';

@inject(Router)
export class Book {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) bookSelected;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state;

  constructor(Router) {
    this.router = Router;
  }

  attached() {
  }

  bookSelectedChanged(newValue, oldValue) {
    if(newValue) {
      let isOwner = this.bookSelected.owners.map((v, i, a) => v.username).includes(this.state.user.username);

      if(!isOwner) {
        this.bookSelected.owners.forEach((v, i, a) => {
          if(!v.requests.hasOwnProperty(this.state.user.username)) {
            v.requests[this.state.user.username] = '0';
          }
        });
      }
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

  setTradeDisplay(owner, span) {
    let show = null;

    if(owner.elem.dataset.status === '0') {
      show = 'location';
    }
    else {
      show = 'status';
    }

    if(span === show) {
      return(true);
    }
    else {
      return(false);
    }
  }
}