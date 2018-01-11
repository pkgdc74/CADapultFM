import { Component } from '@angular/core';

import { PMListPage } from '../pm/pmlist';
import { SettingsPage } from '../settings/settings';
import { DMListPage } from '../dm/dmlist';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = DMListPage;
  tab2Root = PMListPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
