import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import debug from 'debug';
import { Observable, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { getExtensionOfElement } from '../questionnaire-item/store/transform-initial-state';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { QuestionnaireWithResponse } from '../questionnaire-item/types';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.scss'],
})
export class QuestionnaireFormFillerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  questionnaireWithResponse$: Observable<QuestionnaireWithResponse | undefined>;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;

  log = debug('app:');

  constructor(
    private route: ActivatedRoute,
    private fhirConfigService: FhirConfigService,
    private router: Router
  ) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  ngOnInit() {
    this.questionnaireWithResponse$ = zip(
      this.route.paramMap.pipe(
        map((params) => params.get('questionnaireId')),
        switchMap((id) =>
          fromPromise<fhir.r4.Questionnaire>(
            this.fhirKitClient.read({
              resourceType: 'Questionnaire',
              id,
            })
          )
        )
      ),
      this.route.queryParamMap.pipe(
        map((params) => params.get('questionnaireResponseId')),
        switchMap((id) =>
          id
            ? fromPromise<fhir.r4.QuestionnaireResponse>(
                this.fhirKitClient.read({
                  resourceType: 'QuestionnaireResponse',
                  id,
                })
              )
            : of(undefined)
        )
      )
    ).pipe(
      map(([questionnaire, questionnaireResponse]) =>
        questionnaire?.resourceType === 'Questionnaire'
          ? {
              questionnaire,
              questionnaireResponse:
                questionnaireResponse?.resourceType === 'QuestionnaireResponse'
                  ? questionnaireResponse
                  : undefined,
            }
          : undefined
      )
    );
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = response;
  }

  async onSubmit({
    questionnaire,
    questionnaireResponse,
  }: QuestionnaireWithResponse) {
    this.log('submit questionnaire response', this.questionnaireResponse);
    if (
      getExtensionOfElement(
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap'
      )(questionnaire)
    ) {
      const bundle = await this.fhirKitClient.operation({
        name: 'extract',
        resourceType: 'QuestionnaireResponse',
        input: this.questionnaireResponse,
      });
      await this.fhirKitClient.create({
        resourceType: 'Bundle',
        body: bundle,
      });
    }
    await this.saveQuestionnaireResponse(questionnaireResponse, 'completed');
    await this.router.navigateByUrl('/');
  }

  onSaveAsDraft(initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse) {
    return this.saveQuestionnaireResponse(
      initialQuestionnaireResponse
    ).then(() => this.router.navigateByUrl('/'));
  }

  onCancel() {
    return this.router.navigateByUrl('/');
  }

  private async saveQuestionnaireResponse(
    initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse,
    status: 'in-progress' | 'completed' = 'in-progress'
  ) {
    const questionnaireResponseId = initialQuestionnaireResponse?.id;
    if (questionnaireResponseId) {
      return this.fhirKitClient.update({
        id: questionnaireResponseId,
        resourceType: 'QuestionnaireResponse',
        body: {
          ...initialQuestionnaireResponse,
          ...this.questionnaireResponse,
          status,
        },
      });
    } else {
      return this.fhirKitClient.create({
        resourceType: 'QuestionnaireResponse',
        body: this.questionnaireResponse,
        status,
      });
    }
  }
}
