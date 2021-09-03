import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import debug from 'debug';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { getExtensionOfElement } from '../questionnaire-item/store/transform-initial-state';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.scss'],
})
export class QuestionnaireFormFillerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  questionnaire$: Observable<fhir.r4.Questionnaire | undefined>;
  initialQuestionnaireResponse: fhir.r4.QuestionnaireResponse;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;
  questionnaire: fhir.r4.Questionnaire;

  log = debug('app:');

  constructor(
    private route: ActivatedRoute,
    private questionnaireFillerServer: QuestionnaireFillerService,
    private fhirConfigService: FhirConfigService,
    private router: Router
  ) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  ngOnInit() {
    this.questionnaire$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')),
      map((id) =>
        id === 'radiology-order'
          ? QuestionnaireDemo.getQuestionnaireRadiologyOrder()
          : id === '-1'
          ? this.questionnaireFillerServer.getQuestionnaire()
          : undefined
      )
    );
    this.questionnaire$.subscribe((term) => {
      this.questionnaire = term;
    });
    this.initialQuestionnaireResponse = this.questionnaireFillerServer.getQuestionnaireResponse();
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = response;
  }

  async onSubmit() {
    this.log('submit questionnaire response', this.questionnaireResponse);
    if (
      getExtensionOfElement(
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap'
      )(this.questionnaire)
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
    await this.saveQuestionnaireResponse('completed');
    await this.router.navigateByUrl('/');
  }

  onSaveAsDraft() {
    return this.saveQuestionnaireResponse().then(() =>
      this.router.navigateByUrl('/')
    );
  }

  onCancel() {
    return this.router.navigateByUrl('/');
  }

  private async saveQuestionnaireResponse(
    status: 'in-progress' | 'completed' = 'in-progress'
  ) {
    const questionnaireResponseId = this.initialQuestionnaireResponse?.id;
    if (questionnaireResponseId) {
      return this.fhirKitClient.update({
        id: questionnaireResponseId,
        resourceType: 'QuestionnaireResponse',
        body: {
          ...this.initialQuestionnaireResponse,
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
