import {inject, bindable, bindingMode} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ApiInterface} from './resources/services/api-interface';
import {handleWebsocket} from './resources/services/handle-websocket';
import {state} from './resources/services/state';

@inject(EventAggregator, ApiInterface)
export class App {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(EventAggregator, ApiInterface) {
    this.ea = EventAggregator;
    this.api = ApiInterface;
  }

  bind() {
    let data = JSON.parse(localStorage.getItem('freecodecamp-manage-a-book-trading-club')) || {};

    if(data.username && data.userexpire && (parseInt(data.userexpire) - Date.now()) > 5000) {
      this.state.user.username = data.username || null;
      this.state.user.expire = parseInt(data.userexpire) || null;
      this.state.user.location = data.userlocation || '';
    }
    else {
      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      data.userlocation = this.state.user.location;
      localStorage.setItem('freecodecamp-manage-a-book-trading-club', JSON.stringify(data));
    }

    if(!this.state.webSocket) {
      this.setWebsocket();
    }
  }

  async attached() {
    if(this.state.user.username && this.state.user.expire && (this.state.user.expire - Date.now()) > 5000) {
      this.state.user.interval = setTimeout(async () => {
        let logout = await this.api.logoutUser();
        
        if(this.state.user.interval) {
          clearInterval(this.state.user.interval);
          this.state.user.interval = null;
        }

        if(this.state.webSocketID) {
          this.state.webSocket.send(JSON.stringify({ type: 'logout' }));
        }

        this.state.user.username = null;
        this.state.user.expire = null;
        this.state.user.location = '';
        console.log('logout');
      }, (this.state.user.expire - Date.now()));
    }
    else {
      let logout = await this.api.logoutUser();

      if(this.state.user.interval) {
        clearInterval(this.state.user.interval);
        this.state.user.interval = null;
      }

      this.state.user.username = null;
      this.state.user.expire = null;
      this.state.user.location = '';
    }

    window.onbeforeunload = (event) => {
      if(this.state.user.interval) {
        clearInterval(this.state.user.interval);
        this.state.user.interval = null;
      }

      if(this.state.toUpdate) {
        clearInterval(this.state.toUpdate);
        this.state.toUpdate = null;
      }

      if(this.state.webSocket) {
        this.state.webSocket.close();
        this.state.webSocketID = null;
        this.state.webSocket = null;
        console.log('close');
      }

      if(this.state.user.username) {
        let store = JSON.parse(localStorage.getItem('freecodecamp-manage-a-book-trading-club')) || {};
        let data = { username: this.state.user.username, userexpire: this.state.user.expire, userlocation: this.state.user.location };
        localStorage.setItem('freecodecamp-manage-a-book-trading-club', JSON.stringify(data));
      }

      return;
    };
  }

  setWebsocket() {
    // this.state.webSocket = new WebSocket(`ws://localhost:3000`);
    this.state.webSocket = new WebSocket(`wss://letsziggy-freecodecamp-dynamic-web-application-04.glitch.me`);

    this.state.webSocket.onopen = (event) => {
      console.log('open');
    };

    this.state.webSocket.onclose = (event) => {
      this.state.webSocketID = null;
      this.state.webSocket = null;
      console.log('close');
    };

    this.state.webSocket.onerror = (event) => {
      this.state.webSocketID = null;
      this.state.webSocket = null;
      console.log('error');
    };

    this.state.webSocket.onmessage = (event) => {
      let message = JSON.parse(event.data);
      handleWebsocket(message, this.state);

      if(message.type !== 'id') {
        this.ea.publish('ws');
      }
    };
  }

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Manage a Book Trading Club';
    config.map([
      {
        route: '',
        redirect: 'home'
      },
      {
        route: 'home',
        name: 'home',
        moduleId: './resources/modules/home',
        title: 'Home',
        nav: true,
      },
      {
        route: 'user',
        name: 'user',
        moduleId: './resources/modules/user',
        title: 'User',
        nav: true,
      },
      {
        route: 'login',
        name: 'login',
        moduleId: './resources/modules/login',
        title: 'Login',
        nav: true,
      },
    ]);

    config.mapUnknownRoutes({ redirect: 'home' });
  }
}