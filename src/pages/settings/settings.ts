import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  conInfo:ConnectionInfo={
    url:"https://www.cadapultfm.com/fmcloudbeta",cid:"FMDemo",userid:"daves",password:"",isValid:false
  }
  constructor(public navCtrl: NavController) {}

}

export interface ConnectionInfo{
  url:string,
  cid:string,
  userid:string,
  password:string,
  isValid:boolean
}
