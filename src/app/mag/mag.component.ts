import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';

@Component({
  selector: 'app-mag',
  templateUrl: './mag.component.html',
  styleUrls: ['./mag.component.scss'],
})
export class MagComponent implements OnInit {
  capabilitystatement: fhir.r4.CapabilityStatement;
  client: FhirClient;

  constructor(private data: FhirConfigService) {
    this.client = data.getMobileAccessGatewayClient();
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
