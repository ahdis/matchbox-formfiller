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
import { Action, FormItem, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-boolean',
  templateUrl: './questionnaire-form-item-boolean.component.html',
  styleUrls: ['./questionnaire-form-item-boolean.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemBooleanComponent implements OnInit {
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
}
