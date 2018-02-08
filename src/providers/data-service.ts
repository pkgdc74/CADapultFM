
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
import { RMIService } from './rmiservice';

@Injectable()
export class DataService {
  private engine: Observable<any>;
  private appsettings: app.AppSettings;
  private subscription: any;

  constructor(private storage: Storage, private security: Security, private store: Store<AppState>, private rmi: RMIService) {
    this.engine = Observable.timer(0, 300000)
    this.store.select("appsettings").subscribe(s => this.appsettings = s)
    let apps = this.get("appsettings").then(x => {
      if (x == null) return
      x.password = x.password.d();
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

  reload() {
    if (this.subscription)
      this.subscription.unsubscribe();
    if (this.appsettings == null) return
    if (this.appsettings.status == 1 && !this.appsettings.offline) {
      this.subscription = this.engine.subscribe((x) => {
        Promise.all([this.get("dms"), this.get("pms"), this.rmi.getProxy()]).then(wos => {
          let dms = wos[0] || []
          let pms = wos[1] || []
          dms = dms.filter(wo => wo.userTouched ? true : false)
          pms = pms.filter(wo => wo.userTouched ? true : false)
          let reqs=[]
          if(dms.length>0)reqs.push(wos[2].syncDmsAsync(dms))
          if(pms.length>0)reqs.push(wos[2].syncPmsAsync(pms))
          return Promise.all(reqs).then(x => wos[2])
        }).then((proxy) => {
          proxy.gettechWOAsync().then(remote => {
            this.store.dispatch(new dm.LoadRemote(remote.DMTasks))
            this.store.dispatch(new pm.LoadRemote(remote.PMTasks))
          }).catch(err => {
            console.log(err)
            this.store.dispatch({ type: "xxx" })
          })
        }).catch(err => {
          console.log(err)
          this.store.dispatch({ type: "xxx" })
        })
      })
    } else {
      this.store.dispatch({ type: "xxx" })
    }
  }
}

