import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirPathComponent } from './fhir-path.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FhirPathComponent', () => {
  let component: FhirPathComponent;
  let fixture: ComponentFixture<FhirPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FhirPathComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FhirPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
