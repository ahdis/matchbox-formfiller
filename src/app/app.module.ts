import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { FHIR_HTTP_CONFIG, NgFhirjsModule } from 'ng-fhirjs';
import { HomeComponent } from './home/home.component';
import { PatientsComponent } from './patients/patients.component';
import { CapabilityStatementComponent } from './capability-statement/capability-statement.component';
import {
  FHIR_JS_CONFIG,
  SettingsComponent,
} from './settings/settings.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { QuestionnaireDetailComponent } from './questionnaire-detail/questionnaire-detail.component';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler/questionnaire-form-filler.component';

import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { FhirPathComponent } from './fhir-path/fhir-path.component';
import { MappingLanguageComponent } from './mapping-language/mapping-language.component';
import { SharedModule } from './shared/shared.module';
import { QuestionnaireItemModule } from './questionnaire-item/questionnaire-item.module';
import { SmartOnFhirPatientStandaloneComponent } from './smart-on-fhir-patient-standalone/smart-on-fhir-patient-standalone.component';
import {
  DefaultOAuthInterceptor,
  OAuthModule,
} from 'angular-oauth2-oidc-codeflow';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'fhirpath',
    component: FhirPathComponent,
  },
  {
    path: 'mappinglanguage',
    component: MappingLanguageComponent,
  },
  {
    path: 'patients',
    component: PatientsComponent,
  },
  {
    path: 'questionnaires',
    component: QuestionnairesComponent,
  },
  {
    path: 'questionnaire-form-filler',
    component: QuestionnaireFormFillerComponent,
  },
  {
    path: 'CapabilityStatement',
    component: CapabilityStatementComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'smartonfhirpatientstandalone',
    component: SmartOnFhirPatientStandaloneComponent,
  },
  {
    path: 'authorize',
    redirectTo: '/smartonfhirpatientstandalone',
    pathMatch: 'full',
  },
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    PatientsComponent,
    CapabilityStatementComponent,
    SettingsComponent,
    HomeComponent,
    PatientDetailComponent,
    QuestionnairesComponent,
    QuestionnaireDetailComponent,
    QuestionnaireFormFillerComponent,
    FhirPathComponent,
    MappingLanguageComponent,
    SmartOnFhirPatientStandaloneComponent,
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    NgFhirjsModule,
    QuestionnaireModule,
    QuestionnaireItemModule,
    RouterModule.forRoot(routes, { useHash: false }), // otherwise we hvave a problem with the redirect uri
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['https://launch.smarthealthit.org/v/r2/sim/'],
        sendAccessToken: true,
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    DefaultOAuthInterceptor,
    { provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
