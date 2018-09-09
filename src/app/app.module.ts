import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';

import { AppComponent } from './app.component';
import { NgFhirjsModule } from 'ng-fhirjs';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { HomeComponent } from './home/home.component';
import { PatientsComponent } from './patients/patients.component';
import { CapabilityStatementComponent } from './capability-statement/capability-statement.component';
import { FHIR_JS_CONFIG, SettingsComponent } from './settings/settings.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { QuestionnaireDetailComponent } from './questionnaire-detail/questionnaire-detail.component';


const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'patients', component: PatientsComponent
  },
  {
    path: 'questionnaires', component: QuestionnairesComponent
  },
  {
    path: 'CapabilityStatement', component: CapabilityStatementComponent
  },
  {
    path: 'settings', component: SettingsComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    PatientsComponent,
    CapabilityStatementComponent,
    SettingsComponent,
    HomeComponent,
    PatientDetailComponent,
    QuestionnairesComponent,
    QuestionnaireDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgFhirjsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [{ provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG }],
  bootstrap: [AppComponent]
})
export class AppModule { }
