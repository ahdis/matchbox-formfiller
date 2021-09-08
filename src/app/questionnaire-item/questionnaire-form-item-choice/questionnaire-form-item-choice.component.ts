import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import * as R from 'ramda';
import { filter, map } from 'rxjs/operators';
import {
  processValuesIfChanged,
  setDisabledBasedOnIsReadOnly,
} from '../impure-helpers';
import { setAnswers } from '../store/action';
import { Action, FormItem, LinkIdPathSegment } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-choice',
  templateUrl: './questionnaire-form-item-choice.component.html',
  styleUrls: ['./questionnaire-form-item-choice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemChoiceComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    this.formControl.setValidators(
      item.isRequired ? [Validators.required] : []
    );
    processValuesIfChanged(
      this.formControl,
      item.repeats ? item : item.answers[0]
    );
    setDisabledBasedOnIsReadOnly(this.formControl, item);
  }

  formControl = new FormControl();
  item: FormItem;

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(
        map((values) => (Array.isArray(values) ? values : [values])),
        filter(R.none(R.isNil))
      )
      .subscribe((values) => {
        this.dispatch(setAnswers(this.linkIdPath, values));
      });
  }
}
