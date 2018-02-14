import { Component, Input } from '@angular/core';


@Component({
  selector: 'documents',
  templateUrl: 'documents.html'
})
export class DocumentsComponent {
  @Input("dox")
  private documents:any[]=[]
  constructor() {
    
  }

}
