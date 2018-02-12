import { Component } from '@angular/core';

/**
 * Generated class for the LaborComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'labor',
  templateUrl: 'labor.html'
})
export class LaborComponent {

  text: string;

  constructor() {
    console.log('Hello LaborComponent Component');
    this.text = 'Hello World';
  }

}
