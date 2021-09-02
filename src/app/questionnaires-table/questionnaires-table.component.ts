import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionnaireFillerService } from '../questionnaire-filler.service';
import FhirClient from 'fhir-kit-client';
import { FhirConfigService } from '../fhirConfig.service';
import { MatTableDataSource } from '@angular/material/table';
import { LocalQuestionnaire } from '../home/home.component';

@Component({
  selector: 'app-questionnaires-table',
  templateUrl: './questionnaires-table.component.html',
  styleUrls: ['./questionnaires-table.component.scss'],
})
export class QuestionnairesTableComponent implements OnInit {
  @Input() dataSource: MatTableDataSource<
    LocalQuestionnaire | fhir.r4.BundleEntry
  >;

  displayedColumns = ['title', 'publisher', 'version', 'status', 'date'];
  client: FhirClient;

  constructor(
    private data: FhirConfigService,
    private router: Router,
    private questionnaireFillerServer: QuestionnaireFillerService
  ) {
    this.client = new FhirClient({ baseUrl: data.getFhirMicroService() });
  }

  ngOnInit() {}

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openQuestionnaire(entry: fhir.r4.BundleEntry) {
    console.log(entry);
    this.client
      .read({ resourceType: 'Questionnaire', id: entry.resource.id })
      .then((response: fhir.r4.Questionnaire) => {
        this.questionnaireFillerServer.setQuestionnare(response);
        this.router.navigate(['questionnaire', '-1']);
      });
  }
}
