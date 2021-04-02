import { Component, OnInit } from '@angular/core';
import { FhirJsHttpService, FHIR_HTTP_CONFIG, FhirConfig } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://hapi.fhir.org/baseR4',
  credentials: 'same-origin',
};

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
    'http://localhost:8080/r4',
    'http://test.fhir.org/r4',
    'http://test.ahdis.ch/hapi-fhir-jpavalidator/fhir',
    'http://hapi.fhir.org/baseR4',
  ];

  constructor(private fhirHttpService: FhirJsHttpService) {}

  ngOnInit() {}

  getSelectedValue(): string {
    return FHIR_JS_CONFIG.baseUrl;
  }

  setSelectedValue(value: string) {
    FHIR_JS_CONFIG.baseUrl = value;
    this.fhirHttpService.updateConfig(FHIR_JS_CONFIG);
  }
}
