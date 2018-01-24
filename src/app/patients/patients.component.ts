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
    const patient = (<fhir.Patient>entry.resource);
    if (patient.name && patient.name.length > 0 && patient.name[0].family) {
     return patient.name[0].family;
    }
    return '';
  }

  getPatientGivenNames(entry: fhir.BundleEntry): string {
    const patient = (<fhir.Patient>entry.resource);
    if (patient.name && patient.name.length > 0 && patient.name[0].given) {
      return (<fhir.Patient>entry.resource).name[0].given.join(' ');
    }
    return '';
  }

  getPatientBirthDate(entry: fhir.BundleEntry): string {
    const patient = (<fhir.Patient>entry.resource);
    if (patient.birthDate) {
     return patient.birthDate;
    }
    return '';
  }

  getPatientAddressLines(entry: fhir.BundleEntry): string {
    const patient = (<fhir.Patient>entry.resource);
    if (patient.address && patient.address.length > 0 && patient.address[0].line) {
     return patient.address[0].line.join(', ');
    }
    return '';
  }

  getPatientAddressCity(entry: fhir.BundleEntry): string {
    const patient = (<fhir.Patient>entry.resource);
    if (patient.address && patient.address.length > 0 && patient.address[0].city) {
     return patient.address[0].city;
    }
    return '';
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
