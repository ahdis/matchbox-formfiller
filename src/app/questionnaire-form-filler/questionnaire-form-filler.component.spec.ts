import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler.component';
import { QuestionnaireItemComponent } from '../questionnaire-item/questionnaire-item.component';
import { QuestionnaireDemo } from '../home/questionnaire-demo';

describe('QuestionnaireFormFillerComponent', () => {
  let component: QuestionnaireFormFillerComponent;
  let fixture: ComponentFixture<QuestionnaireFormFillerComponent>;

  const questionnaireFillerServer: Partial<QuestionnaireFillerService> = new QuestionnaireFillerService();
  questionnaireFillerServer.setQuestionnare(QuestionnaireDemo.questionnaireEbida);


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnaireFormFillerComponent, QuestionnaireItemComponent],
      imports: [
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserAnimationsModule
      ],
      providers: [{ provide: QuestionnaireFillerService, useValue: questionnaireFillerServer }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireFormFillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
