/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {

  @Input() patient: fhir.Patient;

  constructor() { }

  ngOnInit() {
  }

}
