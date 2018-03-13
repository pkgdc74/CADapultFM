import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState, PMPartslabor, FMTables } from '../../appstate/app.state';
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
  private user: any;
  private fmtables: FMTables
  constructor(public navCtrl: NavController, public navParams: NavParams, private store: Store<AppState>) {
    this.index = this.navParams.get("index")
    this.store.subscribe(data => {
      this.wosLen = data.dms.length;
      this.rs = data.dms[this.index]
      data.fmtables["priority"].forEach(itm => this.priority[itm.value] = itm.color)
      this.fmtables = data.fmtables
      this.partlabor = data.fmtables.pmpartslabor
      this.user = data.fmtables.user;
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

  parts() {
    return this.partlabor.filter(row => row.type == "Part" && row.maintid == this.rs.requestid)
  }
  labor() {
    return this.partlabor.filter(row => row.type == "Labor" && row.maintid == this.rs.requestid)
  }

  private techcomments: string;
  saveState(wo) {
    let tmp = { requestid:wo.requestid,techstatus:wo.techstatus, techcomments: this.techcomments }
    wo.techcomments = this.techcomments + "<br>" + wo.techcomments
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: tmp } })
    if (wo.techstatus == "Closed") {
      this.store.dispatch(new DM.Close(wo))
      this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: "back", duration: 300 })
    } else {
      this.store.dispatch(new DM.Save(wo))
    }
    this.techcomments = ""
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
