import { Component, Input, OnInit } from '@angular/core';
import * as R from 'ramda';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { getFormItemByLinkIdPath } from '../store/selector';
import { Action, FormItem, ItemControl, QuestionnaireState } from '../types';

@Component({
  selector: 'app-questionnaire-form-item',
  templateUrl: './questionnaire-form-item.component.html',
  styleUrls: ['./questionnaire-form-item.component.scss'],
})
export class QuestionnaireFormItemComponent implements OnInit {
  @Input() linkIdPath: string[];
  @Input() store: Observable<QuestionnaireState>;
  @Input() dispatch: (action: Action) => void;

  item$: Observable<FormItem | undefined>;
  itemLinkIdPaths$: Observable<string[][]>;

  ItemControl = ItemControl;

  constructor() {}

  ngOnInit() {
    this.item$ = this.store.pipe(
      map(getFormItemByLinkIdPath(this.linkIdPath)),
      distinctUntilChanged<FormItem | undefined>(R.equals)
    );
    this.itemLinkIdPaths$ = this.item$.pipe(
      map(item => (R.isNil(item) ? [] : item.itemLinkIds)),
      distinctUntilChanged(R.equals),
      map<string[], string[][]>(
        R.map(itemLinkId => [...this.linkIdPath, itemLinkId])
      )
    );
  }
}
