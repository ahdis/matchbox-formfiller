/// <reference path=".,/../../../fhir.r4/index.d.ts" />

import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-questionnaire-item',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemComponent implements OnInit {

  @Input() item: fhir.r4.QuestionnaireItem;
  @Input() level: number;
  @Input() formGroup: FormGroup;
  formControl: FormControl;


  constructor(private questionaireFillerServer: QuestionnaireFillerService) { }

  ngOnInit() {
    console.log('setting form for: ' + this.item.linkId);
    let isRequired = false;
    let initValue = '';
    if (this.item.required) {
       isRequired = true;
    }
    if (this.item.initial) {
      let set = false;
      for (const itemInitial of this.item.initial) {
        if (itemInitial.valueString) {
          initValue += itemInitial.valueString;
          set = true;
        }
      }
      if (!set) {
        console.log('initialValue not implemented yet for ' + JSON.stringify(this.item.initial));
      }
    }

    this.formControl = new FormControl(initValue, (isRequired ? Validators.required : undefined));
    this.formControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(term => {
        console.log('setting ' + this.item.linkId + ' to ' + term);
        this.questionaireFillerServer.setQuestionnaireResponseItem(this.item.linkId, term);
      });
    this.formGroup.addControl(this.item.linkId, this.formControl);
  }

  isEnabled(): boolean {
    if (this.item.enableWhen) {
      for (const itemEnabledWhen of this.item.enableWhen) {
        const answer = this.questionaireFillerServer.getQuestionnaireResponseItem(itemEnabledWhen.question);
        if (!answer) {
          return false;
        }
        if (itemEnabledWhen.operator === '=' ) {
          if (itemEnabledWhen.answerCoding) {
            if (itemEnabledWhen.answerCoding.code !== answer) {
              return false;
            }
          }
          /* 
          itemEnabledWhen.answerBoolean)
          ...... answerDecimal			decimal	
          ...... answerInteger			integer	
          ...... answerDate			date	
          ...... answerDateTime			dateTime	
          ...... answerTime			time	
          ...... answerString			string	
          ...... answerCoding			Coding	
          ...... answerQuantity			Quantity	
          ...... answerReference			Reference(Any)
          */
        } else {
          console.log('TODO: operator ' + itemEnabledWhen.operator + ' not implemented yet for item with linkedId ' + this.item.linkId);
        }
      }
    }
    return true;
  }

  getItemTypeIsGroup(): boolean {
    return ('group' === this.item.type);
  }

  getAnswerOptionValue(answerOption: fhir.r4.QuestionnaireItemAnswerOption): string {
    if (answerOption.valueString) {
      return answerOption.valueString;
    }
    if (answerOption.valueCoding) {
      return answerOption.valueCoding.code;
    }
  }

  getAnswerOptionDisplay(answerOption: fhir.r4.QuestionnaireItemAnswerOption): string {
    if (answerOption.valueString) {
      return answerOption.valueString;
    }
    if (answerOption.valueCoding) {
      return answerOption.valueCoding.display;
    }
  }

  getAnswerValueSetValue(concept: fhir.r4.ValueSetComposeIncludeConcept): string {
    return concept.code;
  }

  getAnswerValueSetDisplay(concept: fhir.r4.ValueSetComposeIncludeConcept): string {
    return concept.display;
  }

  getAnswerValueSet(): fhir.r4.ValueSetComposeInclude[] {
   return  this.questionaireFillerServer.getAnswerValueSetComposeIncludeConcepts(this.item.answerValueSet);
  }


}
