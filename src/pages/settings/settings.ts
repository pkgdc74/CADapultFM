import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { global } from '@angular/core/src/util';
import { Security } from '../../providers/security';

declare var cfm:any

export interface ConnectionInfo {
  url: string,
  cid: string,
  userid: string,
  password: string,
  offline:boolean
}

@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  conInfo: ConnectionInfo = {
    url: "https://www.cadapultfm.com/fmcloudbeta", cid: "FMDemo", userid: "", password: "",offline:false
  }

  constructor(public navCtrl: NavController, private ds: DataService, private toastCtrl: ToastController,private sec:Security) {
    this.ds.get("connectionSetting").then((x) => {
      if (x == null) return
      this.conInfo = x;
      this.conInfo.password = this.conInfo.password.d()
    })
  }

  connect() {
    let options = { message: "", duration: 3000 };
    var rmis = new cfm.rmi.RMIService()
    rmis.setRMIHeader({ cid: this.conInfo.cid, userid: this.conInfo.userid, password: this.sec.authtoken(this.conInfo.password) })
    rmis.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${this.conInfo.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
      .then((proxy) => {
        proxy.testConnectionAsync().then((x) => {
          if (x.status === "OK") {
            options.message = "Connection successful"
            this.toastCtrl.create(options).present()
            this.saveState()
          } else {
            options.message = x.msg
            this.toastCtrl.create(options).present()
          }
        })
      },
      (x) => {
        options.duration=10000;
        options.message = x
        this.toastCtrl.create(options).present()
      })
  }
  private saveState():Promise<any>{
    let info = Object.assign({}, this.conInfo)
    info.password = info.password.e();
    return this.ds.set("connectionSetting", info).then((x)=>{
      this.ds.appStateChanged();
    })
  }
  toggleMode(flag) {
    this.conInfo.offline=flag
    this.saveState()
  }
}
