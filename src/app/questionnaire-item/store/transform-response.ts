import * as R from 'ramda';
import { isDate, isNumber, isObject, isString } from 'util';
import {
  AnswerOption,
  AnswerOptionType,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import { filterNotNil } from './util';

const getReponseAnswers = ({
  type,
  answerOptions,
  answers,
}: QuestionnaireItem): fhir.r4.QuestionnaireResponseItemAnswer[] =>
  R.pipe(
    filterNotNil,
    R.map((answer: any) => {
      switch (type) {
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
              ? `${answer.getFullYear()}-${
                  answer.getMonth() < 9 ? '0' : ''
                }${answer.getMonth() + 1}-${
                  answer.getDate() <= 9 ? '0' : ''
                }${answer.getDate()}`
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
            answerOption =>
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
) => fhir.r4.QuestionnaireResponseItem[] = R.map(item => ({
  linkId: item.linkId,
  text: item.text,
  answer: getReponseAnswers(item),
  item: getResponseItems(R.values(item.items)),
}));

export const getQuestionnaireResponse = ({
  items,
}: QuestionnaireState): fhir.r4.QuestionnaireResponse => ({
  status: 'in-progress',
  item: getResponseItems(R.values(items)),
});
