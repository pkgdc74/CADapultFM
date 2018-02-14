import { Component, Input } from '@angular/core';


@Component({
  selector: 'documents',
  templateUrl: 'documents.html'
})
export class DocumentsComponent {
  @Input("docs")
  documents:any[]=[]
  constructor() {
    
  }

}
