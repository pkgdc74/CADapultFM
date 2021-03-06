import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { Security } from '../../providers/security';
import { AppSettings, defaultAppSettings, ConnectionStatus, AppSettingsSave } from './appsettingsstate';
import { Store } from '@ngrx/store';
import { AppState } from '../../appstate/app.state';

declare var cfm: any


@Component({
  selector: 'settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  private conInfo: AppSettings

  constructor(public navCtrl: NavController, private ds: DataService, private toastCtrl: ToastController, private sec: Security, private store: Store<AppState>) {
    this.store.select("appsettings").subscribe(state => {
      this.conInfo = state
    })
  }

  connect() {
    let options = { position: "top", message: "", duration: 3000 };
    var rmis = new cfm.rmi.RMIService()
    rmis.setRMIHeader({ cid: this.conInfo.cid, userid: this.conInfo.userid, password: this.sec.authtoken(this.conInfo.password) })
    rmis.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${this.conInfo.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
      .then((proxy) => {
        proxy.testConnectionAsync().then((x) => {
          if (x.status === "OK") {
            options.message = "Connection successful"
            this.toastCtrl.create(options).present()
            this.conInfo.status = ConnectionStatus.Connected;
            this.saveState()
            this.navCtrl.parent.select(0)
          } else {
            options.message = x.msg
            this.toastCtrl.create(options).present()
          }
        })
      },
      (x) => {
        options.message = x
        this.toastCtrl.create(options).present()
      })
  }
  private saveState() {
    let info = Object.assign({}, this.conInfo)
    this.store.dispatch(new AppSettingsSave(info))
    this.ds.reload();
  }
  toggleMode(flag) {
    this.conInfo.offline = flag
    this.saveState()
  }
}
