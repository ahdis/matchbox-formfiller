import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  Action,
  FormItem,
  LinkIdPathSegment,
  QuestionnaireState,
} from '../types';
import { addAnswer, removeAnswer } from '../store/action';
import { Observable } from 'rxjs';
import { isNumber } from '../store/util';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-questionnaire-form-item-group',
  templateUrl: './questionnaire-form-item-group.component.html',
  styleUrls: ['./questionnaire-form-item-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionnaireFormItemGroupComponent {
  @Input() formItem: FormItem;
  @Input() level: number;
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() childrenItemLinkIdPaths: LinkIdPathSegment[][][];
  @Input() store: Observable<QuestionnaireState>;
  @Input() dispatch: (action: Action) => void;
  @Input() formParent: FormGroup;

  formArray: FormArray;

  ngOnInit() {
    let formGroup = new FormGroup({});
    this.formArray = new FormArray([]);
    this.formArray.push(formGroup);
    this.formParent.addControl(this.formItem.linkId, this.formArray);
  }

  addGroup() {
    let formGroup = new FormGroup({});
    this.formArray.push(formGroup);
    this.dispatch(addAnswer(this.linkIdPath, ''));
  }

  removeGroup(index) {
    this.formArray.removeAt(index);
    this.dispatch(removeAnswer(this.linkIdPath, index));
  }

  track(index: number, paths: (LinkIdPathSegment[] | LinkIdPathSegment)[]) {
    return pathsToString(paths);
  }

  getFormGroup(answerIndex) {
    return this.formArray.at(answerIndex);
  }
}

const pathsToString = (paths: (LinkIdPathSegment[] | LinkIdPathSegment)[]) =>
  paths
    .map((path) =>
      Array.isArray(path)
        ? pathsToString(path)
        : isNumber(path.index)
        ? path.linkId + ':' + path.index
        : path.linkId
    )
    .join(':');
