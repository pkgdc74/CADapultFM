import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

export interface ConnectionInfo {
  url: string,
  cid: string,
  userid: string,
  password: string,
  isValid: boolean
}

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  conInfo: ConnectionInfo = {
    url: "https://cadapultfm1.cadapult.local/fmcloudbeta", cid: "FMDev", userid: "", password: "", isValid: false
  }
  constructor(public navCtrl: NavController) {
  }
  connect() {

  }
  showMessage() {
  }
}
