import { QuestionnaireModule } from './questionnaire.module';

describe('QuestionnaireModule', () => {
  let questionnaireModule: QuestionnaireModule;

  beforeEach(() => {
    questionnaireModule = new QuestionnaireModule();
  });

  it('should create an instance', () => {
    expect(questionnaireModule).toBeTruthy();
  });
});
