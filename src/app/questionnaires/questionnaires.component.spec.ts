import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { FhirConfig, FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { QuestionnaireDetailComponent } from '../questionnaire-detail/questionnaire-detail.component';
import { QuestionnairesComponent } from './questionnaires.component';
import { MatTableModule } from '@angular/material';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://test.fhir.org/r3',
  credentials: 'same-origin',
};

describe('QuestionnairesComponent', () => {
  let component: QuestionnairesComponent;
  let fixture: ComponentFixture<QuestionnairesComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [QuestionnairesComponent, QuestionnaireDetailComponent],
        imports: [
          MatTableModule,
          FormsModule,
          ReactiveFormsModule,
          NoopAnimationsModule,
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [
          FhirJsHttpService,
          { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
