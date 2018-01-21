import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgFhirjsModule } from 'ng-fhirjs';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';

export const FHIR_JS_CONFIG: FhirConfig = {
//  baseUrl: 'http://localhost:8080/baseDstu3',
baseUrl: 'http://test.fhir.org/r3',
credentials: 'same-origin'
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgFhirjsModule
  ],
  providers: [{ provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}],
  bootstrap: [AppComponent]
})
export class AppModule { }
