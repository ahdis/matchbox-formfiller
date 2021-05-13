export enum ItemControl {
  Slider = 'slider',
  RadioButton = 'radio-button',
  CheckBox = 'check-box',
}

export enum AnswerOptionType {
  String = 'string',
  Coding = 'coding',
  UserProvided = 'user-provided',
}

export enum IsEnabledBehavior {
  All = 'all',
  Any = 'any',
}

export type ChoiceOrientation = 'horizontal' | 'vertical';

export interface QuestionnaireState {
  readonly title: string;
  readonly url: string;
  readonly items: QuestionnaireItemsIndexedByLinkId;
  readonly extensions: {
    readonly title: RenderingExtension;
  };
}

export interface QuestionnaireItemsIndexedByLinkId {
  readonly [linkId: string]: QuestionnaireItem;
}

export interface AnswerOption {
  readonly type: AnswerOptionType;
  readonly value: any;
  readonly key: string;
  readonly display: string;
}

export interface IsEnabledCondition {
  readonly linkId: string;
  readonly operator: string;
  readonly answer: any;
}

export interface QuestionnaireItem {
  readonly linkId: string;
  readonly type: string;
  readonly isRequired: boolean;
  readonly isReadonly: boolean;
  readonly maxLength?: number;
  readonly repeats: boolean;
  readonly prefix?: string;
  readonly text: string;
  readonly answerOptions: AnswerOption[];
  readonly isEnabledWhen: IsEnabledCondition[];
  readonly isEnabledBehavior: IsEnabledBehavior;
  readonly answers: any[];
  readonly extensions: SupportedExtensions;
  readonly items: QuestionnaireItemsIndexedByLinkId;
}

interface SupportedExtensions {
  readonly isHidden: boolean;
  readonly itemControl?: ItemControl;
  readonly choiceOrientation?: ChoiceOrientation;
  readonly prefix: RenderingExtension;
  readonly text: RenderingExtension;
  readonly supportLink?: string;
  readonly sliderStepValue?: number;
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly unit?: string;
  readonly fhirPathExpression?: string;
}

export interface FormItemAnswerOption {
  key: string;
  display: string;
  isUserProvided: boolean;
}

export interface FormItem {
  linkId: string;
  type: string;
  isRequired: boolean;
  isReadonly: boolean;
  isEnabled: boolean;
  maxLength?: number;
  repeats: boolean;
  prefix?: string;
  text: string;
  answerOptions: FormItemAnswerOption[];
  answers: any[];
  extensions: SupportedExtensions;
  itemLinkIds: string[];
}

export interface RenderingExtension {
  readonly renderAsHtml: boolean;
  readonly styles: Styles;
}

export interface Styles {
  readonly [cssPropertyName: string]: string;
}

export interface Action {
  readonly type: string;
  readonly payload?: any;
}
