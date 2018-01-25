import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { SignaturePage } from '../signature/signature';
import { Modal } from 'ionic-angular/components/modal/modal';
import { DataService } from '../../providers/data-service/data-service';

@Component({
  selector: 'dmtasks',
  templateUrl: 'dmtasks.html'
})
export class DMTasksPage {
  wos: any[]
  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private ds: DataService) {
    this.ds.get("dm").then(d => { this.wos = d; })

  }
  toggleWip(wo) {
    wo.wips = wo.wips || []
    wo.startTime = wo.startTime || 0
    if (wo.startTime > 0) {
      wo.wips.push({ "st": wo.startTime, "et": new Date().getTime() })
      wo.startTime = 0;
      wo.labor = wo.wips.reduce((s, x) => { return s + (x.et - x.st) }, 0)
    } else {
      wo.startTime = new Date().getTime()
    }
  }
  closeWO(wo) {

  }
  signWO(wo) {
    let m: Modal = this.modalCtrl.create(SignaturePage, { du: wo.signature || "" })
    m.onDidDismiss((d) => {
      if (!wo.signature)
        wo.signature = d;
    })
    m.present()
  }
}


