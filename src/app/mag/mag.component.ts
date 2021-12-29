import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FhirConfigService } from '../fhirConfig.service';
import { FormControl } from '@angular/forms';
import FhirClient from 'fhir-kit-client';
import { FhirPathService } from '../fhirpath.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Base64 } from 'js-base64';
import { toLocaleDateTime } from '../questionnaire-item/store/util';

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

  documentReferenceFormatCode: string;
  documentReferenceAttachmentUrl: string;
  documentReferenceDescription: string;

  xml: string;
  pdf: string;
  upload: string;
  targetId: string;

  public sourceIdentifierSystem: FormControl;
  public sourceIdentifierValue: FormControl;
  public targetIdentifierSystem: FormControl;
  public targetIdentifier2System: FormControl;
  public authenticate: FormControl;
  public iheSourceId: FormControl;

  // oid mag = ahdis + .20 ->   2.16.756.5.30.1.145.20

  errMsg: string;

  constructor(
    private data: FhirConfigService,
    private fhirPathService: FhirPathService,
    private http: HttpClient,
    private cd: ChangeDetectorRef
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
    this.sourceIdentifierSystem.setValue('urn:oid:2.16.756.5.30.1.196.3.2.1');
    this.sourceIdentifierValue = new FormControl();
    this.sourceIdentifierValue.setValue('MAGMED001');
    this.targetIdentifierSystem = new FormControl();
    this.targetIdentifierSystem.setValue('urn:oid:2.16.756.5.30.1.191.1.0.2.1');
    this.targetIdentifier2System = new FormControl();
    this.targetIdentifier2System.setValue('urn:oid:2.16.756.5.30.1.127.3.10.3');
    this.authenticate = new FormControl();
    this.authenticate.setValue('HCP');
    this.iheSourceId = new FormControl();
    this.iheSourceId.setValue(oid_mag_ahdis + '.1');
  }

  setJson(result: string) {
    this.json = result;
  }
  getJson(): string {
    return this.json;
  }

  ngOnInit() {}

  ngOnDestroy() {}

  setPixmQueryResult(response: any) {
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
  }

  onPIXmQuery() {
    this.targetIdentifierValue = 'querying ...';
    this.targetIdentifier2Value = 'querying ...';
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
        method: 'get',
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
      });
  }

  setDocumentReferenceResult(response: any) {
    this.setJson(JSON.stringify(response, null, 2));
    this.documentReferenceFormatCode = this.fhirPathService.evaluateToString(
      response,
      'entry[0].resource.content.format.code'
    );
    this.documentReferenceAttachmentUrl = this.fhirPathService.evaluateToString(
      response,
      'entry[0].resource.content.attachment.url'
    );
    this.documentReferenceDescription = this.fhirPathService.evaluateToString(
      response,
      'entry[0].resource.description'
    );
  }

  findMedicationList(format?: string) {
    this.documentReferenceFormatCode = 'querying ...';
    this.documentReferenceAttachmentUrl = 'querying ...';
    let queryParams =
      'patient.identifier=' +
      this.targetIdentifierSystem.value +
      '|' +
      this.targetIdentifierValue +
      (format ? '&format=' + encodeURIComponent(format) : '');
    let saml = this.mag
      .operation({
        name: '$find-medication-list?status=current&' + queryParams,
        resourceType: 'DocumentReference',
        method: 'get',
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            Authorization: 'IHE-SAML ' + this.getSamlToken(),
          },
        },
      })
      .then((response) => this.setDocumentReferenceResult(response))
      .catch((error) => {
        this.setJson(JSON.stringify(error, null, 2));
        this.documentReferenceFormatCode = '';
        this.documentReferenceFormatCode = '';
      });
  }

  onFindMedicationList() {
    this.findMedicationList();
  }

  onFindMedicationCard() {
    this.findMedicationList(
      'urn:oid:2.16.756.5.30.1.127.3.10.10|urn:ch:cda-ch-emed:medication-card:2018'
    );
  }

  // temporary fix because we cannot generate the assertion ourselves yet
  getSamlToken() {
    if (this.authenticate.value === 'HCP') {
      switch (this.sourceIdentifierValue.value) {
        case 'MAGMED001':
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il8zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiIElzc3VlSW5zdGFudD0iMjAyMS0wOS0xNVQwODozMzowNS43NjNaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI18zZDk3YTVjNC04Zjg4LTRmYjItYjZkYi1iMzY3ZDE5ZDMxMzMiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPitGVitNNWtvNTJSM0lyNE9hMjZWTzVLZnNMNUJkdUFrdGpqOEpzdnI5dms9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpsallPcUFHbW1URlBndW5QeUxWZHJzWG1vS1Y3TUcwMG5aZCtjR2owT0Ntb1k5SFdEYXhJNjB3ZllRRDlGNmg2N1pOcUhodFVjblVICm51L2lvR0RYYWNyNFFkT3Brc1ZzUk1SeHdjTjF1S1VLdWY1cldWcGlWeXQ0T1NHT2hxWDFZeGlRWjBrOVVQWVF4ZExYTVJoSFgwMGYKRFlWSncvSjZVR3FacWhRUFdlNVh3ZzJjakZSanFQZjVjVzR4WStDdU1nbEo0cUVoemhOa2lJcUdReXc2MkhvZnArenpXM2dDRlJ0MApDbkpmRi95bVRaSFRaa1czSTdjZE0yL01Ud0ZVdVlubTVpZXE4dVd3OXNmYUFwM3Z5MkJOOXlHZ05BNmF2T1ZYTjArTHBubUJId3NuClByNlBzMVFPUnJKS2dKbENGTnVLcjRqWGJ0SEpyOGF4ZnN6czBBPT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9lMWVmYTlhM2IyODFjNzA4MDJmZjdkYTFiMDEyZTIzYTRlYjRiNGQwIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMDktMTVUMDg6Mzg6MDUuNzYzWiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMDktMTVUMDg6MzM6MDQuNzYzWiIgTm90T25PckFmdGVyPSIyMDIxLTA5LTE1VDA4OjM4OjA1Ljc2M1oiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTA5LTE1VDA4OjMzOjA1Ljc2M1oiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTA0MzUyMDk4MTBeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4K';
        case 'MAGMED002':
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6c29hcGVudj0iaHR0cDovL3d3dy53My5vcmcvMjAwMy8wNS9zb2FwLWVudmVsb3BlIiB4bWxuczp3c3Q9Imh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzLXN4L3dzLXRydXN0LzIwMDUxMiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il8xODNmMjBiYS04ZTY4LTQzOGUtOGUxNC02YWUzNTYxZjdlZGMiIElzc3VlSW5zdGFudD0iMjAyMS0xMS0yOVQxNjowMDoyMS40MTRaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI18xODNmMjBiYS04ZTY4LTQzOGUtOGUxNC02YWUzNTYxZjdlZGMiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPkJtVzNucE03SjllNXFQTVJsYUNZeVhwNkZrUXlqNktYMi9Nd3hXajREcVU9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpCN1A5dlk5L1J3dDdxcGE3RE42NVg2NmF6MWhvZDRhdjBuRENMS3cvUGFQOFpWQ2xZU0orRHk4aUNPeE81RU9LU1E4aWtpY3o5bG95CjNzQytiL1lEc1U3VlVWdkNiNlBhbFEzbFBLeTRONzhzanBhbExmczUvSDlEbCtsUTlVQXIzakZOSXFQU0hUUUFBTVNUam9VcUFZMFMKcjBLZXV1L3ZRT2tJUDAzak5BQUx6NlNVQ1V0cnYzZ3Z4L0cxSFZ6V3ZUS2lwSjdVZDBMMU5OOWE1bUdGVDlZRXQ0TXl0QkRLczB3SQo1SnBoTCtWR3NORjZ5Z0M3RU5sd0Ftc3ltRy8yMnhzUEx5TlIya3RuY1VydjV6Z1I1WGpvYjBNejNOSWFpM2Z0WXVuWWd1cDZlRzRtCkNBQk56T3V4b3NEVDlRcDBLZzV6RkdBUndFbjJUQWtkUWdCNVl3PT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9iZmQ4MjA0Nzc3ZWYzMTdhODllMDUzMWMzMjViOTY4YTY1Y2YwNTRiIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMTEtMjlUMTY6MDU6MjEuNDE0WiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMTEtMjlUMTY6MDA6MjAuNDE0WiIgTm90T25PckFmdGVyPSIyMDIxLTExLTI5VDE2OjA1OjIxLjQxNFoiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTExLTI5VDE2OjAwOjIxLjQxNFoiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTA0MzY5NzQ0ODleXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4=';
        case 'MAGMED003':
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6c29hcGVudj0iaHR0cDovL3d3dy53My5vcmcvMjAwMy8wNS9zb2FwLWVudmVsb3BlIiB4bWxuczp3c3Q9Imh0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL3dzLXN4L3dzLXRydXN0LzIwMDUxMiIgeG1sbnM6eHNkPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgSUQ9Il9hNmQ0MWYwZC01ODJmLTRjODUtYTZhOC1kMGI5OGJhYWZkNzUiIElzc3VlSW5zdGFudD0iMjAyMS0xMS0yOVQxNjowNzowMS4xNDhaIiBWZXJzaW9uPSIyLjAiPjxzYW1sMjpJc3N1ZXI+aHR0cDovL2l0aC1pY29zZXJ2ZS5jb20vZUhlYWx0aFNvbHV0aW9uc1NUUzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNyc2Etc2hhMSIvPgo8ZHM6UmVmZXJlbmNlIFVSST0iI19hNmQ0MWYwZC01ODJmLTRjODUtYTZhOC1kMGI5OGJhYWZkNzUiPgo8ZHM6VHJhbnNmb3Jtcz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+CjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiPjxlYzpJbmNsdXNpdmVOYW1lc3BhY2VzIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiIFByZWZpeExpc3Q9InhzZCIvPjwvZHM6VHJhbnNmb3JtPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPjczMndLMGdBQklScTJ4ZmFGSEcxdDgvbllnME8zaDhMTFZSaFA2OU0rNGM9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgphc3pMZzVVWjVUVE1Cdm95ZTFlWnJSOG9WMElxR1JKRzA2dm52Y0t0THFiM0FkaXZrQ01XbHJ3WHdvWWN3V01kcitaRWJ0dEkvS0cyCm9ObUF4MlJ5bWhsT0lybSthZjdDb2FJNHYzM0k1ZFZMdUdxNURySVV1QS9jcXN2cGEveExHbGQxcEo4ZjVXZDl3NUtPOXBFNzljWUEKWHdMY2tpeXE4ZnpRYUNTa3daMFNqYWNObG40TnlWbDZxdVZQMXdZNnZ5ckVXbk5zakdUd012QzhiUTZzUEx5SE1RSGU3SjJrVXNCVAo2RnJiandkdVJPMExJVHNzSXNvc0p1QUpUUGZmdkNTbUEvbVM2Q1p1aktNNmVoQ0s5ZVFHNit2Zi9mTkQ0UzVCZ0QzNGx4eXBoV1VMCkJzZ1JhNG5VOG0xN09BT2xWalFBcWRNSWRJeldITmd3SUV0b3VRPT0KPC9kczpTaWduYXR1cmVWYWx1ZT4KPGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJR2pUQ0NCWFdnQXdJQkFnSVViQjhGT24wU0RNNFhkdjNVMG9ubjlGUzJ4TUV3RFFZSktvWklodmNOQVFFTEJRQXdWREVMTUFrRwpBMVVFQmhNQ1EwZ3hGVEFUQmdOVkJBb1RERk4zYVhOelUybG5iaUJCUnpFdU1Dd0dBMVVFQXhNbFUzZHBjM05UYVdkdUlGQmxjbk52CmJtRnNJRWR2YkdRZ1EwRWdNakF4TkNBdElFY3lNakFlRncweU1EQXlNamd3TlRRNE1ETmFGdzB5TXpBeU1qZ3dOVFE0TUROYU1JR3UKTVFzd0NRWURWUVFHRXdKRFNERU5NQXNHQTFVRUNCTUVRbVZ5YmpFVE1CRUdBMVVFQ2hNS1VHOXpkQ0JEU0NCQlJ6RWNNQm9HQTFVRQpDeE1UUlMxSVpXRnNkR2dnVDNCbGNtRjBhVzl1Y3pFcU1DZ0dDU3FHU0liM0RRRUpBUlliYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwCmFFQndiM04wTG1Ob01URXdMd1lEVlFRREV5aHdjMlYxWkc4NklGTkJUVXdnVTJsbmJtVnlJRU5CVWtFZ1NXNTBaV2R5WVhScGIyNGcKUlZCRU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBeVJOL3hXWE5zRE5sVE9QOW5TdmVnNWlVZDdscQp1N1RkaDVBQWdsOVE2QVNvVGg3ekplYkkraGs0SU9iUTdQN1dOZXlEY2RTWlBldHd3OEdKOG15Zm1Sb1Q4allHTWlwQWJSVGg3dWRrCnZ4MERPVVR3TUpYOFJMemVHdVhBQ3dmV3lXZTlpNnc2a3loSVlyVDIxdmNMQ0Z3bnlUUFcxTGFCWm9WWkNNMjN4VHdCRVlRT1VjNEoKYXJDOXJxcm0vMmFOVlBrZDhGM1h5anNTM0ZZVzJ1MXcwNU5yMnNBSWRWYlVnbXFMMWJYeFFmLzI4Vk5HMmkyWjZCWm5VMzdWVTBrdQpqK201b2NnaVJjWm9teVV1ZTMyUnAvMm1tblpWb0t1NmFqcURQNEtkYWVNcm42c1d1dnNpTlpFTDg0ZSs0ZFBPY0k2SHVvRStHcUthCmI4OXFpckFkT3dJREFRQUJvNElDK2pDQ0F2WXdKZ1lEVlIwUkJCOHdIWUViYjNCbGNtRjBhVzl1Y3k1bExXaGxZV3gwYUVCd2IzTjAKTG1Ob01BNEdBMVVkRHdFQi93UUVBd0lEK0RBMUJnTlZIU1VFTGpBc0JnZ3JCZ0VGQlFjREFnWUlLd1lCQlFVSEF3UUdDaXNHQVFRQgpnamNLQXdRR0Npc0dBUVFCZ2pjVUFnSXdIUVlEVlIwT0JCWUVGT05ZK0dwMWZMUVdwU0N2T2FLQzJqeE5pTUhrTUI4R0ExVWRJd1FZCk1CYUFGTm95K1VuNFVjeVljV1lNMmM2MjI1SS9DVXZ2TUlIL0JnTlZIUjhFZ2Zjd2dmUXdSNkJGb0VPR1FXaDBkSEE2THk5amNtd3UKYzNkcGMzTnphV2R1TG01bGRDOUVRVE15UmprME9VWTROVEZEUXprNE56RTJOakJEUkRsRFJVSTJSRUk1TWpOR01EazBRa1ZHTUlHbwpvSUdsb0lHaWhvR2ZiR1JoY0RvdkwyUnBjbVZqZEc5eWVTNXpkMmx6YzNOcFoyNHVibVYwTDBOT1BVUkJNekpHT1RRNVJqZzFNVU5ECk9UZzNNVFkyTUVORU9VTkZRalpFUWpreU0wWXdPVFJDUlVZbE1rTlBQVk4zYVhOelUybG5iaVV5UTBNOVEwZy9ZMlZ5ZEdsbWFXTmgKZEdWU1pYWnZZMkYwYVc5dVRHbHpkRDlpWVhObFAyOWlhbVZqZEVOc1lYTnpQV05TVEVScGMzUnlhV0oxZEdsdmJsQnZhVzUwTUdrRwpBMVVkSUFSaU1HQXdWQVlKWUlWMEFWa0JBZ0VOTUVjd1JRWUlLd1lCQlFVSEFnRVdPV2gwZEhBNkx5OXlaWEJ2YzJsMGIzSjVMbk4zCmFYTnpjMmxuYmk1amIyMHZVM2RwYzNOVGFXZHVMVWR2YkdRdFExQXRRMUJUTG5Ca1pqQUlCZ1lFQUk5NkFRRXdnZGNHQ0NzR0FRVUYKQndFQkJJSEtNSUhITUdRR0NDc0dBUVVGQnpBQ2hsaG9kSFJ3T2k4dmMzZHBjM056YVdkdUxtNWxkQzlqWjJrdFltbHVMMkYxZEdodgpjbWwwZVM5a2IzZHViRzloWkM5RVFUTXlSamswT1VZNE5URkRRems0TnpFMk5qQkRSRGxEUlVJMlJFSTVNak5HTURrMFFrVkdNRjhHCkNDc0dBUVVGQnpBQmhsTm9kSFJ3T2k4dloyOXNaQzF3WlhKemIyNWhiQzFuTWk1dlkzTndMbk4zYVhOemMybG5iaTV1WlhRdlJFRXoKTWtZNU5EbEdPRFV4UTBNNU9EY3hOall3UTBRNVEwVkNOa1JDT1RJelJqQTVORUpGUmpBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQpiNW52VmsreHJ3RENjeC9DN2FLSlNrd3VFOE12UkZ3UmViNUlXSjk5RmhZeDlrSEhmMEgwN3hPQWJURkVhZER4ZXRwbjQvNVU4UlNSClQxY3RRUTNWR1pUNTdVeW50aVd1aGV5Q051SnBMZ3pjb3UrSTh3MWpiK1RPZVNBRjBhME1QSFFNcmRPcEQ5aWtNdVhmaG5nRjRONHUKTVVkSXhIbk95U2g3VE0rQllERU9hdXVOYVV2T3BOczdsMUs0aGFRY1MvYmFYU2hXdVBwN2dQZzhWb1dEMXZqUlFzeDY3RVY5MVAySQpHTWNreXZPWFVuWXVaYjZtMWlJYUplSlVkOEUxS3Jud3QxU2czVkpWVkdqWk1JdVRVMW5YMWlhSjVFWkxab1RCR0daSFk1SHFuV1o4CnBDWTRVek1KVGZuQmpJUFlaSzFNeEx6QkIvY3dqMWJJeHVOeVpBPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6U3ViamVjdD48c2FtbDI6TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCIgTmFtZVF1YWxpZmllcj0idXJuOmdzMTpnbG4iPjc2MDEwMDIwNzQ4MDM8L3NhbWwyOk5hbWVJRD48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBJblJlc3BvbnNlVG89IkFzc2VydGlvbl9hNGFmYWRlNTYzYWNhYzZmYmMwYWNjNzAwYjIyZGE1OTkxMjhiYWEzIiBOb3RPbk9yQWZ0ZXI9IjIwMjEtMTEtMjlUMTY6MTI6MDEuMTQ4WiIgUmVjaXBpZW50PSJodHRwOi8vdGVzdC5haGRpcy5jaC9tYWctcG1wIi8+PC9zYW1sMjpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDI6U3ViamVjdD48c2FtbDI6Q29uZGl0aW9ucyBOb3RCZWZvcmU9IjIwMjEtMTEtMjlUMTY6MDc6MDAuMTQ4WiIgTm90T25PckFmdGVyPSIyMDIxLTExLTI5VDE2OjEyOjAxLjE0OFoiPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT51cm46ZS1oZWFsdGgtc3Vpc3NlOnRva2VuLWF1ZGllbmNlOmFsbC1jb21tdW5pdGllczwvc2FtbDI6QXVkaWVuY2U+PC9zYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDI6Q29uZGl0aW9ucz48c2FtbDI6QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDIxLTExLTI5VDE2OjA3OjAxLjE0OFoiPjxzYW1sMjpBdXRobkNvbnRleHQ+PHNhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPnVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphYzpjbGFzc2VzOlBhc3N3b3JkUHJvdGVjdGVkVHJhbnNwb3J0PC9zYW1sMjpBdXRobkNvbnRleHRDbGFzc1JlZj48L3NhbWwyOkF1dGhuQ29udGV4dD48L3NhbWwyOkF1dGhuU3RhdGVtZW50PjxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24iPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eHNwYToxLjA6c3ViamVjdDpvcmdhbml6YXRpb24taWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOmFueVVSSSI+dXJuOm9pZDoyLjE2Ljc1Ni41LjMwLjEuMTk2PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnN1YmplY3QtaWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHNkOnN0cmluZyI+Q2VybmVyIDEgQ0hVVjwvc2FtbDI6QXR0cmlidXRlVmFsdWU+PC9zYW1sMjpBdHRyaWJ1dGU+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxSb2xlIHhtbG5zPSJ1cm46aGw3LW9yZzp2MyIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgY29kZT0iSENQIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIEVQUiBBY3RvcnMiIGRpc3BsYXlOYW1lPSJIZWFsdGhjYXJlIHByb2Zlc3Npb25hbCIgeHNpOnR5cGU9IkNFIi8+PC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4c3BhOjEuMDpzdWJqZWN0OnB1cnBvc2VvZnVzZSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlPjxQdXJwb3NlT2ZVc2UgeG1sbnM9InVybjpobDctb3JnOnYzIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiBjb2RlPSJOT1JNIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNSIgY29kZVN5c3RlbU5hbWU9ImVIZWFsdGggU3Vpc3NlIFZlcndlbmR1bmdzendlY2siIGRpc3BsYXlOYW1lPSJOb3JtYWwgQWNjZXNzIiB4c2k6dHlwZT0iQ0UiLz48L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOm9hc2lzOm5hbWVzOnRjOnhhY21sOjIuMDpyZXNvdXJjZTpyZXNvdXJjZS1pZCI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj43NjEzMzc2MTA0MzA4OTE0MTZeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xMjcuMy4xMC4zJmFtcDtJU088L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0idXJuOmloZTppdGk6eGNhOjIwMTA6aG9tZUNvbW11bml0eUlkIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVyaSI+PHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6YW55VVJJIj51cm46b2lkOjIuMTYuNzU2LjUuMzAuMS4xOTEuMS4wPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD48L3NhbWwyOkFzc2VydGlvbj4=';
      }
    }
    if (this.authenticate.value === 'PATIENT') {
      switch (this.sourceIdentifierValue.value) {
        case 'MAGMED002':
          return 'PHNhbWwyOkFzc2VydGlvbiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgSUQ9IkFzc2VydGlvbl8zZWZiZmM3OTE3YTFkM2VjNmUzM2VjNzBmNDEwMzkzZDY1NTk4MGJiIiBJc3N1ZUluc3RhbnQ9IjIwMjAtMDgtMjhUMDk6MDE6MDYuNDIxWiIgVmVyc2lvbj0iMi4wIj4KICAgIDxzYW1sMjpBdHRyaWJ1dGVTdGF0ZW1lbnQ+CiAgICAgICAgPHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJ1cm46b2FzaXM6bmFtZXM6dGM6eGFjbWw6Mi4wOnN1YmplY3Q6cm9sZSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDp1cmkiPgogICAgICAgICAgICA8c2FtbDI6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzZDphbnlUeXBlIj4KICAgICAgICAgICAgICAgIDxobDd2MzpSb2xlIHhtbG5zOmhsN3YzPSJ1cm46aGw3LW9yZzp2MyIgY29kZT0iUEFUIiBjb2RlU3lzdGVtPSIyLjE2Ljc1Ni41LjMwLjEuMTI3LjMuMTAuNiIgZGlzcGxheU5hbWU9IlBhdGllbnQiLz4KICAgICAgICAgICAgPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT4KICAgICAgICA8L3NhbWwyOkF0dHJpYnV0ZT4KICAgICAgICA8c2FtbDI6QXR0cmlidXRlIE5hbWU9InVybjpvYXNpczpuYW1lczp0Yzp4YWNtbDoyLjA6cmVzb3VyY2U6cmVzb3VyY2UtaWQiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6dXJpIj4KICAgICAgICAgICAgPHNhbWwyOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4c2Q6c3RyaW5nIj5NQUdNRUQwMDJeXl4mYW1wOzIuMTYuNzU2LjUuMzAuMS4xOTYuMy4yLjEmYW1wO0lTTzwvc2FtbDI6QXR0cmlidXRlVmFsdWU+CiAgICAgICAgPC9zYW1sMjpBdHRyaWJ1dGU+CiAgICA8L3NhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudD4KPC9zYW1sMjpBc3NlcnRpb24+';
      }
    }
    return 'ERROR_NO_IHESAML_TOKEN_AVAILABLE';
  }

  onDownloadDocumentReferenceAttachment() {
    let completeUrl = this.documentReferenceAttachmentUrl.replace(
      'http://test.ahdis.ch/mag-pmp/camel/xdsretrieve',
      'https://test.ahdis.ch/mag-pmp/camel/xdsretrieve'
    );
    const headers = new HttpHeaders().set(
      'Authorization',
      'IHE-SAML ' + this.getSamlToken()
    );
    const options = {
      responseType: 'text' as const,
      headers: headers,
    };
    this.http.get(completeUrl, options).subscribe({
      next: (body: string) => {
        (this.xml = body), this.setJson(body);
      },
      error: (err: Error) => this.setJson(err.message),
    });
  }

  getStructureMap(formatCode: string): string {
    switch (formatCode) {
      case 'urn:ihe:pharm:pml:2013':
        return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationListDocumentToBundle';
      case 'urn:ch:cda-ch-emed:medication-card:2018':
        return 'http://fhir.ch/ig/cda-fhir-maps/StructureMap/CdaChEmedMedicationCardDocumentToBundle';
    }
  }

  setTransformResult(response: any) {
    this.setJson(JSON.stringify(response, null, 2));
    // wrong fhirpath, should be ofType(Binary) and would be nicer to resolve from the section link
    this.pdf = this.fhirPathService.evaluateToString(
      response,
      "entry.resource.where(resourceType='Binary').data"
    );
  }

  onTransform() {
    if (this.xml != null) {
      this.fhir
        .operation({
          name:
            'transform?source=' +
            encodeURIComponent(
              this.getStructureMap(this.documentReferenceFormatCode)
            ),
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
        })
        .catch((error) => {
          this.setJson(error);
        });
    }
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.pdf`;
    link.click();
  }

  onPdf() {
    this.downloadPdf(this.pdf, this.documentReferenceDescription);
  }

  fileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsText(file);
      reader.onload = () => {
        this.upload = <string>reader.result;
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      };
    }
  }

  generateOidFromUuid(): string {
    let guid = uuidv4();
    let guidBytes = `0x${guid.replace(/-/g, '')}`;
    var bigInteger = BigInt(guidBytes);
    return `2.25.${bigInteger.toString()}`;
  }

  createMhdTransaction() {
    let bundle = {
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
            contentType: 'text/xml',
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
            type: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '721914005',
                  display: 'Patient consent document',
                },
              ],
            },
            category: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '405624007',
                    display: 'Administrative documentation',
                  },
                ],
              },
            ],
            subject: {
              reference: '#7',
            },
            date: '$8',
            description: 'Upload APPC',
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
                  contentType: 'text/xml',
                  language: 'de-CH',
                  url: '$1',
                  creation: '$8',
                },
                format: {
                  system: 'urn:oid:1.3.6.1.4.1.19376.1.2.3',
                  code: 'urn:ihe:iti:appc:2016:consent',
                  display: 'Advanced Patient Privacy Consents',
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
    bundle.entry[0].resource.data = Base64.encode(this.upload); // $2
    // List
    let uuid3 = uuidv4();
    bundle.entry[1].fullUrl = 'urn:uuid:' + uuid3; // $3

    // $4 http://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-sourceId
    bundle.entry[1].resource.extension.push({
      url: 'http://profiles.ihe.net/ITI/MHD/StructureDefinition/ihe-sourceId',
      valueIdentifier: {
        value: this.iheSourceId.value,
      },
    });
    bundle.entry[1].resource.extension.push({
      url:
        'http://fhir.ch/ig/ch-epr-mhealth/StructureDefinition/ch-ext-author-authorrole',
      valueCoding: {
        system: 'urn:oid:2.16.756.5.30.1.127.3.10.6',
        code: 'HCP',
        display: 'Healthcare professional',
      },
    });
    bundle.entry[1].resource.extension.push({
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
    bundle.entry[1].resource.identifier[0].value = listUniqueId; // $5 identifier.official uniqueId

    let listEntryUuid = 'urn:oid:' + this.generateOidFromUuid();

    bundle.entry[1].resource.identifier[1].value = listEntryUuid; // $6 identifier.usual
    bundle.entry[1].resource.subject.reference = this.targetId; // $7 https://test.ahdis.ch/mag-pmp/fhir/Patient/2.16.756.5.30.1.191.1.0.2.1-713d79be-058e-4f55-82a8-e1f81f5e0047

    let currentDateTime = toLocaleDateTime(new Date());
    bundle.entry[1].resource.date = currentDateTime; // $8 2011-11-29T11:00:00+01:00

    let fullUrlDocumentReference = 'urn:uuid:' + uuidv4();
    bundle.entry[1].resource.entry[0].item.reference = fullUrlDocumentReference; // $9 urn:uuid:537f1c0f-6adc-48b2-b7f9-141f7e639972

    // DocumentReference
    bundle.entry[2].fullUrl = fullUrlDocumentReference; // $9

    bundle.entry[2].resource.extension.push({
      url:
        'http://fhir.ch/ig/ch-epr-mhealth/StructureDefinition/ch-ext-author-authorrole',
      valueCoding: {
        system: 'urn:oid:2.16.756.5.30.1.127.3.10.6',
        code: 'HCP',
        display: 'Healthcare professional',
      },
    });

    bundle.entry[2].resource.contained[0].identifier[0].value = this.sourceIdentifierSystem.value;
    bundle.entry[2].resource.contained[0].identifier[0].value = this.sourceIdentifierValue.value; // $10

    bundle.entry[2].resource.contained[0].identifier[1].value = this.targetIdentifierSystem.value;
    bundle.entry[2].resource.contained[0].identifier[1].value = this.targetIdentifierValue; // $11

    let docRefUniqueId = 'urn:uuid:' + uuidv4();
    bundle.entry[2].resource.masterIdentifier.value = docRefUniqueId; // $12 urn:uuid:537f1c0f-6adc-48b2-b7f9-141f7e639972 DocumentEntry.uniqueId

    let docRefEntryUuid = 'urn:oid:' + this.generateOidFromUuid();
    bundle.entry[2].resource.identifier[0].value = docRefEntryUuid; // $14 identifier.usual DocumentEntry.entryUuid

    bundle.entry[2].resource.subject.reference = this.targetId; // $7 https://test.ahdis.ch/mag-pmp/fhir/Patient/2.16.756.5.30.1.191.1.0.2.1-713d79be-058e-4f55-82a8-e1f81f5e0047
    bundle.entry[2].resource.date = currentDateTime; // $8 2011-11-29T11:00:00+01:00

    bundle.entry[2].resource.content[0].attachment.url = fullUrlBinary; // $1

    let created = currentDateTime;
    bundle.entry[2].resource.content[0].attachment.creation = created; // $8

    this.mag
      .transaction({
        body: bundle,
        options: {
          headers: {
            accept: 'application/fhir+json;fhirVersion=4.0',
            Authorization: 'IHE-SAML ' + this.getSamlToken(),
          },
        },
      })
      .then((response) => this.setJson(JSON.stringify(response, null, 2)))
      .catch((error) => {
        this.setJson(JSON.stringify(error, null, 2));
      });
  }
}
