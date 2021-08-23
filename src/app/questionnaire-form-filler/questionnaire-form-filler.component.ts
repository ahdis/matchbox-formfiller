import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import debug from 'debug';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { FhirConfigService } from '../fhirConfig.service';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.scss'],
})
export class QuestionnaireFormFillerComponent implements OnInit {
  questionnaire$: Observable<fhir.r4.Questionnaire | undefined>;
  questionnaireResponseInitial$: Observable<
    fhir.r4.QuestionnaireResponse | undefined
  >;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;
  questionnaire: fhir.r4.Questionnaire;
  extracted: fhir.r4.Resource;

  log = debug('app:');

  constructor(
    private route: ActivatedRoute,
    private questionaireFillerServer: QuestionnaireFillerService,
    private data: FhirConfigService
  ) {}

  ngOnInit() {
    this.questionnaire$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')),
      map((name) =>
        name === 'sdc-extract'
          ? QuestionnaireDemo.getQuestionnaireSdcExtract()
          : name === 'referral-min'
          ? QuestionnaireDemo.getQuestionnaireReferralMin()
          : name === 'sdc-cap'
          ? QuestionnaireDemo.getQuestionnaireSdcCap()
          : name === 'sdc-loinc'
          ? QuestionnaireDemo.getQuestionnaireSdcLoinc()
          : name === 'sdc-render'
          ? QuestionnaireDemo.getQuestionnaireSdcRender()
          : name === 'height-weight'
          ? QuestionnaireDemo.getQuestionnaireLhncbHeightWeight()
          : name === 'string'
          ? QuestionnaireDemo.getQuestionnaireString()
          : name === 'support-link'
          ? QuestionnaireDemo.getQuestionnaireSupportLink()
          : name === 'radiology-order'
          ? QuestionnaireDemo.getQuestionnaireRadiologyOrder()
          : name === '-1'
          ? this.questionaireFillerServer.getQuestionniare()
          : undefined
      )
    );
    this.questionnaireResponseInitial$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')),
      map((name) =>
        name === 'ebida'
          ? QuestionnaireDemo.getQuestionnaireEbidaQr()
          : undefined
      )
    );
    this.questionnaire$.subscribe((term) => {
      this.questionnaire = term;
    });
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    if (this.questionnaire.extension) {
      for (let extension of this.questionnaire.extension) {
        if (
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap' ===
          extension.url
        ) {
          this.log('extraction');
          const client = this.data.getFhirClient();
          client
            .operation({
              name: 'extract',
              resourceType: 'QuestionnaireResponse',
              input: response,
            })
            .then((data) => (this.extracted = data));
        }
      }
    }
    this.questionnaireResponse = response;
  }

  onSubmit() {
    this.log('submit questionnaire response', this.questionnaireResponse);
  }
}
