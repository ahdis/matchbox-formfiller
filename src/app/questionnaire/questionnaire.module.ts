import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemLabelComponent } from './item-label/item-label.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ItemLabelComponent
  ],
  declarations: [ItemLabelComponent]
})
export class QuestionnaireModule { }
