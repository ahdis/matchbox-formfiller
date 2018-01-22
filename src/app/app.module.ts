import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';


import { AppComponent } from './app.component';
import { NgFhirjsModule } from 'ng-fhirjs';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { PatientsComponent } from './patients/patients.component';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://localhost:8080/baseDstu3',
  // baseUrl: 'http://test.fhir.org/r3',
  credentials: 'same-origin'
};

const routes: Routes = [
  {
    path: 'patients', component: PatientsComponent
  }];

@NgModule({
  declarations: [
    AppComponent,
    PatientsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgFhirjsModule,
    MatTableModule,
    MatPaginatorModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [{ provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG }],
  bootstrap: [AppComponent]
})
export class AppModule { }
