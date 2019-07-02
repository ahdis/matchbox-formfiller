import { evaluate } from 'fhirpath';
import * as R from 'ramda';
import { pipe } from 'rxjs';
import {
  AnswerOptionType,
  FormItem,
  IsEnabledBehavior,
  IsEnabledCondition,
  QuestionnaireItem,
  QuestionnaireItemsIndexedByLinkId,
  QuestionnaireState,
} from '../types';
import { getQuestionnaireResponse } from './transform-response';
import {
  filterNotNil,
  getStatePathFromItemLinkIdPath,
  isNotNil,
  isString,
  toArray,
} from './util';

const getAnswersByFhirPathExpression = (
  state: QuestionnaireState,
  fhirPathExpression: string
) =>
  R.pipe(
    () => evaluate(getQuestionnaireResponse(state), fhirPathExpression),
    toArray,
    result => (R.isEmpty(result) ? [undefined] : result)
  )();

const getItemByLinkId = (
  linkId: string,
  items: QuestionnaireItemsIndexedByLinkId
): QuestionnaireItem | undefined =>
  items[linkId]
    ? items[linkId]
    : R.pipe(
        R.values,
        R.map((item: QuestionnaireItem) => getItemByLinkId(linkId, item.items)),
        filterNotNil,
        R.head
      )(items);

const isExistsOperatorSatisfied = (
  expectedAnswer: any,
  actualAnswers: any[]
): boolean =>
  (expectedAnswer ? (R.identity as (result: boolean) => boolean) : R.not)(
    R.any(isNotNil, actualAnswers)
  );

const isEqualsOperatorSatisfied = (expectedAnswer: any, actualAnswers: any[]) =>
  R.any(R.equals(expectedAnswer), actualAnswers);

const getIsEnabledPredicate = ({
  linkId,
  operator,
  answer,
}: IsEnabledCondition): ((state: QuestionnaireState) => boolean) =>
  R.pipe(
    (state: QuestionnaireState) => getItemByLinkId(linkId, state.items),
    R.propOr([], 'answers'),
    toArray,
    answers =>
      operator === 'exists'
        ? isExistsOperatorSatisfied(answer, answers)
        : operator === '='
        ? isEqualsOperatorSatisfied(answer, answers)
        : true
  );

const getIsEnabled = (state: QuestionnaireState) => (
  item: QuestionnaireItem
): boolean =>
  item.isEnabledWhen.length === 0 ||
  (item.isEnabledBehavior === IsEnabledBehavior.All ? R.allPass : R.anyPass)(
    R.map(getIsEnabledPredicate, item.isEnabledWhen)
  )(state);

export const getFormItemByLinkIdPath = (
  linkIdPath: string[]
): ((state: QuestionnaireState) => FormItem | undefined) =>
  pipe(
    state => ({
      item: R.path<QuestionnaireItem | undefined>(
        getStatePathFromItemLinkIdPath(linkIdPath),
        state
      ),
      state,
    }),
    ({ item, state }): FormItem =>
      R.isNil(item)
        ? undefined
        : {
            linkId: item.linkId,
            type: item.type,
            isRequired: item.isRequired,
            isReadonly: item.isReadonly,
            isEnabled: getIsEnabled(state)(item),
            maxLength: item.maxLength,
            repeats: item.repeats,
            prefix: item.prefix,
            text: item.text,
            answerOptions: R.map(
              ({ type, key, display }) => ({
                key,
                display,
                isUserProvided: type === AnswerOptionType.UserProvided,
              }),
              item.answerOptions
            ),
            answers: isString(item.extensions.fhirPathExpression)
              ? getAnswersByFhirPathExpression(
                  state,
                  item.extensions.fhirPathExpression
                )
              : item.answers,
            extensions: item.extensions,
            itemLinkIds: R.keys(item.items) as string[],
          }
  );
