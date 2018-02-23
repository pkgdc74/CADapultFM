import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { PMTasksPage } from '../pages/pm/pmtasks';
import { SettingsPage } from '../pages/settings/settings';
import { DMTasksPage } from '../pages/dm/dmtasks';
import { TabsPage } from '../pages/tabs/tabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';
import { SignaturePage } from '../pages/signature/signature';
import { IonicStorageModule } from '@ionic/storage';
import { Security } from '../providers/security';
import { StoreModule } from '@ngrx/store';
import { dmreducer } from '../pages/dm/dmredux';
import { pmreducer } from '../pages/pm/pmredux';
import { EffectsModule } from '@ngrx/effects';
import { DataService } from '../providers/data-service';
import { DMEffects } from '../pages/dm/dmeffects';
import { appsettingsreducer } from '../pages/settings/appsettingsstate';
import { AppEffects } from '../pages/settings/appeffects';
import { RMIService } from '../providers/rmiservice';
import { fmtablesreducer } from './fmcommon';
import { DmdetailPage } from '../pages/dmdetail/dmdetail';
import { File } from "@ionic-native/file";
import { FileOpener } from "@ionic-native/file-opener";
import { MimeTypes } from '../providers/MimeTypes';
import { syncQueueReducer, SyncQueueEffects } from '../reducers/syncqueue';


@NgModule({
  declarations: [
    MyApp, PMTasksPage, SettingsPage, DMTasksPage, TabsPage, SignaturePage,DmdetailPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp), ComponentsModule,
    IonicStorageModule.forRoot(),
    StoreModule.forRoot({dms:dmreducer,pms:pmreducer,appsettings:appsettingsreducer,fmtables:fmtablesreducer,syncqueue:syncQueueReducer}),
    EffectsModule.forRoot([DMEffects,AppEffects,SyncQueueEffects]),
    PipesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, PMTasksPage, SettingsPage, DMTasksPage, TabsPage, SignaturePage,DmdetailPage
  ],
  providers: [
    StatusBar,RMIService,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DataService,Security,File,FileOpener,MimeTypes
  ]
})
export class AppModule { }
