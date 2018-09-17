import { Component, OnInit } from '@angular/core';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.css']
})
export class QuestionnaireFormFillerComponent implements OnInit {

  formGroup: FormGroup;
  questionnaireResponse: any;

  constructor(private questionaireFillerServer: QuestionnaireFillerService) {
    this.formGroup = new FormGroup({});
  }

  ngOnInit() {
  }

  getQuestionnaire(): fhir.Questionnaire {
    return this.questionaireFillerServer.getQuestionniare();
  }

  getQuestionnaireTitle(): string {
    return this.getQuestionnaire().title;
  }

  onSubmit(): void {
    this.questionnaireResponse = this.formGroup.value;
  }



}
