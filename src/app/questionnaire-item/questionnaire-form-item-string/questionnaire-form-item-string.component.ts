import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import * as R from 'ramda';
import { filter } from 'rxjs/operators';
import {
  modifyFormArrayToMatchAnswerCount,
  processValuesIfChanged,
  setDisabledBasedOnIsReadOnly,
} from '../impure-helpers';
import { addAnswer, removeAnswer, setAnswers } from '../store/action';
import { isNumber } from '../store/util';
import { Action, FormItem, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-string',
  templateUrl: './questionnaire-form-item-string.component.html',
  styleUrls: ['./questionnaire-form-item-string.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemStringComponent implements OnInit {
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
        this.dispatch(
          setAnswers(this.linkIdPath, values, this.formArray.valid)
        );
      });
  }

  addAnswer() {
    this.dispatch(addAnswer(this.linkIdPath, ''));
  }

  removeAnswer(index) {
    this.dispatch(removeAnswer(this.linkIdPath, index));
  }
}
