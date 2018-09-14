  /// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-questionnaire-item',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemComponent implements OnInit {

  @Input() item: fhir.QuestionnaireItem;
  @Input() level: number;

  constructor() { }

  ngOnInit() {
  }

  getItemTypeIsGroup(): boolean {
    return ('group' === this.item.type);
  }

}
