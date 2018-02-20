import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export interface Part{
  description:string;
  cost:number;
  quantity:number;
}

@Component({
  selector: 'parts',
  templateUrl: 'parts.html'
})
export class PartsComponent {
  private partForm:any;
  private parts:Part[]=[]
  constructor(private fb:FormBuilder) {
    this.partForm=fb.group({
      description:['',Validators.required],
      cost:['',Validators.compose([Validators.required,Validators.min(0)])],
      quantity:['',Validators.compose([Validators.required,Validators.min(1)])]
    })
  }
  add(value){
    this.parts.push(value)
  }
}
