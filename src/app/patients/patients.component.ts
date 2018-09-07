/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit } from '@angular/core';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  pageIndex = 0;

  pageSizeOptions = [this.pageSize];
  public searchName: FormControl;
  public searchNameValue = '';

  selectedPatient: fhir.Patient;

  constructor(private fhirHttpService: FhirJsHttpService) {

    const query = <QueryObj>{
      type: 'Patient',
      query: {
        _count: this.pageSize,
        _summary: 'true',
        _sort: 'family'
      }
    };
    this.searchName = new FormControl();
    this.searchName.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(term => {
        console.log('called with ' + term);
        const queryName = {...query};
        queryName.query = {...query.query};
        if (term) {
          queryName.query.name = term;
        }
        fhirHttpService.search(queryName).then(response => {
          this.pageIndex = 0;
          this.setBundle(<fhir.Bundle>response.data);
        });
      });
    fhirHttpService.search(query).then(response => {
      this.setBundle(<fhir.Bundle>response.data);
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

  selectRow(row: fhir.BundleEntry) {
    const selection = row.resource;
    const readObj = { type: 'Patient', id: selection.id };
    this.fhirHttpService.read(readObj).then(response => {
      this.selectedPatient = response.data;
    });
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.pageIndex) {
      this.fhirHttpService.nextPage({ bundle: this.bundle }).then(response => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response.data);
        console.log('next page called ');
      });
    } else {
      this.fhirHttpService.prevPage({ bundle: this.bundle }).then(response => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response.data);
        console.log('previous page called ');
      });
    }
  }

  setBundle(bundle: fhir.Bundle) {
    this.bundle = <fhir.Bundle>bundle;
    this.length = this.bundle.total;
    this.dataSource.data = this.bundle.entry;
    this.selectedPatient = undefined;
  }

  ngOnInit() {
  }
}
