import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import FhirClient from 'fhir-kit-client';

@Injectable({
  providedIn: 'root',
})
export class FhirConfigService {
  constructor() {}

  public changeFhirMicroService(server: string) {
    localStorage.setItem('fhirMicroServer', server);
  }

  public changeMagMicroService(server: string) {
    localStorage.setItem('magMicroService', server);
  }

  getFhirMicroService() {
    const service = localStorage.getItem('fhirMicroServer');
    return service ? service : '/matchbox/fhir';
  }

  getMobileAccessGatewayService() {
    const service = localStorage.getItem('magMicroService');
    return service ? service : '/mag/fhir';
  }

  getFhirClient() {
    return new FhirClient({ baseUrl: this.getFhirMicroService() });
  }

  getMobileAccessGatewayClient() {
    return new FhirClient({ baseUrl: this.getMobileAccessGatewayService() });
  }
}
