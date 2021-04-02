import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

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

  constructor(
    private route: ActivatedRoute,
    private questionaireFillerServer: QuestionnaireFillerService
  ) {}

  ngOnInit() {
    this.questionnaire$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')),
      map(name =>
        name === 'ebida'
          ? QuestionnaireDemo.getQuestionnaireEbida()
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
          : name === '-1'
          ? this.questionaireFillerServer.getQuestionniare()
          : undefined
      )
    );
    this.questionnaireResponseInitial$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')),
      map(name =>
        name === 'ebida'
          ? QuestionnaireDemo.getQuestionnaireEbidaQr()
          : undefined
      )
    );
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = response;
  }

  onSubmit() {
    console.log('submit questionnaire response', this.questionnaireResponse);
  }
}
