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
    description:"Heater not working",
    startTime:new Date("1/10/2018").getTime()
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
  toggleWip(wo){
    wo.wips=wo.wips||[]
    wo.startTime=wo.startTime||0
    if(wo.startTime>0){
      wo.wips.push({"st":wo.startTime,"et":new Date().getTime()})
      wo.startTime=0;
      wo.labor=wo.wips.reduce((s,x)=>{return s+(x.et-x.st)},0)
    }else{
      wo.startTime=new Date().getTime()
    }
  }
}


