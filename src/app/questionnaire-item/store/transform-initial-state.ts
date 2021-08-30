import * as R from 'ramda';
import {
  Action,
  AnswerOption,
  AnswerOptionType,
  ChoiceOrientation,
  IsEnabledBehavior,
  IsEnabledCondition,
  ItemControl,
  QuestionnaireItem,
  QuestionnaireItemsIndexedByLinkId,
  QuestionnaireState,
} from '../types';
import {
  isNotNil,
  isObject,
  isString,
  toArray,
  toBoolean,
  toNumber,
  toString,
} from './util';
import { setAnswers } from './action';

const getExtensionOfElement = (extensionUrl: string) =>
  R.pipe(
    (item: unknown) => (isObject(item) ? item : {}),
    R.prop('extension'),
    toArray,
    R.find(R.pipe(R.propOr(undefined, 'url'), R.equals(extensionUrl)))
  );

const getBooleanExtension = (extensionUrl: string) =>
  R.pipe(
    getExtensionOfElement(extensionUrl),
    R.propOr(false, 'valueBoolean'),
    toBoolean
  );

const getNumberExtension = (extensionUrl: string) =>
  R.pipe(
    getExtensionOfElement(extensionUrl),
    R.propOr(undefined, 'valueInteger'),
    toNumber
  );

const getStringExtensionWithPath = (path: string[]) => (extensionUrl: string) =>
  R.pipe(
    getExtensionOfElement(extensionUrl),
    R.pathOr(undefined, path),
    toString
  );
const getStringExtension = getStringExtensionWithPath(['valueString']);
const getUriExtension = getStringExtensionWithPath(['valueUri']);
const getValueCodingCodeExtension = getStringExtensionWithPath([
  'valueCoding',
  'code',
]);

const getHiddenExtension = getBooleanExtension(
  'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
);

