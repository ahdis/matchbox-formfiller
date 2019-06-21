import { Injectable } from '@angular/core';
import { FhirPathService } from 'ng-fhirjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireFillerService {
  private questionnaire: fhir.r4.Questionnaire;
  private questionnaireResponse: fhir.r4.QuestionnaireResponse;
  private mapResponseItems = new Map<
    string,
    fhir.r4.QuestionnaireResponseItem
  >();

  constructor(private fhirPathService: FhirPathService) {}

  setQuestionnare(quest: fhir.r4.Questionnaire) {
    this.questionnaire = quest;
    this.questionnaireResponse = undefined;
    this.mapResponseItems = new Map<
      string,
      fhir.r4.QuestionnaireResponseItem
    >();
  }

  getQuestionniare(): fhir.r4.Questionnaire {
    return this.questionnaire;
  }

  setQuestionnareResponse(quest: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = quest;
  }

  addQuestionnaireResponseItems(
    questItems: fhir.r4.QuestionnaireItem[]
  ): fhir.r4.QuestionnaireResponseItem[] {
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
      this.questionnaireResponse.item = this.addQuestionnaireResponseItems(
        this.questionnaire.item
      );
    }
    return this.questionnaireResponse;
  }

  getQuestionnaireResponseItem(
    linkId
  ): fhir.r4.QuestionnaireResponseItemAnswer {
    return this.mapResponseItems.get(linkId);
  }

  evaluateFhirPath(fhirPathExpression: string): string {
    const fhirPathResult = this.fhirPathService.evaluate(
      this.questionnaireResponse,
      fhirPathExpression
    );
    if (fhirPathResult) {
      return fhirPathResult[0];
    }
    return '';
  }

  setQuestionnaireResponseItem(
    item: fhir.r4.QuestionnaireItem,
    values: any[]
  ): boolean {
    const responseItem = this.mapResponseItems.get(item.linkId);
    responseItem.answer = (values || []).map(value => {
      const questionnaireResponseItemAnswer = <
        fhir.r4.QuestionnaireResponseItemAnswer
      >{};
      switch (item.type) {
        case 'decimal':
          // decimal	Decimal	Question with is a real number answer (valueDecimal).
          // TODO: ist this really necessary? maybe ValueDecimal should just be the result
          // that there are no conversion issues (text->float->text vor over the wire makes not much sense)
          questionnaireResponseItemAnswer.valueDecimal = value;
          break;
        case 'integer':
          // integer	Integer	Question with an integer answer (valueInteger)
          questionnaireResponseItemAnswer.valueInteger = parseInt(value, 10);
          break;
        case 'date':
          //  date	Date	Question with a date answer (valueDate).
          // TODO
          break;
        case 'dateTime':
          //  date	Date	Question with a date answer (valueDate).
          // TODO
          break;
        case 'time':
          // Time	Question with a time (hour:minute:second) answer independent of date. (valueTime).
          // TODO
          break;
        case 'string':
          //  string	String	Question with a short (few words to short sentence) free-text entry answer (valueString).
          questionnaireResponseItemAnswer.valueString = value;
          break;
        case 'text':
          //  text	Text	Question with a long (potentially multi-paragraph) free-text entry answer (valueString).
          questionnaireResponseItemAnswer.valueString = value;
          break;
        case 'url':
          //   url	Url	Question with a URL (website, FTP site, etc.) answer (valueUri).
          questionnaireResponseItemAnswer.valueUri = value;
          break;
        case 'choice':
        case 'open-choice':
          // Open Choice	Answer is a Coding drawn from a list of possible answers (as with the choice type)
          // or a free-text entry in a string (valueCoding or valueString).
          let found = false;
          if (item.answerOption) {
            for (const answerOption of item.answerOption) {
              // TODO: do we have more types here possible?
              if (answerOption.valueString) {
                if (answerOption.valueString === value) {
                  questionnaireResponseItemAnswer.valueString = value;
                  found = true;
                  break;
                }
              } else {
                if (answerOption.valueCoding) {
                  if (answerOption.valueCoding.code === value) {
                    questionnaireResponseItemAnswer.valueCoding =
                      answerOption.valueCoding;
                    found = true;
                    break;
                  }
                }
              }
            }
          } else {
            if (item.answerValueSet) {
              const valueSet = this.getAnswerValueSetComposeIncludeConcepts(
                item.answerValueSet
              );
              for (const answerValue of valueSet) {
                if (answerValue.code) {
                  if (answerValue.code === value) {
                    questionnaireResponseItemAnswer.valueCoding = answerValue;
                    found = true;
                    break;
                  }
                }
              }
            }
          }
          if (item.type === 'open-choice' && !found) {
            questionnaireResponseItemAnswer.valueString = value;
          }
          break;
        case 'attachment':
          // Attachment	Question with binary content such as a image, PDF, etc. as an answer (valueAttachment).
          // TODO
          questionnaireResponseItemAnswer.valueAttachment = value;
          break;
        case 'reference':
          // reference	Reference	Question with a reference to another resource (practitioner,
          // organization, etc.) as an answer (valueReference).
          // TODO
          break;
        case 'quantity':
          // quantity	Quantity	Question with a combination of a numeric value and unit,
          // potentially with a comparator (<, >, etc.) as an answer.
          // (valueQuantity) There is an extension http://hl7.org/fhir/StructureDefinition/questionnaire-unit that can be used to define what
          // unit should be captured (or the a unit that has a ucum conversion from the provided unit).
          //   url	Url	Question with a URL (website, FTP site, etc.) answer (valueUri).
          questionnaireResponseItemAnswer.valueQuantity.value = value;
          //        questionnaireResponseItemAnswer.valueQuantity.code = ;
          break;
      }
      return questionnaireResponseItemAnswer;
    });
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
      console.log(
        'TODO: not yet implemented reference to canonical valueset' + canonical
      );
    }
    return undefined;
  }

  /**
   * returns the FIRST conecpt list in the include
   * @param canonical
   */
  getAnswerValueSetComposeIncludeConcepts(
    canonical: string
  ): fhir.r4.ValueSetComposeIncludeConcept[] {
    const valueSet = this.getValueSet(canonical);
    return valueSet.compose.include[0].concept;
  }

  public getExtension(
    extensions: fhir.r4.Extension[],
    url: string
  ): fhir.r4.Extension {
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
