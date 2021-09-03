import * as R from 'ramda';
import {
  AnswerOption,
  AnswerOptionType,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import {
  isDate,
  isNumber,
  isObject,
  isString,
  toLocaleDate,
  toLocaleDateTime,
  toLocaleTime,
} from './util';
import { getIsEnabled } from './enable-behavior';

const getAnswerValueWithQuestionnaireItem = ({
  type,
  answerOptions,
}: QuestionnaireItem) => (
  answer: any
): fhir.r4.QuestionnaireResponseItemAnswer => {
  switch (type) {
    case 'boolean':
      return {
        valueBoolean: typeof answer === 'boolean' ? answer : answer === 'true',
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
      return {
        valueTime: isDate(answer)
          ? toLocaleTime(answer)
          : isString(answer)
          ? answer
          : undefined,
      };
    case 'string':
    case 'text':
      return isString(answer) && answer !== ''
        ? {
            valueString: answer,
          }
        : undefined;
    case 'url':
      return isString(answer) && answer !== ''
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
      const parsedValue = parseFloat(answer);
      return isFinite(parsedValue)
        ? {
            valueQuantity: {
              value: parsedValue,
            },
          }
        : undefined;
  }
  return undefined;
};

const getResponseAnswers = (
  item: QuestionnaireItem,
  getIsItemEnabled: (item: QuestionnaireItem) => boolean
): fhir.r4.QuestionnaireResponseItemAnswer[] => {
  const getAnswerValue = getAnswerValueWithQuestionnaireItem(item);
  return R.filter(
    (answerItem) => !R.isNil(answerItem) && !R.isEmpty(answerItem),
    R.map(
      ({ answer, items }) => ({
        ...getAnswerValue(answer),
        ...(R.isEmpty(items)
          ? {}
          : {
              item: getResponseItems(getIsItemEnabled)(R.values(items)),
            }),
      }),
      item.itemAnswerList
    )
  );
};

const getResponseItems: (
  getIsItemEnabled: (item: QuestionnaireItem) => boolean
) => (items: QuestionnaireItem[]) => fhir.r4.QuestionnaireResponseItem[] = (
  getIsItemEnabled
) =>
  R.chain((item) => {
    const isEnabled = getIsItemEnabled(item);
    const getIsEnabledForSubItems = isEnabled
      ? getIsItemEnabled
      : R.always(false);
    const responseItem: fhir.r4.QuestionnaireResponseItem = {
      linkId: item.linkId,
      text: item.text,
    };
    const getItems = R.pipe(
      R.values,
      getResponseItems(getIsEnabledForSubItems)
    );
    if (item.type === 'group') {
      return R.map(
        ({ items }) => ({
          ...responseItem,
          item: getItems(items),
        }),
        item.itemAnswerList
      );
    } else {
      const responseAnswer = getResponseAnswers(item, getIsEnabledForSubItems);
      return R.isEmpty(responseAnswer) || !isEnabled
        ? [responseItem]
        : [
            {
              ...responseItem,
              ...(R.isEmpty(responseAnswer) || !isEnabled
                ? {}
                : { answer: responseAnswer }),
            },
          ];
    }
  });

export const getQuestionnaireResponse = (
  state: QuestionnaireState
): fhir.r4.QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  questionnaire: state.url,
  status: 'in-progress',
  item: getResponseItems(getIsEnabled(state))(R.values(state.items)),
});
