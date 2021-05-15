import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { FormControl } from '@angular/forms';
import FhirClient from 'fhir-kit-client';
import debug from 'debug';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit {
  public map: FormControl;

  client: FhirClient;
  static log = debug('app:');
  errMsg: string;

  constructor(private cd: ChangeDetectorRef, private data: FhirConfigService) {
    this.client = data.getFhirClient();
    this.map = new FormControl();
  }

  ngOnInit() {}

  onSubmit() {
    ClientComponent.log('onSubmit ');
    let res: fhir.r4.Resource;
    res = JSON.parse(this.map.value);

    this.client
      .create({
        resourceType: res.resourceType,
        body: res,
      })
      .then((response) => {
        this.map.setValue(JSON.stringify(response));
      })
      .catch((error) => {
        this.errMsg = 'Error' + error;
      });
  }

  fileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);
      reader.onload = () => {
        this.map.setValue(reader.result);
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }
}
