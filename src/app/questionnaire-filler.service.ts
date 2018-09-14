import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireFillerService {

  private questionnaire: fhir.Questionnaire;

  constructor() { }

  setQuestionnare(quest: fhir.Questionnaire) {
    this.questionnaire = quest;
  }

  getQuestionniare(): fhir.Questionnaire {
    return this.questionnaire;
  }


}
