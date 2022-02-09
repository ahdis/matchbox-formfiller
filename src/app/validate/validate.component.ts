import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';
import { FormControl } from '@angular/forms';
import { buffer, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import pako from 'pako';
import untar from 'js-untar';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { timeStamp } from 'console';
import { HighlightSpanKind } from 'typescript';
import { IDroppedBlob } from '../upload/upload.component';

interface ITarEntry {
  name: string; // "package/package.json",
  mode: string; // "0100644 ",
  uid: number; // 0,
  gid: number; // 0,
  size: number; // 647,
  mtime: number; // 1641566058,
  checksum: number; // 13500,
  type: string; // "0",
  linkname: string; // "",
  ustarFormat: string; // "ustar",
  version: string; // "00",
  uname: string; // "",
  gname: string; // "",
  devmajor: number; //0,
  devminor: number; //0,
  namePrefix: string; // "",
  buffer: ArrayBuffer; // {}
  getBlobUrl: () => string; // ???
  readAsJSON: () => any;
  readAsString: () => string;
}

class ValidationEntry {
  name: string; // "package/package.json",
  json: string;
  operationOutcome: fhir.r4.OperationOutcome;
  profiles: string[];

  constructor(name: string, json: string) {
    this.name = name;
    this.json = json;
  }

  getErrors(): number {
    if (this.operationOutcome) {
      return this.operationOutcome?.issue?.filter(
        (issue) =>
          issue.code === 'processing' &&
          (issue.severity === 'error' || issue.severity === 'fatal')
      ).length;
    }
    return undefined;
  }

  getWarnings(): number {
    if (this.operationOutcome) {
      return this.operationOutcome?.issue?.filter(
        (issue) => issue.code === 'processing' && issue.severity === 'warning'
      ).length;
    }
    return undefined;
  }

  getInfos(): number {
    if (this.operationOutcome) {
      return this.operationOutcome?.issue?.filter(
        (issue) =>
          issue.code === 'processing' && issue.severity === 'information'
      ).length;
    }
    return undefined;
  }
}
@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
})
export class ValidateComponent implements OnInit {
  json: string;
  capabilitystatement: fhir.r4.CapabilityStatement;
  client: FhirClient;
  errMsg: string;
  operationOutcome: fhir.r4.OperationOutcome;
  package: ArrayBuffer;
  resourceName: string;
  resourceId: string;
  selectedProfile: string;
  validationInProgress: number;
  selectedEntry: ValidationEntry;

  dataSource = new MatTableDataSource<ValidationEntry>();

  constructor(private data: FhirConfigService, private cd: ChangeDetectorRef) {
    this.client = data.getFhirClient();

    this.client
      .capabilityStatement()
      .then((data: fhir.r4.CapabilityStatement) => {
        this.capabilitystatement = data;
      });
    this.validationInProgress = 0;
  }

  getSelectedProfile(): string {
    return this.selectedProfile;
  }

  setSelectedProfile(value: string) {
    this.selectedProfile = value;
  }

  getProfiles(): string[] {
    const resCap = this.capabilitystatement.rest[0].resource.find(
      (entry) =>
        (<fhir.r4.CapabilityStatementRestResource>entry).type ===
        this.resourceName
    );
    return [resCap.profile, ...resCap.supportedProfile];
  }

  addFile(droppedBlob: IDroppedBlob) {
    this.validationInProgress += 1;
    if (
      droppedBlob.contentType === 'application/json' ||
      droppedBlob.name.endsWith('.json')
    ) {
      this.addJson(droppedBlob.blob);
    }
    if (droppedBlob.name.endsWith('.tgz')) {
      this.addPackage(droppedBlob.blob);
    }
    this.validationInProgress -= 1;
  }

  addJson(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    const dataSource = this.dataSource;
    reader.onload = () => {
      // need to run CD since file load runs outside of zone
      this.cd.markForCheck();
      let entry = new ValidationEntry(file.name, <string>reader.result);
      dataSource.data.push(entry);
      this.validate(entry);
    };
  }

  onValidateIg() {
    const query = {
      _sort: 'title',
      _count: 1000,
    };

    this.client
      .search({ resourceType: 'ImplementationGuide', searchParams: query })
      .then((response) => {
        let bundle = <fhir.r4.Bundle>response;
        bundle.entry.forEach((entry) => {
          this.fetchData(
            this.client.baseUrl + '/ImplementationGuide/' + entry.resource.id
          );
        });
      });
  }

