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
import { RmiService } from '../providers/rmi-service/rmi-service';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';
import { SignaturePage } from '../pages/signature/signature';


@NgModule({
  declarations: [
    MyApp, PMTasksPage, SettingsPage, DMTasksPage, TabsPage, SignaturePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp), ComponentsModule,
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
    RmiService
  ]
})
export class AppModule { }
