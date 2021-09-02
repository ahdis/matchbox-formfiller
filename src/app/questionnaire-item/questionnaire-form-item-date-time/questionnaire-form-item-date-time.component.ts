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
import { Action, FormItem } from '../types';
import { toLocaleHHMM } from '../store/util';

@Component({
  selector: 'app-questionnaire-form-item-date-time',
  templateUrl: './questionnaire-form-item-date-time.component.html',
  styleUrls: ['./questionnaire-form-item-date-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemDateTimeComponent implements OnInit {
  @Input() linkIdPath: string[];
  @Input() dispatch: (action: Action) => void;
  @Input() set formItem(item: FormItem) {
    this.item = item;
    modifyFormArrayToMatchAnswerCount(
      this.formArray,
      item,
      item.isRequired ? [Validators.required] : []
    );
    processValuesIfChanged(this.formArray, item, (values) =>
      this.formArray.patchValue(values, { emitEvent: false })
    );
    modifyFormArrayToMatchAnswerCount(
      this.formTimeArray,
      item,
      item.isRequired ? [Validators.required] : []
    );
    const dateToTime = (date?: Date) => date && toLocaleHHMM(date);
    processValuesIfChanged(
      this.formTimeArray,
      { ...item, answers: item.answers.map(dateToTime) },
      (values) => this.formTimeArray.patchValue(values, { emitEvent: false })
    );
    this.updateControls();
  }

  formArray = new FormArray([]);
  formTimeArray = new FormArray([]);
  controls = this.getControls();
  item: FormItem;

  ngOnInit() {
    this.formArray.valueChanges
      .pipe(filter(R.none(R.isNil)))
      .subscribe((values) => {
        this.dispatch(
          setAnswers(
            this.linkIdPath,
            this.getValues(values, this.formTimeArray.getRawValue())
          )
        );
      });
    this.formTimeArray.valueChanges
      .pipe(filter(R.none(R.isNil)))
      .subscribe((values) => {
        this.dispatch(
          setAnswers(
            this.linkIdPath,
            this.getValues(this.formArray.getRawValue(), values)
          )
        );
      });
  }

  getValues(
    dates: ReadonlyArray<Date | undefined>,
    times: ReadonlyArray<string | undefined>
  ) {
    return R.zip(dates, times).map(([date, time]) => {
      if (date) {
        if (time) {
          const [hours, minutes] = time
            .split(':')
            .map((number) => parseInt(number, 10));
          date.setHours(hours);
          date.setMinutes(minutes);
        }
        return date;
      }
    });
  }

  // update controls without changing reference
  updateControls() {
    const newControls = this.getControls();
    if (this.controls.length > newControls.length) {
      this.controls.splice(newControls.length);
    }
    newControls.forEach((control, index) => {
      if (this.controls[index]) {
        const { date, time } = control;
        this.controls[index].date = date;
        this.controls[index].time = time;
      } else {
        this.controls.push(control);
      }
    });
  }

  getControls() {
    return R.zip(
      this.formArray.controls,
      this.formTimeArray.controls
    ).map(([date, time]) => ({ date, time }));
  }
}