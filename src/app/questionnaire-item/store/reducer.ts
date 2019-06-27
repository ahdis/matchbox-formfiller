import * as R from 'ramda';
import { AnswerOption, AnswerOptionType, QuestionnaireState } from '../types';
import {
  ADD_ANSWER,
  ADD_ANSWER_OPTION,
  REMOVE_ANSWER,
  SET_ANSWERS,
} from './action';
import {
  getAnswerOptionsLensFromItemLinkIdPath,
  getAnswersLensFromItemLinkIdPath,
} from './util';

export const rootReducer = (
  state: QuestionnaireState,
  action: any
): QuestionnaireState => {
  switch (action.type) {
    case ADD_ANSWER:
      return R.over(
        getAnswersLensFromItemLinkIdPath(action.payload.linkIdPath),
        R.append(action.payload.initialValue),
        state
      );
    case REMOVE_ANSWER:
      return R.over(
        getAnswersLensFromItemLinkIdPath(action.payload.linkIdPath),
        R.remove(action.payload.index, 1),
        state
      );
    case SET_ANSWERS:
      return R.set(
        getAnswersLensFromItemLinkIdPath(action.payload.linkIdPath),
        action.payload.answers,
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
