import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { Subscription } from 'rxjs';
import debug from 'debug';
import * as questionnaireRadiologyOrderJson from '../../examples/radorder.json';
import * as questionnaireRadiologyOrderDefaultResponse from '../../examples/radorder-qr-default.json';
import * as placerOrderIdentifierJson from '../../examples/placer-order-identifier.json';
import * as incomingBundleJson from '../../examples/bundle-incoming.json';
import * as outgoingBundleJson from '../../examples/bundle-outgoing.json';

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
    'https://test.ahdis.ch/matchbox/fhir',
    'http://localhost:8080/matchbox/fhir',
    'https://ehealthsuisse.ihe-europe.net/matchbox-validator/fhir',
    'https://hapi.fhir.org/baseR4',
    'http://hapi.fhir.org/baseR4',
    'http://tx.fhir.org/r4/',
    'http://test.fhir.org/r4',
    'https://test.ahdis.ch/mag-pmp/fhir',
    'http://localhost:9090/mag-pmp/fhir',
  ];

  mobileAccessGateways = [
    'https://test.ahdis.ch/mag-pmp/fhir',
    'http://localhost:9090/mag-pmp/fhir',
    'https://test.ahdis.ch/mag-bfh/fhir',
    'https://test.ahdis.ch/mag-test/fhir',
    'https://test.ahdis.ch/mag-testemedo/fhir',
  ];

  subscriptionFhir: Subscription;
  baseUrlFhir: string;
  subscriptionMag: Subscription;
  baseUrlMag: string;

  constructor(private data: FhirConfigService) {}

  ngOnInit() {
    this.subscriptionFhir = this.data.fhirMicroService.subscribe(
      (url) => (this.baseUrlFhir = url)
    );
    this.subscriptionMag = this.data.magMicroService.subscribe(
      (url) => (this.baseUrlMag = url)
    );
  }

  getFhirSelectedValue(): string {
    return this.baseUrlFhir;
  }

  setFhirSelectedValue(value: string) {
    debug('setting new server to ' + value);
    this.data.changeFhirMicroService(value);
  }

  getMagSelectedValue(): string {
    return this.baseUrlMag;
  }

  setMagSelectedValue(value: string) {
    debug('setting new server to ' + value);
    this.data.changeMagMicroService(value);
  }

  async setRadOrderQuestionnaire() {
    const questionnaireRadiologyOrder = questionnaireRadiologyOrderJson as any;
    await this.createOrUpdateResource(
      'Questionnaire',
      {
        _id: questionnaireRadiologyOrder.id,
      },
      questionnaireRadiologyOrder
    );
  }

  async setDefaultQuestionnaireResponseForRadOrder() {
    const response = questionnaireRadiologyOrderDefaultResponse as any;
    await this.createOrUpdateResource(
      'QuestionnaireResponse',
      {
        questionnaire: response.questionnaire,
        identifier: `${response.identifier[0].system}|${response.identifier[0].value}`,
      },
      response
    );
  }

  async setPlacerOrderIdentifier() {
    const placerOrderIdentifier = placerOrderIdentifierJson as any;
    await this.createOrUpdateResource(
      'Basic',
      {
        code: `${placerOrderIdentifier.code.coding[0].system}|${placerOrderIdentifier.code.coding[0].code}`,
      },
      placerOrderIdentifier
    );
  }

  async setIncomingBundleExample() {
    const incomingBundle = incomingBundleJson as any;
    await this.createOrUpdateResource(
      'Bundle',
      {
        _id: incomingBundle.id,
      },
      incomingBundle
    );
  }

  async setOutgoingBundleExample() {
    const outgoingBundle = outgoingBundleJson as any;
    await this.createOrUpdateResource(
      'Bundle',
      {
        _id: outgoingBundle.id,
      },
      outgoingBundle
    );
  }

  private async createOrUpdateResource(
    resourceType: string,
    searchParams: {
      [key: string]:
        | string
        | number
        | boolean
        | Array<string | number | boolean>;
    },
    body: any
  ) {
    const bundle = await this.data.getFhirClient().resourceSearch({
      resourceType,
      searchParams,
    });

    const id = bundle?.entry?.[0]?.resource?.id;
    if (id) {
      await this.data.getFhirClient().update({
        id,
        resourceType,
        body: {
          ...body,
          id,
        },
      });
    } else {
      await this.data.getFhirClient().create({
        resourceType,
        body,
      });
    }
  }
}
