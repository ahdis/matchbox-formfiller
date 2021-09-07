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
  defaultIfEmpty,
  distinctUntilChanged,
  first,
  map,
  pairwise,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { rootReducer } from '../store/reducer';
import { transformQuestionnaire } from '../store/transform-initial-state';
import { getQuestionnaireResponse } from '../store/transform-response';
import {
  Action,
  LinkIdPathSegment,
  QuestionnaireState,
  RenderingExtension,
} from '../types';
import {
  extractContainedValueSets,
  extractExternalAnswerValueSetUrls,
} from '../store/value-sets';
import { FhirConfigService } from '../../fhirConfig.service';
import Client from 'fhir-kit-client';
import { getInitActions } from '../store/init-actions';

@Component({
  selector: 'app-questionnaire-form',
  templateUrl: './questionnaire-form.component.html',
  styleUrls: ['./questionnaire-form.component.scss'],
})
export class QuestionnaireFormComponent implements OnChanges, OnDestroy {
  @Input() questionnaire: fhir.r4.Questionnaire;
  @Input() questionnaireResponse: fhir.r4.QuestionnaireResponse;
  @Input() hideSubmitButton = false;
  @Input() hideSaveButton = false;
  @Input() hideCancelButton = false;

  @Output()
  changeQuestionnaireResponse = new EventEmitter<fhir.r4.QuestionnaireResponse>();
  @Output() submitQuestionnaire = new EventEmitter<void>();
  @Output() saveAsDraft = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  store$: Observable<QuestionnaireState>;
  titleWithExtension$: Observable<{
    title: string;
    renderingExtension: RenderingExtension;
  }>;
  itemLinkIdPaths$: Observable<LinkIdPathSegment[][]>;

  private readonly fhirKitClient: Client;
  private unsubscribe$ = new Subject<void>();

  dispatch$: BehaviorSubject<Action>;
  dispatch = (action: Action): void => this.dispatch$.next(action);

  constructor(fhirConfigService: FhirConfigService) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  ngOnChanges() {
    this.ngOnDestroy();
    this.unsubscribe$ = new Subject<void>();
    this.dispatch$ = new BehaviorSubject<Action>({ type: '@@INIT' });

    this.store$ = this.loadExternalValueSets().pipe(
      switchMap((valueSets: any[]) =>
        this.dispatch$.pipe(
          scan(
            rootReducer,
            transformQuestionnaire(this.questionnaire, valueSets)
          )
        )
      ),
      shareReplay()
    );

    zip(
      this.dispatch$,
      this.store$.pipe(startWith(undefined as QuestionnaireState), pairwise())
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
      map(({ items }) => R.map((linkId) => ({ linkId }), R.keys(items))),
      distinctUntilChanged<LinkIdPathSegment[]>(R.equals),
      map(R.map((linkId) => [linkId]))
    );

    this.store$
      .pipe(takeUntil(this.unsubscribe$), map(getQuestionnaireResponse))
      .subscribe((val) => this.changeQuestionnaireResponse.next(val));

    this.store$.pipe(first()).subscribe(() => {
      const initWithQuestionnaireResponse = R.pipe(
        getInitActions([]),
        R.forEach(this.dispatch)
      );

      if (this.questionnaireResponse) {
        initWithQuestionnaireResponse(this.questionnaireResponse);
      } else if (this.questionnaire.url) {
        this.findDefaultQuestionnaireResponse(this.questionnaire.url).then(
          (questionnaireResponse) => {
            if (
              questionnaireResponse?.resourceType === 'QuestionnaireResponse'
            ) {
              initWithQuestionnaireResponse(questionnaireResponse);
            }
          }
        );
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private loadExternalValueSets() {
    return zip(
      ...R.map(
        (url) =>
          this.fhirKitClient
            .resourceSearch({
              resourceType: 'ValueSet',
              searchParams: { url },
            })
            .then(extractFirstEntryFromSearchBundle)
            .catch(() => undefined),
        extractExternalAnswerValueSetUrls(this.questionnaire)
      )
    ).pipe(
      map((valueSetsFromRequests: (undefined | fhir.r4.ValueSet)[]) => [
        ...extractContainedValueSets(this.questionnaire),
        ...R.filter(
          (valueSet) => valueSet?.resourceType === 'ValueSet',
          valueSetsFromRequests
        ),
      ]),
      defaultIfEmpty([])
    );
  }

  private findDefaultQuestionnaireResponse(
    questionnaireUrl: string
  ): Promise<any | undefined> {
    return this.fhirKitClient
      .resourceSearch({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          questionnaire: questionnaireUrl,
          identifier: 'http://ahdis.ch/fhir/Questionnaire|DEFAULT',
        },
      })
      .then(extractFirstEntryFromSearchBundle);
  }
}

const extractFirstEntryFromSearchBundle = (bundle: any) =>
  bundle?.entry?.[0]?.resource;
