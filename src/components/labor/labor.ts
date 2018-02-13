import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';

export interface Labor{
  description:string;
  hours:number;
  rate:number
}

@Component({
  selector: 'labor',
  templateUrl: 'labor.html'
})
export class LaborComponent {
  @Input("data")
  laborarr:Labor[]=[]
  @Output("data")
  laborarrChange=new EventEmitter<Labor[]>()

  private laborForm:FormGroup
  constructor(private fb:FormBuilder) {
    this.laborForm=this.fb.group({
      description:['',Validators.required],
      hours:['',Validators.compose([Validators.required,Validators.min(0)])],
      rate:['',Validators.compose([Validators.required,Validators.min(1)])]
    })
    
  }
  add(labor){
    this.laborarr.push(labor)
    this.laborForm.setValue({hours:"",rate:"",description:""})
  }
  delete(idx){
    this.laborarr.splice(idx,1)
  }
  cost(){
    return this.laborarr.reduce((s,itm)=>{s+=itm.rate*itm.hours;return s},0)
  }
}