  async fetchData(url: string) {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/gzip',
      },
    });
    const contentType = res.headers.get('Content-Type');
    const blob = await res.blob();
    this.addPackage(blob);
  }

  addPackage(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      this.package = <ArrayBuffer>reader.result;
      // need to run CD since file load runs outside of zone
      this.cd.markForCheck();
      if (this.package != null) {
        const result = pako.inflate(new Uint8Array(this.package));
        const dataSource = this.dataSource;
        const pointer = this;
        untar(result.buffer).then(
          function (extractedFiles) {
            // onSuccess
          },
          function (err) {
            // onError
          },
          function (extractedFile: ITarEntry) {
            // onProgress
            if (
              extractedFile.name?.indexOf('example') >= 0 &&
              extractedFile.name?.indexOf('.index.json') == -1
            ) {
              let name = extractedFile.name;
              if (name.startsWith('package/example/')) {
                name = name.substring('package/example/'.length);
              }
              if (name.startsWith('example/')) {
                name = name.substring('example/'.length);
              }
              let decoder = new TextDecoder('utf-8');
              let entry = new ValidationEntry(
                name,
                JSON.stringify(
                  JSON.parse(decoder.decode(extractedFile.buffer)),
                  null,
                  2
                )
              );
              dataSource.data.push(entry);
              pointer.validate(entry);
            }
          }
        );
      }
    };
  }

  onClear() {
    this.selectRow(undefined);
    const len = this.dataSource.data.length;
    this.dataSource.data.splice(0, len);
    this.dataSource.data = this.dataSource.data; // https://stackoverflow.com/questions/46746598/angular-material-how-to-refresh-a-data-source-mat-table
  }

  validate(row: ValidationEntry) {
    this.validationInProgress += 1;
    const valprofile =
      this.selectedProfile != null
        ? '?profile=' + encodeURIComponent(this.selectedProfile)
        : '';
    if (this.selectedProfile != null) {
      row.profiles = [this.selectedProfile];
    } else {
      try {
        const res = <fhir.r4.Resource>JSON.parse(row.json);
        if (res && res.meta?.profile) {
          row.profiles = res.meta?.profile;
        }
      } catch (error) {}
    }
    this.client
      .operation({
        name: 'validate' + valprofile,
        resourceType: undefined,
        input: row.json,
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            'content-type': 'application/fhir+json;fhirVersion=4.0',
          },
        },
      })
      .then((response) => {
        // see below
        this.validationInProgress -= 1;
        row.operationOutcome = response;
        this.dataSource.data = this.dataSource.data; // https://stackoverflow.com/questions/46746598/angular-material-how-to-refresh-a-data-source-mat-table
        if (this.validationInProgress == 0) {
          this.selectRow(row);
        }
      })
      .catch((error) => {
        // fhir-kit-client throws an error when  return in not json
        this.validationInProgress -= 1;
      });
  }

  selectRow(row: ValidationEntry) {
    this.selectedEntry = row;
    if (row) {
      this.operationOutcome = row.operationOutcome;
      this.json = row.json;
      const res = <fhir.r4.Resource>JSON.parse(this.json);
      if (res?.resourceType) {
        this.resourceName = res.resourceType;
        this.resourceId = res.id;
      } else {
        this.resourceName = '';
        this.resourceId = '';
      }
    } else {
      this.operationOutcome = undefined;
      this.json = undefined;
    }
  }

  remove(row: ValidationEntry) {
    const index = this.dataSource.data.indexOf(row);
    this.dataSource.data.splice(index, 1); //remove element from array
    this.dataSource.data = this.dataSource.data; // https://stackoverflow.com/questions/46746598/angular-material-how-to-refresh-a-data-source-mat-table
  }

  validationOutcomeTitle(): string {
    return `Details Validation Results ${this.resourceName} / ${this.resourceId}`;
  }

  onValidate() {
    let entry = new ValidationEntry(
      this.selectedEntry.name,
      this.selectedEntry.json
    );
    this.dataSource.data.push(entry);
    this.validate(entry);
  }

  getJson(): String {
    return this.json;
  }

  ngOnInit(): void {}
}
