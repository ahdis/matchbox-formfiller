import * as questionnaireEbida from '../../examples/ebida-order-1.json';
import * as questionnaireSdcCap from '../../examples/Questionnaire-questionnaire-sdc-profile-example-cap.json';
import * as questionnaireSdcLoinc from '../../examples/Questionnaire-questionnaire-sdc-profile-example-loinc.json';
import * as questionnaireSdcRender from '../../examples/Questionnaire-questionnaire-sdc-profile-example-render.json';

export class QuestionnaireDemo {

  static getQuestionnaireEbida(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireEbida);
  }

  static getQuestionnaireSdcCap(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireSdcCap);
  }

  static getQuestionnaireSdcLoinc(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireSdcLoinc);
  }

  static getQuestionnaireSdcRender(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireSdcRender);
  }

}

