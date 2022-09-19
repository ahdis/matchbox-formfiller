import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-cda2-fhir',
  templateUrl: './cda2-fhir.component.html',
  styleUrls: ['./cda2-fhir.component.scss'],
})
export class Cda2FhirComponent implements OnInit {
  structureMaps: fhir.r4.StructureMap[];

  selectedUrl: string;

  client: FhirClient;
  maps: Map<String, String>;

  xml: string;
  selectedMap: FormControl;

  query = {
    _summary: 'true',
    _sort: 'name',
    name: 'Cda',
  };

  panelOpenState = false;

  public transformed: any;
  errMsg: string;
  operationOutcome: fhir.r4.OperationOutcome;
  operationOutcomeTransformed: fhir.r4.OperationOutcome;

  constructor(private data: FhirConfigService, private cd: ChangeDetectorRef) {
    this.client = data.getFhirClient();
    this.client
      .search({ resourceType: 'StructureMap', searchParams: this.query })
      .then((response) => {
        this.setMaps(<fhir.r4.Bundle>response);
        return response;
      });

    this.selectedMap = new FormControl();
    this.selectedMap.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        this.selectedUrl = term;
        this.transform();
      });
  }

  fileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);
      reader.onload = () => {
        this.xml = <string>reader.result;
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
        this.transform();
      };
    }
  }

  transform() {
    if (this.xml != null && this.selectedUrl != null) {
      this.client
        .operation({
          name: 'transform?source=' + encodeURIComponent(this.selectedUrl),
          resourceType: 'StructureMap',
          input: this.xml,
          options: {
            headers: {
              'content-type': 'application/fhir+xml;fhirVersion=4.0',
            },
          },
        })
        .then((response) => {
          this.operationOutcomeTransformed = null;
          this.transformed = response;
        })
        .catch((error) => {
          this.transformed = null;
          this.operationOutcomeTransformed = error.response.data;
        });
    }
  }

  getXml(): String {
    return this.xml;
  }

  getMapped(): String {
    return JSON.stringify(this.transformed, null, 2);
  }

  setMaps(response: fhir.r4.Bundle) {
    this.structureMaps = response.entry
      .filter((entry) =>
        (<fhir.r4.StructureMap>entry.resource).name.startsWith('Cda')
      )
      .map((entry) => <fhir.r4.StructureMap>entry.resource);
  }
  ngOnInit(): void {}
}
