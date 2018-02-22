import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

export interface Labor{
  id:number;
  woid:number;
  description:string;
  hours:number;
  rate:number;
  date:Date;
}

@Component({
  selector: 'labor',
  templateUrl: 'labor.html'
})
export class LaborComponent {
  @Input("readonly")
  readonly:boolean=false
  @Input("data")
  laborarr:Labor[]=[]
  @Output("data")
  laborarrChange=new EventEmitter<Labor[]>()
  private laborForm:FormGroup;
  private maxDate:string=""+(new Date().getFullYear()+10)
  private minDate:string=""+(new Date().getFullYear()-10)
  constructor(private fb:FormBuilder,private eref:ElementRef) {
    this.laborForm=this.fb.group({
      description:['',Validators.required],
      hours:['',Validators.compose([Validators.required,Validators.min(0)])],
      rate:['',Validators.compose([Validators.required,Validators.min(1)])],
      date:[new Date().toISOString(),Validators.compose([Validators.required])],
    })
  }
  private setFocus(){
    let element = this.eref.nativeElement.querySelector('textarea');
    element.focus()
  }
  ngAfterViewInit(){ 
    //this.setFocus()
  }
  add(labor){
    this.laborarr.push(labor)
    this.laborForm.reset();
    this.setFocus() 
    this.laborForm.controls["date"].setValue(new Date().toISOString())
  }
  delete(idx){
    this.laborarr.splice(idx,1)
    this.setFocus()
  }
  cost(){
    return this.laborarr.reduce((s,itm)=>{s+=itm.rate*itm.hours;return s},0)
  }
}