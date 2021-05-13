import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FHIR_HTTP_CONFIG, NgFhirjsModule } from 'ng-fhirjs';
import { AppComponent } from './app.component';
import { CapabilityStatementComponent } from './capability-statement/capability-statement.component';
import { FhirPathComponent } from './fhir-path/fhir-path.component';
import { HomeComponent } from './home/home.component';
import { MappingLanguageComponent } from './mapping-language/mapping-language.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientsComponent } from './patients/patients.component';
import { QuestionnaireDetailComponent } from './questionnaire-detail/questionnaire-detail.component';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler/questionnaire-form-filler.component';
import { QuestionnaireItemModule } from './questionnaire-item/questionnaire-item.module';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from './shared/shared.module';
import { IgsComponent } from './igs/igs.component';

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
    path: 'questionnaire/:id',
    component: QuestionnaireFormFillerComponent,
  },
  {
    path: 'CapabilityStatement',
    component: CapabilityStatementComponent,
  },
  {
    path: 'igs',
    component: IgsComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
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
    IgsComponent,
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    NgFhirjsModule,
    QuestionnaireItemModule,
    RouterModule.forRoot(routes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
