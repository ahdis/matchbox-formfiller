import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import debug from 'debug';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.scss'],
})
export class QuestionnaireFormFillerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  questionnaire$: Observable<fhir.r4.Questionnaire | undefined>;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;
  questionnaire: fhir.r4.Questionnaire;
  extracted: fhir.r4.Resource;

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
          ? this.questionnaireFillerServer.getQuestionniare()
          : undefined
      )
    );
    this.questionnaire$.subscribe((term) => {
      this.questionnaire = term;
    });
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = response;
  }

  onSubmit() {
    this.log('submit questionnaire response', this.questionnaireResponse);
    if (this.questionnaire.extension) {
      for (const extension of this.questionnaire.extension) {
        if (
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap' ===
          extension.url
        ) {
          this.log('extraction');
          this.fhirKitClient
            .operation({
              name: 'extract',
              resourceType: 'QuestionnaireResponse',
              input: this.questionnaireResponse,
            })
            .then((data) => (this.extracted = data));
        }
      }
    }
    return this.router.navigateByUrl('/');
  }

  onSaveAsDraft() {
    return this.fhirKitClient
      .create({
        resourceType: 'QuestionnaireResponse',
        body: this.questionnaireResponse,
      })
      .then(() => this.router.navigateByUrl('/'));
  }

  onCancel() {
    return this.router.navigateByUrl('/');
  }
}
