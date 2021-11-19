import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import * as R from 'ramda';
import {
  modifyFormArrayToMatchCount,
  setDisabledBasedOnIsReadOnly,
} from '../impure-helpers';
import { setAnswers } from '../store/action';
import { Action, FormItem, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-check-box',
  templateUrl: './questionnaire-form-item-check-box.component.html',
  styleUrls: ['./questionnaire-form-item-check-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemCheckBoxComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() dispatch: (action: Action) => void;
  @Input() formParent: FormGroup;
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
    setDisabledBasedOnIsReadOnly(this.formArray, item);
  }
  @Input() allowUserProvidedAnswers: boolean;

  formArray = new FormArray([]);
  item: FormItem;

  ngOnInit() {
    this.formParent.addControl(this.item.linkId, this.formArray);
    this.formArray.setValidators(
      this.item.isRequired
        ? [
            (control: FormArray) =>
              (Array.isArray(control.value) ? control.value : []).some(
                (value) => !!value
              )
                ? null
                : { required: 'This field is required.' },
          ]
        : []
    );
    this.formArray.valueChanges.subscribe((values) => {
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
