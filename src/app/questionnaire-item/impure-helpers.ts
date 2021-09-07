import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidatorFn,
} from '@angular/forms';
import * as R from 'ramda';
import { FormItem } from './types';

export const modifyFormArrayToMatchAnswerCount = (
  formArray: FormArray,
  item: FormItem,
  validators?: ValidatorFn | ValidatorFn[]
): void =>
  modifyFormArrayToMatchCount(formArray, item.answers.length, validators);

export const modifyFormArrayToMatchCount = (
  formArray: FormArray,
  count: number,
  validators?: ValidatorFn | ValidatorFn[]
): void => {
  if (count > formArray.length) {
    R.forEach(
      () => formArray.push(new FormControl(undefined, validators)),
      R.range(formArray.length, count)
    );
  } else if (count < formArray.length) {
    R.forEach(
      (index) => formArray.removeAt(index),
      R.range(count, formArray.length)
    );
  }
};

export const processValuesIfChanged = (
  formArray: FormArray,
  item: FormItem,
  callback: (values: string[]) => void
): void => {
  if (!R.equals(formArray.value, item.answers)) {
    callback(item.answers as string[]);
  }
};

export const setDisabledBasedOnIsReadOnly = (
  control: AbstractControl,
  item: FormItem
): void => {
  if (item.isReadonly) {
    control.disable({ onlySelf: true, emitEvent: false });
  } else {
    control.enable({ onlySelf: true, emitEvent: false });
  }
};
