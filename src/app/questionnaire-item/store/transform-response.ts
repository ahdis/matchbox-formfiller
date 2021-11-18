import * as R from 'ramda';
import {
  AnswerOption,
  AnswerOptionType,
  ItemAnswer,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import {
  isDate,
  isObject,
  isString,
  toLocaleDateTime,
  toLocaleDate,
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
      return R.isNil(answer) || answer === ''
        ? undefined
        : {
            valueBoolean: answer === true || answer === 'true',
          };
    case 'decimal':
      const valueDecimal = parseFloat(answer);
      return isFinite(valueDecimal)
        ? {
            valueDecimal,
          }
        : undefined;
    case 'integer':
      const valueInteger = parseInt(answer, 10);
      return isFinite(valueInteger)
        ? {
            valueInteger,
          }
        : undefined;
    case 'date':
      const valueDate = isDate(answer)
        ? toLocaleDate(answer)
        : isString(answer)
        ? answer
        : undefined;
      return valueDate
        ? {
            valueDate,
          }
        : undefined;
    case 'dateTime':
      const valueDateTime = isDate(answer)
        ? toLocaleDateTime(answer)
        : isString(answer)
        ? answer
        : undefined;
      return valueDateTime
        ? {
            valueDateTime,
          }
        : undefined;
    case 'time':
      const valueTime = isDate(answer)
        ? toLocaleTime(answer)
        : isString(answer)
        ? answer
        : undefined;
      return valueTime
        ? {
            valueTime,
          }
        : undefined;
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
          answerOption?.type === AnswerOptionType.Coding &&
          isObject(answerOption?.value)
            ? {
                valueCoding: R.pick(
                  ['system', 'version', 'code', 'display', 'userSelected'],
                  answerOption.value
                ),
              }
            : isString(answerOption?.value)
            ? {
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
    R.map(({ answer, items }) => {
      const responseItems = getResponseItems(getIsItemEnabled)(R.values(items));
      return {
        ...getAnswerValue(answer),
        ...(R.isEmpty(responseItems)
          ? {}
          : {
              item: responseItems,
            }),
      };
    }, item.itemAnswerList)
  );
};

const getResponseItems: (
  getIsItemEnabled: (item: QuestionnaireItem) => boolean
) => (items: QuestionnaireItem[]) => fhir.r4.QuestionnaireResponseItem[] = (
  getIsItemEnabled
) =>
  R.pipe(
    R.filter<QuestionnaireItem, 'array'>(getIsItemEnabled),
    R.chain((item) => {
      const responseItem: fhir.r4.QuestionnaireResponseItem = {
        linkId: item.linkId,
        text: item.text,
      };
      const getItems = R.pipe(R.values, getResponseItems(getIsItemEnabled));
      if (item.type === 'group') {
        return R.pipe(
          R.map(({ items }) => ({
            ...responseItem,
            item: getItems(items),
          })),
          R.filter<fhir.r4.QuestionnaireResponseItem, 'array'>(
            ({ item: answerItem }) =>
              !R.isNil(answerItem) && !R.isEmpty(answerItem)
          )
        )(item.itemAnswerList);
      }
      const responseAnswer = getResponseAnswers(item, getIsItemEnabled);
      if (R.isEmpty(responseAnswer)) {
        return [];
      }
      return [{ ...responseItem, answer: responseAnswer }];
    })
  );

export const getQuestionnaireResponse = (
  state: QuestionnaireState
): fhir.r4.QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  questionnaire: state.url,
  status: 'in-progress',
  item: getResponseItems(getIsEnabled(state))(R.values(state.items)),
});

const checkAnswerList = (itemAnswerList: readonly ItemAnswer[]): boolean => {
  if (itemAnswerList) {
    for (let itemAnswer of itemAnswerList) {
      if (itemAnswer.valid === false) {
        return false;
      }
      if (itemAnswer.items) {
        const questionnaireItems = R.values(itemAnswer.items);
        for (let questionnaireItem of questionnaireItems) {
          if (questionnaireItem.itemAnswerList) {
            if (!checkAnswerList(questionnaireItem.itemAnswerList)) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
};

export const getQuestionnaireValid = (state: QuestionnaireState): boolean => {
  const questionnaireItems = R.values(state.items);
  for (let questionnaireItem of questionnaireItems) {
    if (questionnaireItem.itemAnswerList) {
      if (!checkAnswerList(questionnaireItem.itemAnswerList)) {
        return false;
      }
    }
  }
  return true;
};
