import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common"
import { WipComponent } from './wip/wip';
import { PipesModule } from '../pipes/pipes.module';
@NgModule({
	declarations: [WipComponent],
	imports: [CommonModule,
		PipesModule
	],
	exports: [WipComponent]
})
export class ComponentsModule {}
