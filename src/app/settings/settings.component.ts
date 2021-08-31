import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { Subscription } from 'rxjs';
import debug from 'debug';
import * as questionnaireRadiologyOrderDefaultResponse from '../../examples/radorder-qr-default.json';

// currently R4 only 'http://localhost:8080/baseDstu3',
// 'http://vonk.furore.com',
// 'http://fhirtest.uhn.ca/baseDstu3'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  fhirServers = [
    'https://test.ahdis.ch/matchbox-order/fhir',
    'https://test.ahdis.ch/r4',
    'http://test.ahdis.ch/r4',
    'http://localhost:8080/r4',
    'http://localhost:8080/r4',
    'http://localhost:8081/r4',
    'http://test.fhir.org/r4',
    'http://localhost:8080/matchbox-validator/fhir',
    'https://test.ahdis.ch/matchbox-validator/fhir',
    'https://hapi.fhir.org/baseR4',
    'http://hapi.fhir.org/baseR4',
  ];

  subscription: Subscription;
  baseUrl: string;

  constructor(private data: FhirConfigService) {}

  ngOnInit() {
    this.subscription = this.data.fhirMicroService.subscribe(
      (url) => (this.baseUrl = url)
    );
  }

  getSelectedValue(): string {
    return this.baseUrl;
  }

  setSelectedValue(value: string) {
    debug('setting new server to ' + value);
    this.data.changeFhirMicroService(value);
  }

  async setDefaultQuestionnaireResponseForRadOrder() {
    const existingQuestionnaireResponseBundle = await this.data
      .getFhirClient()
      .resourceSearch({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          questionnaire:
            'http://fhir.ch/ig/ch-rad-order/Questionnaire/QuestionnaireRadiologyOrder',
          identifier: 'http://ahdis.ch/fhir/Questionnaire|DEFAULT',
        },
      });

    const id = existingQuestionnaireResponseBundle?.entry?.[0]?.resource?.id;
    if (id) {
      await this.data.getFhirClient().update({
        id,
        resourceType: 'QuestionnaireResponse',
        body: {
          ...questionnaireRadiologyOrderDefaultResponse,
          id,
        },
      });
    } else {
      await this.data.getFhirClient().create({
        resourceType: 'QuestionnaireResponse',
        body: questionnaireRadiologyOrderDefaultResponse,
      });
    }
  }
}
