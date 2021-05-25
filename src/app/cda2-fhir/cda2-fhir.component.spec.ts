import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cda2FhirComponent } from './cda2-fhir.component';

describe('Cda2FhirComponent', () => {
  let component: Cda2FhirComponent;
  let fixture: ComponentFixture<Cda2FhirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Cda2FhirComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Cda2FhirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
