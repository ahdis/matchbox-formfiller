import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapabilityStatementComponent } from './capability-statement.component';
import { MatCardModule } from '@angular/material/card';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { FhirJsHttpService, FHIR_HTTP_CONFIG, FhirConfig } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://test.fhir.org/r3',
  credentials: 'same-origin',
};

describe('CapabilityStatementComponent', () => {
  let component: CapabilityStatementComponent;
  let fixture: ComponentFixture<CapabilityStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CapabilityStatementComponent],
      imports: [HttpClientTestingModule, MatCardModule],
      providers: [
        FhirJsHttpService,
        { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapabilityStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
