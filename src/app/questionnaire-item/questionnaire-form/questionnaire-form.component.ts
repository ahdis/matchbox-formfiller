import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import * as R from 'ramda';
import { BehaviorSubject, Observable, Subject, zip } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  pairwise,
  scan,
  shareReplay,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { rootReducer } from '../store/reducer';
import { transformQuestionnaire } from '../store/transform-initial-state';
import { getQuestionnaireResponse } from '../store/transform-response';
import { Action, QuestionnaireState, RenderingExtension } from '../types';

@Component({
  selector: 'app-questionnaire-form',
  templateUrl: './questionnaire-form.component.html',
  styleUrls: ['./questionnaire-form.component.scss'],
})
export class QuestionnaireFormComponent implements OnChanges, OnDestroy {
  @Input() questionnaire: fhir.r4.Questionnaire;
  @Input() questionnaireResponse: fhir.r4.QuestionnaireResponse;

  @Output() changeQuestionnaireResponse = new EventEmitter<
    fhir.r4.QuestionnaireResponse
  >();
  @Output() submitQuestionnaire = new EventEmitter<void>();

  dispatch$: BehaviorSubject<Action>;
  dispatch = (action: Action): void => this.dispatch$.next(action);

  store$: Observable<QuestionnaireState>;
  titleWithExtension$: Observable<{
    title: string;
    renderingExtension: RenderingExtension;
  }>;
  itemLinkIdPaths$: Observable<string[][]>;

  private unsubscribe$ = new Subject<void>();

  ngOnChanges() {
    this.ngOnDestroy();
    this.unsubscribe$ = new Subject<void>();
    this.dispatch$ = new BehaviorSubject<Action>({ type: '@@INIT' });

    this.store$ = this.dispatch$.pipe(
      scan(
        rootReducer,
        transformQuestionnaire(this.questionnaire, this.questionnaireResponse)
      ),
      shareReplay()
    );

    zip(
      this.dispatch$,
      this.store$.pipe(
        startWith(undefined),
        pairwise()
      )
    ).subscribe(([action, [prevState, state]]) => {
      console.group(`Action: ${action.type}`);
      console.log('Action', action);
      console.log('Previous state', prevState);
      console.log('State', state);
      console.groupEnd();
    });

    this.titleWithExtension$ = this.store$.pipe(
      map(({ title, extensions }) => ({
        title,
        renderingExtension: extensions.title,
      })),
      distinctUntilChanged<{
        title: string;
        renderingExtension: RenderingExtension;
      }>(R.equals)
    );

    this.itemLinkIdPaths$ = this.store$.pipe(
      map(({ items }) => R.keys(items)),
      distinctUntilChanged<string[]>(R.equals),
      map(R.map(linkId => [linkId]))
    );

    this.store$
      .pipe(
        takeUntil(this.unsubscribe$),
        map(getQuestionnaireResponse)
      )
      .subscribe(val => this.changeQuestionnaireResponse.next(val));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
