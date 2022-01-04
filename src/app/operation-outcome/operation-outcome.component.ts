import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-operation-outcome',
  templateUrl: './operation-outcome.component.html',
  styleUrls: ['./operation-outcome.component.scss'],
})
export class OperationOutcomeComponent implements OnInit {
  @Input() title: string;
  @Input() json: string;
  @Input() operationOutcome: fhir.r4.OperationOutcome;

  constructor() {}

  ngOnInit(): void {}

  getJson(): String {
    return this.json;
  }

  getLineFromExtension(issue: fhir.r4.OperationOutcomeIssue): string {
    if (issue.extension?.length > 0) {
      return 'L' + issue.extension[0].valueInteger;
    }
    return '';
  }

  getLocation(issue: fhir.r4.OperationOutcomeIssue): string {
    if (issue.location?.length > 0) {
      return issue.location[0];
    }
    return '';
  }
}
