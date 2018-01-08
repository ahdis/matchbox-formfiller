import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FHIR_HTTP_CONFIG, FhirJsHttpService } from './fhir-js-http.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
  ],
  providers: [FhirJsHttpService],
})
export class NgFhirjsModule { }
