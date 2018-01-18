/// <reference path="./fhir-js.d.ts" />
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Inject, InjectionToken } from '@angular/core';

const fhirjs = require('fhir.js/src/fhir');

export const FHIR_HTTP_CONFIG = new InjectionToken<FhirConfig>('fhir configuration');

@Injectable()
export class FhirJsHttpService {

  private ifhirjs: IFhir;

  constructor(private httpClient: HttpClient, @Inject(FHIR_HTTP_CONFIG) config: FhirConfig) {
    this.ifhirjs = this.getService(httpClient, config);
  }

  private getService(httpClient: HttpClient, config: FhirConfig): IFhir {

    const ngHttpClient: HttpClient = httpClient;

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
              if (args.debug !== undefined) {
                console.log(response);
              }
              resolve(getResponse(response, args));
            },
            response => {
              if (args.debug !== undefined) {
                console.log(response);
              }
              reject(getResponse(response, args));
            });
        });
      }
    };
    return fhirjs(config, adapter);
  }

  /** Get a capability statement for the system */
  conformance(empty: Minimal): Promise<ResponseObj> {
    return this.ifhirjs.conformance(empty);
  }

  /** Create a new resource with a server assigned id */
  create(entry: Entry): Promise<ResponseObj> {
    return this.ifhirjs.create(entry);
  }

  /** Read the current state of the resource */
  read(resource: ReadObj): Promise<ResponseObj> {
    return this.ifhirjs.read(resource);
  }

  /** Retrieve the change history for all resources */
  history(empty: Minimal): Promise<ResponseObj> {
    return this.ifhirjs.history(empty);
  }

  /** Retrieve the change history for a particular resource type */
  typeHistory(query: ResourceType): Promise<ResponseObj> {
    return this.ifhirjs.typeHistory(query);
  }

  /** Retrieve the change history for a particular resource */
  resourceHistory(query: ReadObj): Promise<ResponseObj> {
    return this.ifhirjs.resourceHistory(query);
  }

  /** Read the state of a specific version of the resource */
  vread(query: VReadObj): Promise<ResponseObj> {
    return this.ifhirjs.vread(query);
  }

  /** Update an existing resource by its id (or create it if it is new) */
  update(entry: Entry): Promise<ResponseObj> {
    return this.ifhirjs.update(entry);
  }

  /** Delete a resource */
  delete(query: Entry): Promise<ResponseObj> {
    return this.ifhirjs.delete(query);
  }

  /** The transaction interactions submit a set of actions to perform on a server in a single HTTP request/response. */
  transaction(bundle: Entry): Promise<ResponseObj> {
    return this.ifhirjs.transaction(bundle);
  }

  /** searches a set of resources based on some filter criteria */
  search(query: QueryObj): Promise<ResponseObj> {
    return this.ifhirjs.search(query);
  }

  /** returns the next results in a series of pages */
  nextPage(query: BundleObj): Promise<ResponseObj> {
    return this.ifhirjs.nextPage(query);
  }

  /** returns the previous results in a series of pages */
  prevPage(query: BundleObj): Promise<ResponseObj> {
    return this.ifhirjs.prevPage(query);
  }

}
