import * as questionnaireRadiologyOrder from '../../examples/radorder.json';

export class QuestionnaireDemo {
  static getQuestionnaireRadiologyOrder(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire>(<any>questionnaireRadiologyOrder);
  }
}
