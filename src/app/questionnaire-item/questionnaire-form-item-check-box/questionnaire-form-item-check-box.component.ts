import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import * as R from 'ramda';
import { modifyFormArrayToMatchCount } from '../impure-helpers';
import { setAnswers } from '../store/action';
import { Action, FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-check-box',
  templateUrl: './questionnaire-form-item-check-box.component.html',
  styleUrls: ['./questionnaire-form-item-check-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemCheckBoxComponent implements OnInit {
  @Input() linkIdPath: string[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchCount(this.formArray, item.answerOptions.length);

    const values = R.map(
      ({ key }) => R.includes(key, item.answers),
      item.answerOptions
    );
    if (!R.equals(this.formArray.value, values)) {
      this.formArray.patchValue(values, { emitEvent: false });
    }
  }
  @Input() allowUserProvidedAnswers: boolean;

  formArray = new FormArray([]);
  item: FormItem;

  ngOnInit() {
    this.formArray.setValidators(
      this.item.isRequired
        ? [
            (control: FormArray) =>
              (Array.isArray(control.value) ? control.value : []).some(
                value => !!value
              )
                ? null
                : { required: 'This field is required.' },
          ]
        : []
    );
    this.formArray.valueChanges.subscribe(values => {
      this.dispatch(
        setAnswers(
          this.linkIdPath,
          R.pipe(
            R.addIndex(R.filter)((_, index) => values[index]),
            R.map(({ key }) => key)
          )(this.item.answerOptions)
        )
      );
    });
  }
}
