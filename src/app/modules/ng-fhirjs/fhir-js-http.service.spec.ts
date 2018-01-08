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
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
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
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(patientV1, {
        headers: {
          'connection': 'close',
          'date': 'Thu, 04 Jan 2018 09: 48: 32 GMT',
          'x-powered-by': 'HAPI FHIR 3.1.0 REST Server (FHIR Server; FHIR 3.0.1/DSTU3)',
          'etag': 'W/\"1\"',
          'last-modified': 'Thu,04 Jan 2018 09: 48: 32 GMT',
          'location': 'http://localhost:8080/baseDstu3/Patient/46912/_history/1',
          'content-type': 'application/json+fhir;charset=utf-8',
          'server': 'Jetty(9.4.z-SNAPSHOT)'
        }, status: 201, statusText: 'OK'
      });
    });
  });


  describe('#read, #vread', () => {
    it('should return the patient with id 46912', () => {

      const read: ReadObj = { id: '46912', type: 'Patient' };

      service.read(read).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('46912');
        expect(response.data.meta.id.versionId).toBe('1');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46912`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(patientV1);
      httpMock.verify();
    });

    it('should return the patient with id 46912, version 1', () => {

      const read: VReadObj = { id: '46912', versionId: '1', type: 'Patient' };

      service.vread(read).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('46912');
        expect(response.data.meta.id.versionId).toBe('1');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46912/_history/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(patientV1);
    });
  });

  describe('#history, #historyType, #resourceHistory', () => {
    it('should return a bundle with the history, paged', () => {

      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "1d50d3af-0f15-43a4-aa51-273ccc9036ff", "meta": { "lastUpdated": "2018-01-06T13:19:58.306+01:00" }, "type": "history", "total": 9749, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/_history" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=4c79ed22-81a6-4d38-ab2f-37d5e736366a&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=history" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Patient/46913", "resource": { "resourceType": "Patient", "id": "46913", "meta": { "versionId": "1", "lastUpdated": "2018-01-04T10:55:48.382+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Franz Müller, 4.12.1971</div>" }, "name": [{ "family": "Müller", "given": ["Franz"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46913/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46912", "resource": { "resourceType": "Patient", "id": "46912", "meta": { "versionId": "1", "lastUpdated": "2018-01-04T10:48:32.744+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody/></table></div>" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46912/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46911", "resource": { "resourceType": "Patient", "id": "46911", "meta": { "versionId": "2", "lastUpdated": "2017-12-29T16:25:20.805+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody/></table></div>" } }, "request": { "method": "DELETE", "url": "http://localhost:8080/baseDstu3/Patient/46911/_history/2" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46911", "resource": { "resourceType": "Patient", "id": "46911", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.798+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Müster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46911/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46910", "resource": { "resourceType": "Observation", "id": "46910", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.670+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46910/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46909", "resource": { "resourceType": "Observation", "id": "46909", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.658+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46909/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46908", "resource": { "resourceType": "Observation", "id": "46908", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.651+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46908/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46907", "resource": { "resourceType": "Observation", "id": "46907", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.644+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46907/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46906", "resource": { "resourceType": "Observation", "id": "46906", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.636+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46906/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/46905", "resource": { "resourceType": "Observation", "id": "46905", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.629+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/46709" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Observation/46905/_history/1" } }] };

      service.history({ debug: true }).then(response => {
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('1d50d3af-0f15-43a4-aa51-273ccc9036ff');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/_history`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(bundle);
      httpMock.verify();
    });

    it('should return a bundle with the history of resource type Patient, paged', () => {
      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "5889353a-0e81-4ec1-84cc-601c47a130c2", "meta": { "lastUpdated": "2018-01-06T14:21:32.802+01:00" }, "type": "history", "total": 2149, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/Patient/_history" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=b65b6eaf-00d0-403f-a83e-73eef7166ab4&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=history" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Patient/46913", "resource": { "resourceType": "Patient", "id": "46913", "meta": { "versionId": "1", "lastUpdated": "2018-01-04T10:55:48.382+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Franz Müller, 4.12.1971</div>" }, "name": [{ "family": "Müller", "given": ["Franz"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46913/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46912", "resource": { "resourceType": "Patient", "id": "46912", "meta": { "versionId": "1", "lastUpdated": "2018-01-04T10:48:32.744+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody/></table></div>" } }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46912/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46911", "resource": { "resourceType": "Patient", "id": "46911", "meta": { "versionId": "2", "lastUpdated": "2017-12-29T16:25:20.805+01:00" }, "text": { "status": "generated", "div": "<divxmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody/></table></div>" } }, "request": { "method": "DELETE", "url": "http://localhost:8080/baseDstu3/Patient/46911/_history/2" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46911", "resource": { "resourceType": "Patient", "id": "46911", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:20.798+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Müster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46911/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46710", "resource": { "resourceType": "Patient", "id": "46710", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:18.723+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46710/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46709", "resource": { "resourceType": "Patient", "id": "46709", "meta": { "versionId": "2", "lastUpdated": "2017-12-29T16:25:18.689+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Muster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "PUT", "url": "http://localhost:8080/baseDstu3/Patient/46709/_history/2" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46709", "resource": { "resourceType": "Patient", "id": "46709", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:25:18.595+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Müster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46709/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46708", "resource": { "resourceType": "Patient", "id": "46708", "meta": { "versionId": "2", "lastUpdated": "2017-12-29T16:24:29.529+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><table class=\"hapiPropertyTable\"><tbody/></table></div>" } }, "request": { "method": "DELETE", "url": "http://localhost:8080/baseDstu3/Patient/46708/_history/2" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46708", "resource": { "resourceType": "Patient", "id": "46708", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:24:29.516+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Müster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46708/_history/1" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46507", "resource": { "resourceType": "Patient", "id": "46507", "meta": { "versionId": "1", "lastUpdated": "2017-12-29T16:24:26.533+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "request": { "method": "PUT", "url": "http://localhost:8080/baseDstu3/Patient/46507/_history/1" } }] };

      service.typeHistory({ debug: true, type: 'Patient' }).then(response => {
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('5889353a-0e81-4ec1-84cc-601c47a130c2');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/_history`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(bundle);
      httpMock.verify();
    });

    it('should return a bundle with the history of a resource, paged', () => {
      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "ce895fc4-f55a-44ee-87ff-24709acf1901", "meta": { "lastUpdated": "2018-01-06T15:06:12.162+01:00" }, "type": "history", "total": 2, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/Patient/46921/_history" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Patient/46921", "resource": { "resourceType": "Patient", "id": "46921", "meta": { "versionId": "2", "lastUpdated": "2018-01-06T15:06:12.128+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Muster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "PUT", "url": "http://localhost:8080/baseDstu3/Patient/46921/_history/2" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/46921", "resource": { "resourceType": "Patient", "id": "46921", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T15:06:12.060+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Müster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg 10"], "city": "Specimendorf", "postalCode": "9876" }] }, "request": { "method": "POST", "url": "http://localhost:8080/baseDstu3/Patient/46921/_history/1" } }] };

      service.resourceHistory({ id: '46921', type: 'Patient' }).then(response => {
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('ce895fc4-f55a-44ee-87ff-24709acf1901');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46921/_history`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(bundle);
    });

  });

  describe('#update', () => {
    it('Update an existing resource by its id', () => {

      // tslint:disable-next-line
      const entry: Entry = { resource: { "resourceType": "Patient", "id": "46915", "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Fälix Müster</div>" }, "name": [{ "family": "Muster", "given": ["Fälix"] }], "gender": "male", "birthDate": "1971-12-04", "address": [{ "line": ["Leidensweg10"], "city": "Specimendorf", "postalCode": "9876" }] } };

      service.update(entry).then(response => {
        expect(response.data.resourceType).toBe('Patient');
        expect(response.status).toBe(200);
        expect(response.data.id).toBe('46915');
        expect(response.data.meta.id.versionId).toBe('2');
        expect(response.data.meta.id.lastUpdated).toBe('2018-01-06T14:34:32.520+01:00');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46915`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      entry.resource.meta = {
        versionId: '2',
        lastUpdated: '2018-01-06T14:34:32.520+01:00'
      };
      req.flush(entry.resource, {
        headers: {
          'connection': 'close',
          'date': 'Sat, 06 Jan 2018 13:34:32 GMT',
          'x-powered-by': 'HAPI FHIR 3.1.0 REST Server (FHIR Server; FHIR 3.0.1/DSTU3)',
          'etag': 'W/\"2\"',
          'last-modified': 'Sat, 06 Jan 2018 13:34:32 GMT',
          'location': 'http://localhost:8080/baseDstu3/Patient/46915/_history/2',
          'content-type': 'application/json+fhir;charset=utf-8',
          'server': 'Jetty(9.4.z-SNAPSHOT)'
        }, status: 200, statusText: 'OK'
      });
    });
  });

  describe('#transaction', () => {
    it('should perform a transaction', () => {

      const entry: Entry = {
        debug: true,
        resource: {
          'resourceType': 'Bundle',
          'id': 'bundle-transaction',
          'meta': {
            'lastUpdated': '2014-08-18T01:43:30Z'
          },
          'type': 'transaction',
          'entry': [
            {
              'fullUrl': 'urn:uuid:61ebe359-bfdc-4613-8bf2-c5e300945f0a',
              'resource': {
                'resourceType': 'Patient',
                'text': {
                  'status': 'generated',
                  'div': '<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>'
                },
                'active': true,
                'name': [
                  {
                    'use': 'official',
                    'family': 'Muster',
                    'given': [
                      'Felix',
                      'Ulrich'
                    ]
                  }
                ],
                'gender': 'male',
                'birthDate': '1974-12-25'
              },
              'request': {
                'method': 'POST',
                'url': 'Patient'
              }
            }
          ]
        }
      };

      service.transaction(entry).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('6001d10d-047e-4d2a-a76a-f09c1ffc320c');
        expect(response.data.type).toBe('transaction-response');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "6001d10d-047e-4d2a-a76a-f09c1ffc320c", "type": "transaction-response", "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3" }], "entry": [{ "response": { "status": "201 Created", "location": "Patient/46924/_history/1", "etag": "1", "lastModified": "2018-01-06T15:25:48.357+01:00" } }] }

      req.flush(bundle, {
        headers: {
          'connection': 'close',
          'date': 'Sat, 06 Jan 2018 14:25:48 GMT',
          'x-powered-by': 'HAPI FHIR 3.1.0 REST Server (FHIR Server; FHIR 3.0.1/DSTU3)',
          'location': 'http://localhost:8080/baseDstu3/Bundle/6001d10d-047e-4d2a-a76a-f09c1ffc320c',
          'content-type': 'application/json+fhir;charset=utf-8',
          'server': 'Jetty(9.4.z-SNAPSHOT)'
        }, status: 200, statusText: 'OK'
      });
    });
  });


  describe('#search', () => {

    // tslint:disable-next-line
    const searchresult: IResource = { "resourceType": "Bundle", "id": "bd15a1c0-748b-409c-a71a-e09b6dbbabf8", "meta": { "lastUpdated": "2018-01-06T22:18:21.779+01:00" }, "type": "searchset", "total": 200, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/Observation?subject=Patient%2F47528" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Observation/47529", "resource": { "resourceType": "Observation", "id": "47529", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.342+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47530", "resource": { "resourceType": "Observation", "id": "47530", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.355+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47531", "resource": { "resourceType": "Observation", "id": "47531", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.363+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47532", "resource": { "resourceType": "Observation", "id": "47532", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.370+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47533", "resource": { "resourceType": "Observation", "id": "47533", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.380+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47534", "resource": { "resourceType": "Observation", "id": "47534", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.387+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47535", "resource": { "resourceType": "Observation", "id": "47535", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.395+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47536", "resource": { "resourceType": "Observation", "id": "47536", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.401+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47537", "resource": { "resourceType": "Observation", "id": "47537", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.408+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weightMeasured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47538", "resource": { "resourceType": "Observation", "id": "47538", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.414+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }] };
    // tslint:disable-next-line
    const searchnextresult: IResource = { "resourceType": "Bundle", "id": "561eda7d-ab70-48be-a334-62e1705b4bdc", "meta": { "lastUpdated": "2018-01-06T22:18:21.786+01:00" }, "type": "searchset", "total": 200, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=20&_count=10&_pretty=true&_bundletype=searchset" }, { "relation": "previous", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=0&_count=10&_pretty=true&_bundletype=searchset" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Observation/47539", "resource": { "resourceType": "Observation", "id": "47539", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.419+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47540", "resource": { "resourceType": "Observation", "id": "47540", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.425+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47541", "resource": { "resourceType": "Observation", "id": "47541", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.431+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47542", "resource": { "resourceType": "Observation", "id": "47542", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.437+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47543", "resource": { "resourceType": "Observation", "id": "47543", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.444+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47544", "resource": { "resourceType": "Observation", "id": "47544", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.449+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47545", "resource": { "resourceType": "Observation", "id": "47545", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.455+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47546", "resource": { "resourceType": "Observation", "id": "47546", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.461+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47547", "resource": { "resourceType": "Observation", "id": "47547", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.467+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47548", "resource": { "resourceType": "Observation", "id": "47548", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.473+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }] }
    // tslint:disable-next-line
    const searchprevresult: IResource = { "resourceType": "Bundle", "id": "1e4c68d5-bf8c-483f-88cc-de965a8f441e", "meta": { "lastUpdated": "2018-01-06T22:18:21.791+01:00" }, "type": "searchset", "total": 200, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=0&_count=10&_pretty=true&_bundletype=searchset" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Observation/47529", "resource": { "resourceType": "Observation", "id": "47529", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.342+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47530", "resource": { "resourceType": "Observation", "id": "47530", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.355+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47531", "resource": { "resourceType": "Observation", "id": "47531", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.363+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47532", "resource": { "resourceType": "Observation", "id": "47532", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.370+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47533", "resource": { "resourceType": "Observation", "id": "47533", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.380+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47534", "resource": { "resourceType": "Observation", "id": "47534", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.387+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47535", "resource": { "resourceType": "Observation", "id": "47535", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.395+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47536", "resource": { "resourceType": "Observation", "id": "47536", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.401+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47537", "resource": { "resourceType": "Observation", "id": "47537", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.408+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Observation/47538", "resource": { "resourceType": "Observation", "id": "47538", "meta": { "versionId": "1", "lastUpdated": "2018-01-06T22:18:20.414+01:00", "profile": ["http://hl7.org/fhir/StructureDefinition/bodyweight"] }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">72 kg</div>" }, "status": "final", "category": [{ "coding": [{ "system": "http://hl7.org/fhir/observation-category", "code": "vital-signs", "display": "Vital Signs" }] }], "code": { "coding": [{ "system": "http://loinc.org", "code": "29463-7", "display": "Body Weight" }, { "system": "http://loinc.org", "code": "3141-9", "display": "Body weight Measured" }, { "system": "http://snomed.info/sct", "code": "27113001", "display": "Body weight" }] }, "subject": { "reference": "Patient/47528" }, "effectiveDateTime": "2017-12-01", "valueQuantity": { "value": 72, "unit": "kg", "system": "http://unitsofmeasure.org", "code": "kg" } }, "search": { "mode": "match" } }] };

    it('should search for patients with a birthdate in 1974', () => {

      service.search({ type: 'Patient', query: { birthdate: 1974 } }).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('e55e2713-b0ac-474e-affb-00d745e2b073');
        expect(response.data.type).toBe('searchset');
        expect(response.data.total).toBe(66);
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient?birthdate=1974`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "e55e2713-b0ac-474e-affb-00d745e2b073", "meta": { "lastUpdated": "2018-01-06T15:41:26.456+01:00" }, "type": "searchset", "total": 66, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/Patient?birthdate=1974" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=4f8ab64f-df66-4184-8093-98271f655dee&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Patient/4953", "resource": { "resourceType": "Patient", "id": "4953", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:02:07.636+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4955", "resource": { "resourceType": "Patient", "id": "4955", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:04:59.076+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4957", "resource": { "resourceType": "Patient", "id": "4957", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:09:08.836+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4959", "resource": { "resourceType": "Patient", "id": "4959", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:09:59.726+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4961", "resource": { "resourceType": "Patient", "id": "4961", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:13:45.361+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4962", "resource": { "resourceType": "Patient", "id": "4962", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:22:14.431+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4964", "resource": { "resourceType": "Patient", "id": "4964", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:25:45.860+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4966", "resource": { "resourceType": "Patient", "id": "4966", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T16:26:33.928+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Chalmers", "given": ["Peter", "James"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/4968", "resource": { "resourceType": "Patient", "id": "4968", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T17:11:52.118+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5003", "resource": { "resourceType": "Patient", "id": "5003", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T09:48:22.053+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }] };

      req.flush(bundle);
      httpMock.verify();
    });

    it('should search for patients with an exact name', () => {

      service.search({ type: 'Patient', query: { name: { $and: [{ $exact: 'Muster' }, { $exact: 'Felix' }] } } }).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('5c0d355a-84f9-428f-a824-89e094cac8fd');
        expect(response.data.type).toBe('searchset');
        expect(response.data.total).toBe(58);
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient?name:exact=Muster&name:exact=Felix`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      // tslint:disable-next-line
      const bundle: IResource = { "resourceType": "Bundle", "id": "5c0d355a-84f9-428f-a824-89e094cac8fd", "meta": { "lastUpdated": "2018-01-06T15:54:31.544+01:00" }, "type": "searchset", "total": 58, "link": [{ "relation": "self", "url": "http://localhost:8080/baseDstu3/Patient?name%3Aexact=Muster&name%3Aexact=Felix" }, { "relation": "next", "url": "http://localhost:8080/baseDstu3?_getpages=10f7c8e6-c582-4ad1-8e92-05e5f0035229&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset" }], "entry": [{ "fullUrl": "http://localhost:8080/baseDstu3/Patient/4968", "resource": { "resourceType": "Patient", "id": "4968", "meta": { "versionId": "1", "lastUpdated": "2017-12-05T17:11:52.118+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5003", "resource": { "resourceType": "Patient", "id": "5003", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T09:48:22.053+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Somenarrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5005", "resource": { "resourceType": "Patient", "id": "5005", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T09:57:56.227+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5007", "resource": { "resourceType": "Patient", "id": "5007", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T10:04:15.365+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5009", "resource": { "resourceType": "Patient", "id": "5009", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T10:06:24.691+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5011", "resource": { "resourceType": "Patient", "id": "5011", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T10:37:43.283+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5013", "resource": { "resourceType": "Patient", "id": "5013", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T11:46:46.042+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Somenarrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5015", "resource": { "resourceType": "Patient", "id": "5015", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T11:47:11.300+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/5017", "resource": { "resourceType": "Patient", "id": "5017", "meta": { "versionId": "1", "lastUpdated": "2017-12-06T11:47:35.219+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }, { "fullUrl": "http://localhost:8080/baseDstu3/Patient/10003", "resource": { "resourceType": "Patient", "id": "10003", "meta": { "versionId": "1", "lastUpdated": "2017-12-07T18:39:53.275+01:00" }, "text": { "status": "generated", "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Some narrative</div>" }, "active": true, "name": [{ "use": "official", "family": "Muster", "given": ["Felix", "Ulrich"] }], "gender": "male", "birthDate": "1974-12-25" }, "search": { "mode": "match" } }] };
      req.flush(bundle);
      httpMock.verify();
    });


    it('should search for observations for a patient specified with an id', () => {

      service.search({ 'type': 'Observation', query: { 'subject': 'Patient/47126' } }).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('bd15a1c0-748b-409c-a71a-e09b6dbbabf8');
        expect(response.data.type).toBe('searchset');
        expect(response.data.total).toBe(200);
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Observation?subject=Patient%2F47126`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(searchresult);
      httpMock.verify();
    });

    it('next page of observations for previous search', () => {

      service.nextPage({ bundle: searchresult }).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('561eda7d-ab70-48be-a334-62e1705b4bdc');
        expect(response.data.type).toBe('searchset');
        expect(response.data.total).toBe(200);
      });

      // tslint:disable-next-line
      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=10&_count=10&_pretty=true&_bundletype=searchset`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(searchnextresult);
      httpMock.verify();
    });

    it('previous page of observations for previous search', () => {

      service.prevPage({ bundle: searchnextresult }).then(response => {
        expect(response.status).toBe(200);
        expect(response.data.resourceType).toBe('Bundle');
        expect(response.data.id).toBe('1e4c68d5-bf8c-483f-88cc-de965a8f441e');
        expect(response.data.type).toBe('searchset');
        expect(response.data.total).toBe(200);
      });

      // tslint:disable-next-line
      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}?_getpages=0f69d55b-d5ad-448f-b473-37f8a668ebe4&_getpagesoffset=0&_count=10&_pretty=true&_bundletype=searchset`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(searchprevresult);
      httpMock.verify();
    });

  });

  describe('#delete', () => {
    it('should delete a patient resource', () => {

      const entry: Entry = {
        resource: patientV1
      };

      service.delete(entry).then(response => {
        expect(response.data.resourceType).toBe('OperationOutcome');
      });

      const req = httpMock.expectOne(`${FHIR_JS_CONFIG.baseUrl}/Patient/46912`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      // tslint:disable-next-line
      const operationOutcome: IResource = {"resourceType":"OperationOutcome","text":{"status":"generated","div":"<div xmlns=\"http://www.w3.org/1999/xhtml\"><h1>Operation Outcome</h1><table border=\"0\"><tr><td style=\"font-weight: bold;\">INFORMATION</td><td>[]</td><td><pre>Successfully deleted 1 resource(s) in 9ms</pre></td>\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t</tr>\n\t\t</table>\n\t</div>"},"issue":[{"severity":"information","code":"informational","diagnostics":"Successfully deleted 1 resource(s) in 9ms"}]};

      req.flush(operationOutcome, {
        headers: {
          'connection': 'close',
          'date': 'Thu, 04 Jan 2018 09: 48: 32 GMT',
          'x-powered-by': 'HAPI FHIR 3.1.0 REST Server (FHIR Server; FHIR 3.0.1/DSTU3)',
          'etag': 'W/\"1\"',
          'last-modified': 'Thu,04 Jan 2018 09: 48: 32 GMT',
          'location': 'http://localhost:8080/baseDstu3/Patient/46912/_history/1',
          'content-type': 'application/json+fhir;charset=utf-8',
          'server': 'Jetty(9.4.z-SNAPSHOT)'
        }, status: 200, statusText: 'OK'
      });
    });
  });

  });
