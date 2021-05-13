import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { Subscription } from 'rxjs';
import debug from 'debug';

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
    'https://test.ahdis.ch/r4',
    'http://test.ahdis.ch/r4',
    'http://localhost:8080/r4',
    'http://test.fhir.org/r4',
    'https://test.ahdis.ch/hapi-fhir-jpavalidator/fhir',
    'http://test.ahdis.ch/hapi-fhir-jpavalidator/fhir',
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
}
