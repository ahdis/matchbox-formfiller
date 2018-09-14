import { Component, OnInit } from '@angular/core';
import { QuestionnaireDemo } from './questionnaire-demo';
import { Router } from '@angular/router';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private questionaireFillerServer: QuestionnaireFillerService) { }

  ngOnInit() {
  }

  fillForm() {
    this.questionaireFillerServer.setQuestionnare(QuestionnaireDemo.questionnaireEbida);
    this.router.navigate(['/questionnaire-form-filler']);
  }


}
