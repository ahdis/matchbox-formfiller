import { evaluate } from 'fhirpath';
import * as R from 'ramda';
import { pipe } from 'rxjs';
import {
  AnswerOptionType,
  FormItem,
  LinkIdPathSegment,
  QuestionnaireItem,
  QuestionnaireState,
} from '../types';
import { getQuestionnaireResponse } from './transform-response';
import { getStatePathFromItemLinkIdPath, isString, toArray } from './util';
import { getIsEnabled } from './enable-behavior';

const getAnswersByFhirPathExpression = (
  state: QuestionnaireState,
  fhirPathExpression: string
) =>
  R.pipe(
    () => evaluate(getQuestionnaireResponse(state), fhirPathExpression),
    toArray,
    (result) => (R.isEmpty(result) ? [undefined] : result)
  )();

export const getFormItemByLinkIdPath = (
  linkIdPath: LinkIdPathSegment[]
): ((state: QuestionnaireState) => FormItem | undefined) =>
  pipe(
    (state) => ({
      item: R.path<QuestionnaireItem | undefined>(
        getStatePathFromItemLinkIdPath(linkIdPath),
        state
      ),
      state,
    }),
    ({ item, state }): FormItem =>
      R.isNil(item?.linkId)
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
              : R.map(({ answer }) => answer, item.itemAnswerList),
            extensions: item.extensions,
            itemLinkIds: R.keys(item.defaultItems) as string[],
          }
  );
