import * as questionnaireEbida from '../../examples/ebida-order-1.json';
import * as questionnaireReferralMin from '../../examples/referral-min.json';
import * as questionnaireSdcCap from '../../examples/Questionnaire-questionnaire-sdc-profile-example-cap.json';
import * as questionnaireSdcLoinc from '../../examples/Questionnaire-questionnaire-sdc-profile-example-loinc.json';
import * as questionnaireSdcRender from '../../examples/Questionnaire-questionnaire-sdc-profile-example-render.json';
import * as questionnaireLhncbHeightWeight from '../../examples/weight-height-questionnaire.json';
import * as questionnaireString from '../../examples/string.json';

export class QuestionnaireDemo {

  static getQuestionnaireEbida(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireEbida);
  }

  static getQuestionnaireReferralMin(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireReferralMin);
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

  static getQuestionnaireLhncbHeightWeight(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireLhncbHeightWeight);
  }

  static getQuestionnaireString(): fhir.r4.Questionnaire {
    return <fhir.r4.Questionnaire> (<any> questionnaireString);
  }


}

