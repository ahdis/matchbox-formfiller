import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import FhirClient from 'fhir-kit-client';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss'],
})
export class ValidateComponent implements OnInit {
  selectedUrl: string;
  json: String;
  client: FhirClient;
  errMsg: string;
  operationOutcome: fhir.r4.OperationOutcome;

  constructor(private data: FhirConfigService, private cd: ChangeDetectorRef) {
    this.client = data.getFhirClient();
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
        this.validate();
      };
    }
  }

  validate() {
    if (this.json != null) {
      const valprofile =
        this.selectedUrl != null
          ? '?profile=' + encodeURIComponent(this.selectedUrl)
          : '';
      this.client
        .operation({
          name: 'validate' + valprofile,
          resourceType: undefined,
          input: this.json,
          options: {
            headers: {
              accept: 'application/fhir+json;fhirVersion=4.0',
              'content-type': 'application/fhir+json;fhirVersion=4.0',
            },
          },
        })
        .then((response) => {
          // see below
          this.operationOutcome = response;
        })
        .catch((error) => {
          // fhir-kit-client throws an error when  return in not json
        });
    }
  }

  getJson(): String {
    return this.json;
  }

  ngOnInit(): void {}
}
