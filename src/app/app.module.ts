import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { CapabilityStatementComponent } from './capability-statement/capability-statement.component';
import { FhirPathComponent } from './fhir-path/fhir-path.component';
import { HomeComponent } from './home/home.component';
import { MappingLanguageComponent } from './mapping-language/mapping-language.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { PatientsComponent } from './patients/patients.component';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler/questionnaire-form-filler.component';
import { QuestionnaireItemModule } from './questionnaire-item/questionnaire-item.module';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from './shared/shared.module';
import { IgsComponent } from './igs/igs.component';
import { ClientComponent } from './client/client.component';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';
import { Cda2FhirComponent } from './cda2-fhir/cda2-fhir.component';
import { Fhir2CdaComponent } from './fhir2-cda/fhir2-cda.component';
import { ValidateComponent } from './validate/validate.component';
import { QuestionnairesTableComponent } from './questionnaires-table/questionnaires-table.component';
import { BundleViewerComponent } from './bundle-viewer/bundle-viewer.component';
import { MagComponent } from './mag/mag.component';
import { TasksTableComponent } from './tasks-table/tasks-table.component';
import { TaskViewerComponent } from './task-viewer/task-viewer.component';
import { ImagingStudyTableComponent } from './imaging-study-table/imaging-study-table.component';
import { OperationOutcomeComponent } from './operation-outcome/operation-outcome.component';
import { UploadComponent } from './upload/upload.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { OAuthModule } from 'angular-oauth2-oidc';

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
    path: 'questionnaire/:questionnaireId',
    component: QuestionnaireFormFillerComponent,
  },
  {
    path: 'bundle/:bundleId',
    component: BundleViewerComponent,
  },
  {
    path: 'task/:taskId',
    component: TaskViewerComponent,
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
    path: 'questionnaires',
    component: QuestionnairesComponent,
  },
  {
    path: 'client',
    component: ClientComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'cda2fhir',
    component: Cda2FhirComponent,
  },
  {
    path: 'fhir2cda',
    component: Fhir2CdaComponent,
  },
  {
    path: 'validate',
    component: ValidateComponent,
  },
  {
    path: 'mag',
    component: MagComponent,
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
    QuestionnairesTableComponent,
    QuestionnaireFormFillerComponent,
    FhirPathComponent,
    MappingLanguageComponent,
    IgsComponent,
    ClientComponent,
    Cda2FhirComponent,
    Fhir2CdaComponent,
    ValidateComponent,
    BundleViewerComponent,
    MagComponent,
    TasksTableComponent,
    TaskViewerComponent,
    ImagingStudyTableComponent,
    OperationOutcomeComponent,
    UploadComponent,
    QuestionnairesComponent,
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    HighlightModule,
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
    OAuthModule.forRoot(),
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          json: () => import('highlight.js/lib/languages/json'),
          xml: () => import('highlight.js/lib/languages/xml'),
        },
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
