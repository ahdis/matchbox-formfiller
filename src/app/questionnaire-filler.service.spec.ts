import { TestBed, inject } from '@angular/core/testing';

import { QuestionnaireFillerService } from './questionnaire-filler.service';

describe('QuestionnaireFillerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionnaireFillerService],
    });
  });

  it('should be created', inject(
    [QuestionnaireFillerService],
    (service: QuestionnaireFillerService) => {
      expect(service).toBeTruthy();
    }
  ));
});
