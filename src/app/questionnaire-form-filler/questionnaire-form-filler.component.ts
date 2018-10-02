import { Component, OnInit, SecurityContext } from '@angular/core';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.css']
})
export class QuestionnaireFormFillerComponent implements OnInit {

  formGroup: FormGroup;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;

  constructor(private questionaireFillerServer: QuestionnaireFillerService, private sanitizer: DomSanitizer) {
    this.formGroup = new FormGroup({});
    this.questionnaireResponse = this.questionaireFillerServer.getQuestionniareResponse();
  }

  ngOnInit() {
  }

  getQuestionnaire(): fhir.r4.Questionnaire {
    return this.questionaireFillerServer.getQuestionniare();
  }

  getQuestionnaireTitle(): string {
    const questionnaire = this.getQuestionnaire();
    if (questionnaire._title) {
      const xhtmlExtension = this.questionaireFillerServer.getExtension(questionnaire._title.extension,
        'http://hl7.org/fhir/StructureDefinition/rendering-xhtml');
      if (xhtmlExtension) {
        return this.sanitizer.sanitize(SecurityContext.HTML, xhtmlExtension.valueString);
      }
    }
    return questionnaire.title;
  }

  getQuestionnaireTitleStyles(): Object {
    const questionnaire = this.getQuestionnaire();
    const css = {};
    if (questionnaire._title) {
      return this.questionaireFillerServer.getCss(this.questionaireFillerServer.getExtension(questionnaire._title.extension,
        'http://hl7.org/fhir/StructureDefinition/rendering-style'));
    }
    return css;
  }

  onSubmit(): void {
    this.questionnaireResponse = this.questionaireFillerServer.getQuestionniareResponse();
  }



}
