import {inject, bindable, bindingMode} from 'aurelia-framework';
import {ApiInterface} from '../services/api-interface';
import {state} from '../services/state';

@inject(ApiInterface)
export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(ApiInterface) {
    this.api = ApiInterface;
  }

  attached() {
  }

  detached() {
  }
}