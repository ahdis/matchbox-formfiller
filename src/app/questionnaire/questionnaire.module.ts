import { NgModule } from '@angular/core';
import { ItemLabelComponent } from './item-label/item-label.component';
import { SharedModule } from '../shared/shared.module';

const exportedComponents = [ItemLabelComponent];

@NgModule({
  imports: [SharedModule],
  exports: exportedComponents,
  declarations: exportedComponents,
})
export class QuestionnaireModule {}
