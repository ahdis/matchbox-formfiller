import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartOnFhirPatientStandaloneComponent } from './smart-on-fhir-patient-standalone.component';

describe('SmartOnFhirPatientStandaloneComponent', () => {
  let component: SmartOnFhirPatientStandaloneComponent;
  let fixture: ComponentFixture<SmartOnFhirPatientStandaloneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmartOnFhirPatientStandaloneComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartOnFhirPatientStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
