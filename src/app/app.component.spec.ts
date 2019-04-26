import { async, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Routes } from '@angular/router';

import { FHIR_HTTP_CONFIG, FhirConfig, FhirJsHttpService } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
  //  baseUrl: 'http://localhost:8080/baseDstu3',
  //  baseUrl: 'http://test.fhir.org/r3',
  baseUrl: 'http://localhost:8080/baseDstu3',
  credentials: 'same-origin',
};

const routes: Routes = [];

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        RouterModule.forRoot(routes, { useHash: true }),
      ],
      providers: [
        FhirJsHttpService,
        { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG },
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'angular on fhir'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('angular on fhir');
  }));
});
