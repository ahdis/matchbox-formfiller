import { Component } from '@angular/core';
import { FhirJsHttpService} from './fhir-js-http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'ng-fhir-sample';
  clickMessage: string;
  fhirOutput: string;

  constructor(private fhirHttpService: FhirJsHttpService) {
    this.clickMessage = '';
    this.fhirOutput = '';
  }

  async testConformance() {
    try {

      console.log('Getting a the patient');

      console.log('Step 1: Calling conformance statement');

      const response: ResponseObj = await this.fhirHttpService.conformance({});

      console.log(JSON.stringify(response));
      this.fhirOutput += ' success ' + JSON.stringify(response);
    } catch (error) {
      console.log('error');
      console.log(JSON.stringify(error));
      this.fhirOutput += ' error ' + JSON.stringify(error);
    }
  }


  async testCreate() {
    try {

      console.log('Creating a the patient');
      const entry: Entry = {
        resource: {
          resourceType: 'Patient'
        }
      };

      entry.debug = true;
      let response = await this.fhirHttpService.create(entry);
      console.log(JSON.stringify(response));
      const createdPatient: IResource = response.data;

      let patientId;
      let patientVersionId;

      this.fhirOutput += ' success ' + '\n';
      if (response.headers !== undefined) {
        this.fhirOutput += response.status + '\n';
        this.fhirOutput += response.headers.get('location') + '\n';
        this.fhirOutput += 'id:' + response.data.id + '\n';
        this.fhirOutput += 'versionId:' + response.data.meta.versionId + '\n';
        if (response.data.id !== undefined) {
          patientId = response.data.id;
          patientVersionId = response.data.meta.versionId;

          const read: ReadObj = { id: patientId, type: 'Patient' };
          response = await this.fhirHttpService.read(read);
        }
      }

    } catch (error) {
      console.log('error');
      console.log(JSON.stringify(error));
      this.fhirOutput += ' error ' + JSON.stringify(error);
    }

  }

  async testSearch() {
    try {
      const response = await this.fhirHttpService.search(
        { type: 'Patient', query: { name: { $and: [{ $exact: 'Muster' }, { $exact: 'Felix' }] } } });
      if (response.headers !== undefined) {
        console.log(response.status);
        this.fhirOutput += 'total entries: ' + response.data.total;
        console.log();
      }
    } catch (error) {
      console.log('error');
      console.log(JSON.stringify(error));
      this.fhirOutput += ' error ' + JSON.stringify(error);
    }
  }

  onClickMe() {
    this.testSearch();
    this.clickMessage = 'testCreate called';
  }

}
