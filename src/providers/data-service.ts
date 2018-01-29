
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
declare var cfm;

@Injectable()
export class DataService {
  private publisher:BehaviorSubject<any>;
  constructor(private storage:Storage,private security:Security) {
    this.engine=Observable.timer(0,20000)
    this.publisher=new BehaviorSubject(0)
    this.appStateChanged()
  }
  
  get(key:string):Promise<any>{
    return this.storage.get(key).then((d)=>{
      d=d==null?null:JSON.parse(d)
      return d;
    }).catch(d=>{
      console.log(d)
    })
  }
  
  set(key:string,data:any):Promise<any>{
    return this.storage.set(key,JSON.stringify(data))
  }
  private engine:Observable<any>;
  
  private subscription={unsubscribe:()=>{}}
  
  appStateChanged(){
    this.get("connectionSetting").then((info)=>{
      if(info==null)return
      if(!info.offline){
        this.subscription=this.engine.switchMap((x)=>{
          let rmi=new cfm.rmi.RMIService()
          rmi.setRMIHeader({cid:info.cid,userid:info.userid,password:this.security.authtoken(info.password.d())});
          let p=rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${info.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
          .then(x=>x.gettechWOAsync())
          return Observable.fromPromise(p)
        }).subscribe(x=>this.publisher.next(x))
      }else{
        this.subscription.unsubscribe();
      }
    })
  }
}


