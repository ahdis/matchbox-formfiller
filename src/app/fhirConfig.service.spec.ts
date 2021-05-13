import { TestBed } from '@angular/core/testing';

import { FhirConfigService } from './fhirConfig.service';

describe('FhirConfigService', () => {
  let service: FhirConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FhirConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
