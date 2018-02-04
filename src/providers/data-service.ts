
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { AppState } from '../appstate/app.state';
import { Store } from '@ngrx/store';
import { DMActionsTypes, LoadRemote } from '../appstate/dmredux';
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
          let p = this.get("connectionSetting").then((info) => {
            let rmi = new cfm.rmi.RMIService()
            rmi.setRMIHeader({ cid: info.cid, userid: info.userid, password: this.security.authtoken(info.password.d()) });
            return rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${info.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
              .then(x => x.gettechWOAsync()).then(remote => {
                this.store.dispatch(new LoadRemote(remote.DMTasks))
              })
          })
        })
      } else {
        this.subscription.unsubscribe();
      }
    })
  }
}

@Injectable()
export class DMEffects {
  constructor(private actions: Actions,private ds:DataService,private store:Store<AppState>) {
  }
  @Effect({dispatch:false}) 
  loadRemote: Observable<number> = this.actions.ofType(DMActionsTypes.DM_ADD,DMActionsTypes.DM_SAVE,DMActionsTypes.DM_LOAD_REMOTE)
  .map((action)=>{
    return 0
  })
    
}
