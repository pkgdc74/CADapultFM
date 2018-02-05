
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { AppState } from '../appstate/app.state';
import { Store } from '@ngrx/store';
import * as dm from '../pages/dm/dmredux';
import * as pm from '../pages/pm/pmredux';

declare var cfm;

@Injectable()
export class DataService {
  private engine: Observable<any>;
  private subscription = { unsubscribe: () => { } }

  constructor(private storage: Storage, private security: Security, private store: Store<AppState>) {
    this.engine = Observable.timer(0, 300000)
    Promise.all([this.get("dms"), this.get("pms")]).then((data) => {
      this.store.dispatch({ type: dm.DMActionsTypes.DM_LOAD_LOCAL, payload: data[0] ? data[0] : [] });
      this.store.dispatch({ type: pm.PMActionsTypes.PM_LOAD_LOCAL, payload: data[1] ? data[1] : [] });
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

  reload() {
    this.get("connectionSetting").then((info) => {
      if (info == null) return
      if (info.status == 1 && !info.offline) {
        this.subscription.unsubscribe();
        this.subscription = this.engine.subscribe((x) => {
          this.get("connectionSetting").then((info) => {
            let rmi = new cfm.rmi.RMIService()
            rmi.setRMIHeader({ cid: info.cid, userid: info.userid, password: this.security.authtoken(info.password.d()) });
            return rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${info.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
              .then(x => x.gettechWOAsync()).then(remote => {
                this.store.dispatch(new dm.LoadRemote(remote.DMTasks))
                this.store.dispatch(new pm.LoadRemote(remote.PMTasks))
              }).catch(err => {
                this.store.dispatch({ type: "xxx" })
              })
          })
        })
      } else {
        this.store.dispatch({ type: "xxx" })
        this.subscription.unsubscribe();
      }
    })
  }
}

