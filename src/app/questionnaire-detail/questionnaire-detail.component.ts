/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-questionnaire-detail',
  templateUrl: './questionnaire-detail.component.html',
  styleUrls: ['./questionnaire-detail.component.css']
})
export class QuestionnaireDetailComponent implements OnInit {


  @Input() questionnaire: fhir.Questionnaire;

  constructor() { }

  ngOnInit() {
  }

}
