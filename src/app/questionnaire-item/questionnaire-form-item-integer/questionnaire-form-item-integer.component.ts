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
import { Action, FormItem, ItemControl, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-integer',
  templateUrl: './questionnaire-form-item-integer.component.html',
  styleUrls: ['./questionnaire-form-item-integer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemIntegerComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchAnswerCount(
      this.formArray,
      item,
      item.isRequired ? [Validators.required] : []
    );
    processValuesIfChanged(this.formArray, item);
    setDisabledBasedOnIsReadOnly(this.formArray, item);
  }

  ItemControl = ItemControl;

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
