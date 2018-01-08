import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FHIR_HTTP_CONFIG, FhirJsHttpService } from './fhir-js-http.service';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://localhost:8080/baseDstu3',
  credentials: 'same-origin'
};

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
  ],
  providers: [FhirJsHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}],
})
export class NgFhirjsModule { }
