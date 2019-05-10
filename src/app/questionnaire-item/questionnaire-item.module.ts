import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { QuestionnaireItemGenericComponent } from './questionnaire-item-generic/questionnaire-item-generic.component';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

const exportedComponents = [QuestionnaireItemGenericComponent];

@NgModule({
  declarations: exportedComponents,
  imports: [SharedModule, QuestionnaireModule],
  exports: exportedComponents,
})
export class QuestionnaireItemModule {}
