import * as R from 'ramda';
import {
  Action,
  AnswerOption,
  AnswerOptionType,
  ItemAnswer,
  QuestionnaireState,
} from '../types';
import {
  ADD_ANSWER,
  ADD_ANSWER_OPTION,
  REMOVE_ANSWER,
  SET_ANSWERS,
} from './action';
import {
  getAnswerOptionsLensFromItemLinkIdPath,
  getDefaultItemsLensFromItemLinkIdPath,
  getItemAnswerListLensFromItemLinkIdPath,
} from './util';

export const rootReducer = (
  state: QuestionnaireState,
  action: Action
): QuestionnaireState => {
  switch (action.type) {
    case ADD_ANSWER:
      return R.over(
        getItemAnswerListLensFromItemLinkIdPath(action.payload.linkIdPath),
        R.append({
          answer: action.payload.initialValue,
          items: R.view(
            getDefaultItemsLensFromItemLinkIdPath(action.payload.linkIdPath),
            state
          ),
        }),
        state
      );
    case REMOVE_ANSWER:
      return R.over(
        getItemAnswerListLensFromItemLinkIdPath(action.payload.linkIdPath),
        R.remove(action.payload.index, 1),
        state
      );
    case SET_ANSWERS:
      return R.over(
        getItemAnswerListLensFromItemLinkIdPath(action.payload.linkIdPath),
        (oldAnswers: ItemAnswer[]) => {
          if (!Array.isArray(oldAnswers)) {
            console.warn('Could not set answers for action', action.payload);
            return oldAnswers;
          }
          const answersConcat = R.concat(
            oldAnswers,
            R.repeat(
              {
                answer: undefined,
                items: R.view(
                  getDefaultItemsLensFromItemLinkIdPath(
                    action.payload.linkIdPath
                  ),
                  state
                ),
              },
              R.max(0, action.payload.answers.length - oldAnswers.length)
            )
          );
          const result = R.map(
            ([answer, { items }]): ItemAnswer => ({
              answer,
              items,
            }),
            R.zip(action.payload.answers, answersConcat)
          );
          return R.forEach((item: ItemAnswer) => {
            item.valid = action.payload?.valid;
            return item;
          }, result);
        },
        state
      );
    case ADD_ANSWER_OPTION:
      return R.over(
        getAnswerOptionsLensFromItemLinkIdPath(action.payload.linkIdPath),
        R.pipe(
          R.filter<AnswerOption, 'array'>(
            ({ key }) => key !== action.payload.key
          ),
          R.append<AnswerOption>({
            type: AnswerOptionType.UserProvided,
            key: action.payload.key,
            display: action.payload.display,
            value: action.payload.value,
          })
        ),
        state
      );
    default:
      return state;
  }
};
