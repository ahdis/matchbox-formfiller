import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireFillerService {

  private questionnaire: fhir.r4.Questionnaire;
  private questionnaireResponse: fhir.r4.QuestionnaireResponse;
  private mapResponseItems = new Map<string, string>();

  constructor() { }

  setQuestionnare(quest: fhir.r4.Questionnaire) {
    this.questionnaire = quest;
  }

  getQuestionniare(): fhir.r4.Questionnaire {
    return this.questionnaire;
  }

  setQuestionnareResponse(quest: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = quest;
  }

  getQuestionniareResponse(): fhir.r4.QuestionnaireResponse {
    return this.questionnaireResponse;
  }

  getQuestionnaireResponseItem(linkId): string {
    return this.mapResponseItems.get(linkId);
  }

  setQuestionnaireResponseItem(linkId: string, value: string ): boolean {
    this.mapResponseItems.set(linkId, value);
    return true;
  }

  getValueSet(canonical: string): fhir.r4.ValueSet {
    if (canonical.startsWith('#')) {
      const id = canonical.substring(1);
      for (const resource of this.questionnaire.contained) {
        if (resource.resourceType === 'ValueSet' && resource.id === id) {
          return <fhir.r4.ValueSet> resource;
        }
      }
    } else {
      console.log('TODO: not yet implemented reference to canonical valueset' + canonical);
    }
    return undefined;
  }

  /**
   * returns the FIRST conecpt list in the include
   * @param canonical
   */
  getAnswerValueSetComposeIncludeConcepts(canonical: string): fhir.r4.ValueSetComposeIncludeConcept[] {
    const valueSet = this.getValueSet(canonical);
    return valueSet.compose.include[0].concept;
  }







}
