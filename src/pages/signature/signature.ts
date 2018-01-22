import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SignatureCompnenet } from '../../components/signature/signature.component';


@Component({
  selector: 'signature-page',
  templateUrl: 'signature.html',
})
export class SignaturePage {
  @ViewChild(SignatureCompnenet)
  sigComp
  dataUrl:string=""
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.dataUrl=this.navParams.get("du")
  }

  accept(){
    this.dataUrl=this.sigComp.dataUrl()
    this.viewCtrl.dismiss(this.dataUrl)
  }
  clear(){
    this.sigComp.clear();
  }
  close(){
    this.viewCtrl.dismiss()
  }
}
