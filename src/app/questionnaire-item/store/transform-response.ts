import * as R from 'ramda';
import {
  AnswerOption,
  AnswerOptionType,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import { filterNotNil, isDate, isNumber, isObject, isString } from './util';
import { getIsEnabled } from './selector';

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
              ? `${answer.getFullYear()}-${answer.getMonth() < 9 ? '0' : ''}${
                  answer.getMonth() + 1
                }-${answer.getDate() <= 9 ? '0' : ''}${answer.getDate()}`
              : isString(answer)
              ? answer
              : undefined,
          };
        case 'dateTime':
          // TODO format date time
          return {
            valueDateTime: isDate(answer)
              ? answer.toString()
              : isString(answer)
              ? answer
              : undefined,
          };
        case 'time':
          // TODO format time
          return {
            valueTime: isDate(answer)
              ? answer.toString()
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
  getIsItemEnabled: (item: QuestionnaireItem) => boolean
) => (items: QuestionnaireItem[]) => fhir.r4.QuestionnaireResponseItem[] = (
  getIsItemEnabled
) =>
  R.map((item) => {
    const isEnabled = getIsItemEnabled(item);
    const responseItem: fhir.r4.QuestionnaireResponseItem = {
      linkId: item.linkId,
      text: item.text,
    };
    const responseAnswer = getResponseAnswers(item);
    if (isEnabled && responseAnswer != null && responseAnswer.length > 0) {
      responseItem.answer = responseAnswer;
    }
    const responseItems = getResponseItems(
      isEnabled ? getIsItemEnabled : R.always(false)
    )(R.values(item.items));
    if (responseItems != null && responseItems.length > 0) {
      responseItem.item = responseItems;
    }
    return responseItem;
  });

export const getQuestionnaireResponse = (
  state: QuestionnaireState
): fhir.r4.QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  questionnaire: state.url,
  status: 'in-progress',
  item: getResponseItems(getIsEnabled(state))(R.values(state.items)),
});
