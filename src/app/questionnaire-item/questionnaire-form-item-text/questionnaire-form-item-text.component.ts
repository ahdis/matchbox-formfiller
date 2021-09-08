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
  setDisabledBasedOnIsReadOnly,
} from '../impure-helpers';
import { setAnswers } from '../store/action';
import { isNumber } from '../store/util';
import { Action, FormItem, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-text',
  templateUrl: './questionnaire-form-item-text.component.html',
  styleUrls: ['./questionnaire-form-item-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemTextComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchAnswerCount(this.formArray, item, [
      ...(item.isRequired ? [Validators.required] : []),
      ...(isNumber(item.maxLength)
        ? [Validators.maxLength(item.maxLength)]
        : []),
    ]);
    processValuesIfChanged(this.formArray, item);
    setDisabledBasedOnIsReadOnly(this.formArray, item);
  }

  formArray = new FormArray([]);
  item: FormItem;

  ngOnInit() {
    this.formArray.valueChanges
      .pipe(filter(R.none(R.isNil)))
      .subscribe((values) => {
        this.dispatch(setAnswers(this.linkIdPath, values));
      });
  }
}
