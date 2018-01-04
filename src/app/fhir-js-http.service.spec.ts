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

  const patientV1: IResource = {
    'resourceType': 'Patient',
    'id': '46912',
    'meta': {
      'versionId': '1',
      'lastUpdated': '2018-01-04T10:48:32.744+01:00'
    },
    'text': {
      'status': 'generated',
      'div': '<div xmlns=\'http://www.w3.org/1999/xhtml\'>Franz Müller, 4.12.1971</div>'
    },
    'name': [
      {
        'family': 'Müller',
        'given': 'Franz'
      }
    ],
    'gender': 'male',
    'birthDate': '1971-12-04',
    'address': [
      {
        'line': [
          'Leidensweg 10'
        ],
        'city': 'Specimendorf',
        'postalCode': '9876'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FhirJsHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG }]
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

  describe('#create', () => {
    it('should create a patient resource', () => {

      const entry: Entry = {
        resource: {
          'resourceType': 'Patient',
          'text': {
            'status': 'generated',
            'div': '<div xmlns=\'http://www.w3.org/1999/xhtml\'>Franz Müller, 4.12.1971</div>'
          },
          'name': [
            {
              'family': 'Müller',
              'given': 'Franz'
            }
          ],
          'gender': 'male',
          'birthDate': '1971-12-04',
          'address': [
            {
              'line': [
                'Leidensweg 10'
              ],
              'city': 'Specimendorf',
              'postalCode': '9876'
            }
          ]
        }
      };

      service.create(entry).then(response => {
        expect(response.data.resourceType).toBe('Patient');
        expect(response.status).toBe(201);
        expect(response.data.id).toBe('46912');
        expect(response.data.meta.id.versionId).toBe('1');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient`);
      expect(req.request.method).toBe('POST');
      req.flush(patientV1, {
        headers: {
          'connection': 'close',
          'date': 'Thu, 04 Jan 2018 09: 48: 32 GMT',
          'x-powered-by': 'HAPI FHIR 3.1.0 REST Server (FHIR Server; FHIR 3.0.1/DSTU3)',
          'etag': 'W/\"1\"',
          'last-modified': 'Thu,04 Jan 2018 09: 48: 32 GMT',
          'location': 'http: //localhost:8080/baseDstu3/Patient/46912/_history/1',
          'content-type': 'application/json+fhir;charset=utf-8',
          'server': 'Jetty(9.4.z-SNAPSHOT)'
        }, status: 201, statusText: 'OK'
      });
    });
  });


  describe('#read', () => {
    it('should return the patient with id 46912', () => {

      const read: ReadObj = { id: '46912', type: 'Patient' };

      service.read(read).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('46912');
        expect(response.data.meta.id.versionId).toBe('1');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46912`);
      expect(req.request.method).toBe('GET');
      req.flush(patientV1);
    });
  });

});
