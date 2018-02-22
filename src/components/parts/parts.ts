import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export interface Part{
  id:number;
  woid:number;
  description:string;
  cost:number;
  quantity:number;
}

@Component({
  selector: 'parts',
  templateUrl: 'parts.html'
})
export class PartsComponent {
  @Input("readonly")
  readonly:boolean=false
  @Input("data")
  private parts:Part[]=[]
  @Output("data")
  private partsChange=new EventEmitter<Part[]>()

  private partForm:FormGroup;
  constructor(private fb:FormBuilder,private eref:ElementRef) {
    this.partForm=fb.group({
      description:['',Validators.required],
      cost:['',Validators.compose([Validators.required,Validators.min(0)])],
      quantity:['',Validators.compose([Validators.required,Validators.min(1)])]
    })
  }
  add(value){
    this.parts.push(value)
    this.partForm.reset()
    let element = this.eref.nativeElement.querySelector('textarea');
    element.focus()
  }
  cost(){
    return this.parts.reduce((s,itm)=>{s+=itm.cost*itm.quantity;return s},0)
  }
}
