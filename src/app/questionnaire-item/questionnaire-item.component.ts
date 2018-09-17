  /// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-questionnaire-item',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemComponent implements OnInit {

  @Input() item: fhir.QuestionnaireItem;
  @Input() level: number;
  @Input() formGroup: FormGroup;
  formControl: FormControl;

  constructor() { }

  ngOnInit() {
    console.log('setting form for: ' + this.item.linkId);
    let isRequired = false;
    if (this.item.required) {
      isRequired = true;
    }
    this.formControl = new FormControl(this.item._initialString || '', (isRequired ? Validators.required : undefined));
    this.formGroup.addControl(this.item.linkId, this.formControl);
  }

  getItemTypeIsGroup(): boolean {
    return ('group' === this.item.type);
  }

}
