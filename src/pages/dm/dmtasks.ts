import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { SignaturePage } from '../signature/signature';
import { Modal } from 'ionic-angular/components/modal/modal';
import { DataService } from '../../providers/data-service';
import { AppState } from '../../appstate/app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as DM from "./dmredux"
import { AppSettings } from '../settings/appsettingsstate';
import { DmdetailPage } from '../dmdetail/dmdetail';

@Component({
  selector: 'dmtasks',
  templateUrl: 'dmtasks.html'
})
export class DMTasksPage {
  appsettings: Observable<AppSettings>;
  private wos: Observable<any[]>
  private priority:any={}
  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private ds: DataService, private store: Store<AppState>) {
    this.wos = this.store.select("dms")
    this.appsettings = this.store.select("appsettings")
    this.store.select("fmtables").subscribe(fmtables=>{
      fmtables["priority"].forEach(itm=>this.priority[itm.value]=itm.color)
    })
  }
  private userTouched(wo){
    if(!wo.userTouched)
      wo.userTouched={}
  }
  toggleWip(wo) {
    this.userTouched(wo)
    wo.userTouched.wips = wo.userTouched.wips || []
    wo.userTouched.localWipSt = wo.userTouched.localWipSt || 0
    if (wo.userTouched.localWipSt > 0) {
      wo.userTouched.wips.push({ "st": wo.userTouched.localWipSt, "et": new Date().getTime() })
      wo.userTouched.localWipSt = 0;
      wo.userTouched.labor = wo.userTouched.wips.reduce((s, x) => { return s + (x.et - x.st) }, 0)
    } else {
      wo.userTouched.localWipSt = new Date().getTime()
    }
    this.saveState(wo)
  }

  closeWO(wo) {
    this.userTouched(wo)
    wo.techstatus='closed'
    if(wo.userTouched.localWipSt && wo.userTouched.localWipSt>0)
      this.toggleWip(wo)
    this.saveState(wo)
  }

  saveState(wo) {
    this.store.dispatch(new DM.Save(wo))
  }

  signWO(wo) {
    this.userTouched(wo)
    let m: Modal = this.modalCtrl.create(SignaturePage, { du: wo.userTouched.signature || "" })
    m.onDidDismiss((d) => {
      if (!wo.userTouched.signature) {
        wo.userTouched.signature = d;
        this.saveState(wo)
      }
    })
    m.present()
  }
  doRefresh(refresher){
    this.ds.reload()
    this.store.skip(1).take(1).subscribe(x=>{
      refresher.complete()
    })
  }
  showDetail(wo){
    this.navCtrl.push(DmdetailPage,{requestid:wo.requestid})
  }
}
