import * as R from 'ramda';
import {
  AnswerOption,
  AnswerOptionType,
  ItemControl,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import {
  filterNotNil,
  isDate,
  isNumber,
  isObject,
  isString,
  toLocaleDate,
  toLocaleDateTime,
  toLocaleTime,
} from './util';

const getResponseAnswers = ({
  type,
  answerOptions,
  answers,
}: QuestionnaireItem): fhir.r4.QuestionnaireResponseItemAnswer[] =>
  R.pipe(
    filterNotNil,
    R.map((answer: any) => {
      switch (type) {
        case 'boolean':
          return {
            valueBoolean:
              typeof answer === 'boolean' ? answer : answer === 'true',
          };
        case 'decimal':
          return {
            valueDecimal: isNumber(answer)
              ? answer
              : isString(answer)
              ? parseFloat(answer)
              : undefined,
          };
        case 'integer':
          return {
            valueInteger: isNumber(answer)
              ? answer
              : isString(answer)
              ? parseInt(answer, 10)
              : undefined,
          };
        case 'date':
          return {
            valueDate: isDate(answer)
              ? toLocaleDate(answer)
              : isString(answer)
              ? answer
              : undefined,
          };
        case 'dateTime':
          return {
            valueDateTime: isDate(answer)
              ? toLocaleDateTime(answer)
              : isString(answer)
              ? answer
              : undefined,
          };
        case 'time':
          // TODO format time
          return {
            valueTime: isDate(answer)
              ? toLocaleTime(answer)
              : isString(answer)
              ? answer
              : undefined,
          };
        case 'string':
        case 'text':
          return isString(answer)
            ? {
                valueString: answer,
              }
            : undefined;
        case 'url':
          return isString(answer)
            ? {
                valueUri: answer,
              }
            : undefined;
        case 'choice':
        case 'open-choice':
          return R.pipe(
            R.find<AnswerOption>(({ key }) => key === answer),
            (answerOption) =>
              answerOption
                ? answerOption.type === AnswerOptionType.Coding
                  ? {
                      valueCoding: answerOption.value,
                    }
                  : {
                      valueString: answerOption.value,
                    }
                : undefined
          )(answerOptions);
        case 'attachment':
          return isObject(answer)
            ? {
                valueAttachment: answer,
              }
            : undefined;
        case 'reference':
          // reference	Reference	Question with a reference to another resource (practitioner,
          // organization, etc.) as an answer (valueReference).
          // TODO
          return undefined;
        case 'quantity':
          // quantity	Quantity	Question with a combination of a numeric value and unit,
          // potentially with a comparator (<, >, etc.) as an answer.
          // (valueQuantity) There is an extension http://hl7.org/fhir/StructureDefinition/questionnaire-unit that can be used to define what
          // unit should be captured (or the a unit that has a ucum conversion from the provided unit).
          //   url	Url	Question with a URL (website, FTP site, etc.) answer (valueUri).
          return {
            valueQuantity: {
              value: answer,
            },
          };
      }
      return undefined;
    }),
    filterNotNil
  )(answers);

const getResponseItems: (
  items: QuestionnaireItem[]
) => fhir.r4.QuestionnaireResponseItem[] = R.map((item) => {
  let responseItem: fhir.r4.QuestionnaireResponseItem = {
    linkId: item.linkId,
    text: item.text,
  };
  let responseAnswer = getResponseAnswers(item);
  if (responseAnswer != null && responseAnswer.length > 0) {
    responseItem.answer = responseAnswer;
  }
  let responseItems = getResponseItems(R.values(item.items));
  if (responseItems != null && responseItems.length > 0) {
    responseItem.item = responseItems;
  }
  return responseItem;
});

export const getQuestionnaireResponse = ({
  url,
  items,
}: QuestionnaireState): fhir.r4.QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  questionnaire: url,
  status: 'in-progress',
  item: getResponseItems(R.values(items)),
});
