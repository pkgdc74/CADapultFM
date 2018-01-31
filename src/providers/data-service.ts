
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { Subscription } from 'rxjs/Subscription';

declare var cfm;

@Injectable()
export class DataService {
  private publisher: BehaviorSubject<any>;
  private engine: Observable<any>;
  private subscription = { unsubscribe: () => { } }

  constructor(private storage: Storage, private security: Security) {
    this.engine = Observable.timer(0, 3000)
    this.publisher = new BehaviorSubject(0)
    this.get("wos").then(x=>{
      this.publisher.next(x)
    })
    this.appStateChanged()
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

  subscribe(name: string, x: (a: object[]) => void): Subscription {
    return this.publisher.subscribe((data) => {
      if (data==null || data == 0) return
      x(data[name])
    })
  }

  woSummary(x: (a: {}) => void) {
    return this.publisher.subscribe((data) => {
      if (data==null || data == 0) return
      data = { "dm": data["DMTasks"].length, "pm": data["PMTasks"].length, "assets": data["Assets"].length }
      x(data)
    })
  }
  private syncData(local:any[],remote:any[]):any[]{
    local.forEach(x=>{
      let i=remote.findIndex(y=>{
        console.log(x.requestid==y.requestid)
        return x.requestid==y.requestid
      })
      if(i!==-1)
        remote.splice(i,1)
    })
    return remote
  }
  appStateChanged() {
    this.get("connectionSetting").then((info) => {
      if (info == null) return
      if (info.status == 1 && !info.offline) {
        this.subscription.unsubscribe();
        this.subscription = this.engine.switchMap<any,any>((x) => {
          let rmi = new cfm.rmi.RMIService()
          rmi.setRMIHeader({ cid: info.cid, userid: info.userid, password: this.security.authtoken(info.password.d()) });
          let p = rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${info.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
          .then(x => x.gettechWOAsync())
          .then(remote=>{
            return this.get("wos").then((local)=>{
              local=local||{DMTasks:[],PMTasks:[],Assets:[]}
              let sdata = {
                DMTasks:this.syncData(local.DMTasks,remote.DMTasks),
                PMTasks:remote.PMTasks,
                Assets:remote.Assets
              }
              local.DMTasks=local.DMTasks.concat(sdata.DMTasks)
              this.set("wos",local)
              return sdata;
            })
          })
          return Observable.fromPromise(p)
        })
        .subscribe(x => {
          if(x.DMTasks.length==0 && x.PMTasks.length==0 && x.Assets.length==0)return
          this.publisher.next(x);
        })
      } else {
        this.subscription.unsubscribe();
      }
    })
  }
}


