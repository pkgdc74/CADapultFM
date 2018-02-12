import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common"
import { WipComponent } from './wip/wip';
import { PipesModule } from '../pipes/pipes.module';
import { SignatureCompnenet } from './signature/signature.component';
import { LaborComponent } from './labor/labor';
import { IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [WipComponent, SignatureCompnenet, LaborComponent],
	imports: [CommonModule, PipesModule,IonicModule.forRoot(LaborComponent),ReactiveFormsModule],
	exports: [WipComponent, SignatureCompnenet, LaborComponent]
})
export class ComponentsModule { }
