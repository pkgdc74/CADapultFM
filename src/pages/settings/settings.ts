import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/data-service/data-service';

import {xxx} from "../../assets/js/test"

export interface ConnectionInfo {
  url: string,
  cid: string,
  userid: string,
  password: string
}

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  conInfo: ConnectionInfo = {
    url: "https://www.cadapultfm.com/fmcloud", cid: "FMDemo", userid: "praveeng", password: "xx"
  }

  constructor(public navCtrl: NavController, private ds: DataService, private toastCtrl: ToastController) {
    alert(xxx)
    ds.get("connectionSetting").then((x) => {
      if (x == null) return
      this.conInfo = x;
      //this.conInfo.password = this.conInfo.password.d()
    })
  }


   connect() {
    /* let options = { message: "", duration: 3000 };
    var rmis = new cfm.rmi.RMIService()
    rmis.setRMIHeader({ cid: this.conInfo.cid, userid: this.conInfo.userid, password: this.process(this.conInfo.password) })
    rmis.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${this.conInfo.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
      .then((proxy) => {
        proxy.testConnectionAsync().then((x) => {
          if (x.status === "OK") {
            let info = Object.assign({}, this.conInfo)
            info.password = info.password.e();
            options.message = "Connection successful"
            this.toastCtrl.create(options).present()
            this.ds.set("connectionSetting", info).then(() => this.ds.startDataEngine());
          } else {
            options.message = x.msg
            this.toastCtrl.create(options).present()
          }
        })
      },
      (x) => {
        options.message = x.msg
        this.toastCtrl.create(options).present()
      }) */
  }

  
 /*  process(pass: string): string {
    let password: any = new Date().getTime() + 10000;
    password = password + "-" + md5(password + "" + pass);
    return password
  }

  validate(x: string, pass: string): boolean {
    let time = x.split("-")
    if (new Date().getTime() > Number(time[0])) return false;
    return md5(time[0] + pass) == time[1]
  }  */

  toggleMode(i) {

  }
}
