
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
import * as fmcommon from '../app/fmcommon';

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
    Promise.all([this.get("dms"), this.get("pms"), apps, this.get("fmtables")]).then((data) => {
      this.store.dispatch(new dm.LoadLoacal(data[0] ? data[0] : []));
      this.store.dispatch(new pm.LoadLoacal(data[1] ? data[1] : []));
      let settings = data[2] ? data[2] : app.defaultAppSettings
      this.store.dispatch(new app.AppSettingsLoad(settings));
      this.store.dispatch(new fmcommon.LoadTablesAction(data[3] ? data[3] : fmcommon.initfmtables))
      return settings
    })
      .then(settings => {
        if (settings.offline || settings.status == 0) throw new Error("offline or not connected")
      })
      .then(() => this.rmi.getProxy()).then(proxy => proxy.getAppTablesAsync()).then((fmtables) => {
        this.store.dispatch(new fmcommon.LoadTablesAction(fmtables))
      })
      .then(() => this.reload())
      .catch(err => console.log(err))
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
          let reqs = [], proxy = wos[2]
          if (dms.length > 0) reqs.push(proxy.syncDmsAsync(dms))
          if (pms.length > 0) reqs.push(proxy.syncPmsAsync(pms))
          reqs.push(this.get("syncqueue").then(commands => {
            if (commands == null || commands.length == 0) return
            return proxy.processCommandsAsync(commands).then(res => {
              let filtered = commands.filter(cmd => {
                return res.findIndex(x => x.syncid == cmd.syncid && x.status == "OK") == -1 ? true : false
              })
              this.set("syncqueue", filtered)
            }).catch(err => console.log(err))
          }))
          return Promise.all(reqs).then(x => proxy)
        }).then((proxy) => Promise.all([proxy.getAppTablesAsync(), proxy.gettechWOAsync()]))
          .then(arr => {
            let [fmtables, remote] = arr;
            this.store.dispatch(new dm.LoadRemote(remote.DMTasks))
            this.store.dispatch(new pm.LoadRemote(remote.PMTasks))
            this.store.dispatch(new fmcommon.LoadTablesAction(fmtables))
            this.store.dispatch({ type: "APP_STORE_STATE_SAVE", payload: "" })
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

