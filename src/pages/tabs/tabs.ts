import { Component, ViewChild } from '@angular/core';

import { PMTasksPage } from '../pm/pmtasks';
import { SettingsPage } from '../settings/settings';
import { DMTasksPage } from '../dm/dmtasks';
import { Tabs } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { Subscription } from 'rxjs';
import { AppState } from '../../appstate/app.state';
import { Store } from '@ngrx/store';
import { Observable } from "rxjs/Rx";


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  private summary: Observable<any>
  @ViewChild('myTabs') 
  tabRef: Tabs;
  tab1Root = DMTasksPage;
  tab2Root = PMTasksPage;
  tab3Root = SettingsPage;
  constructor(private store: Store<AppState>, private ds: DataService) {
    this.summary = this.store.select((state) => {
      return { dms: state.dms.length, pms: state.pms.length }
    })
  }

  ionViewDidLoad() {
    this.ds.get("appsettings").then(connection=>{
      if(connection==null ||connection.status==0)
        this.tabRef.select(2)
    })
  }

  ionViewDidEnter() {
    
  }
}
