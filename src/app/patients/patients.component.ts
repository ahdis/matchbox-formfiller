/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit } from '@angular/core';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { MatTableDataSource, PageEvent } from '@angular/material';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

  searched = false;
  bundle: fhir.Bundle;
  dataSource = new MatTableDataSource<fhir.BundleEntry>();

  length = 100;
  pageSize = 10;
  oldPageIndex = 0;
  pageSizeOptions = [this.pageSize];

  constructor(private fhirHttpService: FhirJsHttpService) {

    fhirHttpService.search({ type: 'Patient', query: { _count: this.pageSize } }).then(response => {
      this.bundle = <fhir.Bundle>response.data;
      this.dataSource.data = this.bundle.entry;
      this.length = this.bundle.total;
      console.log('called ');
    });
  }

  getPatientFamilyName(entry: fhir.BundleEntry): string {
    return (<fhir.Patient>entry.resource).name[0].family;
  }

  getPatientGivenNames(entry: fhir.BundleEntry): string {
    return (<fhir.Patient>entry.resource).name[0].given.join(' ');
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.oldPageIndex) {
      this.fhirHttpService.nextPage({ bundle: this.bundle }).then(response => {
        this.oldPageIndex = event.pageIndex;
        this.bundle = <fhir.Bundle>response.data;
        this.length = this.bundle.total;
        this.dataSource.data = this.bundle.entry;
        console.log('next page called ');
      });
    } else {
      this.fhirHttpService.prevPage({ bundle: this.bundle }).then(response => {
        this.oldPageIndex = event.pageIndex;
        this.bundle = <fhir.Bundle>response.data;
        this.length = this.bundle.total;
        this.dataSource.data = this.bundle.entry;
        console.log('previous page called ');
      });
    }
  }

  ngOnInit() {
  }
}
