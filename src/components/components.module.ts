import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common"
import { WipComponent } from './wip/wip';
@NgModule({
	declarations: [WipComponent],
	imports: [CommonModule],
	exports: [WipComponent]
})
export class ComponentsModule {}
