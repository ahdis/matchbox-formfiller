import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import FhirClient from 'fhir-kit-client';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})
export class PatientsComponent implements OnInit {
  searched = false;
  bundle: fhir.Bundle;
  dataSource = new MatTableDataSource<fhir.BundleEntry>();

  length = 100;
  pageSize = 10;
  pageIndex = 0;

  client: FhirClient;

  query = {
    _count: this.pageSize,
    _summary: 'true',
    _sort: 'family',
    name: '',
  };

  pageSizeOptions = [this.pageSize];
  public searchName: FormControl;
  public searchNameValue = '';

  selectedPatient: fhir.Patient;

  constructor(private data: FhirConfigService) {
    this.client = data.getFhirClient();

    this.searchName = new FormControl();
    this.searchName.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        console.log('called with ' + term);

        console.log('called with ' + term);
        if (term) {
          this.query = { ...this.query, name: term };
        }

        this.client
          .search({ resourceType: 'Patient', searchParams: this.query })
          .then((response) => {
            this.pageIndex = 0;
            this.setBundle(<fhir.Bundle>response);
            return response;
          });
      });
    this.client
      .search({ resourceType: 'Patient', searchParams: this.query })
      .then((response) => {
        this.pageIndex = 0;
        this.setBundle(<fhir.Bundle>response);
        return response;
      });
  }

  getPatientFamilyName(entry: fhir.BundleEntry): string {
    const patient = <fhir.Patient>entry.resource;
    if (patient.name && patient.name.length > 0 && patient.name[0].family) {
      return patient.name[0].family;
    }
    return '';
  }

  getPatientGivenNames(entry: fhir.BundleEntry): string {
    const patient = <fhir.Patient>entry.resource;
    if (patient.name && patient.name.length > 0 && patient.name[0].given) {
      return (<fhir.Patient>entry.resource).name[0].given.join(' ');
    }
    return '';
  }

  getPatientBirthDate(entry: fhir.BundleEntry): string {
    const patient = <fhir.Patient>entry.resource;
    if (patient.birthDate) {
      return patient.birthDate;
    }
    return '';
  }

  getPatientAddressLines(entry: fhir.BundleEntry): string {
    const patient = <fhir.Patient>entry.resource;
    if (
      patient.address &&
      patient.address.length > 0 &&
      patient.address[0].line
    ) {
      return patient.address[0].line.join(', ');
    }
    return '';
  }

  getPatientAddressCity(entry: fhir.BundleEntry): string {
    const patient = <fhir.Patient>entry.resource;
    if (
      patient.address &&
      patient.address.length > 0 &&
      patient.address[0].city
    ) {
      return patient.address[0].city;
    }
    return '';
  }

  selectRow(row: fhir.BundleEntry) {
    const selection = row.resource;
    const readObj = { resourceType: 'Patient', id: selection.id };
    this.client.read(readObj).then((response) => {
      this.selectedPatient = <fhir.Patient>response;
    });
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.pageIndex) {
      this.client.nextPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response);
        console.log('next page called ');
      });
    } else {
      this.client.prevPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response);
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

  ngOnInit() {}
}