const getItemControlExtension = R.pipe(
  getExtensionOfElement(
    'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  ),
  R.pathOr([], ['valueCodeableConcept', 'coding']),
  toArray,
  R.find(
    R.pipe(
      R.propOr(undefined, 'system'),
      R.equals('http://hl7.org/fhir/questionnaire-item-control')
    )
  ),
  R.propOr(undefined, 'code'),
  (code) =>
    code === 'radio-button'
      ? ItemControl.RadioButton
      : code === 'check-box'
      ? ItemControl.CheckBox
      : code === 'slider'
      ? ItemControl.Slider
      : undefined
);

const getChoiceOrientationExtension = R.pipe(
  getExtensionOfElement(
    'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation'
  ),
  R.propOr(undefined, 'valueCode'),
  (code?: ChoiceOrientation): ChoiceOrientation | undefined =>
    R.includes(code, ['vertical', 'horizontal']) ? code : undefined
);

const getSupportLinkExtension = getUriExtension(
  'http://hl7.org/fhir/StructureDefinition/questionnaire-supportLink'
);

const getSliderStepValueExtension = getNumberExtension(
  'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue'
);

const getMinValueExtension = getNumberExtension(
  'http://hl7.org/fhir/StructureDefinition/minValue'
);

const getMaxValueExtension = getNumberExtension(
  'http://hl7.org/fhir/StructureDefinition/maxValue'
);

const getUnitExtension = getValueCodingCodeExtension(
  'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
);

const getRenderingXHtmlExtension = getStringExtension(
  'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
);

const getHasRenderXHtmlExtension = R.pipe(getRenderingXHtmlExtension, isNotNil);

const getHtmlOrText = (text: string, extensionContainer: unknown) =>
  getHasRenderXHtmlExtension(extensionContainer)
    ? getRenderingXHtmlExtension(extensionContainer)
    : text;

const getRenderingStyleExtension = R.pipe(
  getStringExtension('http://hl7.org/fhir/StructureDefinition/rendering-style'),
  R.defaultTo(''),
  R.split(';'),
  R.filter(R.complement(R.pipe(R.trim, R.isEmpty))),
  R.map(R.pipe(R.split(':'), R.map(R.trim))),
  R.fromPairs as (pairs: string[][]) => { [cssPropertyName: string]: string }
);

const getCalculatedExpressionExtension = R.pipe(
  getExtensionOfElement(
    'http://hl7.org/fhir/StructureDefinition/questionnaire-calculatedExpression'
  ),
  R.ifElse(
    R.pathEq(['valueExpression', 'language'], 'text/fhirpath'),
    R.pathOr(undefined, ['valueExpression', 'expression']),
    R.always(undefined)
  ),
  toString
);

const isCanonicalUriAFragmentReference = (canonicalUri: string): boolean =>
  R.startsWith('#', toString(canonicalUri) || '');

const getOptionsFromValueSet: (
  valueSets: any[]
) => (item: unknown) => AnswerOption[] = (valueSets) =>
  R.pipe(
    R.propOr(undefined, 'answerValueSet'),
    (url: undefined | string) =>
      url
        ? R.find(
            isCanonicalUriAFragmentReference(url)
              ? R.propEq('id', R.tail(url))
              : R.propEq('url', url),
            valueSets
          )
        : undefined,
    R.pathOr([], ['compose', 'include', 0, 'concept']),
    toArray,
    R.map(
      (concept: any): AnswerOption => ({
        type: AnswerOptionType.Coding,
        value: concept,
        key: toString(concept.code),
        display: toString(concept.display),
      })
    )
  );

const getOptionsFromAnswerOptions: (
  answerOptions: unknown[]
) => AnswerOption[] = R.pipe(
  toArray,
  R.map((answerOption: any): AnswerOption | undefined =>
    isString(answerOption.valueString)
      ? {
          type: AnswerOptionType.String,
          value: toString(answerOption.valueString),
          key: toString(answerOption.valueString),
          display: toString(answerOption.valueString),
        }
      : isObject(answerOption.valueCoding)
      ? {
          type: AnswerOptionType.Coding,
          value: answerOption.valueCoding,
          key: toString(answerOption.valueCoding.code),
          display: toString(answerOption.valueCoding.display),
        }
      : undefined
  )
);

const getOptions = (valueSets: any[]) => (item: any) =>
  Array.isArray(item && item.answerOption)
    ? getOptionsFromAnswerOptions(item.answerOption)
    : getOptionsFromValueSet(valueSets)(item);

const getExistingTypeProperty: (
  prefix: string
) => (item: unknown) => unknown = (prefix) =>
  R.cond([
    [R.has(`${prefix}Boolean`), R.prop(`${prefix}Boolean`)],
    [R.has(`${prefix}Decimal`), R.prop(`${prefix}Decimal`)],
    [R.has(`${prefix}Integer`), R.prop(`${prefix}Integer`)],
    [R.has(`${prefix}Date`), R.prop(`${prefix}Date`)],
    [R.has(`${prefix}DateTime`), R.prop(`${prefix}DateTime`)],
    [R.has(`${prefix}Time`), R.prop(`${prefix}Time`)],
    [R.has(`${prefix}String`), R.prop(`${prefix}String`)],
    [R.has(`${prefix}Uri`), R.prop(`${prefix}Uri`)],
    [R.has(`${prefix}Attachment`), R.prop(`${prefix}Attachment`)],
    [
      R.hasPath([`${prefix}Coding`, 'code']),
      R.path([`${prefix}Coding`, 'code']),
    ],
    [
      R.hasPath([`${prefix}Quantity`, 'value']),
      R.path([`${prefix}Quantity`, 'value']),
    ],
    [R.has(`${prefix}Reference`), R.prop(`${prefix}Reference`)],
    [R.T, R.always(undefined)],
  ]);

const getExistingValueProperty = getExistingTypeProperty('value');
const getExistingAnswerProperty = getExistingTypeProperty('answer');

const getEnabledConditions = R.pipe(
  R.propOr([], 'enableWhen'),
  toArray,
  R.map(
    (condition: any): IsEnabledCondition =>
      condition && {
        linkId: condition.question,
        operator: condition.operator,
        answer: getExistingAnswerProperty(condition),
      }
  ),
  R.filter<IsEnabledCondition, 'array'>(
    (condition) =>
      isObject(condition) &&
      isString(condition.linkId) &&
      isString(condition.operator) &&
      !R.isNil(condition.answer)
  )
);

const getInitialAnswers = R.pipe(
  R.propOr([], 'initial'),
  toArray,
  R.map(getExistingValueProperty),
  R.when(R.isEmpty, R.always([undefined]))
);

const transformItem = (valueSets: any[]) => (item: any): QuestionnaireItem => ({
  linkId: item.linkId,
  type: item.type,
  isRequired: toBoolean(item.required),
  isReadonly: toBoolean(item.readonly),
  maxLength: toNumber(item.maxLength),
  repeats: toBoolean(item.repeats),
  prefix: getHtmlOrText(toString(item.prefix), item._prefix),
  text: getHtmlOrText(toString(item.text), item._text) || '',
  answerOptions: getOptions(valueSets)(item),
  isEnabledWhen: getEnabledConditions(item),
  isEnabledBehavior:
    item.enableBehavior === 'all'
      ? IsEnabledBehavior.All
      : IsEnabledBehavior.Any,
  answers: getInitialAnswers(item),
  extensions: {
    isHidden: getHiddenExtension(item),
    itemControl: getItemControlExtension(item),
    choiceOrientation: getChoiceOrientationExtension(item),
    prefix: {
      renderAsHtml: getHasRenderXHtmlExtension(item._prefix),
      styles: getRenderingStyleExtension(item._prefix),
    },
    text: {
      renderAsHtml: getHasRenderXHtmlExtension(item._text),
      styles: getRenderingStyleExtension(item._text),
    },
    supportLink: getSupportLinkExtension(item),
    sliderStepValue: getSliderStepValueExtension(item),
    minValue: getMinValueExtension(item),
    maxValue: getMaxValueExtension(item),
    unit: getUnitExtension(item),
    fhirPathExpression: getCalculatedExpressionExtension(item),
  },
  items: transformItems(valueSets)(item.item),
});

const transformItems: (
  valueSets: any[]
) => (items: unknown) => QuestionnaireItemsIndexedByLinkId = (valueSets) =>
  R.pipe(
    toArray,
    R.filter(
      (item: any) =>
        isObject(item) && isString(item.linkId) && isString(item.type)
    ),
    R.map(transformItem(valueSets)),
    R.indexBy(R.prop('linkId'))
  );

export const transformQuestionnaire = (
  questionnaire: fhir.r4.Questionnaire,
  valueSets: any[]
): QuestionnaireState => ({
  title: getHtmlOrText(toString(questionnaire.title), questionnaire._title),
  items: transformItems(valueSets)(questionnaire.item),
  url: questionnaire.url,
  extensions: {
    title: {
      renderAsHtml: getHasRenderXHtmlExtension(questionnaire._title),
      styles: getRenderingStyleExtension(questionnaire._title),
    },
  },
});

export const getInitActions = (path: string[]) => (item: any): Action[] => [
  ...(Array.isArray(item?.answer)
    ? [
        setAnswers(
          [...path, item.linkId],
          R.map(getExistingValueProperty, item.answer)
        ),
      ]
    : []),
  ...(Array.isArray(item?.item)
    ? R.chain(
        getInitActions(item.linkId ? [...path, item.linkId] : []),
        item.item
      )
    : []),
];
