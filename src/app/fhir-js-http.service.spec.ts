import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FhirJsHttpService, FHIR_HTTP_CONFIG } from './fhir-js-http.service';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://localhost:8080/baseDstu3',
  credentials: 'same-origin'
};

describe('FhirJsHttpService', () => {

  let injector: TestBed;
  let service: FhirJsHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FhirJsHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}]
    });
    injector = getTestBed();
    service = injector.get(FhirJsHttpService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('#conformance', () => {
    it('should return an conformance statement', () => {

      const resource: IResource = {
        'resourceType': 'CapabilityStatement',
        'status': 'active',
        'date': '2018-01-03T17:31:22+01:00',
        'publisher': 'Not provided',
        'kind': 'instance',
        'software': {
          'name': 'HAPI FHIR Server',
          'version': '3.1.0'
        },
        'implementation': {
          'description': 'Example Server'
        },
        'fhirVersion': '3.0.1',
        'acceptUnknown': 'extensions',
        'format': [
          'application/fhir+xml',
          'application/fhir+json'
        ]
      };

      service.conformance({}).then(response => {
        expect(response.data.resourceType).toBe('CapabilityStatement');
        expect(response.data.status).toBe('active');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/metadata`);
      expect(req.request.method).toBe('GET');
      req.flush(resource);
    });
  });

});
