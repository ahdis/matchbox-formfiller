import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgFhirjsModule } from './modules/ng-fhirjs/ng-fhirjs.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgFhirjsModule
  ],
//  providers: [FhirJsHttpService, { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG}],
  bootstrap: [AppComponent]
})
export class AppModule { }
