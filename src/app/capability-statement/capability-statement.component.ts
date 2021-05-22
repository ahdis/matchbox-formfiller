import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';

import debug from 'debug';

@Component({
  selector: 'app-capability-statement',
  templateUrl: './capability-statement.component.html',
  styleUrls: ['./capability-statement.component.scss'],
})
export class CapabilityStatementComponent implements OnInit {
  capabilitystatement: fhir.r4.CapabilityStatement;
  client: FhirClient;

  constructor(private data: FhirConfigService) {
    this.client = data.getFhirClient();
    this.client
      .capabilityStatement()
      .then((data: fhir.r4.CapabilityStatement) => {
        this.capabilitystatement = data;
      });
  }

  getJson(): string {
    return JSON.stringify(this.capabilitystatement, null, 2);
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
