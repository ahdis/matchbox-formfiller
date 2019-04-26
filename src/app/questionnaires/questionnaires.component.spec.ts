import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnairesComponent } from './questionnaires.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionnaireDetailComponent } from '../questionnaire-detail/questionnaire-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FHIR_HTTP_CONFIG, FhirConfig, FhirJsHttpService } from 'ng-fhirjs';
import { RouterTestingModule } from '@angular/router/testing';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://test.fhir.org/r3',
  credentials: 'same-origin',
};

describe('QuestionnairesComponent', () => {
  let component: QuestionnairesComponent;
  let fixture: ComponentFixture<QuestionnairesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnairesComponent, QuestionnaireDetailComponent],
      imports: [
        MatCardModule,
        MatPaginatorModule,
        MatSelectModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        FhirJsHttpService,
        { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
