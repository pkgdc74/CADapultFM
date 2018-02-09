import { Component, animate } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'dmdetail',
  templateUrl: 'dmdetail.html',
})
export class DmdetailPage {
  private requestid:number
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }
  name:string
  ionViewDidLoad() {
    this.requestid=this.navParams.get("requestid")
  }
  swipeEvent(e) {
    if(e.direction==2)
      this.navCtrl.push(DmdetailPage,{requestid:this.requestid+1},{animate:true,animation:"ios-transition",direction:"forward",duration:1000})
    else
      this.navCtrl.push(DmdetailPage,{requestid:this.requestid-1},{animate:true,animation:"ios-transition",direction:"back",duration:1000})
  }
  next(){

  }
  previous(){

  }
}
