/// <reference path=".,/../../../fhir.r4/index.d.ts" />

import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-questionnaire-item',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css'],
})
export class QuestionnaireItemComponent implements OnInit {
  @Input() item: fhir.r4.QuestionnaireItem;
  @Input() level: number;
  @Input() formGroup: FormGroup;
  @Input() formParent: FormGroup;
  formControl: FormControl;

  constructor(
    private questionaireFillerServer: QuestionnaireFillerService,
    private sanitizer: DomSanitizer
  ) {}

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
        console.log(
          'initialValue not implemented yet for ' +
            JSON.stringify(this.item.initial)
        );
      }
    }

    if (this.hasFhirPathExpression()) {
      this.formControl = new FormControl({ initValue, disabled: false });
    } else {
      this.formControl = new FormControl(
        initValue,
        isRequired ? Validators.required : undefined
      );
    }
    this.formControl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(term => {
        console.log('setting ' + this.item.linkId + ' to ' + term);
        this.questionaireFillerServer.setQuestionnaireResponseItem(
          this.item,
          term
        );
      });
    this.formGroup.addControl(this.item.linkId, this.formControl);

    if (this.hasFhirPathExpression()) {
      this.formParent.valueChanges.pipe(debounceTime(300)).subscribe(term => {
        console.log('calculating' + this.item.linkId);
        const calculatedValue = this.questionaireFillerServer.evaluateFhirPath(
          this.getFhirPathExpression()
        );
        if (calculatedValue) {
          this.formControl.reset({ value: calculatedValue, disabled: true });
        }
      });
    }
  }

  isEnabled(): boolean {
    if (this.item.enableWhen) {
      for (const itemEnabledWhen of this.item.enableWhen) {
        const answer = this.questionaireFillerServer.getQuestionnaireResponseItem(
          itemEnabledWhen
        );
        if (!answer) {
          return false;
        }
        if (itemEnabledWhen.operator === '=') {
          if (itemEnabledWhen.answerCoding) {
            if (itemEnabledWhen.answerCoding.code !== answer.valueCoding.code) {
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
          console.log(
            'TODO: operator ' +
              itemEnabledWhen.operator +
              ' not implemented yet for item with linkedId ' +
              this.item.linkId
          );
        }
      }
    }
    return true;
  }

  isHidden(): boolean {
    const xhtmlExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
    );
    return xhtmlExtension && xhtmlExtension.valueBoolean;
  }

  showAsSlider(): boolean {
    const sliderExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
    );
    return (
      sliderExtension &&
      sliderExtension.valueCodeableConcept.coding[0].system ===
        'http://hl7.org/fhir/questionnaire-item-control' &&
      sliderExtension.valueCodeableConcept.coding[0].code === 'slider'
    );
  }

  getSliderStepValue(): number {
    const sliderExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-sliderStepValue'
    );
    if (sliderExtension) {
      return sliderExtension.valueInteger;
    }
    return undefined;
  }

  getMinValue(): number {
    const minExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/minValue'
    );
    if (minExtension) {
      return minExtension.valueInteger;
    }
    return undefined;
  }

  getMaxValue(): number {
    const maxExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/maxValue'
    );
    if (maxExtension) {
      return maxExtension.valueInteger;
    }
    return undefined;
  }

  getUnit(): string {
    const unitExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
    );
    if (unitExtension) {
      return unitExtension.valueCoding.code;
    }
  }

  getFhirPathExpressionExtension(): fhir.r4.Extension {
    const fhirPathExpression = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-calculatedExpression'
    );
    if (
      fhirPathExpression &&
      fhirPathExpression.valueExpression &&
      fhirPathExpression.valueExpression.language &&
      fhirPathExpression.valueExpression.language === 'text/fhirpath'
    ) {
      return fhirPathExpression;
    }
    return undefined;
  }

  hasFhirPathExpression(): boolean {
    return this.getFhirPathExpressionExtension() !== undefined;
  }

  getFhirPathExpression(): string {
    return this.getFhirPathExpressionExtension().valueExpression.expression;
  }

  getItemTypeIsGroup(): boolean {
    return 'group' === this.item.type;
  }

  getAnswerOptionValue(
    answerOption: fhir.r4.QuestionnaireItemAnswerOption
  ): string {
    if (answerOption.valueString) {
      return answerOption.valueString;
    }
    if (answerOption.valueCoding) {
      return answerOption.valueCoding.code;
    }
  }

  getAnswerOptionDisplay(
    answerOption: fhir.r4.QuestionnaireItemAnswerOption
  ): string {
    if (answerOption.valueString) {
      return answerOption.valueString;
    }
    if (answerOption.valueCoding) {
      return answerOption.valueCoding.display;
    }
  }

  getAnswerValueSetValue(
    concept: fhir.r4.ValueSetComposeIncludeConcept
  ): string {
    return concept.code;
  }

  getAnswerValueSetDisplay(
    concept: fhir.r4.ValueSetComposeIncludeConcept
  ): string {
    return concept.display;
  }

  getAnswerValueSet(): fhir.r4.ValueSetComposeInclude[] {
    return this.questionaireFillerServer.getAnswerValueSetComposeIncludeConcepts(
      this.item.answerValueSet
    );
  }

  getErrorMessage(): string {
    return 'Is required (or or other error';
  }
}
