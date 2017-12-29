/// <reference path="../types/fhir.js/index.d.ts" />
import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
const fhirjs = require('fhir.js/src/fhir');

@Injectable()
export class FhirHttpService {

  constructor(private httpClient: HttpClient) {
  }

  getService(config: Config): IFhir {

    const ngHttpClient: HttpClient = this.httpClient;

    function getHeader(headers: HttpHeaders): Map<string, string[]> {
      const map = new Map<string, string[]>();
      for (const key of headers.keys()) {
        map.set(key, headers.getAll(key));
      }
      return map;
    }

    function getResponse(response: HttpResponse<IResource>, args: RequestObj): ResponseObj {
      const resp: ResponseObj = {
        data: response.body,
        status: response.status,
        headers: getHeader(response.headers),
        config: args
      };
      return resp;
    }

    const adapter: Adapter = {
      http: function (args: RequestObj): Promise<ResponseObj> {
        const url: string = args.url;
        if (args.debug !== undefined) {
          console.log('[debug angular httpclient adapater] ' + args);
        }
        let headers = new HttpHeaders();
        for (const prop in args.headers) {
          if (prop) {
            headers = headers.set(prop, args.headers[prop]);
          }
        }
        const body = args.data;
        return new Promise(function (resolve, reject) {
          ngHttpClient.request<IResource>(args.method, url, { body: body, headers: headers, observe: 'response' }).toPromise().then(
            response => {
              console.log(response);
              resolve(getResponse(response, args));
            },
            response => {
              console.log(response);
              reject(getResponse(response, args));
            });
        });
      }
    };

    return fhirjs(config, adapter);
  }
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private client: IFhir;

  private config: Config = {
    // baseUrl: 'http://fhirtest.uhn.ca/baseDstu3',
    baseUrl: 'http://localhost:8080/baseDstu3',
    credentials: 'same-origin'
  };

  title: 'ng-fhir-sample';
  clickMessage: string;
  fhirOutput: string;

  constructor(private fhirHttpService: FhirHttpService) {
    this.client = fhirHttpService.getService(this.config);
    this.clickMessage = '';
    this.fhirOutput = '';
  }

  async testConformance() {
    try {

      console.log('Getting a the patient');

      console.log('Step 1: Calling conformance statement');

      const response: ResponseObj = await this.client.conformance({});

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
      let response = await this.client.create(entry);
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
          response = await this.client.read(read);
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
      const response = await this.client.search(
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
