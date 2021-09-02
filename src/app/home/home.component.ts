import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';
import { Router } from '@angular/router';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import * as R from 'ramda';

const localDataSource = [
  {
    id: 'radiology-order',
    title: 'Questionnaire Radiology Order (local version)',
    status: 'active',
    date: '2021-02-24',
    publisher: 'HL7 Switzerland',
    version: '0.1.0',
  },
];
export type LocalQuestionnaire = typeof localDataSource[0];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  newOrderDataSource = new MatTableDataSource<
    LocalQuestionnaire | fhir.r4.BundleEntry
  >(localDataSource);
  openOrderDataSource = new MatTableDataSource<fhir.r4.BundleEntry>();
  client: FhirClient;

  constructor(
    private data: FhirConfigService,
    private router: Router,
    private questionnaireFillerServer: QuestionnaireFillerService
  ) {
    this.client = new FhirClient({ baseUrl: data.getFhirMicroService() });
    this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          _sort: 'title',
        },
      })
      .then((e) => (console.log(e), e))
      .then(
        (response: fhir.r4.Bundle) =>
          (this.newOrderDataSource.data = [
            ...localDataSource,
            ...response.entry,
          ])
      );
    this.client
      .search({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          _summary: 'true',
        },
      })
      .then((bundle) =>
        bundle.entry.map((entry: fhir.r4.BundleEntry) => entry.resource)
      )
      .then((questionnaireResponses: fhir.r4.QuestionnaireResponse[]) => {
        if (!questionnaireResponses.length) {
          return;
        }
        // load related Questionnaires
        const questionnaireUrls = R.uniq(
          questionnaireResponses.map(
            (questionnaireResponse) => questionnaireResponse.questionnaire
          )
        ).join(',');
        this.client
          .search({
            resourceType: 'Questionnaire',
            searchParams: {
              url: questionnaireUrls,
            },
          })
          .then((bundle) =>
            bundle.entry.map((entry: fhir.r4.BundleEntry) => entry.resource)
          )
          .then((linkedQuestionnaires: fhir.r4.Questionnaire[]) => {
            questionnaireResponses.map((questionnaireResponse) => {
              const linkedQuestionnaire = linkedQuestionnaires.find(
                ({ url }) => questionnaireResponse.questionnaire === url
              );
              return [questionnaireResponse, linkedQuestionnaire];
            }); // TODO Show relevant information in open orders table
          });
        this.openOrderDataSource.data = questionnaireResponses;
      });
  }

  openQuestionnaire(entry: LocalQuestionnaire | fhir.r4.BundleEntry) {
    if (!('resource' in entry)) {
      this.router.navigate(['questionnaire', entry.id]);
      return;
    }
    this.client
      .read({ resourceType: 'Questionnaire', id: entry.resource.id })
      .then((response: fhir.r4.Questionnaire) => {
        this.questionnaireFillerServer.setQuestionnare(response);
        this.router.navigate(['questionnaire', '-1']);
      });
  }

  openQuestionnaireResponse() {
    // TODO
  }
}
