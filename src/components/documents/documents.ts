import { Component, Input } from '@angular/core';
import { RMIService } from '../../providers/rmiservice';
import { File } from "@ionic-native/file"
import { Platform, ToastController } from 'ionic-angular';
import { Cordova } from '@ionic-native/core';
import { FileOpener } from '@ionic-native/file-opener';
import { MimeTypes } from '../../providers/MimeTypes';


@Component({
  selector: 'documents',
  templateUrl: 'documents.html'
})
export class DocumentsComponent {
  @Input("readonly")
  readonly:boolean=false

  @Input("dox")
  private documents: any[] = []
  constructor(private rmi: RMIService, private file: File, private platform: Platform, private fo: FileOpener, private mime: MimeTypes, private toastCtrl: ToastController) {
  }
  private log: string[] = []
  download(doc) {
    let root = this.file.externalApplicationStorageDirectory
      || this.file.externalDataDirectory
      || this.file.syncedDataDirectory
      || this.file.dataDirectory
    this.rmi.getProxy().then(proxy => proxy.getDocumentAsync(doc.id))
      .then(file => this.file.writeFile(root, doc.filename, file.buffer, { replace: true }))
      .then(fileEntry => this.fo.open(fileEntry.nativeURL, this.mime.getMimeType(doc.filename)))
      .catch(error => this.log.push(JSON.stringify(error)))
  }
}
