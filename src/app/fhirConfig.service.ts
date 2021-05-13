import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import FhirClient from 'fhir-kit-client';

@Injectable({
  providedIn: 'root',
})
export class FhirConfigService {
  private fhirMicroServer = new BehaviorSubject('http://test.ahdis.ch/r4');
  fhirMicroService = this.fhirMicroServer.asObservable();

  constructor() {}

  changeFhirMicroService(server: string) {
    this.fhirMicroServer.next(server);
  }

  getFhirMicroService() {
    return this.fhirMicroServer.getValue();
  }

  getFhirClient() {
    return new FhirClient({ baseUrl: this.getFhirMicroService() });
  }
}
