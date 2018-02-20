import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../appstate/app.state';
import { Observable } from 'rxjs/Rx';
import { Labor } from '../../components/labor/labor';


@Component({
  selector: 'dmdetail',
  templateUrl: 'dmdetail.html',
})
export class DmdetailPage {
  private index: number;
  private rs: any;
  private laborarr: Labor[] = []
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

}


