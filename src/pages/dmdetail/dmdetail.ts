import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../appstate/app.state';
import { Observable } from 'rxjs/Rx';
import { Labor } from '../../components/labor/labor';
import { Part } from '../../components/parts/parts';
import * as DM from "../dm/dmredux"

@Component({
  selector: 'dmdetail',
  templateUrl: 'dmdetail.html',
})
export class DmdetailPage {
  private index: number;
  private rs: any;
  private labor: Labor[] = [];
  private parts: Part[] = [];
  private section: string = "detailView"
  private priority: any = {};
  private wosLen:number;
  private dox:any[];
  private statusTypes:any[]
  constructor(public navCtrl: NavController, public navParams: NavParams, private store: Store<AppState>) {
    this.index = this.navParams.get("index")
    this.store.subscribe(data => {
      this.wosLen=data.dms.length;
      this.rs=data.dms[this.index]
      data.fmtables["priority"].forEach(itm => this.priority[itm.value] = itm.color)
      this.labor=data.fmtables.dmlabor.filter(rs=>rs.woid==this.rs.requestid)
      this.parts=data.fmtables.dmpart.filter(rs=>rs.woid==this.rs.requestid)
      this.dox=data.fmtables.documents.filter(x=>x.uid==this.rs.uid || x.uid==this.rs.recurrenceid)
      this.statusTypes=data.fmtables.pmdmstatustypes
    })
  }

  ionViewDidLoad() {
  }

  swipeEvent(e) {
    let next = (e.direction == 2) ? 1 : -1;
    let nextInd = this.index + next;
    if (nextInd >= this.wosLen ) return;
    if (next == 1)
      this.navCtrl.push(DmdetailPage, { index: nextInd }, { animate: true, animation: "ios-transition", direction: "forward", duration: 300 })
    else
      this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: "back", duration: 300 })
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
    wo.techstatus='Closed'
    if(wo.userTouched.localWipSt && wo.userTouched.localWipSt>0)
      this.toggleWip(wo)
    this.saveState(wo)
  }

  saveState(wo) {
    this.store.dispatch(new DM.Save(wo))
  }
}


