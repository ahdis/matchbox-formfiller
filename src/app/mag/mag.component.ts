import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { FormControl } from '@angular/forms';
import FhirClient from 'fhir-kit-client';
import { FhirPathService } from '../fhirpath.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Base64 } from 'js-base64';
import { toLocaleDateTime } from '../questionnaire-item/store/util';
import { MatTableDataSource } from '@angular/material/table';
import { AuthConfig, OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { getTokenSourceMapRange } from 'typescript';
import { IDroppedBlob } from '../upload/upload.component';
import { FhirResource } from 'fhir-kit-client';

class UUIReplace {
  descr: string;
  existingUuid: string;
  newUuid: string;
}

@Component({
  selector: 'app-mag',
  templateUrl: './mag.component.html',
  styleUrls: ['./mag.component.scss'],
})
export class MagComponent implements OnInit {
  mag: FhirClient;
  fhir: FhirClient;
  json: string;
  doc: string;

  targetIdentifierValue: string;
  targetIdentifier2Value: string;

  xml: string;
  pdf: string;
  uploadBase64: string;
  uploadContentType: string;
  uploadBundle: fhir.r4.Bundle;

  targetId: string;

  public sourceIdentifierSystem: FormControl;
  public sourceIdentifierValue: FormControl;
  public sourceAddIdentifierSystem: FormControl;
  public sourceAddIdentifierValue: FormControl;
  public sourceManagingOrganizationOid: FormControl;
  public sourceManagingOrganizationName: FormControl;
  public targetIdentifierSystem: FormControl;
  public targetIdentifier2System: FormControl;
  public authenticate: FormControl;
  public documentType: FormControl;
  public documentDescription: FormControl;
  public masterIdentifier: FormControl;
  public creationTime: FormControl;
  public serviceStartFrom: FormControl;
  public serviceStartTo: FormControl;
  public serviceEndFrom: FormControl;
  public serviceEndTo: FormControl;

  public iheSourceId: FormControl;

  public searchGiven: FormControl;
  public searchGivenValue = '';
  public searchFamily: FormControl;
  public searchFamilyValue = '';
  public fhirConfigService: FhirConfigService;

  public replaceUuids = new Array<UUIReplace>();

  bundle: fhir.r4.Bundle;
  patient: fhir.r4.Patient;

  pageIndex = 0;
  dataSource = new MatTableDataSource<fhir.r4.DocumentReference>();
  length = 100;
  pageSize = 10;

  // oid mag = ahdis + .20 ->   2.16.756.5.30.1.145.20

  errMsg: string;
  errMsgAssignPatient: string;

  scopes: object;

  inMhdQueryProgress = false;
  inMhdUploadProgress = false;
  inPixmProgress = false;
  selectedDocumentReference: fhir.r4.DocumentReference;

  constructor(
    private data: FhirConfigService,
    private fhirPathService: FhirPathService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private oauthService: OAuthService,
    private router: Router
  ) {
    const oid_mag_ahdis = 'urn:oid:2.16.756.5.30.1.145.20';
    this.mag = data.getMobileAccessGatewayClient();
    this.fhir = data.getFhirClient();
    this.mag
      .capabilityStatement()
      .then((data: fhir.r4.CapabilityStatement) =>
        this.setJson(JSON.stringify(data, null, 2))
      );
    this.sourceIdentifierSystem = new FormControl();
    this.sourceIdentifierSystem.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceIdentifierSystem',
        'urn:oid:2.16.756.5.30.1.196.3.2.1'
      )
    );
    this.sourceIdentifierValue = new FormControl();
    this.sourceIdentifierValue.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceIdentifierValue',
        'MAGMED001'
      )
    );
    this.sourceAddIdentifierSystem = new FormControl();
    this.sourceAddIdentifierSystem.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceAddIdentifierSystem',
        'urn:oid:2.16.756.5.30.1.196.3.2.1'
      )
    );
    this.sourceAddIdentifierValue = new FormControl();
    this.sourceAddIdentifierValue.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceAddIdentifierValue',
        'MAGMED001'
      )
    );
    this.sourceManagingOrganizationOid = new FormControl();
    this.sourceManagingOrganizationOid.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceManagingOrganizationOid',
        'urn:oid:1.3.6.1.4.1.21367.2017.2.7.109'
      )
    );
    this.sourceManagingOrganizationName = new FormControl();
    this.sourceManagingOrganizationName.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.sourceManagingOrganizationName',
        'TESTORG'
      )
    );
    this.targetIdentifierSystem = new FormControl();
    this.targetIdentifierSystem.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.targetIdentifierSystem',
        'urn:oid:2.16.756.5.30.1.191.1.0.2.1'
      )
    );
    this.targetIdentifier2System = new FormControl();
    this.targetIdentifier2System.setValue(
      this.getLocalStorageItemOrDefault(
        'mag.targetIdentifier2System',
        'urn:oid:2.16.756.5.30.1.127.3.10.3'
      )
    );
    this.serviceStartFrom = new FormControl();
    this.serviceStartFrom.setValue(
      this.getLocalStorageItemOrDefault('mag.serviceStartFrom', '')
    );
    this.serviceStartTo = new FormControl();
    this.serviceStartTo.setValue(
      this.getLocalStorageItemOrDefault('mag.serviceStartTo', '')
    );
    this.serviceEndFrom = new FormControl();
    this.serviceEndFrom.setValue(
      this.getLocalStorageItemOrDefault('mag.serviceEndFrom', '')
    );
    this.serviceEndTo = new FormControl();
    this.serviceEndTo.setValue(
      this.getLocalStorageItemOrDefault('mag.serviceEndTo', '')
    );
    this.authenticate = new FormControl();
    this.authenticate.setValue(
      this.getLocalStorageItemOrDefault('mag.authenticate', 'HCP')
    );
    this.documentType = new FormControl();
    this.documentType.setValue(
      this.getLocalStorageItemOrDefault('mag.documentType', 'APPC')
    );

    this.targetIdentifierValue = this.getLocalStorageItemOrDefault(
      'mag.targetIdentifierValue',
      ''
    );
    this.targetIdentifier2Value = this.getLocalStorageItemOrDefault(
      'mag.targetIdentifier2Value',
      ''
    );
    this.targetId = this.getLocalStorageItemOrDefault('mag.targetId', '');

    this.iheSourceId = new FormControl();
    this.iheSourceId.setValue(oid_mag_ahdis + '.1');

    this.searchGiven = new FormControl();
    this.searchFamily = new FormControl();
    this.documentDescription = new FormControl();
    this.documentDescription.setValue(
      this.getLocalStorageItemOrDefault('mag.documentType', 'Titel')
    );
    this.masterIdentifier = new FormControl();
    this.masterIdentifier.setValue(uuidv4());
    this.creationTime = new FormControl();
    this.creationTime.setValue(toLocaleDateTime(new Date()));

    this.fhirConfigService = data;

    oauthService.configure(this.fhirConfigService.getAuthCodeFlowConfig());
    oauthService.tryLoginCodeFlow().then((_) => {
      this.scopes = this.oauthService.getGrantedScopes();
    });

    oauthService.events.subscribe((event) => {
      if (event instanceof OAuthErrorEvent) {
        console.error(event);
      } else {
        console.warn(event);
      }
    });
  }

  cache() {
    this.setLocaleStorageItem(
      'mag.sourceIdentifierSystem',
      this.sourceIdentifierSystem.value
    );
    this.setLocaleStorageItem(
      'mag.sourceIdentifierValue',
      this.sourceIdentifierValue.value
    );
    this.setLocaleStorageItem(
      'mag.targetIdentifierSystem',
      this.targetIdentifierSystem.value
    );
    this.setLocaleStorageItem(
      'mag.targetIdentifier2System',
      this.targetIdentifier2System.value
    );
    this.setLocaleStorageItem(
      'mag.targetIdentifierValue',
      this.targetIdentifierValue
    );
    this.setLocaleStorageItem(
      'mag.targetIdentifier2Value',
      this.targetIdentifier2Value
    );
    this.setLocaleStorageItem('mag.targetId', this.targetId);
    this.setLocaleStorageItem('mag.authenticate', this.authenticate.value);
    this.setLocaleStorageItem('mag.documentType', this.documentType.value);
    this.setLocaleStorageItem(
      'mag.sourceAddIdentifierSystem',
      this.sourceAddIdentifierSystem.value
    );
    this.setLocaleStorageItem(
      'mag.sourceAddIdentifierValue',
      this.sourceAddIdentifierValue.value
    );
    this.setLocaleStorageItem(
      'mag.sourceManagingOrganizationOid',
      this.sourceManagingOrganizationOid.value
    );
    this.setLocaleStorageItem(
      'mag.sourceManagingOrganizationName',
      this.sourceManagingOrganizationName.value
    );
    this.setLocaleStorageItem(
      'mag.serviceStartFrom',
      this.serviceStartFrom.value
    );
    this.setLocaleStorageItem('mag.serviceStartTo', this.serviceStartTo.value);
    this.setLocaleStorageItem('mag.serviceEndFrom', this.serviceEndFrom.value);
    this.setLocaleStorageItem('mag.serviceEndTo', this.serviceEndTo.value);
  }

  getLocalStorageItemOrDefault(key: string, def: string): string {
    const val: string = localStorage.getItem(key);
    if (val) {
      return val;
    }
    return def;
  }

  setLocaleStorageItem(key: string, value: string): string {
    localStorage.setItem(key, value);
    return value;
  }

  setJson(result: string) {
    this.json = result;
  }
  getJson(): string {
    return this.json;
  }

  getScopes(): string {
    if (this.scopes) {
      return JSON.stringify(this.scopes, null, 2);
    }
    return '';
  }

  ngOnInit() {}

  ngOnDestroy() {}

  setPixmQueryResult(response: any) {
    this.inPixmProgress = false;
    this.setJson(JSON.stringify(response, null, 2));
    this.targetIdentifierValue = this.fhirPathService.evaluateToString(
      response,
      "parameter.valueIdentifier.where(system='" +
        this.targetIdentifierSystem.value +
        "').value"
    );
    this.targetIdentifier2Value = this.fhirPathService.evaluateToString(
      response,
      "parameter.valueIdentifier.where(system='" +
        this.targetIdentifier2System.value +
        "').value"
    );
    this.targetId = this.fhirPathService.evaluateToString(
      response,
      'parameter.valueReference.reference'
    );
    this.cache();
  }

  setPatientFetchResult(response: any) {
    this.inPixmProgress = false;
    this.patient = response as fhir.r4.Patient;
    this.setJson(JSON.stringify(response, null, 2));
    this.cache();
  }

  setPIXmFeedAddResult(response: any) {
    this.inPixmProgress = false;
    this.patient = undefined;
    this.setJson(JSON.stringify(response, null, 2));
    this.cache();
  }

  onPIXmQuery() {
    this.targetIdentifierValue = '';
    this.targetIdentifier2Value = '';
    this.patient = undefined;
    this.inPixmProgress = true;
    this.cache();
    let queryParams =
      'sourceIdentifier=' +
      this.sourceIdentifierSystem.value +
      '|' +
      this.sourceIdentifierValue.value +
      '&targetSystem=' +
      this.targetIdentifierSystem.value +
      '&targetSystem=' +
      this.targetIdentifier2System.value;
    this.mag
      .operation({
        name: '$ihe-pix?' + queryParams,
        resourceType: 'Patient',
        method: 'GET',
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            'content-type': 'application/fhir+json;fhirVersion=4.0',
          },
        },
      })
      .then((response) => this.setPixmQueryResult(response))
      .catch((error) => {
        this.setJson(JSON.stringify(error, null, 2));
        this.targetIdentifierValue = '';
        this.targetIdentifier2Value = '';
        this.targetId = '';
        this.cache();
        this.inPixmProgress = false;
      });
  }

  getPatient(): Promise<fhir.r4.Patient> {
    const patientId: string = this.targetId.substring(
      this.targetId.indexOf('Patient/') + 8
    );
    return this.mag.read({
      resourceType: 'Patient',
      id: patientId,
      options: {
        headers: {
          accept: 'application/fhir+json;fhirVersion=4.0',
          'content-type': 'application/fhir+json;fhirVersion=4.0',
        },
      },
    });
  }

  async onFetchPatient() {
    this.patient = undefined;
    this.inPixmProgress = true;
    this.cache();
    try {
      this.patient = await this.getPatient();
      this.setPatientFetchResult(this.patient);
    } catch (error) {
      this.setJson(JSON.stringify(error, null, 2));
      this.cache();
      this.inPixmProgress = false;
    }
  }

  onPIXmFeedAdd() {
    this.inPixmProgress = true;
    this.cache();
    let query = {
      identifier:
        this.sourceAddIdentifierSystem.value +
        '|' +
        this.sourceAddIdentifierValue.value,
    };
    if (this.patient.managingOrganization === undefined) {
      this.patient.managingOrganization = {
        identifier: {
          system: this.sourceManagingOrganizationOid.value,
          value: this.sourceManagingOrganizationName.value,
        },
      };
    }

    this.mag
      .update({
        resourceType: 'Patient',
        body: this.patient,
        searchParams: query,
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            'content-type': 'application/fhir+json;fhirVersion=4.0',
          },
        },
      })
      .then((response) => this.setPIXmFeedAddResult(response))
      .catch((error) => {
        this.setJson(JSON.stringify(error, null, 2));
        this.cache();
        this.inPixmProgress = false;
      });
  }

  onAuthenticate() {
    this.scopes = null;
    if (this.authenticate.value === 'HCP') {
      let authCodeFlowConfig = this.fhirConfigService.getAuthCodeFlowConfig();
      authCodeFlowConfig.scope = `person_id=${this.targetIdentifier2Value}^^^&2.16.756.5.30.1.127.3.10.3&ISO purpose_of_use=urn:oid:2.16.756.5.30.1.127.3.10.5|NORM subject_role=urn:oid:2.16.756.5.30.1.127.3.10.6|HCP`;
      this.oauthService.configure(authCodeFlowConfig);
      this.oauthService.initCodeFlow();
    } else {
      this.oauthService.logOut();
    }
  }

  getSimulatedSamlPmpAssertion(mpipid: string, mpioid: string): String {
    let assertion = `<saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" ID="Assertion_3efbfc7917a1d3ec6e33ec70f410393d655980bb" IssueInstant="2020-08-28T09:01:06.421Z" Version="2.0"><saml2:AttributeStatement><saml2:Attribute Name="urn:oasis:names:tc:xacml:2.0:subject:role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri"><saml2:AttributeValue xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xsd:anyType"><hl7v3:Role xmlns:hl7v3="urn:hl7-org:v3" code="PAT" codeSystem="2.16.756.5.30.1.127.3.10.6" displayName="Patient"/></saml2:AttributeValue></saml2:Attribute><saml2:Attribute Name="urn:oasis:names:tc:xacml:2.0:resource:resource-id" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri"><saml2:AttributeValue xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xsd:string">${mpipid}^^^&amp;${mpioid}&amp;ISO</saml2:AttributeValue></saml2:Attribute></saml2:AttributeStatement></saml2:Assertion>`;
    return Base64.encode(assertion);
  }

  setBundle(bundle: fhir.r4.Bundle) {
    if (bundle) {
      this.bundle = <fhir.r4.Bundle>bundle;
      this.length = this.bundle.total;
      this.dataSource.data = this.bundle.entry.map(
        (entry) => entry.resource as fhir.r4.DocumentReference
      );
    } else {
      this.dataSource.data = null;
    }
    this.dataSource.data = this.dataSource.data; // https://stackoverflow.com/questions/46746598/angular-material-how-to-refresh-a-data-source-mat-table
  }

  setDocumentReferenceResult(response: fhir.r4.Bundle) {
    this.setJson(JSON.stringify(response, null, 2));
    this.setBundle(response);
  }

  findDocumentReferences(): Promise<fhir.r4.Bundle> {
    let query = {
      status: 'current',
      'patient.identifier':
        this.targetIdentifierSystem.value + '|' + this.targetIdentifierValue,
    };
    return this.mag.search({
      resourceType: 'DocumentReference',
      searchParams: query,
      options: {
        headers: {
          accept: 'application/fhir+json;fhirVersion=4.0',
          Authorization: 'IHE-SAML ' + this.getSamlToken(),
        },
      },
    }) as Promise<fhir.r4.Bundle>;
  }

  async onFindDocumentReferences() {
    this.inMhdQueryProgress = true;
    try {
      const bundle = await this.findDocumentReferences();
      this.setDocumentReferenceResult(bundle as fhir.r4.Bundle);
      this.inMhdQueryProgress = false;
    } catch (error) {
      this.setJson(JSON.stringify(error, null, 2));
      this.setBundle(null);
      this.inMhdQueryProgress = false;
    }
  }

  findMedicationList(format?: string): Promise<fhir.r4.Bundle> {
    let queryParams =
      'patient.identifier=' +
      this.targetIdentifierSystem.value +
      '|' +
      this.targetIdentifierValue +
      (format ? '&format=' + encodeURIComponent(format) : '');
    if (this.serviceStartFrom.value?.length > 0) {
      queryParams += `&serviceStartFrom=${this.serviceStartFrom.value}`;
    }
    if (this.serviceStartTo.value?.length > 0) {
      queryParams += `&serviceStartTo=${this.serviceStartTo.value}`;
    }
    if (this.serviceEndFrom.value?.length > 0) {
      queryParams += `&serviceEndFrom=${this.serviceEndFrom.value}`;
    }
    if (this.serviceEndTo.value?.length > 0) {
      queryParams += `&serviceEndTo=${this.serviceEndTo.value}`;
    }

    return this.mag.operation({
      name: '$find-medication-list?status=current&' + queryParams,
      resourceType: 'DocumentReference',
      method: 'GET',
      options: {
        headers: {
          accept: 'application/fhir+json;fhirVersion=4.0',
          Authorization: 'IHE-SAML ' + this.getSamlToken(),
        },
      },
    });
  }

  async onFindMedicationList() {
    this.inMhdQueryProgress = true;
    this.cache();
    try {
      const bundle = await this.findMedicationList();
      this.setDocumentReferenceResult(bundle);
      if (bundle.entry && bundle.entry.length == 1) {
        await this.downloadDocumentReferenceAttachment(
          bundle.entry[0].resource as fhir.r4.DocumentReference
        );
      }
      this.inMhdQueryProgress = false;
    } catch (error) {
      this.setJson(JSON.stringify(error, null, 2));
      this.setBundle(null);
      this.inMhdQueryProgress = false;
    }
  }

  async onFindMedicationCard() {
    this.inMhdQueryProgress = true;
    this.cache();
    try {
      const bundle = await this.findMedicationList(
        'urn:oid:2.16.756.5.30.1.127.3.10.10|urn:ch:cda-ch-emed:medication-card:2018'
      );
      this.setDocumentReferenceResult(bundle);
      if (bundle.entry && bundle.entry.length == 1) {
        await this.downloadDocumentReferenceAttachment(
          bundle.entry[0].resource as fhir.r4.DocumentReference
        );
      }
      this.inMhdQueryProgress = false;
    } catch (error) {
      this.setJson(JSON.stringify(error, null, 2));
      this.setBundle(null);
      this.inMhdQueryProgress = false;
    }
  }

  // temporary fix because we cannot generate the assertion ourselves yet
  getSamlToken() {
    if (this.authenticate.value === 'HCP') {
      switch (this.sourceIdentifierValue.value) {
        case 'MAGMED005':
          console.log('simulation token');
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il8zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiIElzc3VlSW5zdGFudD0iMjAyMS0wOS0xNVQwODozMzowNS43NjNaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI18zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPitGVitNNWtvNTJSM0lyNE9hMjZWTzVLZnNMNUJkdUFrdGpqOEpzdnI5dms9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpsallPcUFHbW1URlBndW5QeUxWZHJzWG1vS1Y3TUcwMG5aZCtjR2owT0Ntb1k5SFdEYXhJNjB3ZllRRDlGNmg2N1pOcUhodFVjblVICm51L2lvR0RYYWNyNFFkT3Brc1ZzUk1SeHdjTjF1S1VLdWY1cldWcGlWeXQ0T1NHT2hxWDFZeGlRWjBrOVVQWVF4ZExYTVJoSFgwMGYKRFlWSncvSjZVR3FacWhRUFdlNVh3ZzJjakZSanFQZjVjVzR4WStDdU1nbEo0cUVoemhOa2lJcUdReXc2MkhvZnArenpXM2dDRlJ0MApDbkpmRi95bVRaSFRaa1czSTdjZE0yL01Ud0ZVdVlubTVpZXE4dVd3OXNmYUFwM3Z5MkJOOXlHZ05BNmF2T1ZYTjArTHBubUJId3NuClByNlBzMVFPUnJKS2dKbENGTnVLcjRqWGJ0SEpyOGF4ZnN6czBBPT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9lMWVmYTlhM2IyODFjNzA4MDJmZjdkYTFiMDEyZTIzYTRlYjRiNGQwIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMDktMTVUMDg6Mzg6MDUuNzYzWiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMDktMTVUMDg6MzM6MDQuNzYzWiIgTm90T25PckFmdGVyPSIyMDIxLTA5LTE1VDA4OjM4OjA1Ljc2M1oiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTA5LTE1VDA4OjMzOjA1Ljc2M1oiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTE5MzIwMDkwOTVeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4K';
        case 'MAGMED006':
          console.log('simulation token');
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il8zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiIElzc3VlSW5zdGFudD0iMjAyMS0wOS0xNVQwODozMzowNS43NjNaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI18zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPitGVitNNWtvNTJSM0lyNE9hMjZWTzVLZnNMNUJkdUFrdGpqOEpzdnI5dms9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpsallPcUFHbW1URlBndW5QeUxWZHJzWG1vS1Y3TUcwMG5aZCtjR2owT0Ntb1k5SFdEYXhJNjB3ZllRRDlGNmg2N1pOcUhodFVjblVICm51L2lvR0RYYWNyNFFkT3Brc1ZzUk1SeHdjTjF1S1VLdWY1cldWcGlWeXQ0T1NHT2hxWDFZeGlRWjBrOVVQWVF4ZExYTVJoSFgwMGYKRFlWSncvSjZVR3FacWhRUFdlNVh3ZzJjakZSanFQZjVjVzR4WStDdU1nbEo0cUVoemhOa2lJcUdReXc2MkhvZnArenpXM2dDRlJ0MApDbkpmRi95bVRaSFRaa1czSTdjZE0yL01Ud0ZVdVlubTVpZXE4dVd3OXNmYUFwM3Z5MkJOOXlHZ05BNmF2T1ZYTjArTHBubUJId3NuClByNlBzMVFPUnJKS2dKbENGTnVLcjRqWGJ0SEpyOGF4ZnN6czBBPT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9lMWVmYTlhM2IyODFjNzA4MDJmZjdkYTFiMDEyZTIzYTRlYjRiNGQwIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMDktMTVUMDg6Mzg6MDUuNzYzWiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMDktMTVUMDg6MzM6MDQuNzYzWiIgTm90T25PckFmdGVyPSIyMDIxLTA5LTE1VDA4OjM4OjA1Ljc2M1oiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTA5LTE1VDA4OjMzOjA1Ljc2M1oiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTU3NTgyOTEwNDdeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4K';
        case 'MAGMED007':
          console.log('simulation token');
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il8zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiIElzc3VlSW5zdGFudD0iMjAyMS0wOS0xNVQwODozMzowNS43NjNaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI18zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPitGVitNNWtvNTJSM0lyNE9hMjZWTzVLZnNMNUJkdUFrdGpqOEpzdnI5dms9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpsallPcUFHbW1URlBndW5QeUxWZHJzWG1vS1Y3TUcwMG5aZCtjR2owT0Ntb1k5SFdEYXhJNjB3ZllRRDlGNmg2N1pOcUhodFVjblVICm51L2lvR0RYYWNyNFFkT3Brc1ZzUk1SeHdjTjF1S1VLdWY1cldWcGlWeXQ0T1NHT2hxWDFZeGlRWjBrOVVQWVF4ZExYTVJoSFgwMGYKRFlWSncvSjZVR3FacWhRUFdlNVh3ZzJjakZSanFQZjVjVzR4WStDdU1nbEo0cUVoemhOa2lJcUdReXc2MkhvZnArenpXM2dDRlJ0MApDbkpmRi95bVRaSFRaa1czSTdjZE0yL01Ud0ZVdVlubTVpZXE4dVd3OXNmYUFwM3Z5MkJOOXlHZ05BNmF2T1ZYTjArTHBubUJId3NuClByNlBzMVFPUnJKS2dKbENGTnVLcjRqWGJ0SEpyOGF4ZnN6czBBPT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9lMWVmYTlhM2IyODFjNzA4MDJmZjdkYTFiMDEyZTIzYTRlYjRiNGQwIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMDktMTVUMDg6Mzg6MDUuNzYzWiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMDktMTVUMDg6MzM6MDQuNzYzWiIgTm90T25PckFmdGVyPSIyMDIxLTA5LTE1VDA4OjM4OjA1Ljc2M1oiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTA5LTE1VDA4OjMzOjA1Ljc2M1oiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTQ1NzQ5NDM3NDFeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4K';
      }
      return this.oauthService.getAccessToken();
    }
    if (this.authenticate.value === 'Patient') {
      return this.getSimulatedSamlPmpAssertion(
        this.targetIdentifierValue,
        (this.targetIdentifierSystem.value as string).substring(8)
      );
    }
    return null;
  }

  async downloadDocumentReferenceAttachment(
    entry: fhir.r4.DocumentReference
  ): Promise<string | ArrayBuffer> {
    const url =
      entry.content && entry.content.length > 0
        ? entry.content[0].attachment.url
        : 'undefined';
    let completeUrl = url.replace(
      'http://test.ahdis.ch/mag-pmp/camel/xdsretrieve',
      'https://test.ahdis.ch/mag-pmp/camel/xdsretrieve'
    );
    const contentType =
      entry.content && entry.content.length > 0
        ? entry.content[0].attachment?.contentType
        : '';
    this.selectedDocumentReference = entry;
    if ('application/pdf' === contentType) {
      const title =
        entry.content && entry.content.length > 0
          ? entry.content[0].attachment.title
          : 'undefined';
      const that = this;
      const res = await fetch(completeUrl, {
        cache: 'no-store',
        headers: {
          Authorization: 'IHE-SAML ' + this.getSamlToken(),
          Accept: 'application/pdf',
        },
      });
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
          that.downloadPdf(reader.result.toString(), title);
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const headers = new HttpHeaders().set(
        'Authorization',
        'IHE-SAML ' + this.getSamlToken()
      );
      const options = {
        responseType: 'text' as const,
        headers: headers,
      };
      return new Promise((resolve, reject) => {
        this.http.get(completeUrl, options).subscribe({
          next: (body: string) => {
            (this.xml = body), this.setJson(body);
            resolve(this.xml);
          },
          error: (err: Error) => {
            reject(err);
          },
        });
      });
    }
  }

  async onDownloadDocumentReferenceAttachment(
    entry: fhir.r4.DocumentReference
  ) {
    this.inMhdQueryProgress = true;
    await this.downloadDocumentReferenceAttachment(entry);
    this.inMhdQueryProgress = false;
  }

  getStructureMap(formatCode: string, cdaToFhir: boolean): string {
    if (cdaToFhir) {
      switch (formatCode) {
        case 'urn:ihe:pharm:pml:2013':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationListDocumentToBundle';
        case 'urn:ch:cda-ch-emed:medication-card:2018':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationCardDocumentToBundle';
        case 'urn:ihe:pharm:mtp:2015':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationTreatmentPlanDocumentToBundle';
        case 'urn:ihe:pharm:pre:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationPrescriptionDocumentToBundle';
        case 'urn:ihe:pharm:padv:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedPharmaceuticalAdviceDocumentToBundle';
        case 'urn:ihe:pharm:dis:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationDispenseDocumentToBundle';
      }
    } else {
      switch (formatCode) {
        case 'urn:ch:cda-ch-emed:medication-card:2018':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/BundleToCdaChEmedMedicationCardDocument';
        case 'urn:ihe:pharm:mtp:2015':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/BundleToCdaChEmedMedicationTreatmentPlanDocument';
        case 'urn:ihe:pharm:pre:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/BundleToCdaChEmedMedicationPrescriptionDocument';
        case 'urn:ihe:pharm:padv:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/BundleToCdaChEmedPharmaceuticalAdviceDocument';
        case 'urn:ihe:pharm:dis:2010':
          return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/BundleToCdaChEmedMedicationDispenseDocument';
      }
    }
    return null;
  }

  canTransformToFhir(): boolean {
    if (this.selectedDocumentReference) {
      const formatCode =
        this.selectedDocumentReference.content &&
        this.selectedDocumentReference.content.length > 0
          ? this.selectedDocumentReference.content[0].format?.code
          : '';
      return this.getStructureMap(formatCode, true) != null;
    }
    return false;
  }

  canTransformToCda(): boolean {
    if (this.getDocumentReferenceContentFormat() != null) {
      return (
        this.getStructureMap(
          this.getDocumentReferenceContentFormat().code,
          true
        ) != null
      );
    }
    return false;
  }

  setTransformResult(response: any) {
    this.setJson(JSON.stringify(response, null, 2));
    // wrong fhirpath, should be ofType(Binary) and would be nicer to resolve from the section link
    this.pdf = this.fhirPathService.evaluateToString(
      response,
      "entry.resource.where(resourceType='Binary').data"
    );
  }

  onTransformToFhir() {
    this.inMhdQueryProgress = true;
    const formatCode =
      this.selectedDocumentReference.content &&
      this.selectedDocumentReference.content.length > 0
        ? this.selectedDocumentReference.content[0].format?.code
        : '';
    if (this.xml != null) {
      this.fhir
        .operation({
          name:
            'transform?source=' +
            encodeURIComponent(this.getStructureMap(formatCode, true)),
          resourceType: 'StructureMap',
          input: this.xml,
          options: {
            headers: {
              'content-type': 'application/fhir+xml;fhirVersion=4.0',
            },
          },
        })
        .then((response) => {
          this.setTransformResult(response);
          this.inMhdQueryProgress = false;
        })
        .catch((error) => {
          this.setJson(error);
          this.inMhdQueryProgress = true;
        });
    }
  }

  onTransformToCda() {
    this.inMhdUploadProgress = true;
    const formatCode = this.getDocumentReferenceContentFormat()
      ? this.getDocumentReferenceContentFormat().code
      : null;
    if (
      formatCode &&
      this.getStructureMap(formatCode, false) != null &&
      this.json != null
    ) {
      this.fhir
        .operation({
          name:
            'transform?source=' +
            encodeURIComponent(this.getStructureMap(formatCode, false)),
          resourceType: 'StructureMap',
          input: this.json,
          options: {
            headers: {
              accept: 'text/xml',
              'content-type': 'application/fhir+json;fhirVersion=4.0',
            },
          },
        })
        .then((response) => {
          // FIXME fhir client cannot handle xml directly :-)
          this.inMhdUploadProgress = true;
        })
        .catch((error) => {
          if (error.response.status === 200) {
            this.uploadContentType = 'text/xml';
            this.xml = error.response.data;
            this.setJson(this.xml);
          } else {
            this.xml = error.response.data;
          }
          this.inMhdUploadProgress = false;
        });
    }
  }

  downloadPdf(base64String: string, fileName: string) {
    const link = document.createElement('a');
    link.href = base64String;
    link.download = `${fileName}.pdf`;
    link.click();
  }

  onPdf() {
    const title =
      this.selectedDocumentReference.content &&
      this.selectedDocumentReference.content.length > 0
        ? this.selectedDocumentReference.content[0].attachment.title
        : 'undefined';
    const pdfdata = `data:application/pdf;base64,${this.pdf}`;
    this.downloadPdf(pdfdata, title);
  }

  generateOidFromUuid(): string {
    let guid = uuidv4();
    let guidBytes = `0x${guid.replace(/-/g, '')}`;
    var bigInteger = BigInt(guidBytes);
    return `2.25.${bigInteger.toString()}`;
  }

  getDocumentReferenceType(): fhir.r4.CodeableConcept {
    switch (this.documentType.value) {
      case 'APPC':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '721914005',
              display: 'Patient consent document',
            },
          ],
        };
      case 'MTP':
      case 'PADV':
      case 'DIS':
      case 'PDF':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '419891008',
              display: 'Record artifact',
            },
          ],
        };
      case 'PRE':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '761938008',
              display: 'Medicinal Prescription record (record artifact)',
            },
          ],
        };
    }
    return null;
  }

  getDocumentReferenceCategory(): fhir.r4.CodeableConcept {
    switch (this.documentType.value) {
      case 'APPC':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '405624007',
              display: 'Administrative documentation',
            },
          ],
        };
      case 'MTP':
      case 'DIS':
      case 'PRE':
      case 'PADV':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '440545006',
              display: 'Prescription record',
            },
          ],
        };
      case 'PDF':
        return {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '405624007',
              display: 'Administrative documentation',
            },
          ],
        };
    }
    return null;
  }

  getDocumentReferenceContentFormat(): fhir.r4.Coding {
    switch (this.documentType.value) {
      case 'APPC':
        return {
          system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
          code: 'urn:ihe:iti:appc:2016:consent',
          display: 'Advanced Patient Privacy Consents',
        };
      case 'MTP':
        return {
          system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
          code: 'urn:ihe:pharm:mtp:2015',
        };
      case 'DIS':
        return {
          system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
          code: 'urn:ihe:pharm:dis:2010',
        };
      case 'PRE':
        return {
          system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
          code: 'urn:ihe:pharm:pre:2010',
        };
      case 'PADV':
        return {
          system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
          code: 'urn:ihe:pharm:padv:2010',
        };
      case 'PDF':
        return {
          system: 'urn:oid:2.16.756.5.30.1.127.3.10.10',
          code: 'urn:che:epr:EPR_Unstructured_Document',
        };
    }
    return null;
  }

  addFile(droppedBlob: IDroppedBlob) {
    this.uploadBase64 = '';
    this.uploadContentType = '';
    this.uploadBundle = null;
    this.json = '';
    this.xml = '';
    this.pdf = '';

    if (
      droppedBlob.contentType === 'application/json' ||
      droppedBlob.name.endsWith('.json') ||
      droppedBlob.contentType === 'text/xml' ||
      droppedBlob.name.endsWith('.xml')
    ) {
      this.addText(droppedBlob);
    } else {
      var reader = new FileReader();
      const that = this;
      reader.readAsDataURL(droppedBlob.blob);
      reader.onloadend = function () {
        let result = reader.result.toString();
        if (result.startsWith('data:application/pdf;base64,')) {
          that.uploadBase64 = result.substring(
            'data:application/pdf;base64,'.length
          );
          that.uploadContentType = 'application/pdf';
          that.documentType.setValue('PDF');
        }
      };
    }
  }

  addText(blob: IDroppedBlob) {
    const reader = new FileReader();
    reader.readAsText(blob.blob);
    const that = this;
    this.documentDescription.setValue(blob.name);
    this.creationTime.setValue(toLocaleDateTime(new Date()));
    reader.onload = () => {
      if (
        blob.contentType === 'application/json' ||
        blob.name.endsWith('.json')
      ) {
        this.uploadContentType = 'application/json';
        this.autoDetectFormat(<string>reader.result);
      }
      if (blob.contentType === 'text/xml' || blob.name.endsWith('.xml')) {
        this.uploadContentType = 'text/xml';
        that.documentType.setValue('XML');
        that.xml = <string>reader.result;
        that.setJson(that.xml);
      }
    };
  }

  autoDetectFormat(jsonString: string) {
    this.documentType.setValue('JSON');
    const json = JSON.parse(jsonString);
    this.setJson(jsonString);

    if (json.hasOwnProperty('resourceType')) {
      const res = json as fhir.r4.Resource;
      if ('Bundle' === res.resourceType) {
        const bundle = json as fhir.r4.Bundle;
        this.autoDetectBundle(bundle);
      }
    }
  }

  autoDetectBundle(bundle: fhir.r4.Bundle) {
    this.creationTime.setValue(bundle.timestamp);
    this.masterIdentifier.setValue(bundle.identifier.value);
    if ('document' === bundle.type && bundle.entry?.length > 0) {
      const composition = bundle.entry[0].resource as fhir.r4.Composition;
      const snomedct = composition.type.coding.find(
        (coding) => 'http://snomed.info/sct' === coding.system
      );
      const loinc = composition.type.coding.find(
        (coding) => 'http://loinc.org' === coding.system
      );
      if (
        loinc &&
        '77603-9' === loinc.code &&
        snomedct &&
        '419891008' === snomedct.code
      ) {
        this.uploadBundle = bundle;
        this.documentType.setValue('MTP');
        return;
      }
      if (
        loinc &&
        '57833-6' === loinc.code &&
        snomedct &&
        '761938008' === snomedct.code
      ) {
        this.uploadBundle = bundle;
        this.documentType.setValue('PRE');
        return;
      }
      if (
        loinc &&
        '60593-1' === loinc.code &&
        snomedct &&
        '419891008' === snomedct.code
      ) {
        this.uploadBundle = bundle;
        this.documentType.setValue('DIS');
        return;
      }
      if (
        loinc &&
        '61356-2' === loinc.code &&
        snomedct &&
        '419891008' === snomedct.code
      ) {
        this.uploadBundle = bundle;
        this.documentType.setValue('PADV');
        return;
      }
    }
  }

  async assignMobileAccessPatient() {
    this.inMhdUploadProgress = true;
    this.errMsgAssignPatient = '';

    if (this.patient == null) {
      this.patient = await this.getPatient();
    }

    if (this.patient == null) {
      this.errMsgAssignPatient =
        "Error: select first 'get Patient' from Mobile Access Gateway";
      return;
    }
    if (this.uploadBundle == null) {
      this.errMsgAssignPatient =
        'Error: need a FHIR Bundle in json format to assign the Patient';
      return;
    }
    const patientEntries = this.uploadBundle.entry.filter(
      (entry) => 'Patient' === entry.resource.resourceType
    );

    // we keep only the local patient identifier
    const patientCopy: fhir.r4.Patient = { ...this.patient };
    patientCopy.identifier = this.patient.identifier.filter(
      (identifier) => identifier.system === this.sourceIdentifierSystem.value
    );
    patientCopy.identifier.find(
      (identifier) => identifier.system === this.sourceIdentifierSystem.value
    ).type = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
          code: 'MR',
        },
      ],
    };

    // we have sometime multiple names in cara test system, we reduce it to the first one
    patientCopy.name = Array<fhir.r4.HumanName>();
    patientCopy.name[0] = this.patient.name[0];

    patientEntries.forEach((patientEntry) => {
      const id = patientEntry.resource.id;
      patientEntry.resource = { ...patientCopy };
      patientEntry.resource.id = id;
    });

    let jsonString = JSON.stringify(this.uploadBundle, null, 2);

    // create a new uuid and replace all occurences of it in the document, store if for later referring uuid's
    const existingUuid = this.uploadBundle.identifier.value;
    const newUuid = 'urn:uuid:' + uuidv4();

    this.replaceUuids.push({
      descr: this.documentType.value,
      existingUuid,
      newUuid,
    });
    this.replaceUuids.forEach(
      (entry) =>
        (jsonString = jsonString.split(entry.existingUuid).join(entry.newUuid))
    );

    this.masterIdentifier.setValue(newUuid);

    // PMP is currently not able to handle MORN, NOON, EVE, NIGHT
    jsonString = jsonString.split('"MORN"').join('"ACM"');
    jsonString = jsonString.split('"NOON"').join('"ACD"');
    jsonString = jsonString.split('"EVE"').join('"ACV"');
    jsonString = jsonString.split('"NIGHT"').join('"HS"');

    this.setJson(jsonString);
    this.inMhdUploadProgress = false;
  }

  createMhdTransaction() {
    this.inMhdUploadProgress = true;
    let bundle: fhir.r4.Bundle = {
      resourceType: 'Bundle',
      meta: {
        profile: [
          'http://profiles.ihe.net/ITI/MHD/StructureDefinition/IHE.MHD.Comprehensive.ProvideBundle',
        ],
      },
      type: 'transaction',
      entry: [
        {
          fullUrl: '$1',
          resource: {
            resourceType: 'Binary',
            contentType: '$1.2',
            data: '$2',
          },
          request: {
            method: 'POST',
            url: 'Binary',
          },
        },
        {
          fullUrl: '$3',
          resource: {
            resourceType: 'List',
            extension: [],
            identifier: [
              {
                use: 'official',
                system: 'urn:ietf:rfc:3986',
                value: '$5',
              },
              {
                use: 'usual',
                system: 'urn:ietf:rfc:3986',
                value: '$6',
              },
            ],
            status: 'current',
            mode: 'working',
            code: {
              coding: [
                {
                  system:
                    'http://profiles.ihe.net/ITI/MHD/CodeSystem/MHDlistTypes',
                  code: 'submissionset',
                  display: 'SubmissionSet as a FHIR List',
                },
              ],
            },
            subject: {
              reference: '$7',
            },
            date: '$8',
            entry: [
              {
                item: {
                  reference: '#9',
                },
              },
            ],
          },
          request: {
            method: 'POST',
            url: 'List',
          },
        },
        {
          fullUrl: '#9',
          resource: {
            resourceType: 'DocumentReference',
            contained: [
              {
                resourceType: 'Patient',
                id: '1',
                identifier: [
                  {
                    system: 'urn:oid:2.16.756.5.30.1.191.1.0.12.3.101',
                    value: '$10',
                  },
                  {
                    system: 'urn:oid:2.16.756.5.30.1.191.1.0.2.1',
                    value: '$11',
                  },
                ],
              },
            ],
            extension: [],
            masterIdentifier: {
              value: '$12',
            },
            identifier: [
              {
                use: 'usual',
                system: 'urn:ietf:rfc:3986',
                value: '$14',
              },
            ],
            status: 'current',
            category: [],
            subject: {
              reference: '#7',
            },
            date: '$8',
            description: 'Upload',
            securityLabel: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '17621005',
                    display: 'Normal (qualifier value)',
                  },
                ],
              },
            ],
            content: [
              {
                attachment: {
                  contentType: '$1.2',
                  language: 'de-CH',
                  url: '$1',
                  creation: '$8',
                },
              },
            ],
            context: {
              facilityType: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '264358009',
                    display: 'General practice premises(environment)',
                  },
                ],
              },
              practiceSetting: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '394802001',
                    display: 'General medicine(qualifier value)',
                  },
                ],
              },
              sourcePatientInfo: {
                reference: '#1',
              },
            },
          },
          request: {
            method: 'POST',
            url: 'DocumentReference',
          },
        },
      ],
    };

    // Binary
    let fullUrlBinary = 'urn:uuid:' + uuidv4();

    bundle.entry[0].fullUrl = fullUrlBinary; // $1
    //    bundle.entry[0].resource.data = Base64.encode(this.upload); // $2

    const binary: fhir.r4.Binary = bundle.entry[0].resource as fhir.r4.Binary;
    binary.contentType = this.uploadContentType; // $1.2

    if (this.json?.length > 0) {
      binary.data = Base64.encode(this.json);
    } else {
      binary.data = this.uploadBase64; // $2
    }

    // List
    let uuid3 = uuidv4();
    bundle.entry[1].fullUrl = 'urn:uid:' + uuid3; // $3
    const list: fhir.r4.List = bundle.entry[1].resource as fhir.r4.List;

    // $4 http://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-sourceId
    list.extension.push({
      url: 'http://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-sourceId',
      valueIdentifier: {
        value: this.iheSourceId.value,
      },
    });
    list.extension.push({
      url:
        'http://fhir.ch/ig/ch-epr-mhealth/StructureDefinition/ch-ext-author-authorrole',
      valueCoding: {
        system: 'urn:oid:2.16.756.5.30.1.127.3.10.6',
        code: 'HCP',
        display: 'Healthcare professional',
      },
    });
    list.extension.push({
      url:
        'http://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-designationType',
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '71388002',
            display: 'Procedure (procedure)',
          },
        ],
        text: 'Procedure (procedure)',
      },
    });

    let listUniqueId = 'urn:uuid:' + uuidv4();
    list.identifier[0].value = listUniqueId; // $5 identifier.official uniqueId

    let listEntryUuid = 'urn:oid:' + this.generateOidFromUuid();

    list.identifier[1].value = listEntryUuid; // $6 identifier.usual
    list.subject.reference = this.targetId; // $7 https://test.ahdis.ch/mag-pmp/fhir/Patient/2.16.756.5.30.1.191.1.0.2.1-713d79be-058e-4f55-82a8-e1f81f5e0047

    let currentDateTime = toLocaleDateTime(new Date());
    list.date = currentDateTime; // $8 2011-11-29T11:00:00+01:00

    let fullUrlDocumentReference = 'urn:uuid:' + uuidv4();
    list.entry[0].item.reference = fullUrlDocumentReference; // $9 urn:uuid:537f1c0f-6adc-48b2-b7f9-141f7e639972

    // DocumentReference
    bundle.entry[2].fullUrl = fullUrlDocumentReference; // $9
    const docref: fhir.r4.DocumentReference = bundle.entry[2]
      .resource as fhir.r4.DocumentReference;

    docref.extension.push({
      url:
        'http://fhir.ch/ig/ch-epr-mhealth/StructureDefinition/ch-ext-author-authorrole',
      valueCoding: {
        system: 'urn:oid:2.16.756.5.30.1.127.3.10.6',
        code: 'HCP',
        display: 'Healthcare professional',
      },
    });

    const docrefpat: fhir.r4.Patient = docref.contained[0] as fhir.r4.Patient;

    docrefpat.identifier[0].value = this.sourceIdentifierSystem.value;
    docrefpat.identifier[0].value = this.sourceIdentifierValue.value; // $10

    docrefpat.identifier[1].value = this.targetIdentifierSystem.value;
    docrefpat.identifier[1].value = this.targetIdentifierValue; // $11

    //    let docRefUniqueId =
    //      'urn:uuid:' + this.masterIdentifier.value.toLocaleLowerCase();
    let docRefUniqueId = this.masterIdentifier.value.toLocaleLowerCase();

    docref.masterIdentifier.value = docRefUniqueId; // $12 urn:uuid:537f1c0f-6adc-48b2-b7f9-141f7e639972 DocumentEntry.uniqueId

    let docRefEntryUuid = 'urn:oid:' + this.generateOidFromUuid();
    docref.identifier[0].value = docRefEntryUuid; // $14 identifier.usual DocumentEntry.entryUuid

    docref.subject.reference = this.targetId; // $7 https://test.ahdis.ch/mag-pmp/fhir/Patient/2.16.756.5.30.1.191.1.0.2.1-713d79be-058e-4f55-82a8-e1f81f5e0047
    docref.date = currentDateTime; // $8 2011-11-29T11:00:00+01:00

    docref.content[0].attachment.url = fullUrlBinary; // $1
    docref.content[0].attachment.contentType = this.uploadContentType; // $1.2

    let documentReference: fhir.r4.DocumentReference = bundle.entry[2]
      .resource as fhir.r4.DocumentReference;

    documentReference.date = this.creationTime.value;
    documentReference.type = this.getDocumentReferenceType();
    documentReference.category.push(this.getDocumentReferenceCategory());
    documentReference.content[0].format = this.getDocumentReferenceContentFormat();
    documentReference.content[0].attachment.creation = this.creationTime.value;
    documentReference.description = this.documentDescription.value;

    this.mag
      .transaction({
        body: bundle as FhirResource & { type: 'transaction' },
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            Authorization: 'IHE-SAML ' + this.getSamlToken(),
          },
        },
      })
      .then((response) => {
        this.setJson(JSON.stringify(response, null, 2));
        this.inMhdUploadProgress = false;
      })
      .catch((error) => {
        this.setJson(JSON.stringify(error, null, 2));
        this.inMhdUploadProgress = false;
      });
  }
}
