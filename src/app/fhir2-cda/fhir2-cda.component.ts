import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-fhir2-cda',
  templateUrl: './fhir2-cda.component.html',
  styleUrls: ['./fhir2-cda.component.scss'],
})
export class Fhir2CdaComponent implements OnInit {
  structureMaps: fhir.r4.StructureMap[];

  selectedUrl: string;

  client: FhirClient;
  maps: Map<String, String>;

  json: String;
  selectedMap: FormControl;

  query = {
    _summary: 'true',
    _sort: 'name',
    name: 'Bundle',
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
        this.json = <string>reader.result;
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
        this.transform();
      };
    }
  }

  transform() {
    if (this.json != null && this.selectedUrl != null) {
      this.client
        .operation({
          name: 'transform?source=' + encodeURIComponent(this.selectedUrl),
          resourceType: 'StructureMap',
          input: this.json,
          options: {
            headers: {
              accept: 'application/fhir+xml;fhirVersion=4.0',
              'content-type': 'application/fhir+json;fhirVersion=4.0',
            },
          },
        })
        .then((response) => {
          // see below
          this.operationOutcomeTransformed = null;
          this.transformed = null;
        })
        .catch((error) => {
          // fhir-kit-client throws an error when  return in not json
          this.transformed = error.response.data;
        });
    }
  }

  getJson(): String {
    return this.json;
  }

  getMapped(): String {
    return this.transformed;
  }

  setMaps(response: fhir.r4.Bundle) {
    this.structureMaps = response.entry
      .filter((entry) =>
        (<fhir.r4.StructureMap>entry.resource).name.startsWith('Bundle')
      )
      .map((entry) => <fhir.r4.StructureMap>entry.resource);
  }
  ngOnInit(): void {}
}
