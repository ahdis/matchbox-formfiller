export const SET_ANSWERS = 'SET_ANSWERS';
export const setAnswers = (
  linkIdPath: string[],
  answers: ReadonlyArray<any>
) => ({
  type: SET_ANSWERS,
  payload: {
    linkIdPath,
    answers,
  },
});

export const ADD_ANSWER = 'ADD_ANSWER';
export const addAnswer = (linkIdPath: string[], initialValue: any) => ({
  type: ADD_ANSWER,
  payload: { linkIdPath, initialValue },
});

export const REMOVE_ANSWER = 'REMOVE_ANSWER';
export const removeAnswer = (linkIdPath: string[], index: number) => ({
  type: REMOVE_ANSWER,
  payload: { linkIdPath, index },
});

export const ADD_ANSWER_OPTION = 'ADD_ANSWER_OPTION';
export const addAnswerOption = (
  linkIdPath: string[],
  key: string,
  display: string,
  value: any = display
) => ({
  type: ADD_ANSWER_OPTION,
  payload: { linkIdPath, key, display, value },
});
