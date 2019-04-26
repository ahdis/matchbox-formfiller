import { Component, OnInit } from '@angular/core';
import { FhirJsHttpService, IResource } from 'ng-fhirjs';

@Component({
  selector: 'app-capability-statement',
  templateUrl: './capability-statement.component.html',
  styleUrls: ['./capability-statement.component.css'],
})
export class CapabilityStatementComponent implements OnInit {
  bundle: IResource;

  constructor(private fhirHttpService: FhirJsHttpService) {
    fhirHttpService.conformance({ debug: true }).then(response => {
      this.bundle = response.data;
      console.log('called ');
    });
  }

  ngOnInit() {}
}
