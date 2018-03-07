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
  private priority: any = {}
  private wips = []
  private wipAt: any = {};
  private labor: any = {};
  private fmtables: any = {}
  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private ds: DataService, private store: Store<AppState>) {
    this.wos = this.store.select("dms")
    this.appsettings = this.store.select("appsettings")
    this.store.select("fmtables").subscribe(fmtables => {
      this.fmtables = fmtables
      fmtables["priority"].forEach(itm => this.priority[itm.value] = itm.color)
      this.wips = fmtables.pmdmrequestswip
      this.labor = fmtables["pmpartslabor"].reduce((s, row) => {
        if (!(row.mainttype == "DMR" && row.type == "Labor")) return s
        s[row.maintid] = s[row.maintid] || 0
        s[row.maintid] += row.hours * 60 * 60 * 1000
        return s
      }, {})
      this.wipAt = fmtables["pmdmrequestswip"].reduce((s, row) => {
        if (!(row.module == "DM" && row.technician == fmtables.user.username && !row.endtime)) return s
        s[row.requestid] = new Date(row.starttime).getTime()
        return s
      }, {})
      console.log(fmtables.pmpartslabor)
    })
  }
  private userTouched(wo) {
    if (!wo.userTouched)
      wo.userTouched = {}
  }
  toDateString(date: Date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
  }
  toggleWip(wo) {
    if (this.wipAt[wo.requestid]) {
      let idx = this.wips.findIndex(rs => rs.requestid == wo.requestid && !rs.endtime)
      this.wips[idx].endtime = new Date().toLocaleString()
      this.store.dispatch({ type: "FMCOMMON_TABLES_UPDATEROW", payload: { table: "pmdmrequestswip", idx: idx, row: this.wips[idx] } })
      let diff = new Date(this.wips[idx].endtime).getTime() - new Date(this.wips[idx].starttime).getTime()
      diff = diff / (60 * 60 * 1000)
      let row = {
        id: -1, maintid: wo.requestid, mainttype: "DMR", type: "Labor", hours: diff, rate: this.fmtables.user.billrate,
        description: "added as WIP hrs", partcost: 0, partqty: 0, workingdate: this.toDateString(new Date()), uuid: new Date().getTime() + wo.requestid
      }
      this.store.dispatch({ type: "FMCOMMON_TABLES_ADDROW", payload: { table: "pmpartslabor", row: row }})
      this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_ADD", payload: row } })
      this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMDMREQUESTSWIP_SAVE", payload: this.wips[idx] } })
    }

    // this.userTouched(wo)
    // wo.userTouched.wips = wo.userTouched.wips || []
    // wo.userTouched.localWipSt = wo.userTouched.localWipSt || 0
    // if (wo.userTouched.localWipSt > 0) {
    //   wo.userTouched.wips.push({ "st": wo.userTouched.localWipSt, "et": new Date().getTime() })
    //   wo.userTouched.localWipSt = 0;
    //   wo.userTouched.labor = wo.userTouched.wips.reduce((s, x) => { return s + (x.et - x.st) }, 0)
    // } else {
    //   wo.userTouched.localWipSt = new Date().getTime()
    // }
    // this.saveState(wo)
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
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: wo } })
  }

  signWO(wo) {
    this.userTouched(wo)
    let m: Modal = this.modalCtrl.create(SignaturePage, { du: wo.signature || "" })
    m.onDidDismiss((d) => {
      if (!wo.signature) {
        wo.signature = d;
        this.saveState(wo)
      }
    })
    m.present()
  }
  doRefresh(refresher) {
    this.ds.reload()
    this.store.skip(1).take(1).subscribe(x => {
      refresher.complete()
    })
  }
  showDetail(wo, index) {
    if (wo.techstatus == 'Closed') return
    this.navCtrl.push(DmdetailPage, { index: index }, { animate: true, animation: "ios-transition", direction: "up", duration: 300 })
  }
}
