import { Component, OnInit } from '@angular/core';
import { QuestionnaireDemo } from './questionnaire-demo';
import { Router } from '@angular/router';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  fhirPath = '';

  constructor(
    private router: Router,
    private questionaireFillerServer: QuestionnaireFillerService
  ) {}

  ngOnInit() {}

  fillForm() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireEbida()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormReferralMin() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireReferralMin()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormSdcCap() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireSdcCap()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormSdcLoinc() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireSdcLoinc()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormSdcRender() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireSdcRender()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormLhncbcHeightWeight() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireLhncbHeightWeight()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }

  fillFormString() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireString()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }
  fillFormSupportLink() {
    this.questionaireFillerServer.setQuestionnare(
      QuestionnaireDemo.getQuestionnaireSupportLink()
    );
    this.router.navigate(['/questionnaire-form-filler']);
  }
}
