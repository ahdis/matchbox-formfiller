import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-questionnaire-detail',
  templateUrl: './questionnaire-detail.component.html',
  styleUrls: ['./questionnaire-detail.component.css'],
})
export class QuestionnaireDetailComponent implements OnInit {
  @Input() questionnaire: fhir.r4.Questionnaire;

  constructor(
    private router: Router,
    private questionaireFillerServer: QuestionnaireFillerService
  ) {}

  ngOnInit() {}

  fillForm() {
    this.questionaireFillerServer.setQuestionnare(this.questionnaire);
    this.router.navigate(['/questionnaire-form-filler']);
  }
}
