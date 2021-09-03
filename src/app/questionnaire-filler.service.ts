import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireFillerService {
  private questionnaire: fhir.r4.Questionnaire;
  private questionnaireResponse: fhir.r4.QuestionnaireResponse;

  setQuestionnaire(
    questionnaire: fhir.r4.Questionnaire,
    questionnaireResponse?: fhir.r4.QuestionnaireResponse
  ) {
    this.questionnaire = questionnaire;
    this.questionnaireResponse = questionnaireResponse;
  }

  getQuestionnaire(): fhir.r4.Questionnaire {
    return this.questionnaire;
  }

  setQuestionnaireResponse(
    questionnaireResponse: fhir.r4.QuestionnaireResponse
  ) {
    this.questionnaireResponse = questionnaireResponse;
  }

  getQuestionnaireResponse(): fhir.r4.QuestionnaireResponse {
    return this.questionnaireResponse;
  }
}
