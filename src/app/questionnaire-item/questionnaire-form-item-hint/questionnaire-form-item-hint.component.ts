import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-hint',
  templateUrl: './questionnaire-form-item-hint.component.html',
  styleUrls: ['./questionnaire-form-item-hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemHintComponent {
  @Input() item: FormItem;
}
