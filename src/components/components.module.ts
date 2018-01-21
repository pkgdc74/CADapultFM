import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common"
import { WipComponent } from './wip/wip';
import { PipesModule } from '../pipes/pipes.module';
import { SignatureCompnenet } from './signature/signature.component';
@NgModule({
	declarations: [WipComponent,SignatureCompnenet],
	imports: [CommonModule,
		PipesModule
	],
	exports: [WipComponent,SignatureCompnenet]
})
export class ComponentsModule {}
