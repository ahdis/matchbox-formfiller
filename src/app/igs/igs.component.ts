import { Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import FhirClient from 'fhir-kit-client';
import debug from 'debug';
import { add } from 'ramda';

@Component({
  selector: 'app-igs',
  templateUrl: './igs.component.html',
  styleUrls: ['./igs.component.scss'],
})
export class IgsComponent implements OnInit {
  public addPackageId: FormControl;
  public addVersion: FormControl;

  bundle: fhir.r4.Bundle;
  dataSource = new MatTableDataSource<fhir.r4.BundleEntry>();

  client: FhirClient;
  static log = debug('app:');
  errMsg: string;

  constructor(private data: FhirConfigService) {
    this.client = data.getFhirClient();
    this.client
      .search({ resourceType: 'ImplementationGuide' })
      .then((response) => {
        this.setBundle(<fhir.r4.Bundle>response);
      });

    this.addPackageId = new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]);
    this.addVersion = new FormControl('current', [
      Validators.required,
      Validators.minLength(1),
    ]);
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
  }

  ngOnInit() {}

  onSubmit() {
    IgsComponent.log('onSubmit ' + this.addPackageId.value);

    this.errMsg = null;

    if (this.addPackageId.invalid || this.addVersion.invalid) {
      this.errMsg = 'Please provide package name';
      return;
    }

    const transactionBundle: fhir.r4.Bundle = {
      resourceType: 'Bundle',
      id: 'bundle-transaction',
      type: 'transaction',
      entry: [
        {
          resource: {
            resourceType: 'ImplementationGuide',
            name: this.addPackageId.value,
            version: this.addVersion.value,
            packageId: this.addPackageId.value,
          },
          request: {
            url: this.client.baseUrl + 'ImplementationGuide',
            method: 'POST',
          },
        },
      ],
    };

    this.client
      .transaction({
        body: transactionBundle,
      })
      .then((response) => {
        this.addPackageId.setValue('');
        this.addVersion.setValue('');
        this.client
          .search({ resourceType: 'ImplementationGuide' })
          .then((response) => {
            this.setBundle(<fhir.r4.Bundle>response);
          });
      })
      .catch((error) => {
        this.errMsg = 'Error' + error;
      });
  }
}
