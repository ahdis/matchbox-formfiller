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
  public resourceType: FormControl;
  public id: FormControl;

  client: FhirClient;
  static log = debug('app:');
  errMsg: string;

  constructor(private cd: ChangeDetectorRef, private data: FhirConfigService) {
    this.client = data.getFhirClient();
    this.map = new FormControl();
    this.resourceType = new FormControl();
    this.id = new FormControl();
  }

  ngOnInit() {}

  onGet() {
    ClientComponent.log('onGet');
    this.client
      .read({
        resourceType: this.resourceType.value,
        id: this.id.value,
      })
      .then((response) => {
        this.map.setValue(JSON.stringify(response));
      })
      .catch((error) => {
        this.errMsg = 'Error' + error;
      });
  }

  onUpdate() {
    ClientComponent.log('onUpdate ');
    let res: fhir.r4.Resource;
    res = JSON.parse(this.map.value);

    this.client
      .update({
        resourceType: res.resourceType,
        id: res.id,
        body: res,
      })
      .then((response) => {
        this.map.setValue(JSON.stringify(response));
      })
      .catch((error) => {
        this.errMsg = 'Error' + error;
      });
  }

  onPost() {
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
