import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'dmtasks',
  templateUrl: 'dmtasks.html'
})
export class DMTasksPage {
    wos:any[]=[{
    woid:1,
    reqtype:"Electrical",
    reqopt:"Heater",
    location:"Newark De",
    description:"Heater not working"
  },
  {
    woid:2,
    reqtype:"Electrical",
    reqopt:"Heater",
    location:"Newark De",
    description:"Heater not working"
  }]

  constructor(public navCtrl: NavController) {

  }
  showPressed(item){
    console.log('x')
  }
}
