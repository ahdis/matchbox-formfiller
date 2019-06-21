/// <reference path="../../../fhir.r4/index.d.ts" />

import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { QuestionnaireFillerService } from '../../questionnaire-filler.service';

@Component({
  selector: 'app-questionnaire-item-generic',
  templateUrl: './questionnaire-item-generic.component.html',
  styleUrls: ['./questionnaire-item-generic.component.scss'],
})
export class QuestionnaireItemGenericComponent implements OnInit {
  @Input() item: fhir.r4.QuestionnaireItem;
  @Input() level: number;
  @Input() formParent: FormGroup;

  formControl: AbstractControl;

  isRequired: boolean;
  isGroup: boolean;
  itemControlCode?: string;
  answerOptions: {
    readonly value: string;
    readonly display: string;
    readonly initialSelected: boolean;
  }[] = [];

  isDraggingFileOverDropZone = false;

  constructor(private questionaireFillerServer: QuestionnaireFillerService) {}

  ngOnInit() {
    console.log('setting form for: ' + this.item.linkId);
    this.isRequired = !!this.item.required;
    this.isGroup = this.item.type === 'group';
    this.itemControlCode = this.getItemControlCode();
    let initValue = '';
    const canHaveMultipleAnswers = this.itemControlCode === 'check-box';
    const hasAnswerOptions =
      this.item.type === 'choice' || this.item.type === 'open-choice';
    const validators = [];
    if (this.isRequired) {
      validators.push(Validators.required);
    }
    if (typeof this.item.maxLength === 'number') {
      validators.push(Validators.maxLength(this.item.maxLength));
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

    if (hasAnswerOptions) {
      if (Array.isArray(this.item.answerOption)) {
        this.answerOptions = this.item.answerOption.map(option => ({
          value: this.getAnswerOptionValue(option),
          display: this.getAnswerOptionDisplay(option),
          initialSelected: !!option.initialSelected,
        }));
      } else if (Array.isArray(this.getAnswerValueSet())) {
        this.answerOptions = this.getAnswerValueSet().map(concept => ({
          value: this.getAnswerValueSetValue(concept),
          display: this.getAnswerValueSetDisplay(concept),
          initialSelected: false,
        }));
      }
    }

    if (this.isGroup) {
      this.formControl = new FormGroup({});
    } else if (canHaveMultipleAnswers) {
      const initialFormControls = hasAnswerOptions
        ? this.answerOptions.map(
            option => new FormControl(option.initialSelected)
          )
        : [];
      this.formControl = new FormArray(
        initialFormControls,
        this.isRequired
          ? [
              (control: AbstractControl) =>
                (Array.isArray(control.value) ? control.value : []).some(
                  value => !!value
                )
                  ? null
                  : { required: 'This field is required.' },
            ]
          : []
      );
    } else if (this.hasFhirPathExpression()) {
      this.formControl = new FormControl({ initValue, disabled: false });
      this.formParent.valueChanges.pipe(debounceTime(300)).subscribe(term => {
        console.log('calculating' + this.item.linkId);
        const calculatedValue = this.questionaireFillerServer.evaluateFhirPath(
          this.getFhirPathExpression()
        );
        if (calculatedValue) {
          this.formControl.reset({ value: calculatedValue, disabled: true });
        }
      });
    } else {
      this.formControl = new FormControl(initValue, validators);
    }

    if (!this.isGroup) {
      this.formControl.valueChanges
        .pipe(
          debounceTime(200),
          distinctUntilChanged()
        )
        .subscribe(values => {
          const answerValues = !canHaveMultipleAnswers
            ? [values]
            : hasAnswerOptions
            ? this.answerOptions
                .filter((_, index) => values[index])
                .map(({ value }) => value)
            : values;

          console.log('setting ' + this.item.linkId + ' to ' + answerValues);
          this.questionaireFillerServer.setQuestionnaireResponseItem(
            this.item,
            answerValues
          );
        });
    }

    // Add control asynchronous to prevent ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() =>
      this.formParent.addControl(this.item.linkId, this.formControl)
    );
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

  getItemControlCode(): string {
    const itemControlExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
    );
    return itemControlExtension &&
      itemControlExtension.valueCodeableConcept.coding[0].system ===
        'http://hl7.org/fhir/questionnaire-item-control'
      ? itemControlExtension.valueCodeableConcept.coding[0].code
      : undefined;
  }

  showAsSlider(): boolean {
    return this.itemControlCode === 'slider';
  }

  getChoiceOrientation(): string {
    const choiceOrientationExtension = this.questionaireFillerServer.getExtension(
      this.item.extension,
      'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation'
    );
    return choiceOrientationExtension && choiceOrientationExtension.valueCode;
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

  getAnswerValueSet(): fhir.r4.ValueSetComposeIncludeConcept[] {
    return this.questionaireFillerServer.getAnswerValueSetComposeIncludeConcepts(
      this.item.answerValueSet
    );
  }

  private attachements = [];

  onDrop(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    this.isDraggingFileOverDropZone = false;
    this.dragCounter = 0;

    const files = ev.target.files || ev.dataTransfer.items;

    if (files) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < files.length; i++) {
        // If dropped items aren't files, reject them
        if (files[i].kind === undefined || files[i].kind === 'file') {
          var file = files[i].getAsFile ? files[i].getAsFile() : files[i];
          console.log('... file[' + i + '].name = ' + file.name);
          console.log(file);
          const attachment: fhir.r4.Attachment = {
            size: file.size,
            title: file.name,
            contentType: file.type,
          };
          this.getBase64(file).then((encodedData: string) => {
            console.log(this.attachements);
            attachment.data = encodedData;
            this.attachements.push(attachment);
            this.updateAttachments();
          });
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < files.length; i++) {
        console.log('... file[' + i + '].name = ' + files.files[i].name);
      }
    }
  }

  private updateAttachments() {
    this.questionaireFillerServer.setQuestionnaireResponseItem(
      this.item,
      this.attachements
    );
  }

  removeAttachment(index) {
    this.attachements.splice(index, 1);
    this.updateAttachments();
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  onFileChange(ev) {}

  private dragCounter = 0;

  onDragOver(ev) {
    ev.preventDefault();
  }

  onDragEnter() {
    this.isDraggingFileOverDropZone = true;
    this.dragCounter++;
  }

  onDragLeave(e) {
    console.log(e);
    this.dragCounter--;
    if (this.dragCounter < 1) {
      this.isDraggingFileOverDropZone = false;
    }
  }
}
