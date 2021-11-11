import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import FhirClient from 'fhir-kit-client';

@Injectable({
  providedIn: 'root',
})
export class FhirConfigService {
  private fhirMicroServer = new BehaviorSubject('/matchbox/fhir');

  private mobileAccessGatewayServer = new BehaviorSubject('/mag/fhir');

  fhirMicroService = this.fhirMicroServer.asObservable();
  magMicroService = this.mobileAccessGatewayServer.asObservable();

  constructor() {}

  public changeFhirMicroService(server: string) {
    this.fhirMicroServer.next(server);
  }

  public changeMagMicroService(server: string) {
    this.mobileAccessGatewayServer.next(server);
  }

  getFhirMicroService() {
    return this.fhirMicroServer.getValue();
  }

  getMobileAccessGatewayService() {
    return this.mobileAccessGatewayServer.getValue();
  }

  getFhirClient() {
    return new FhirClient({ baseUrl: this.getFhirMicroService() });
  }

  getMobileAccessGatewayClient() {
    return new FhirClient({ baseUrl: this.getMobileAccessGatewayService() });
  }
}
