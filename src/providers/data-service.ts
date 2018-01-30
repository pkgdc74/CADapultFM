
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Rx";
import { Security } from "./security";
import { Subscription } from 'rxjs/Subscription';
declare var cfm;

@Injectable()
export class DataService {
  private publisher:BehaviorSubject<any>;
  private engine:Observable<any>;
  private subscription={unsubscribe:()=>{}}

  constructor(private storage:Storage,private security:Security) {
    this.engine=Observable.timer(0,300000)
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

  subscribe(name:string,x:(a:object[])=>void):Subscription{
    return this.publisher.subscribe((data)=>{
        if(data==0)return
        x(data[name])
    })
  }

  woSummary(x:(a:{})=>void){
    return this.publisher.subscribe((data)=>{
      if(data==0)return
      data={"dm":data["DMTasks"].length,"pm":data["PMTasks"].length,"assets":data["Assets"].length}
      x(data)
    })
  }

  appStateChanged(){
    this.get("connectionSetting").then((info)=>{
      if(info==null)return
      if(info.status==1 && !info.offline){
        this.subscription.unsubscribe();
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


