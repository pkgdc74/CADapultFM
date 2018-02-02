
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { Subscription } from 'rxjs/Subscription';
import { AppState } from '../appstate/app.state';
import { Store } from '@ngrx/store';
import { DMActionsTypes, LoadRemoteDone, LoadRemote } from '../appstate/dmredux';
import { Actions, Effect } from "@ngrx/effects";
import { Action } from "@ngrx/store"

declare var cfm;

@Injectable()
export class DataService {
  private engine: Observable<any>;
  private subscription = { unsubscribe: () => { } }

  constructor(private storage: Storage, private security: Security, private store: Store<AppState>) {
    this.engine = Observable.timer(0, 300000)
    this.get("wos").then(x => {
      this.store.dispatch({ type: DMActionsTypes.DM_LOAD_LOCAL, payload: x ? x.DMTasks : [] });
    }).then(x => this.appStateChanged())
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

  appStateChanged() {
    this.get("connectionSetting").then((info) => {
      if (info == null) return
      if (info.status == 1 && !info.offline) {
        this.subscription.unsubscribe();
        this.subscription = this.engine.subscribe((x) => {
          this.store.dispatch(new LoadRemote())
        })
      } else {
        this.subscription.unsubscribe();
      }
    })
  }
}

@Injectable()
export class DMEffects {
  constructor(private actions: Actions, private ds: DataService, private security: Security,private store:Store<AppState>) {
  }
  @Effect()
  loadRemote: Observable<Action> = this.actions.ofType(DMActionsTypes.DM_LOAD_REMOTE)
    .flatMap(x => {
      let p = this.ds.get("connectionSetting").then((info) => {
        if (info == null || info.status != 1 || info.offline) return null
        let rmi = new cfm.rmi.RMIService()
        rmi.setRMIHeader({ cid: info.cid, userid: info.userid, password: this.security.authtoken(info.password.d()) });
        return rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${info.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
          .then(x => x.gettechWOAsync()).then(remote => {
            return new LoadRemoteDone(remote.DMTasks)
          })
      })
      return Observable.fromPromise(p)
    })
}
