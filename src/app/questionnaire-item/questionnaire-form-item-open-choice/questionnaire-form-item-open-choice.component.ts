import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import {
  modifyFormArrayToMatchAnswerCount,
  processValuesIfChanged,
} from '../impure-helpers';
import { addAnswerOption, setAnswers } from '../store/action';
import { filterNotNil, isString } from '../store/util';
import { Action, FormItem, FormItemAnswerOption } from '../types';

@Component({
  selector: 'app-questionnaire-form-item-open-choice',
  templateUrl: './questionnaire-form-item-open-choice.component.html',
  styleUrls: ['./questionnaire-form-item-open-choice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemOpenChoiceComponent implements OnInit {
  @Input() linkIdPath: string[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchAnswerCount(
      this.formArray,
      item,
      item.isRequired ? [Validators.required] : []
    );
    processValuesIfChanged(this.formArray, item, values =>
      this.formArray.patchValue(
        R.map(
          value => R.find(({ key }) => key === value, item.answerOptions),
          values
        ),
        { emitEvent: false }
      )
    );
  }

  formArray = new FormArray([]);
  item: FormItem;

  answerOptions$: Observable<FormItemAnswerOption[][]>;

  ngOnInit() {
    this.formArray.valueChanges
      .pipe(filter(R.none(R.isNil)))
      .subscribe(values => {
        (R.pipe(
          R.addIndex(R.map)((value: any, index) =>
            isString(value)
              ? addAnswerOption(this.linkIdPath, `user-option-${index}`, value)
              : undefined
          ),
          filterNotNil,
          R.forEach(this.dispatch)
        ) as any)(values);
        const answers = R.addIndex(R.map)(
          (value: any, index) =>
            isString(value) ? `user-option-${index}` : value.key,
          values
        );
        this.dispatch(setAnswers(this.linkIdPath, answers));
      });

    this.answerOptions$ = this.formArray.valueChanges.pipe(
      startWith(R.map(() => '', R.range(0, this.formArray.length))),
      map(R.map((value: any) => (isString(value) ? value : value.display))),
      map(
        R.map(value =>
          R.filter(
            ({ display }) => R.includes(R.toLower(value), R.toLower(display)),
            this.item.answerOptions
          )
        )
      )
    );
  }

  displayOption(answerOption?: FormItemAnswerOption) {
    return answerOption ? answerOption.display : undefined;
  }
}
