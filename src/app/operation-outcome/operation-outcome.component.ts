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
}
