import { Component } from '@angular/core';

import { PMTasksPage } from '../pm/pmtasks';
import { SettingsPage } from '../settings/settings';
import { DMTasksPage } from '../dm/dmtasks';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = DMTasksPage;
  tab2Root = PMTasksPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
