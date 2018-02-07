import { Injectable } from "@angular/core";
import { AppState } from "../appstate/app.state";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { AppSettings } from "../pages/settings/appsettingsstate";
import { Security } from "./security";

declare var cfm

@Injectable()
export class RMIService{
private settings:AppSettings;
private appsettings:AppSettings
    constructor(private store:Store<AppState>,private security:Security){
        store.select("appsettings").subscribe(settings=>this.appsettings=settings)
    }
    getProxy(){
        let rmi = new cfm.rmi.RMIService()
        rmi.setRMIHeader({ cid: this.appsettings.cid, userid: this.appsettings.userid, password: this.security.authtoken(this.appsettings.password) });
        rmi.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", `${this.appsettings.url}/invpmdm/mobile/invpmdmmobilermiservice.asp`)
        return rmi;
    }
}