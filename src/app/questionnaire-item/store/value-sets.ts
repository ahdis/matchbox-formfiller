import * as R from 'ramda';
import { toArray } from './util';

export const extractContainedValueSets = R.pipe(
  (questionnaire: any) => questionnaire?.contained,
  toArray,
  R.filter<any, 'array'>(
    (resource: any) => resource?.resourceType === 'ValueSet'
  )
);

export const extractExternalAnswerValueSetUrls = (
  questionnaireOrItem:
    | fhir.r4.Questionnaire
    | fhir.r4.QuestionnaireItem
    | undefined
): string[] =>
  R.chain(
    (item: any) => [
      ...(/^https?:\/\//.test(item?.answerValueSet)
        ? [item?.answerValueSet]
        : []),
      ...extractExternalAnswerValueSetUrls(item),
    ],
    toArray(questionnaireOrItem?.item)
  );
