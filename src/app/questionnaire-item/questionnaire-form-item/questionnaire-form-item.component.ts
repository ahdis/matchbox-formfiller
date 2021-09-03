import { Component, Input, OnInit } from '@angular/core';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { getFormItemByLinkIdPath } from '../store/selector';
import {
  Action,
  FormItem,
  ItemControl,
  LinkIdPathSegment,
  QuestionnaireState,
} from '../types';

@Component({
  selector: 'app-questionnaire-form-item',
  templateUrl: './questionnaire-form-item.component.html',
  styleUrls: ['./questionnaire-form-item.component.scss'],
})
export class QuestionnaireFormItemComponent implements OnInit {
  @Input() linkIdPath: LinkIdPathSegment[];
  @Input() store: Observable<QuestionnaireState>;
  @Input() dispatch: (action: Action) => void;

  item$: Observable<FormItem | undefined>;
  childrenItemLinkIdPaths$: Observable<LinkIdPathSegment[][][]>;
  hasNoCustomChildrenRenderer$: Observable<boolean>;

  ItemControl = ItemControl;

  constructor() {}

  ngOnInit() {
    this.item$ = this.store.pipe(
      map(getFormItemByLinkIdPath(this.linkIdPath)),
      distinctUntilChanged<FormItem | undefined>(R.equals)
    );
    this.childrenItemLinkIdPaths$ = this.item$.pipe(
      map((item) =>
        R.isNil(item)
          ? []
          : R.map(
              (answerIndex) => ({ itemLinkIds: item.itemLinkIds, answerIndex }),
              R.range(0, item.answers.length)
            )
      ),
      distinctUntilChanged(R.equals),
      map<
        { itemLinkIds: string[]; answerIndex: number }[],
        LinkIdPathSegment[][][]
      >(
        R.map(({ itemLinkIds, answerIndex }) =>
          R.map(
            (linkId) => [...this.linkIdPath, { linkId, index: answerIndex }],
            itemLinkIds
          )
        )
      )
    );
    this.hasNoCustomChildrenRenderer$ = this.item$.pipe(
      map((item) => !R.isNil(item) && !R.includes(item.type, ['group']))
    );
  }
}
