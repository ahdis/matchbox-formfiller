/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://localhost:8080/baseDstu3',
  credentials: 'same-origin'
};

describe('Utilities', () => {

  let injector: TestBed;
  let service: FhirJsHttpService;
  let httpMock: HttpTestingController;



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

  describe('#Patient with extension test, see https://www.hl7.org/fhir/patient-example-dicom.json.html', () => {
    it('extensions should be accessible with type defintions for fhir', () => {

        const patient: fhir.Patient = {
            'resourceType': 'Patient',
            'id': 'dicom',
            'text': {
              'status': 'generated',
              // tslint:disable-next-line:max-line-length
              'div': '<div xmlns=\"http://www.w3.org/1999/xhtml\"> Patient MINT_TEST, ID = MINT1234. Age = 56y, Size =\n      1.83m, Weight = 72.58kg </div>'
            },
            'extension': [
              {
                'url': 'http://nema.org/fhir/extensions#0010:1010',
                'valueQuantity': {
                  'value': 56,
                  'unit': 'Y'
                }
              },
              {
                'url': 'http://nema.org/fhir/extensions#0010:1020',
                'valueQuantity': {
                  'value': 1.83,
                  'unit': 'm'
                }
              },
              {
                'url': 'http://nema.org/fhir/extensions#0010:1030',
                'valueQuantity': {
                  'value': 72.58,
                  'unit': 'kg'
                }
              }
            ],
            'identifier': [
              {
                'system': 'http://nema.org/examples/patients',
                'value': 'MINT1234'
              }
            ],
            'active': true,
            'name': [
              {
                'family': 'MINT_TEST'
              }
            ],
            'gender': 'male',
            '_gender': {
              'extension': [
                {
                  'url': 'http://nema.org/examples/extensions#gender',
                  'valueCoding': {
                    'system': 'http://nema.org/examples/gender',
                    'code': 'M'
                  }
                }
              ]
            },
            'managingOrganization': {
              'reference': 'Organization/1'
            }
      };

      expect(patient.extension[0].valueQuantity.value).toBe(56);
      expect(patient._gender.extension[0].valueCoding.code).toBe('M');

      patient.extension[0].valueQuantity.value = 12;
      expect(patient.extension[0].valueQuantity.value).toBe(12);


    });
  });



  });
