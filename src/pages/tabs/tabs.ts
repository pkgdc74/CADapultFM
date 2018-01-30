import { Component, ViewChild } from '@angular/core';

import { PMTasksPage } from '../pm/pmtasks';
import { SettingsPage } from '../settings/settings';
import { DMTasksPage } from '../dm/dmtasks';
import { Tabs } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { Subscription } from 'rxjs';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  private summary:any={dm:0,pm:0,assets:0};
  subscription: Subscription;
  tab1Root = DMTasksPage;
  tab2Root = PMTasksPage;
  tab3Root = SettingsPage;
  constructor(private ds:DataService) {
    
  }

  @ViewChild('myTabs') tabRef: Tabs;

  ionViewDidEnter() {
    this.subscription=this.ds.woSummary((d) => { this.summary = d;})
  }
  ionViewDidLeave() {
    this.subscription.unsubscribe();
  }
}
