import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';

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
  client: FhirClient;

  constructor(private data: FhirConfigService) {
    this.client = new FhirClient({ baseUrl: data.getFhirMicroService() });
    this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          _sort: 'title',
        },
      })
      .then(
        (response: fhir.r4.Bundle) =>
          (this.newOrderDataSource.data = [
            ...localDataSource,
            ...response.entry,
          ])
      );
  }
}
