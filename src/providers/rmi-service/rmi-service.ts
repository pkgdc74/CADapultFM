import { Injectable } from '@angular/core';
declare var cfm

@Injectable()
export class RmiService {
  private rs = new cfm.rmi.RMIService()
  conInfo = {
    url: "https://cadapultfm1.cadapult.local/fmcloudbeta", cid: "FMDev", userid: "", password: "", isValid: false
  }
  constructor() {
    this.rs.setRMIHeader({ "cid": this.conInfo.cid, "userid": this.conInfo.userid });
    this.rs.getProxyAsync("com.mobile.invpmdm.InvPMDMRMIService", this.conInfo.url + "/invpmdm/mobile/invpmdmmobilermiservice.asp").then(x => this.rs = x)
  }
  get(){
    return this.rs
  }
}
