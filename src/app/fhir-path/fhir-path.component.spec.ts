import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FhirPathComponent } from './fhir-path.component';

describe('FhirPathComponent', () => {
  let component: FhirPathComponent;
  let fixture: ComponentFixture<FhirPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FhirPathComponent ]
    })
    .compileComponents();
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
