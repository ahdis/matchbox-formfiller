import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireItemGenericComponent } from './questionnaire-item-generic.component';
import { ItemLabelComponent } from '../../questionnaire/item-label/item-label.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
} from '@angular/material';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('QuestionnaireItemGenericComponent', () => {
  let component: QuestionnaireItemGenericComponent;
  let fixture: ComponentFixture<QuestionnaireItemGenericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnaireItemGenericComponent, ItemLabelComponent],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatDatepickerModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatSliderModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
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
