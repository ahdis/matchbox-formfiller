import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FhirPathComponent } from './fhir-path.component';

describe('FhirPathComponent', () => {
  let component: FhirPathComponent;
  let fixture: ComponentFixture<FhirPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FhirPathComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
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
