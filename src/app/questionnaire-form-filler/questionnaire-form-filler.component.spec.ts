import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatSelectModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatRadioModule,
  MatDatepickerModule,
  MatSliderModule,
  MatNativeDateModule,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionnaireDemo } from '../home/questionnaire-demo';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import { QuestionnaireItemGenericComponent } from '../questionnaire-item/questionnaire-item-generic/questionnaire-item-generic.component';
import { ItemLabelComponent } from '../questionnaire/item-label/item-label.component';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler.component';

describe('QuestionnaireFormFillerComponent', () => {
  let component: QuestionnaireFormFillerComponent;
  let fixture: ComponentFixture<QuestionnaireFormFillerComponent>;

  const questionnaireFillerServer: Partial<
    QuestionnaireFillerService
  > = new QuestionnaireFillerService({
    evaluate() {},
  });
  questionnaireFillerServer.setQuestionnare(
    QuestionnaireDemo.getQuestionnaireEbida()
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        QuestionnaireFormFillerComponent,
        QuestionnaireItemGenericComponent,
        ItemLabelComponent,
      ],
      imports: [
        MatInputModule,
        MatRadioModule,
        MatDatepickerModule,
        MatSelectModule,
        MatSliderModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: QuestionnaireFillerService,
          useValue: questionnaireFillerServer,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
