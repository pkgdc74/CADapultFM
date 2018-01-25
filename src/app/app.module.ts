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
import { DataService } from '../providers/data-service/data-service';
import { IonicStorageModule } from '@ionic/storage';


@NgModule({
  declarations: [
    MyApp, PMTasksPage, SettingsPage, DMTasksPage, TabsPage, SignaturePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp), ComponentsModule,
    IonicStorageModule.forRoot(),
    PipesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, PMTasksPage, SettingsPage, DMTasksPage, TabsPage, SignaturePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DataService,
  ]
})
export class AppModule { }
