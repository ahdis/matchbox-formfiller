import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { QuestionnaireFormItemAttachmentComponent } from './questionnaire-form-item-attachment/questionnaire-form-item-attachment.component';
import { QuestionnaireFormItemBooleanComponent } from './questionnaire-form-item-boolean/questionnaire-form-item-boolean.component';
import { QuestionnaireFormItemCheckBoxComponent } from './questionnaire-form-item-check-box/questionnaire-form-item-check-box.component';
import { QuestionnaireFormItemChoiceComponent } from './questionnaire-form-item-choice/questionnaire-form-item-choice.component';
import { QuestionnaireFormItemDateComponent } from './questionnaire-form-item-date/questionnaire-form-item-date.component';
import { QuestionnaireFormItemDateTimeComponent } from './questionnaire-form-item-date-time/questionnaire-form-item-date-time.component';
import { QuestionnaireFormItemDecimalComponent } from './questionnaire-form-item-decimal/questionnaire-form-item-decimal.component';
import { QuestionnaireFormItemGroupComponent } from './questionnaire-form-item-group/questionnaire-form-item-group.component';
import { QuestionnaireFormItemHintComponent } from './questionnaire-form-item-hint/questionnaire-form-item-hint.component';
import { QuestionnaireFormItemIntegerComponent } from './questionnaire-form-item-integer/questionnaire-form-item-integer.component';
import { QuestionnaireFormItemLabelComponent } from './questionnaire-form-item-label/questionnaire-form-item-label.component';
import { QuestionnaireFormItemOpenChoiceComponent } from './questionnaire-form-item-open-choice/questionnaire-form-item-open-choice.component';
import { QuestionnaireFormItemRadioButtonComponent } from './questionnaire-form-item-radio-button/questionnaire-form-item-radio-button.component';
import { QuestionnaireFormItemStringComponent } from './questionnaire-form-item-string/questionnaire-form-item-string.component';
import { QuestionnaireFormItemTextComponent } from './questionnaire-form-item-text/questionnaire-form-item-text.component';
import { QuestionnaireFormItemComponent } from './questionnaire-form-item/questionnaire-form-item.component';
import { QuestionnaireFormComponent } from './questionnaire-form/questionnaire-form.component';
import { QuestionnaireFormItemQuantityComponent } from './questionnaire-form-item-quantity/questionnaire-form-item-quantity.component';

const exportedComponents = [
  QuestionnaireFormComponent,
  QuestionnaireFormItemComponent,
  QuestionnaireFormItemLabelComponent,
  QuestionnaireFormItemHintComponent,
  QuestionnaireFormItemGroupComponent,
  QuestionnaireFormItemBooleanComponent,
  QuestionnaireFormItemStringComponent,
  QuestionnaireFormItemDateComponent,
  QuestionnaireFormItemDateTimeComponent,
  QuestionnaireFormItemTextComponent,
  QuestionnaireFormItemDecimalComponent,
  QuestionnaireFormItemIntegerComponent,
  QuestionnaireFormItemChoiceComponent,
  QuestionnaireFormItemOpenChoiceComponent,
  QuestionnaireFormItemQuantityComponent,
  QuestionnaireFormItemCheckBoxComponent,
  QuestionnaireFormItemRadioButtonComponent,
  QuestionnaireFormItemAttachmentComponent,
];

@NgModule({
  declarations: exportedComponents,
  imports: [SharedModule],
  exports: exportedComponents,
})
export class QuestionnaireItemModule {}
