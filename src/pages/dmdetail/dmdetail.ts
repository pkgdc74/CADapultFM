import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState, PMPartslabor } from '../../appstate/app.state';
import { Observable } from 'rxjs/Rx';
import * as DM from "../dm/dmredux"

@Component({
  selector: 'dmdetail',
  templateUrl: 'dmdetail.html',
})
export class DmdetailPage {
  private index: number;
  private rs: any;
  private section: string = "detailView"
  private priority: any = {};
  private wosLen: number;
  private dox: any[];
  private statusTypes: any[]
  private partlabor: PMPartslabor[];
  private user:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private store: Store<AppState>) {
    this.index = this.navParams.get("index")
    this.store.subscribe(data => {
      this.wosLen = data.dms.length;
      this.rs = data.dms[this.index]
      data.fmtables["priority"].forEach(itm => this.priority[itm.value] = itm.color)
      this.partlabor = data.fmtables.pmpartslabor
      this.user=data.fmtables.user;
      this.dox = data.fmtables.documents.filter(x => x.uid == this.rs.uid || x.uid == this.rs.recurrenceid)
      this.statusTypes = data.fmtables.pmdmstatustypes
    })
  }

  ionViewDidLoad() {
  }

  swipeEvent(e) {
    let next = (e.direction == 2) ? 1 : -1;
    let nextInd = this.index + next;
    if (nextInd >= this.wosLen) return;
    if (next == 1)
      this.navCtrl.push(DmdetailPage, { index: nextInd }, { animate: true, animation: "ios-transition", direction: "forward", duration: 300 })
    else
      this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: "back", duration: 300 })
  }
  private userTouched(wo) {
    if (!wo.userTouched)
      wo.userTouched = {}
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
  parts() {
    return this.partlabor.filter(row => row.type == "Part" && row.maintid == this.rs.requestid)
  }
  labor() {
    return this.partlabor.filter(row => row.type == "Labor" && row.maintid == this.rs.requestid)
  }
  closeWO(wo) {
    this.userTouched(wo)
    wo.techstatus = 'Closed'
    if (wo.userTouched.localWipSt && wo.userTouched.localWipSt > 0)
      this.toggleWip(wo)
    this.saveState(wo)
  }

  saveState(wo) {
    this.store.dispatch(new DM.Save(wo))
  }

  addPart(part: PMPartslabor) {
    part.id = -1
    part.maintid = this.rs.requestid
    part.type = "Part"
    part.mainttype = "DMR"
    part.uuid = new Date().getTime().toString() + this.rs.requestid;
    this.store.dispatch({ type: "FMCOMMON_TABLES_ADDROW", payload: { table: "pmpartslabor", row: part } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_ADD", payload: part } })
  }

  deletePart(part: PMPartslabor) {
    let idx = this.partlabor.findIndex(itm => {
      if (itm.id > -1)
        return itm.id == part.id
      else
        return itm.uuid == part.uuid
    })
    this.store.dispatch({ type: "FMCOMMON_TABLES_DELETEROW", payload: { table: "pmpartslabor", idx: idx } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_DELETE", payload: part } })
  }

  toDateString(date: Date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
  }
  addLabor(labor: PMPartslabor) {
    labor.id = -1
    labor.maintid = this.rs.requestid
    labor.type = "Labor"
    labor.mainttype = "DMR"
    labor.uuid = new Date().getTime().toString() + this.rs.requestid;
    let x = { ...labor, workingdate: this.toDateString(new Date(labor.workingdate)) }
    this.store.dispatch({ type: "FMCOMMON_TABLES_ADDROW", payload: { table: "pmpartslabor", row: x } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_ADD", payload: x } })
  }

  deleteLabor(labor: PMPartslabor) {
    let idx = this.partlabor.findIndex(itm => {
      if (itm.id > -1)
        return itm.id == labor.id
      else
        return itm.uuid == labor.uuid
    })
    this.store.dispatch({ type: "FMCOMMON_TABLES_DELETEROW", payload: { table: "pmpartslabor", idx: idx } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_DELETE", payload: labor } })
  }
}
