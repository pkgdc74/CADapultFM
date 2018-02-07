import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { SignaturePage } from '../signature/signature';
import { Modal } from 'ionic-angular/components/modal/modal';
import { DataService } from '../../providers/data-service';
import { AppState } from '../../appstate/app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as pm from "./pmredux"
import { AppSettings } from '../settings/appsettingsstate';

@Component({
  selector: 'pmtasks',
  templateUrl: 'pmtasks.html'
})
export class PMTasksPage {
  appsettings: Store<AppSettings>;
  private wos: Observable<any[]>
  
  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private ds: DataService, private store: Store<AppState>) {
    this.wos = this.store.select(state => state.pms)
    this.appsettings = this.store.select("appsettings")
  }

  toggleWip(wo) {
    wo.wips = wo.wips || []
    wo.localWipSt = wo.localWipSt || 0
    if (wo.localWipSt > 0) {
      wo.wips.push({ "st": wo.localWipSt, "et": new Date().getTime() })
      wo.localWipSt = 0;
      wo.labor = wo.wips.reduce((s, x) => { return s + (x.et - x.st) }, 0)
    } else {
      wo.localWipSt = new Date().getTime()
    }
    this.saveState(wo)
  }

  closeWO(wo) {
    this.saveState(wo)
  }

  saveState(wo) {
    this.store.dispatch(new pm.Save(wo,this.ds))
  }

  signWO(wo) {
    let m: Modal = this.modalCtrl.create(SignaturePage, { du: wo.signature || "" })
    m.onDidDismiss((d) => {
      if (!wo.signature) {
        wo.signature = d;
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
}
