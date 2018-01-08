import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgFhirjsModule } from './modules/ng-fhirjs/ng-fhirjs.module';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from './modules/ng-fhirjs/fhir-js-http.service';

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
    HttpClientModule,
    NgFhirjsModule
  ],
  providers: [{ provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}],
  bootstrap: [AppComponent]
})
export class AppModule { }
