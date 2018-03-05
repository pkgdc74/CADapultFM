import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PMPartslabor } from '../../appstate/app.state';


@Component({
  selector: 'labor',
  templateUrl: 'labor.html'
})
export class LaborComponent {
  @Input("readonly")
  readonly:boolean=false
  @Input("data")
  laborarr:PMPartslabor[]=[]
  @Output()
  private addlabor=new EventEmitter<PMPartslabor>()
  @Output()
  private deletelabor=new EventEmitter<PMPartslabor>()

  private laborForm:FormGroup;
  private maxDate:string=""+(new Date().getFullYear()+10)
  private minDate:string=""+(new Date().getFullYear()-10)
  constructor(private fb:FormBuilder,private eref:ElementRef) {
    this.laborForm=this.fb.group({
      description:['',Validators.required],
      hours:['',Validators.compose([Validators.required,Validators.min(0)])],
      rate:['',Validators.compose([Validators.required,Validators.min(1)])],
      workingdate:[new Date().toISOString(),Validators.compose([Validators.required])],
    })
  }
  private setFocus(){
    let element = this.eref.nativeElement.querySelector('textarea');
    element.focus()
  }
  ngAfterViewInit(){ 
    
  }
  add(labor){
    this.addlabor.emit(labor)
    this.laborForm.reset();
    this.setFocus() 
    this.laborForm.controls["workingdate"].setValue(new Date().toISOString())
  }
  delete(idx){
    this.deletelabor.emit(this.laborarr[idx])
  }
  cost(){
    return this.laborarr.reduce((s,itm)=>{s+=itm.rate*itm.hours;return s},0)
  }
}