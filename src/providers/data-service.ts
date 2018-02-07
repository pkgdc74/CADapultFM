
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { AppState } from '../appstate/app.state';
import { Store } from '@ngrx/store';
import * as dm from '../pages/dm/dmredux';
import * as pm from '../pages/pm/pmredux';
import * as app from '../pages/settings/appsettingsstate';
import { state } from '@angular/core/src/animation/dsl';

declare var cfm;

@Injectable()
export class DataService {
  private engine: Observable<any>;
  private appsettings: app.AppSettings;

  constructor(private storage: Storage, private security: Security, private store: Store<AppState>) {
    this.engine = Observable.timer(0, 300000)
    this.store.select("appsettings").subscribe(s => this.appsettings = s)
    let apps=this.get("appsettings").then(x=>{
      if(x==null)return
      x.password=x.password.d();
      return x;
    })
    Promise.all([this.get("dms"), this.get("pms"), apps]).then((data) => {
      this.store.dispatch({ type: dm.DMActionsTypes.DM_LOAD_LOCAL, payload: data[0] ? data[0] : [] });
      this.store.dispatch({ type: pm.PMActionsTypes.PM_LOAD_LOCAL, payload: data[1] ? data[1] : [] });
      this.store.dispatch(new app.AppSettingsLoad(data[2] ? data[2] : app.defaultAppSettings));
    }).then(x => this.reload())
  }

  get(key: string): Promise<any> {
    return this.storage.get(key).then((d) => {
      d = d == null ? null : JSON.parse(d)
      return d;
    }).catch(d => {
      console.log(d)
    })
  }

  set(key: string, data: any): Promise<any> {
    return this.storage.set(key, JSON.stringify(data))
  }
  subscription:any
  reload() {
    if(this.subscription)
        this.subscription.unsubscribe()
    if (this.appsettings == null) return
    if (this.appsettings.status == 1 && !this.appsettings.offline) {
      this.subscription=this.engine.subscribe((x) => {
        let rmi = new cfm.rmi.RMIService()
        rmi.setRMIHeader({ cid: this.appsettings.cid, userid: this.appsettings.userid, password: this.security.authtoken(this.appsettings.password) });
        return rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${this.appsettings.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
          .then(x => x.gettechWOAsync()).then(remote => {
            this.store.dispatch(new dm.LoadRemote(remote.DMTasks))
            this.store.dispatch(new pm.LoadRemote(remote.PMTasks))
          }).catch(err => {
            this.store.dispatch({ type: "xxx" })
          })
      })
    } else {
      this.store.dispatch({type: "xxx" })
    }
  }
}

