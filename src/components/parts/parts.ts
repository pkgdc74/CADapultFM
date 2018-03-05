import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState, PMPartslabor } from '../../appstate/app.state';
import { SyncQueueAdd } from '../../reducers/syncqueue';

@Component({
  selector: 'parts',
  templateUrl: 'parts.html'
})
export class PartsComponent {
  @Input("readonly")
  readonly:boolean=false
  @Input("data")
  private parts:PMPartslabor[]=[]
  @Output()
  private addpart=new EventEmitter<PMPartslabor>()
  @Output()
  private deletepart=new EventEmitter<PMPartslabor>()

  private partForm:FormGroup;
  constructor(private fb:FormBuilder,private eref:ElementRef,private store:Store<AppState>) {
    this.partForm=fb.group({
      description:['',Validators.required],
      partcost:['',Validators.compose([Validators.required,Validators.min(0)])],
      partqty:['',Validators.compose([Validators.required,Validators.min(1)])]
    })
  }
  add(value){
    this.addpart.emit(value)
    this.partForm.reset()
    let element = this.eref.nativeElement.querySelector('textarea');
    element.focus()
  }
  cost(){
    return this.parts.reduce((s,itm)=>{s+=itm.partcost*itm.partqty;return s},0)
  }
  delete(idx){
    this.deletepart.emit(this.parts[idx])
  }
}
