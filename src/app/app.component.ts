/// <reference path="../types/fhir.js/src/adapters/native/index.d.ts" />
/// <reference path="../types/fhir.js/index.d.ts" />
import { Component } from '@angular/core';
import { IFhir, Config, ResponseObj, Entry, IResource, ResourceType, ReadObj, VReadObj } from 'fhir.js';
import fhirAdapter = require('fhir.js/src/adapters/native');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private client: IFhir;

  private config: Config = {
           baseUrl: 'http://fhirtest.uhn.ca/baseDstu3',
    // baseUrl: 'http://localhost:8080/baseDstu3',
    credentials: 'same-origin'
  };

  title: 'ng-fhir-sample';
  clickMessage: string;
  fhirOutput: string;

  constructor() {
    this.client = fhirAdapter(this.config);
    this.clickMessage = '';
    this.fhirOutput = '';
}

  async testCreate() {
    try {

      console.log('Creating a the patient');
      const entry: Entry = {
          resource: {
            resourceType: 'Patient'
          }
        };
      entry.debug = true;
      const response = await this.client.create(entry);
      console.log(JSON.stringify(response));
      this.fhirOutput += ' success ' + JSON.stringify(response);
    } catch (error) {
      console.log('error');
      console.log(JSON.stringify(error));
      this.fhirOutput += ' error ' + JSON.stringify(error);
    }

  }

  onClickMe() {
    this.testCreate();
    this.clickMessage = 'testCreate called';
  }

}
