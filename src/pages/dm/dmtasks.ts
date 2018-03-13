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
    })
  }

  toDateString(date: Date) {
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
  }
  
  startWIP(wo){
    let time = new Date().toLocaleString().replace(",", "")
    let wip = {
      id: -1, requestid: wo.requestid, module: "DM", technician: this.fmtables.user.username, starttime: time, endtime: null, uuid: new Date().getTime() + wo.requestid
    }
    this.store.dispatch({ type: "FMCOMMON_TABLES_ADDROW", payload: { table: "pmdmrequestswip", row: wip } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMDMREQUESTSWIP_ADD", payload: wip } })
  }
  stopWIP(wip,wo){
    wip.endtime = new Date().toLocaleString().replace(",", "")
    let diff: number = new Date(wip.endtime).getTime() - new Date(wip.starttime).getTime()
    diff = diff / (60 * 60 * 1000)
    let labor = {
      id: -1, maintid: wo.requestid, mainttype: "DMR", type: "Labor", hours: diff.toFixed(2), rate: this.fmtables.user.billrate,
      description: "added as WIP hrs", partcost: 0, partqty: 0, workingdate: this.toDateString(new Date()), uuid: new Date().getTime() + wo.requestid
    }
    this.store.dispatch({ type: "FMCOMMON_TABLES_ADDROW", payload: { table: "pmpartslabor", row: labor } })
    this.store.dispatch({ type: "FMCOMMON_TABLES_UPDATEROW", payload: { table: "pmdmrequestswip", row: wip } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMPARTSLABOR_ADD", payload: labor } })
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "PMDMREQUESTSWIP_SAVE", payload: wip } })
  }
  toggleWip(wo) {
    let wip = this.wips.find(rs => rs.requestid == wo.requestid && !rs.endtime)
    let status: string;
    if (wip) {
      this.stopWIP(wip,wo)
      status = "Open"
    } else {
      this.startWIP(wo)
      status = this.fmtables.appvars.PMDMWIPTechStatusValue || wo.techstatus
    }
    wo.techstatus = status
    this.store.dispatch(new DM.Save(wo))
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: { requestid: wo.requestid, techstatus: wo.techstatus } } })
  }

  closeWO(wo) {
    let wip = this.wips.find(rs => rs.requestid == wo.requestid && !rs.endtime)
    if(wip)
      this.stopWIP(wip,wo)
    wo.techstatus="Closed"
    this.store.dispatch(new DM.Close(wo))
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: { requestid: wo.requestid, techstatus: wo.techstatus } } })
  }

  saveState(wo) {
    if (wo.techstatus == "Closed") {
      this.store.dispatch(new DM.Close(wo))
    } else {
      this.store.dispatch(new DM.Save(wo))
    }
    let x = { requestid: wo.requestid, techstatus: wo.techstatus }
    this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: x } })
  }

  signWO(wo) {
    let m: Modal = this.modalCtrl.create(SignaturePage, { du: wo.signature || "" })
    m.onDidDismiss((d) => {
      if (!wo.signature) {
        wo.signature = d;
        this.store.dispatch(new DM.Save(wo))
        let x = { requestid: wo.requestid, signature: wo.signature, techstatus: wo.techstatus }
        this.store.dispatch({ type: "SYNCQUEUE_ADD", command: { name: "DM_SAVE", payload: x } })
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
