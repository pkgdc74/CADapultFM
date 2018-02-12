import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../appstate/app.state';
import { Observable } from 'rxjs/Rx';


@Component({
  selector: 'dmdetail',
  templateUrl: 'dmdetail.html',
})
export class DmdetailPage {
  private index: number;
  private wos: any[];
  private rs: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private store: Store<AppState>) {
    this.index = this.navParams.get("index")
    this.store.subscribe(data => { this.wos = data.dms; this.rs = this.wos[this.index] })
  }

  ionViewDidLoad() {
  }

  swipeEvent(e) {
    let next = (e.direction == 2) ? 1 : -1;
    let nextInd = this.index + next;
    if (nextInd >= this.wos.length || nextInd < 0) return;
    if (next == 1)
      this.navCtrl.push(DmdetailPage, { index: nextInd }, { animate: true, animation: "ios-transition", direction: "forward", duration: 300 })
    else
      this.navCtrl.pop({ animate: true, animation: "ios-transition", direction: "back", duration: 300 })
  }

}

