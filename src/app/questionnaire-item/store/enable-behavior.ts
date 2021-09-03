import * as R from 'ramda';
import {
  IsEnabledBehavior,
  IsEnabledCondition,
  QuestionnaireItem,
  QuestionnaireItemsIndexedByLinkId,
  QuestionnaireState,
} from '../types';
import { filterNotNil, isNotNil, toArray } from './util';

const getItemByLinkId = (
  linkId: string,
  items: QuestionnaireItemsIndexedByLinkId
) =>
  items[linkId]
    ? items[linkId]
    : R.pipe(
        R.values,
        R.chain((item: QuestionnaireItem) =>
          R.map(
            (questionnaireItems) =>
              getItemByLinkId(linkId, questionnaireItems.items),
            item.itemAnswerList
          )
        ),
        filterNotNil,
        // For simplicity's sake, this is not implemented according to the specification:
        // From the specification (https://www.hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item.enableWhen.question):
        // If multiple question occurrences are present for the same question (same linkId), then this refers to the nearest question occurrence reachable by tracing first the "ancestor" axis and then the "preceding" axis and then the "following" axis.
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
    R.propOr([], 'itemAnswerList'),
    toArray,
    R.map(R.prop('answer')),
    (answers) =>
      operator === 'exists'
        ? isExistsOperatorSatisfied(answer, answers)
        : operator === '='
        ? isEqualsOperatorSatisfied(answer, answers)
        : true
  );

export const getIsEnabled = (state: QuestionnaireState) => (
  item: QuestionnaireItem
): boolean =>
  item.isEnabledWhen.length === 0 ||
  (item.isEnabledBehavior === IsEnabledBehavior.All ? R.allPass : R.anyPass)(
    R.map(getIsEnabledPredicate, item.isEnabledWhen)
  )(state);
