import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { Subscription } from 'rxjs';
import debug from 'debug';
import { MatTableDataSource } from '@angular/material/table';
import { QuestionnaireTableEntry } from '../questionnaires-table/questionnaires-table.component';
import { QuestionnaireWithResponse } from '../questionnaire-item/types';
import * as R from 'ramda';
import Client from 'fhir-kit-client';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';

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
    'https://gazelle.ihe.net/matchbox/fhir',
    'https://ehealthsuisse.ihe-europe.net/matchbox/fhir',
    'https://hapi.fhir.org/baseR4',
    'http://hapi.fhir.org/baseR4',
    'http://tx.fhir.org/r4/',
    'http://test.fhir.org/r4',
    'https://test.ahdis.ch/mag-cara/fhir',
    'https://test.ahdis.ch/mag-pmp/fhir',
    'https://test.ahdis.ch/mag-bfh/fhir',
    'https://test.ahdis.ch/mag-test-emedo/fhir',
    'http://localhost:8080/matchbox/fhir',
    'http://localhost:9090/mag-pmp/fhir',
    'http://localhost:9090/mag-cara/fhir',
  ];

  mobileAccessGateways = [
    'https://test.ahdis.ch/mag-cara/fhir',
    'https://test.ahdis.ch/mag-pmp/fhir',
    'https://test.ahdis.ch/mag-bfh/fhir',
    'https://test.ahdis.ch/mag-test/fhir',
    'https://test.ahdis.ch/mag-test-emedo/fhir',
    'http://localhost:8080/matchbox/fhir',
    'http://localhost:9090/mag-pmp/fhir',
    'http://localhost:9090/mag-cara/fhir',
  ];

  subscriptionFhir: Subscription;
  baseUrlFhir: string;
  subscriptionMag: Subscription;
  baseUrlMag: string;

  client: Client;
  defaultQuestionnaireDataSource = new MatTableDataSource<
    QuestionnaireTableEntry<QuestionnaireWithResponse>
  >();

  constructor(private data: FhirConfigService, private router: Router) {
    this.client = data.getFhirClient();

    this.loadQuestionnaireResponses();
  }

  ngOnInit() {
    this.baseUrlFhir = this.data.getFhirMicroService();
    this.baseUrlMag = this.data.getMobileAccessGatewayService();
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

  async loadQuestionnaireResponses() {
    const questionnaireResponses: fhir.r4.QuestionnaireResponse[] = (await this.client
      .search({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          _summary: 'true',
          _sort: '-_lastUpdated',
          status: 'completed',
          identifier: 'http://ahdis.ch/fhir/Questionnaire|DEFAULT',
        },
      })
      .then(
        extractResourcesFromSearchBundle
      )) as fhir.r4.QuestionnaireResponse[];

    if (!questionnaireResponses.length) {
      return;
    }

    // load related Questionnaires
    const questionnaireUrls = R.uniq(
      questionnaireResponses.map(
        (questionnaireResponse) => questionnaireResponse.questionnaire
      )
    ).join(',');
    const linkedQuestionnaires: fhir.r4.Questionnaire[] = (await this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          url: questionnaireUrls,
        },
      })
      .then(extractResourcesFromSearchBundle)) as fhir.r4.Questionnaire[];

    this.defaultQuestionnaireDataSource.data = questionnaireResponses.map(
      (questionnaireResponse) => {
        const questionnaire = linkedQuestionnaires.find(
          ({ url }) => questionnaireResponse.questionnaire === url
        );
        return {
          title: questionnaire?.title,
          status: questionnaireResponse?.status,
          date: questionnaireResponse.meta?.lastUpdated,
          publisher: questionnaire?.publisher,
          version: questionnaireResponse.meta?.versionId,
          entry: {
            questionnaire,
            questionnaireResponse,
          },
        };
      }
    );
  }

  openDefaultQuestionnaireResponse({
    questionnaire,
    questionnaireResponse,
  }: QuestionnaireWithResponse) {
    this.router.navigate(['questionnaire', questionnaire.id], {
      queryParams: {
        questionnaireResponseId: questionnaireResponse.id,
        showHidden: true,
      },
    });
  }
}

const extractResourcesFromSearchBundle = (
  bundle: fhir.r4.OperationOutcome | fhir.r4.Bundle
): Promise<fhir.r4.Resource[]> =>
  bundle.resourceType !== 'Bundle'
    ? Promise.reject('Search failed')
    : Promise.resolve(
        (bundle as fhir.r4.Bundle)?.entry?.map(({ resource }) => resource) ?? []
      );
