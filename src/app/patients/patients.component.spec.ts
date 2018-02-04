import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsComponent } from './patients.component';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule} from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://test.fhir.org/r3',
  credentials: 'same-origin'
};

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture: ComponentFixture<PatientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientsComponent ],
      imports: [HttpClientTestingModule, MatCardModule, MatPaginatorModule, MatSelectModule, MatTableModule],
      providers: [FhirJsHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}]    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
