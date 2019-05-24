import { NgModule } from '@angular/core';
import { ItemLabelComponent } from './item-label/item-label.component';
import { SharedModule } from '../shared/shared.module';
import { ItemHintComponent } from './item-hint/item-hint.component';

const exportedComponents = [ItemLabelComponent, ItemHintComponent];

@NgModule({
  imports: [SharedModule],
  exports: exportedComponents,
  declarations: exportedComponents,
})
export class QuestionnaireModule {}
