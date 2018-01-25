import { Component, ViewChild } from '@angular/core';

import { PMTasksPage } from '../pm/pmtasks';
import { SettingsPage } from '../settings/settings';
import { DMTasksPage } from '../dm/dmtasks';
import { Tabs } from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = DMTasksPage;
  tab2Root = PMTasksPage;
  tab3Root = SettingsPage;
  constructor() {
    
  }

  @ViewChild('myTabs') tabRef: Tabs;

  ionViewDidEnter() {
  this.tabRef.select(2)
  }
}
