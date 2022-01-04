import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import FhirClient from 'fhir-kit-client';
import debug from 'debug';
import { add } from 'ramda';
import { timeStamp } from 'console';

@Component({
  selector: 'app-igs',
  templateUrl: './igs.component.html',
  styleUrls: ['./igs.component.scss'],
})
export class IgsComponent implements OnInit {
  public addPackageId: FormControl;
  public addVersion: FormControl;
  public addUrl: FormControl;
  public selection: fhir.r4.ImplementationGuide;

  length = 100;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [this.pageSize];

  bundle: fhir.r4.Bundle;
  dataSource = new MatTableDataSource<fhir.r4.BundleEntry>();

  client: FhirClient;
  static log = debug('app:');
  errMsg: string;
  operationOutcome: fhir.r4.OperationOutcome;

  query = {
    _summary: 'true',
    _sort: 'name',
  };

  constructor(private data: FhirConfigService) {
    this.client = data.getFhirClient();
    this.addPackageId = new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]);
    this.addVersion = new FormControl('current', [
      Validators.required,
      Validators.minLength(1),
    ]);
    this.addUrl = new FormControl('url');
    this.search();
  }

  search() {
    this.client
      .search({ resourceType: 'ImplementationGuide', searchParams: this.query })
      .then((response) => {
        this.pageIndex = 0;
        this.setBundle(<fhir.r4.Bundle>response);
        this.selection = undefined;
        this.addPackageId.setValue('');
        this.addVersion.setValue('');
        this.addUrl.setValue('');
      });
  }

  getPackageId(entry: fhir.r4.BundleEntry): string {
    const ig = <fhir.r4.ImplementationGuide>entry.resource;
    if (ig.packageId) {
      return ig.packageId;
    }
    return '';
  }

  getName(entry: fhir.r4.BundleEntry): string {
    const ig = <fhir.r4.ImplementationGuide>entry.resource;
    if (ig.name) {
      return ig.name;
    }
    return '';
  }

  getVersion(entry: fhir.r4.BundleEntry): string {
    const ig = <fhir.r4.ImplementationGuide>entry.resource;
    if (ig.version) {
      return ig.version;
    }
    return '';
  }

  getUrl(entry: fhir.r4.BundleEntry): string {
    const ig = <fhir.r4.ImplementationGuide>entry.resource;
    if (ig.url) {
      return ig.url;
    }
    return '';
  }

  setBundle(bundle: fhir.r4.Bundle) {
    this.bundle = <fhir.r4.Bundle>bundle;
    this.dataSource.data = this.bundle.entry;
    this.length = this.bundle.total;
    this.selection = undefined;
  }

  ngOnInit() {}

  selectRow(row: fhir.r4.BundleEntry) {
    this.selection = row.resource as fhir.r4.ImplementationGuide;
    this.addPackageId.setValue(this.selection.packageId);
    this.addUrl.setValue(this.selection.url);
    this.addVersion.setValue(this.selection.version);
  }

  onSubmit() {
    IgsComponent.log('onSubmit ' + this.addPackageId.value);

    this.errMsg = null;

    if (this.addPackageId.invalid || this.addVersion.invalid) {
      this.errMsg = 'Please provide package name';
      return;
    }

    this.client
      .create({
        resourceType: 'ImplementationGuide',
        body: {
          resourceType: 'ImplementationGuide',
          name: this.addPackageId.value,
          version: this.addVersion.value,
          packageId: this.addPackageId.value,
          url: this.addUrl.value,
        },
        options: {
          headers: {
            Prefer: 'return=OperationOutcome',
          },
        },
      })
      .then((response) => {
        this.errMsg = 'Created Implementation Guide' + this.addPackageId.value;
        this.operationOutcome = response as fhir.r4.OperationOutcome;
        this.search();
      })
      .catch((error) => {
        this.errMsg =
          'Error creating Implementation Guide ' + this.addPackageId.value;
        this.operationOutcome = error.response.data;
      });
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.pageIndex) {
      this.client.nextPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.r4.Bundle>response);
        this.selection = undefined;
        console.log('next page called ');
      });
    } else {
      this.client.prevPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.r4.Bundle>response);
        this.selection = undefined;
        console.log('previous page called ');
      });
    }
  }

  // Prefer: return=OperationOutcome

  onUpdate() {
    this.errMsg = null;

    this.selection.name = this.addPackageId.value;
    this.selection.version = this.addVersion.value;
    this.selection.packageId = this.addPackageId.value;
    this.selection.url = this.addUrl.value;

    this.client
      .update({
        resourceType: this.selection.resourceType,
        id: this.selection.id,
        body: this.selection,
        options: {
          headers: {
            Prefer: 'return=OperationOutcome',
          },
        },
      })
      .then((response) => {
        this.errMsg =
          'Updated Implementation Guide ' + this.selection.packageId;
        this.operationOutcome = response as fhir.r4.OperationOutcome;
        this.search();
      })
      .catch((error) => {
        this.errMsg =
          'Error updating Implementation Guide ' + this.selection.packageId;
        this.operationOutcome = error.response.data;
      });
  }

  onDelete() {
    this.errMsg = null;

    this.client
      .delete({
        resourceType: this.selection.resourceType,
        id: this.selection.id,
        options: {
          headers: {
            Prefer: 'return=OperationOutcome',
          },
        },
      })
      .then((response) => {
        this.errMsg =
          'Deleted Implementation Guide Resource (not package)' +
          this.selection.packageId;
        this.operationOutcome = response as fhir.r4.OperationOutcome;
        this.search();
      })
      .catch((error) => {
        this.errMsg =
          'Error deleting Implementation Guide ' + this.selection.packageId;
        this.operationOutcome = error.response.data;
      });
  }
}
