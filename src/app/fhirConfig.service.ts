import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import FhirClient from 'fhir-kit-client';

@Injectable({
  providedIn: 'root',
})
export class FhirConfigService {
  private fhirMicroServer = new BehaviorSubject(
    'https://test.ahdis.ch/matchbox-order/fhir'
  );
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
