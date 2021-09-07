import { QuestionnaireWithResponse } from '../questionnaire-item/types';

export const extractQuestionnaireWithResponseFromBundle = (
  bundle: fhir.r4.Bundle
): Partial<QuestionnaireWithResponse> => ({
  questionnaire: findResourceByType(bundle, 'Questionnaire') as any,
  questionnaireResponse: findResourceByType(
    bundle,
    'QuestionnaireResponse'
  ) as any,
});

const findResourceByType = (
  bundle: fhir.r4.Bundle,
  resourceType: string
): fhir.r4.Resource | undefined =>
  bundle?.entry?.find((entry) => entry?.resource?.resourceType === resourceType)
    ?.resource;
