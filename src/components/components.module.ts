import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common"
import { WipComponent } from './wip/wip';
import { PipesModule } from '../pipes/pipes.module';
import { SignatureCompnenet } from './signature/signature.component';
import { LaborComponent } from './labor/labor';
import { IonicModule } from 'ionic-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentsComponent } from './documents/documents';

@NgModule({
	declarations: [WipComponent, SignatureCompnenet, LaborComponent, DocumentsComponent],
	imports: [
		CommonModule,
		PipesModule,
		ReactiveFormsModule,
		IonicModule.forRoot(DocumentsComponent),
		IonicModule.forRoot(LaborComponent)
	],
	exports: [WipComponent, SignatureCompnenet, LaborComponent, DocumentsComponent]
})
export class ComponentsModule { }
