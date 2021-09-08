import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidatorFn,
} from '@angular/forms';
import * as R from 'ramda';
import { FormItem } from './types';
import { isObject } from './store/util';

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
  control: AbstractControl,
  item: FormItem | any,
  callback: (values: string[]) => void = (values) =>
    control.patchValue(values, { emitEvent: false })
): void => {
  const answers = isObject(item) && 'answers' in item ? item.answers : item;
  if (!R.equals(control.value, answers)) {
    callback(answers as string[]);
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
