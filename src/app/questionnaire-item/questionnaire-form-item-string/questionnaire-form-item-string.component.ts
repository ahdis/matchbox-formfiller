import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import * as R from 'ramda';
import { filter } from 'rxjs/operators';
import {
  modifyFormArrayToMatchAnswerCount,
  processValuesIfChanged,
} from '../impure-helpers';
import { setAnswers } from '../store/action';
import { isNumber } from '../store/util';
import { Action, FormItem } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-string',
  templateUrl: './questionnaire-form-item-string.component.html',
  styleUrls: ['./questionnaire-form-item-string.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemStringComponent implements OnInit {
  @Input() linkIdPath: string[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchAnswerCount(this.formArray, item, [
      ...(item.isRequired ? [Validators.required] : []),
      ...(isNumber(item.maxLength)
        ? [Validators.maxLength(item.maxLength)]
        : []),
    ]);
    processValuesIfChanged(this.formArray, item, values =>
      this.formArray.patchValue(values, { emitEvent: false })
    );
  }

  formArray = new FormArray([]);
  item: FormItem;

  ngOnInit() {
    this.formArray.valueChanges
      .pipe(filter(R.none(R.isNil)))
      .subscribe(values => {
        this.dispatch(setAnswers(this.linkIdPath, values));
      });
  }
}
