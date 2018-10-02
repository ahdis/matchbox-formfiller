import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireFillerService {

  private questionnaire: fhir.r4.Questionnaire;
  private questionnaireResponse: fhir.r4.QuestionnaireResponse;
  private mapResponseItems = new Map<string, fhir.r4.QuestionnaireResponseItem>();

  constructor() { }

  setQuestionnare(quest: fhir.r4.Questionnaire) {
    this.questionnaire = quest;
    this.questionnaireResponse = undefined;
    this.mapResponseItems = new Map<string, fhir.r4.QuestionnaireResponseItem>();
  }

  getQuestionniare(): fhir.r4.Questionnaire {
    return this.questionnaire;
  }

  setQuestionnareResponse(quest: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = quest;
  }

  addQuestionnaireResponseItems(questItems: fhir.r4.QuestionnaireItem[]): fhir.r4.QuestionnaireResponseItem[] {
    const responseItems: fhir.r4.QuestionnaireResponseItem[] = [];
    for (const questItem of questItems) {
      const responseItem = <fhir.r4.QuestionnaireResponseItem>{};
      responseItem.linkId = questItem.linkId;
      responseItem.text = questItem.text;
      this.mapResponseItems.set(questItem.linkId, responseItem);
      responseItems.push(responseItem);
      if (questItem.item) {
        responseItem.item = this.addQuestionnaireResponseItems(questItem.item);
      }
    }
    return responseItems;
  }

  getQuestionniareResponse(): fhir.r4.QuestionnaireResponse {
    if (!this.questionnaireResponse) {
      this.questionnaireResponse = <fhir.r4.QuestionnaireResponse>{};
      this.questionnaireResponse.status = 'in-progress';
      this.questionnaireResponse.item = this.addQuestionnaireResponseItems(this.questionnaire.item);
    }
    return this.questionnaireResponse;
  }

  getQuestionnaireResponseItem(linkId): fhir.r4.QuestionnaireResponseItemAnswer {
    return this.mapResponseItems.get(linkId);
  }

  setQuestionnaireResponseItem(item: fhir.r4.QuestionnaireItem, value: string): boolean {
    const responseItem = this.mapResponseItems.get(item.linkId);
    responseItem.answer = [];
    const questionnaireResponseItemAnswer = <fhir.r4.QuestionnaireResponseItemAnswer>{};
    switch (item.type) {
      case 'decimal':
        questionnaireResponseItemAnswer.valueDecimal = parseFloat(value);
        break;
      case 'string':
        questionnaireResponseItemAnswer.valueString = value;
        break;
      default:
         console.log(item.linkId + 'not yet implemented for ');
    }
    responseItem.answer.push(questionnaireResponseItemAnswer);
    return true;
  }

  getValueSet(canonical: string): fhir.r4.ValueSet {
    if (canonical.startsWith('#')) {
      const id = canonical.substring(1);
      for (const resource of this.questionnaire.contained) {
        if (resource.resourceType === 'ValueSet' && resource.id === id) {
          return <fhir.r4.ValueSet>resource;
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

  public getExtension(extensions: fhir.r4.Extension[], url: string): fhir.r4.Extension {
    if (extensions) {
      for (const extension of extensions) {
        if (extension.url === url) {
          return extension;
        }
      }
    }
    return undefined;
  }

  /**
  * NgStyle needs JSON object, style doesn't work because angular security blocks it, exampel for styleExtension: "color:green;"
  * @param styleExtension
  */
  public getCss(styleExtension: fhir.r4.Extension): Object {
    const css = {};
    if (styleExtension) {
      for (const cssproperty of styleExtension.valueString.split(';')) {
        const properties = cssproperty.split(':');
        css[properties[0]] = properties[1];
      }
    }
    return css;
  }







}
