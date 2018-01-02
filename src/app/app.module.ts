import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent, FhirHttpService, FHIR_HTTP_CONFIG  } from './app.component';

export const FHIR_JS_CONFIG: FhirConfig = {
  baseUrl: 'http://localhost:8080/baseDstu3',
  credentials: 'same-origin'
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [FhirHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG }],
  bootstrap: [AppComponent]
})
export class AppModule { }
