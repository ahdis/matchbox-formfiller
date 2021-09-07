import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgFhirjsModule } from 'ng-fhirjs';
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
    path: 'CapabilityStatement',
    component: CapabilityStatementComponent,
  },
  {
    path: 'igs',
    component: IgsComponent,
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
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    HighlightModule,
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
