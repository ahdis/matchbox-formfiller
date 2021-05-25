import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fhir2CdaComponent } from './fhir2-cda.component';

describe('Fhir2CdaComponent', () => {
  let component: Fhir2CdaComponent;
  let fixture: ComponentFixture<Fhir2CdaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Fhir2CdaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Fhir2CdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
