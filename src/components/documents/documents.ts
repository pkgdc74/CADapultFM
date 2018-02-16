import { Component, Input } from '@angular/core';
import { RMIService } from '../../providers/rmiservice';
import { File } from "@ionic-native/file"


@Component({
  selector: 'documents',
  templateUrl: 'documents.html'
})
export class DocumentsComponent {
  @Input("dox")
  private documents: any[] = []
  private storagePath:string;
  constructor(private rmi: RMIService, private file: File) {

  }

  download(doc) {
    this.storagePath=this.file.dataDirectory||this.file.externalDataDirectory||this.file.syncedDataDirectory
    this.rmi.getProxy()
      .then(proxy => proxy.getDocumentAsync(doc.id))
      .then(file => this.file.writeFile(this.storagePath, doc.filename, file._buffer))
  }

}
