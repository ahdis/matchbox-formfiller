import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ItemLabelComponent } from '../../questionnaire/item-label/item-label.component';
import { QuestionnaireItemGenericComponent } from './questionnaire-item-generic.component';
import { MatAutocompleteModule } from '@angular/material';

describe('QuestionnaireItemGenericComponent', () => {
  let component: QuestionnaireItemGenericComponent;
  let fixture: ComponentFixture<QuestionnaireItemGenericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnaireItemGenericComponent, ItemLabelComponent],
      imports: [
        MatAutocompleteModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireItemGenericComponent);
    component = fixture.componentInstance;
    component.level = 0;
    component.item = {
      linkId: 'order.number',
      text: 'Auftrags-Nummer',
      type: 'string',
    };
    component.formGroup = new FormGroup({});
    component.formParent = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
