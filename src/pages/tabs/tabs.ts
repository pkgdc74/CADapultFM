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
  private summary: Observable<any>=Observable.of({dms:0,pms:0});
  subscription: Subscription;
  tab1Root = DMTasksPage;
  tab2Root = PMTasksPage;
  tab3Root = SettingsPage;
  constructor(private store: Store<AppState>) {
    this.summary=this.store.select((state) => {
      //this needs to be fixed when I start working with PMS.
      return  {dms:state.dms.length,pms:0}
    })
  }
  @ViewChild('myTabs') tabRef: Tabs;

}
