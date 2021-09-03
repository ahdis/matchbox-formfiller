import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface QuestionnaireTableEntry<T> {
  readonly title: string;
  readonly publisher: string;
  readonly version: string;
  readonly status: string;
  readonly date: string;
  readonly entry: T;
}

@Component({
  selector: 'app-questionnaires-table',
  templateUrl: './questionnaires-table.component.html',
  styleUrls: ['./questionnaires-table.component.scss'],
})
export class QuestionnairesTableComponent<T> {
  @Input() dataSource: MatTableDataSource<QuestionnaireTableEntry<T>>;
  @Output() rowClick = new EventEmitter<T>();

  displayedColumns = ['title', 'publisher', 'version', 'status', 'date'];

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
