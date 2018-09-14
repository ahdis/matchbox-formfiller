import { Component, OnInit } from '@angular/core';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.css']
})
export class QuestionnaireFormFillerComponent implements OnInit {

  constructor(private questionaireFillerServer: QuestionnaireFillerService) {}

  ngOnInit() {
  }

  getQuestionnaire(): fhir.Questionnaire {
    return this.questionaireFillerServer.getQuestionniare();
  }

  getQuestionnaireTitle(): string {
    return this.getQuestionnaire().title;
  }



}
