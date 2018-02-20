import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common"
import { WipComponent } from './wip/wip';
import { PipesModule } from '../pipes/pipes.module';
import { SignatureCompnenet } from './signature/signature.component';
import { LaborComponent } from './labor/labor';
import { IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentsComponent } from './documents/documents';
import { PartsComponent } from './parts/parts';

@NgModule({
	declarations: [WipComponent, SignatureCompnenet, LaborComponent, DocumentsComponent,
    PartsComponent],
	imports: [
		CommonModule,
		PipesModule,
		ReactiveFormsModule,
		IonicModule.forRoot(DocumentsComponent),
		IonicModule.forRoot(LaborComponent),
		IonicModule.forRoot(PartsComponent)
	],
	exports: [WipComponent, SignatureCompnenet, LaborComponent, DocumentsComponent,
    PartsComponent]
})
export class ComponentsModule { }
