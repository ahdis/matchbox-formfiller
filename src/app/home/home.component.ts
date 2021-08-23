import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  displayedColumns = ['title', 'publisher', 'version', 'status', 'date'];
  dataSource = new MatTableDataSource([
    {
      id: 'sdc-extract',
      title: 'SDC extraction Example',
      status: 'draft',
      date: '2021-05-31',
      publisher: 'ahdis',
      version: '1',
    },
    {
      id: 'referral-min',
      title: 'ORF Referral Minimial',
      status: 'draft',
      date: '2019-03-28',
      publisher: 'ahdis',
      version: '0.9.1',
    },
    {
      id: 'sdc-cap',
      title: 'SDC Cap form',
      status: 'active',
      date: '2019-03-28',
      publisher: '',
      version: '2.8.0',
    },
    {
      id: 'sdc-loinc',
      title: 'Medication or Other Substance',
      status: 'active',
      date: '2012-04-01',
      publisher: 'AHRQ',
      version: '2012-04',
    },
    {
      id: 'sdc-render',
      title: 'Advanced Rendering Questionnaire Profile Demonstration',
      status: 'draft',
      date: '2018-08-01',
      publisher: '',
      version: '2.8.0',
    },
    {
      id: 'height-weight',
      title: 'Weight & Height tracking panel',
      status: 'draft',
      date: '2018-09-12',
      publisher: '',
      version: '2.56',
    },
    {
      id: 'string',
      title: 'Example - String with a unit',
      status: 'draft',
      date: '2018-10-01',
      publisher: 'ahdis',
      version: '1',
    },
    {
      id: 'support-link',
      title: 'Support Link Form',
      status: 'draft',
      date: '2019-05-24',
      publisher: 'ahdis',
      version: '1',
    },
    {
      id: 'radiology-order',
      title: 'Questionnaire Radiology Order',
      status: 'active',
      date: '2021-02-24',
      publisher: 'HL7 Switzerland',
      version: '0.1.0',
    },
  ]);

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
