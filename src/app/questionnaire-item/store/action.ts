import { LinkIdPathSegment } from '../types';

export const SET_ANSWERS = 'SET_ANSWERS';
export const setAnswers = (
  linkIdPath: LinkIdPathSegment[],
  answers: ReadonlyArray<any>
) => ({
  type: SET_ANSWERS,
  payload: {
    linkIdPath,
    answers,
  },
});

export const ADD_ANSWER = 'ADD_ANSWER';
export const addAnswer = (
  linkIdPath: LinkIdPathSegment[],
  initialValue: any
) => ({
  type: ADD_ANSWER,
  payload: { linkIdPath, initialValue },
});

export const REMOVE_ANSWER = 'REMOVE_ANSWER';
export const removeAnswer = (
  linkIdPath: LinkIdPathSegment[],
  index: number
) => ({
  type: REMOVE_ANSWER,
  payload: { linkIdPath, index },
});

export const ADD_ANSWER_OPTION = 'ADD_ANSWER_OPTION';
export const addAnswerOption = (
  linkIdPath: LinkIdPathSegment[],
  key: string,
  display: string,
  value: any = display
) => ({
  type: ADD_ANSWER_OPTION,
  payload: { linkIdPath, key, display, value },
});
