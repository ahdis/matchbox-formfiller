import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-label',
  templateUrl: './questionnaire-form-item-label.component.html',
  styleUrls: ['./questionnaire-form-item-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemLabelComponent {
  @Input() item: FormItem;
}
