import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule, MatNativeDateModule, MatDividerModule,  MatSliderModule, MatSlideToggleModule } from '@angular/material';

import { AppComponent } from './app.component';
import { NgFhirjsModule } from 'ng-fhirjs';
import { FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { HomeComponent } from './home/home.component';
import { PatientsComponent } from './patients/patients.component';
import { CapabilityStatementComponent } from './capability-statement/capability-statement.component';
import { FHIR_JS_CONFIG, SettingsComponent } from './settings/settings.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { QuestionnairesComponent } from './questionnaires/questionnaires.component';
import { QuestionnaireDetailComponent } from './questionnaire-detail/questionnaire-detail.component';
import { QuestionnaireFormFillerComponent } from './questionnaire-form-filler/questionnaire-form-filler.component';
import { QuestionnaireItemComponent } from './questionnaire-item/questionnaire-item.component';

import { QuestionnaireModule } from './questionnaire/questionnaire.module';

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
    path: 'questionnaire-form-filler', component: QuestionnaireFormFillerComponent
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
    QuestionnaireDetailComponent,
    QuestionnaireFormFillerComponent,
    QuestionnaireItemComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgFhirjsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTableModule,
    MatToolbarModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    ReactiveFormsModule,
    QuestionnaireModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [{ provide: FHIR_HTTP_CONFIG, useValue: FHIR_JS_CONFIG }],
  bootstrap: [AppComponent]
})
export class AppModule { }
