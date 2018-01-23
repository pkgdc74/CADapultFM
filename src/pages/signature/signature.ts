import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController,ToastController } from 'ionic-angular';
import { SignatureCompnenet } from '../../components/signature/signature.component';


@Component({
  selector: 'signature-page',
  templateUrl: 'signature.html',
})
export class SignaturePage {
  @ViewChild(SignatureCompnenet)
  sigComp
  dataUrl: string = ""
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,private toastCtrl:ToastController) {
    this.dataUrl = this.navParams.get("du")
  }
 
  accept() {
    if(this.sigComp.isValid()){
      let toast = this.toastCtrl.create({
        message: 'Signature required',
        duration: 3000
      });
      toast.present()
      return
    }
    this.dataUrl = this.sigComp.dataUrl()
    this.viewCtrl.dismiss(this.dataUrl)
  }
  clear() {
    this.sigComp.clear();
  }
  close() {
    this.viewCtrl.dismiss()
  }
}
