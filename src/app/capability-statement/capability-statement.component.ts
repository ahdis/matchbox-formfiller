import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import debug from 'debug';

@Component({
  selector: 'app-capability-statement',
  templateUrl: './capability-statement.component.html',
  styleUrls: ['./capability-statement.component.scss'],
})
export class CapabilityStatementComponent implements OnInit {
  capabilitystatement: fhir.r4.CapabilityStatement;

  constructor(private data: FhirConfigService) {
    const client = data.getFhirClient();
    client.capabilityStatement().then((data: fhir.r4.CapabilityStatement) => {
      this.capabilitystatement = data;
    });
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
