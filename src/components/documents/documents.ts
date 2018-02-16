import { Component, Input } from '@angular/core';
import { RMIService } from '../../providers/rmiservice';
import { File } from "@ionic-native/file"
import { Platform } from 'ionic-angular';
import { Cordova } from '@ionic-native/core';
import { FileOpener } from '@ionic-native/file-opener';


@Component({
  selector: 'documents',
  templateUrl: 'documents.html'
})
export class DocumentsComponent {
  @Input("dox")
  private documents: any[] = []
  constructor(private rmi: RMIService, private file: File, private platform: Platform,private fo:FileOpener) {
  }
  private log:string[]=[]
  download(doc) {
    let root: string = this.file.externalApplicationStorageDirectory
      || this.file.dataDirectory
      || this.file.syncedDataDirectory
      || this.file.documentsDirectory
      this.log.push(root)
    this.platform.ready().then(x => {
      this.log.push("insideready")
      this.rmi.getProxy().then(proxy => proxy.getDocumentAsync(doc.id))
        .then(file => {
          this.log.push("file downloaded")
          return this.file.writeFile(root, doc.filename, file.buffer,{replace:true})
        }).then(x => {
          this.log.push(`file ${JSON.stringify(x)} saved`)
          this.log.push(`opening file ${x}`)
          return this.fo.open(x,"")
          .then(x=>this.log.push("file opened"))
          .catch(x=>this.log.push("error opening file. "+x))
        }).catch(x => this.log.push(`error ${x}`))
    }).catch(x => this.log.push(`error ${root}`))
  }
}
