import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { setAnswers } from '../store/action';
import { Action, FormItem, LinkIdPathSegment } from '../types';
import { setDisabledBasedOnIsReadOnly } from '../impure-helpers';

@Component({
  selector: 'app-questionnaire-form-item-radio-button',
  templateUrl: './questionnaire-form-item-radio-button.component.html',
  styleUrls: ['./questionnaire-form-item-radio-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemRadioButtonComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    this.formControl.patchValue(item.answers[0], { emitEvent: false });
    setDisabledBasedOnIsReadOnly(this.formControl, item);
  }
  @Input() allowUserProvidedAnswers: boolean;

  formControl = new FormControl();
  item: FormItem;

  ngOnInit() {
    this.formControl.setValidators(
      this.item.isRequired ? [Validators.required] : []
    );
    this.formControl.valueChanges.subscribe((value) => {
      this.dispatch(setAnswers(this.linkIdPath, [value]));
    });
  }
}
