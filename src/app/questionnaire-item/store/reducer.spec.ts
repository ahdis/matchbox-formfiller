import {
  AnswerOption,
  ChoiceOrientation,
  IsEnabledBehavior,
  IsEnabledCondition,
  ItemAnswer,
  ItemControl,
  QuestionnaireItem,
  QuestionnaireItemsIndexedByLinkId,
  QuestionnaireState,
  RenderingExtension,
  Styles,
} from '../types';
import { setAnswers } from './action';
import { rootReducer } from './reducer';

describe('setAnswers()', () => {
  it('should set answers in root item', () => {
    const actual = rootReducer(
      createQuestionnaireState({
        items: {
          rootItem1: createQuestionnaireItem({
            linkId: 'rootItem1',
            itemAnswerList: [
              {
                answer: 'x',
                items: {},
              },
              {
                answer: 'y',
                items: {},
              },
            ],
          }),
        },
      }),
      setAnswers([{ linkId: 'rootItem1' }], ['a'])
    );
    const expected = createQuestionnaireState({
      items: {
        rootItem1: createQuestionnaireItem({
          linkId: 'rootItem1',
          itemAnswerList: [
            {
              answer: 'a',
              items: {},
            },
          ],
        }),
      },
    });
    expect(actual).toEqual(expected);
  });

  it('should set answers in nested item', () => {
    const actual = rootReducer(
      createQuestionnaireState({
        items: {
          rootItem1: createQuestionnaireItem({
            linkId: 'rootItem1',
            itemAnswerList: [
              {
                answer: undefined,
                items: {
                  nestedItem1: createQuestionnaireItem({
                    linkId: 'nestedItem1',
                    answers: [1],
                  }),
                },
              },
            ],
          }),
        },
      }),
      setAnswers(
        [{ linkId: 'rootItem1' }, { linkId: 'nestedItem1', index: 0 }],
        ['a', 'b', 'c']
      )
    );
    const expected = createQuestionnaireState({
      items: {
        rootItem1: createQuestionnaireItem({
          linkId: 'rootItem1',
          itemAnswerList: [
            {
              answer: undefined,
              items: {
                nestedItem1: createQuestionnaireItem({
                  linkId: 'nestedItem1',
                  itemAnswerList: [
                    {
                      answer: 'a',
                      items: {},
                    },
                    {
                      answer: 'b',
                      items: {},
                    },
                    {
                      answer: 'c',
                      items: {},
                    },
                  ],
                }),
              },
            },
          ],
        }),
      },
    });
    expect(actual).toEqual(expected);
  });
});

const createRenderingExtension = ({
  renderAsHtml = false,
  styles = {} as Styles,
} = {}): RenderingExtension => ({
  renderAsHtml,
  styles,
});

const createQuestionnaireItem = ({
  linkId = 'exampleLinkId',
  type = 'exampleType',
  isRequired = false,
  isReadonly = false,
  maxLength = undefined as number | undefined,
  repeats = false,
  prefix = undefined as string | undefined,
  text = 'exampleText',
  answerOptions = [] as AnswerOption[],
  isEnabledWhen = [] as IsEnabledCondition[],
  isEnabledBehavior = IsEnabledBehavior.All,
  answers = [],
  extensions: {
    isHidden = false,
    itemControl = undefined as ItemControl | undefined,
    choiceOrientation = undefined as ChoiceOrientation | undefined,
    prefix: prefixExtension = createRenderingExtension(),
    text: textExtension = createRenderingExtension(),
    supportLink = undefined as string | undefined,
    sliderStepValue = undefined as number | undefined,
    minValue = undefined as number | undefined,
    maxValue = undefined as number | undefined,
    unit = undefined as string | undefined,
    fhirPathExpression = undefined as string | undefined,
  } = {},
  defaultItems = {} as QuestionnaireItemsIndexedByLinkId,
  itemAnswerList = [] as ItemAnswer[],
} = {}): QuestionnaireItem => ({
  linkId,
  type,
  isRequired,
  isReadonly,
  maxLength,
  repeats,
  prefix,
  text,
  answerOptions,
  isEnabledWhen,
  isEnabledBehavior,
  extensions: {
    isHidden,
    itemControl,
    choiceOrientation,
    prefix: prefixExtension,
    text: textExtension,
    supportLink,
    sliderStepValue,
    minValue,
    maxValue,
    unit,
    fhirPathExpression,
  },
  defaultItems,
  itemAnswerList,
});

const createQuestionnaireState = ({
  title = 'exampleTitle',
  url = 'http://example.com',
  items = {} as QuestionnaireItemsIndexedByLinkId,
  extensions: { title: titleExtension = createRenderingExtension() } = {},
} = {}): QuestionnaireState => ({
  title,
  url,
  items,
  extensions: {
    title: titleExtension,
  },
});
