import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface TaskTableEntry<T> {
  readonly title: string;
  readonly status: string;
  readonly requester: string;
  readonly owner: string;
  readonly authoredOn: string;
  readonly lastModified: string;
  readonly entry: T;
}

@Component({
  selector: 'app-tasks-table',
  templateUrl: './tasks-table.component.html',
  styleUrls: ['./tasks-table.component.scss'],
})
export class TasksTableComponent<T> {
  @Input() dataSource: MatTableDataSource<TaskTableEntry<T>>;
  @Output() rowClick = new EventEmitter<T>();

  displayedColumns = ['title', 'status', 'requester', 'owner', 'lastModified'];

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
