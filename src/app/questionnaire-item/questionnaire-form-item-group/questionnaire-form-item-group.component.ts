import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-group',
  templateUrl: './questionnaire-form-item-group.component.html',
  styleUrls: ['./questionnaire-form-item-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemGroupComponent {
  @Input() formItem: FormItem;
  @Input() level: number;
}
