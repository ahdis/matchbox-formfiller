import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class QuestionnairesTableComponent<T> {
  @Input() dataSource: MatTableDataSource<T>;
  @Output() rowClick = new EventEmitter<T>();

  displayedColumns = ['title', 'publisher', 'version', 'status', 'date'];

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
