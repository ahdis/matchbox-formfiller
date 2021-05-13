// Type definitions for fhir-kit-client 1.1
// Project: https://github.com/Vermonster/fhir-kit-client
// Definitions by: Matthew Morrissette <https://github.com/yinzara>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import { Options, Headers } from 'request';
import { OpPatch } from 'json-patch';

type KnownResourceType =
  | 'Account'
  | 'ActivityDefinition'
  | 'AdverseEvent'
  | 'AllergyIntolerance'
  | 'Appointment'
  | 'AppointmentResponse'
  | 'AuditEvent'
  | 'Basic'
  | 'Binary'
  | 'BodySite'
  | 'Bundle'
  | 'CapabilityStatement'
  | 'CarePlan'
  | 'CareTeam'
  | 'ChargeItem'
  | 'Claim'
  | 'ClaimResponse'
  | 'ClinicalImpression'
  | 'CodeSystem'
  | 'Communication'
  | 'CommunicationRequest'
  | 'CompartmentDefinition'
  | 'Composition'
  | 'ConceptMap'
  | 'Condition'
  | 'Consent'
  | 'Contract'
  | 'Coverage'
  | 'DataElement'
  | 'DetectedIssue'
  | 'Device'
  | 'DeviceComponent'
  | 'DeviceMetric'
  | 'DeviceRequest'
  | 'DeviceUseStatement'
  | 'DiagnosticReport'
  | 'DocumentManifest'
  | 'DocumentReference'
  | 'EligibilityRequest'
  | 'EligibilityResponse'
  | 'Encounter'
  | 'Endpoint'
  | 'EnrollmentRequest'
  | 'EnrollmentResponse'
  | 'EpisodeOfCare'
  | 'ExpansionProfile'
  | 'ExplanationOfBenefit'
  | 'FamilyMemberHistory'
  | 'Flag'
  | 'Goal'
  | 'GraphDefinition'
  | 'Group'
  | 'GuidanceResponse'
  | 'HealthcareService'
  | 'ImagingManifest'
  | 'ImagingStudy'
  | 'Immunization'
  | 'ImmunizationRecommendation'
  | 'ImplementationGuide'
  | 'Library'
  | 'Linkage'
  | 'List'
  | 'Location'
  | 'Measure'
  | 'MeasureReport'
  | 'Media'
  | 'Medication'
  | 'MedicationAdministration'
  | 'MedicationDispense'
  | 'MedicationRequest'
  | 'MedicationStatement'
  | 'MessageDefinition'
  | 'MessageHeader'
  | 'NamingSystem'
  | 'NutritionOrder'
  | 'Observation'
  | 'OperationDefinition'
  | 'OperationOutcome'
  | 'Organization'
  | 'Parameters'
  | 'Patient'
  | 'PaymentNotice'
  | 'PaymentReconciliation'
  | 'Person'
  | 'PlanDefinition'
  | 'Practitioner'
  | 'PractitionerRole'
  | 'Procedure'
  | 'ProcedureRequest'
  | 'ProcessRequest'
  | 'ProcessResponse'
  | 'Provenance'
  | 'Questionnaire'
  | 'QuestionnaireResponse'
  | 'ReferralRequest'
  | 'RelatedPerson'
  | 'RequestGroup'
  | 'ResearchStudy'
  | 'ResearchSubject'
  | 'RiskAssessment'
  | 'Schedule'
  | 'SearchParameter'
  | 'Sequence'
  | 'ServiceDefinition'
  | 'Slot'
  | 'Specimen'
  | 'StructureDefinition'
  | 'StructureMap'
  | 'Subscription'
  | 'Substance'
  | 'SupplyDelivery'
  | 'SupplyRequest'
  | 'Task'
  | 'TestReport'
  | 'TestScript'
  | 'ValueSet'
  | 'VisionPrescription';

type ResourceType = string;

type CustomResourceType = Exclude<ResourceType, KnownResourceType>;

interface SmartAuthMetadata {
  authorizeUrl?: string;
  tokenUrl?: string;
  registerUrl?: string;
  manageUrl?: string;
}

interface CustomResource extends fhir.r4.ResourceBase {
  [key: string]: any;
}

type FhirResource = CustomResource | fhir.r4.Resource;

interface SearchParams {
  [key: string]: string | number | boolean | Array<string | number | boolean>;
}

interface Compartment {
  id: string;
  resourceType: string;
}

declare class Client {
  baseUrl: string;
  customHeaders: Headers;
  bearerToken: string | undefined;

  /**
   * Create a FHIR client.
   *
   * @param {Object} config Client configuration
   * @param {String} config.baseUrl ISS for FHIR server
   * @param {Object} [config.customHeaders] Optional custom headers to send with
   *   each request
   * @throws An error will be thrown unless baseUrl is a non-empty string.
   */
  constructor(config: { baseUrl: string; customHeaders?: Headers });

  /**
   * Resolve a reference and return FHIR resource
   *
   * From: http://hl7.org/fhir/STU3/references.html, a reference can be: 1)
   * absolute URL, 2) relative URL or 3) an internal fragement. In the case of
   * (2), there are rules on resolving references that are in a FHIR bundle.
   *
   * @async
   *
   * @example
   *
   * // Always does a new http request
   * client.resolve({ reference: 'http://test.com/fhir/Patient/1' }).then((patient) => {
   *   console.log(patient);
   * });
   *
   * // Always does a new http request, using the client.baseUrl
   * client.resolve({ reference: 'Patient/1' }).then((patient) => {
   *   console.log(patient);
   * });
   *
   * // Try to resolve a patient in the bundle, otherwise build request
   * // at client.baseUrl
   * client.resolve({ reference: 'Patient/1', context: bundle }).then((patient) => {
   *   console.log(patient);
   * });
   *
   * // Resolve a patient contained in someResource (see:
   * // http://hl7.org/fhir/STU3/references.html#contained)
   * client.resolve({ reference: '#patient-1', context: someResource }).then((patient) => {
   *   console.log(patient);
   * });
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.reference - FHIR reference
   * @param {Object} [params.context] - Optional bundle with 'entry' array or FHIR resource with 'contained' array (if 'params.reference' starts with '#')
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  resolve(params: {
    reference: string;
    context?: fhir.r4.Bundle | fhir.r4.DomainResource;
    options?: Options;
  }): Promise<FhirResource>;

  /**
   * Obtain the SMART OAuth URLs from the Capability Statement
   * http://docs.smarthealthit.org/authorization/conformance-statement/
   *
   * @async
   *
   * @example
   *
   * // Using promises
   * fhirClient.smartAuthMetadata().then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.smartAuthMetadata();
   * console.log(response);
   *
   * @param {Object} [params] - The request parameters.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} contains the following SMART URIs: authorizeUrl,
   *   tokenUrl, registerUrl, manageUrl
   */
  smartAuthMetadata(params?: {
    headers?: Headers;
    options?: Options;
  }): Promise<SmartAuthMetadata>;

  /**
   * Get the default capability statement.
   *
   * @async
   *
   * @example
   *
   * // Using promises
   * fhirClient.capabilityStatement().then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.capabilityStatement();
   * console.log(response);
   *
   * @param {Object} [params] - The request parameters.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} capability statement FHIR resource.
   */
  capabilityStatement(params?: {
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;

  /**
   * Get a resource by id.
   *
   * @example
   *
   * // Using promises
   * fhirClient.read({
   *   resourceType: 'Patient',
   *   id: '12345',
   * }).then(data => console.log(data));
   *
   * // Using async
   * let response = await fhirClient.read({
   *   resourceType: 'Patient',
   *   id: '12345',
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {String} params.id - The FHIR id for the resource.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  read(params: {
    resourceType: 'Account';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Account>;
  read(params: {
    resourceType: 'ActivityDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ActivityDefinition>;
  read(params: {
    resourceType: 'AdverseEvent';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AdverseEvent>;
  read(params: {
    resourceType: 'AllergyIntolerance';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AllergyIntolerance>;
  read(params: {
    resourceType: 'Appointment';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Appointment>;
  read(params: {
    resourceType: 'AppointmentResponse';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AppointmentResponse>;
  read(params: {
    resourceType: 'AuditEvent';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AuditEvent>;
  read(params: {
    resourceType: 'Basic';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Basic>;
  read(params: {
    resourceType: 'Binary';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Binary>;
  read(params: {
    resourceType: 'Bundle';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;
  read(params: {
    resourceType: 'CapabilityStatement';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;
  read(params: {
    resourceType: 'CarePlan';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CarePlan>;
  read(params: {
    resourceType: 'CareTeam';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CareTeam>;
  read(params: {
    resourceType: 'ChargeItem';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ChargeItem>;
  read(params: {
    resourceType: 'Claim';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Claim>;
  read(params: {
    resourceType: 'ClaimResponse';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClaimResponse>;
  read(params: {
    resourceType: 'ClinicalImpression';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClinicalImpression>;
  read(params: {
    resourceType: 'CodeSystem';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CodeSystem>;
  read(params: {
    resourceType: 'Communication';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Communication>;
  read(params: {
    resourceType: 'CommunicationRequest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CommunicationRequest>;
  read(params: {
    resourceType: 'CompartmentDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CompartmentDefinition>;
  read(params: {
    resourceType: 'Composition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Composition>;
  read(params: {
    resourceType: 'ConceptMap';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ConceptMap>;
  read(params: {
    resourceType: 'Condition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Condition>;
  read(params: {
    resourceType: 'Consent';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Consent>;
  read(params: {
    resourceType: 'Contract';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Contract>;
  read(params: {
    resourceType: 'Coverage';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Coverage>;
  read(params: {
    resourceType: 'DetectedIssue';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DetectedIssue>;
  read(params: {
    resourceType: 'Device';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Device>;
  read(params: {
    resourceType: 'DeviceMetric';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceMetric>;
  read(params: {
    resourceType: 'DeviceRequest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceRequest>;
  read(params: {
    resourceType: 'DeviceUseStatement';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceUseStatement>;
  read(params: {
    resourceType: 'DiagnosticReport';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DiagnosticReport>;
  read(params: {
    resourceType: 'DocumentManifest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentManifest>;
  read(params: {
    resourceType: 'DocumentReference';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentReference>;
  read(params: {
    resourceType: 'DomainResource';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DomainResource>;
  read(params: {
    resourceType: 'Encounter';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Encounter>;
  read(params: {
    resourceType: 'Endpoint';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Endpoint>;
  read(params: {
    resourceType: 'EnrollmentRequest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentRequest>;
  read(params: {
    resourceType: 'EnrollmentResponse';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentResponse>;
  read(params: {
    resourceType: 'EpisodeOfCare';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EpisodeOfCare>;
  read(params: {
    resourceType: 'ExplanationOfBenefit';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ExplanationOfBenefit>;
  read(params: {
    resourceType: 'FamilyMemberHistory';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.FamilyMemberHistory>;
  read(params: {
    resourceType: 'Flag';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Flag>;
  read(params: {
    resourceType: 'Goal';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Goal>;
  read(params: {
    resourceType: 'GraphDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GraphDefinition>;
  read(params: {
    resourceType: 'Group';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Group>;
  read(params: {
    resourceType: 'GuidanceResponse';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GuidanceResponse>;
  read(params: {
    resourceType: 'HealthcareService';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.HealthcareService>;
  read(params: {
    resourceType: 'ImagingStudy';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImagingStudy>;
  read(params: {
    resourceType: 'Immunization';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Immunization>;
  read(params: {
    resourceType: 'ImmunizationRecommendation';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImmunizationRecommendation>;
  read(params: {
    resourceType: 'ImplementationGuide';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImplementationGuide>;
  read(params: {
    resourceType: 'Library';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Library>;
  read(params: {
    resourceType: 'Linkage';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Linkage>;
  read(params: {
    resourceType: 'List';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.List>;
  read(params: {
    resourceType: 'Location';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Location>;
  read(params: {
    resourceType: 'Measure';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Measure>;
  read(params: {
    resourceType: 'MeasureReport';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MeasureReport>;
  read(params: {
    resourceType: 'Media';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Media>;
  read(params: {
    resourceType: 'Medication';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Medication>;
  read(params: {
    resourceType: 'MedicationAdministration';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationAdministration>;
  read(params: {
    resourceType: 'MedicationDispense';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationDispense>;
  read(params: {
    resourceType: 'MedicationRequest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationRequest>;
  read(params: {
    resourceType: 'MedicationStatement';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationStatement>;
  read(params: {
    resourceType: 'MessageDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageDefinition>;
  read(params: {
    resourceType: 'MessageHeader';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageHeader>;
  read(params: {
    resourceType: 'NamingSystem';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NamingSystem>;
  read(params: {
    resourceType: 'NutritionOrder';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NutritionOrder>;
  read(params: {
    resourceType: 'Observation';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Observation>;
  read(params: {
    resourceType: 'OperationDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationDefinition>;
  read(params: {
    resourceType: 'OperationOutcome';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationOutcome>;
  read(params: {
    resourceType: 'Organization';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Organization>;
  read(params: {
    resourceType: 'Parameters';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Parameters>;
  read(params: {
    resourceType: 'Patient';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Patient>;
  read(params: {
    resourceType: 'PaymentNotice';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentNotice>;
  read(params: {
    resourceType: 'PaymentReconciliation';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentReconciliation>;
  read(params: {
    resourceType: 'Person';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Person>;
  read(params: {
    resourceType: 'PlanDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PlanDefinition>;
  read(params: {
    resourceType: 'Practitioner';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Practitioner>;
  read(params: {
    resourceType: 'PractitionerRole';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PractitionerRole>;
  read(params: {
    resourceType: 'Procedure';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Procedure>;
  read(params: {
    resourceType: 'Provenance';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Provenance>;
  read(params: {
    resourceType: 'Questionnaire';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Questionnaire>;
  read(params: {
    resourceType: 'QuestionnaireResponse';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.QuestionnaireResponse>;
  read(params: {
    resourceType: 'RelatedPerson';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RelatedPerson>;
  read(params: {
    resourceType: 'RequestGroup';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RequestGroup>;
  read(params: {
    resourceType: 'ResearchStudy';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchStudy>;
  read(params: {
    resourceType: 'ResearchSubject';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchSubject>;
  read(params: {
    resourceType: 'RiskAssessment';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RiskAssessment>;
  read(params: {
    resourceType: 'Schedule';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Schedule>;
  read(params: {
    resourceType: 'SearchParameter';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SearchParameter>;
  read(params: {
    resourceType: 'Slot';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Slot>;
  read(params: {
    resourceType: 'Specimen';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Specimen>;
  read(params: {
    resourceType: 'StructureDefinition';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureDefinition>;
  read(params: {
    resourceType: 'StructureMap';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureMap>;
  read(params: {
    resourceType: 'Subscription';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Subscription>;
  read(params: {
    resourceType: 'Substance';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Substance>;
  read(params: {
    resourceType: 'SupplyDelivery';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyDelivery>;
  read(params: {
    resourceType: 'SupplyRequest';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyRequest>;
  read(params: {
    resourceType: 'Task';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Task>;
  read(params: {
    resourceType: 'TestReport';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestReport>;
  read(params: {
    resourceType: 'TestScript';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestScript>;
  read(params: {
    resourceType: 'ValueSet';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ValueSet>;
  read(params: {
    resourceType: 'VisionPrescription';
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.VisionPrescription>;
  read(params: {
    resourceType: CustomResourceType;
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | CustomResource>;

  /**
   * Get a resource by id and version.
   *
   * @example
   *
   * // Using promises
   * fhirClient.vread({
   *   resourceType: 'Patient',
   *   id: '12345',
   *   version: '1',
   * }).then(data => console.log(data));
   *
   * // Using async
   * let response = await fhirClient.vread({
   *   resourceType: 'Patient',
   *   id: '12345',
   *   version: '1',
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {String} params.id - The FHIR id for the resource.
   * @param {String} params.version - The version id for the resource.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  vread(params: {
    resourceType: 'Account';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Account>;
  vread(params: {
    resourceType: 'ActivityDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ActivityDefinition>;
  vread(params: {
    resourceType: 'AdverseEvent';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AdverseEvent>;
  vread(params: {
    resourceType: 'AllergyIntolerance';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AllergyIntolerance>;
  vread(params: {
    resourceType: 'Appointment';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Appointment>;
  vread(params: {
    resourceType: 'AppointmentResponse';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AppointmentResponse>;
  vread(params: {
    resourceType: 'AuditEvent';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AuditEvent>;
  vread(params: {
    resourceType: 'Basic';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Basic>;
  vread(params: {
    resourceType: 'Binary';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Binary>;
  vread(params: {
    resourceType: 'Bundle';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;
  vread(params: {
    resourceType: 'CapabilityStatement';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;
  vread(params: {
    resourceType: 'CarePlan';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CarePlan>;
  vread(params: {
    resourceType: 'CareTeam';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CareTeam>;
  vread(params: {
    resourceType: 'ChargeItem';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ChargeItem>;
  vread(params: {
    resourceType: 'Claim';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Claim>;
  vread(params: {
    resourceType: 'ClaimResponse';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClaimResponse>;
  vread(params: {
    resourceType: 'ClinicalImpression';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClinicalImpression>;
  vread(params: {
    resourceType: 'CodeSystem';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CodeSystem>;
  vread(params: {
    resourceType: 'Communication';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Communication>;
  vread(params: {
    resourceType: 'CommunicationRequest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CommunicationRequest>;
  vread(params: {
    resourceType: 'CompartmentDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CompartmentDefinition>;
  vread(params: {
    resourceType: 'Composition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Composition>;
  vread(params: {
    resourceType: 'ConceptMap';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ConceptMap>;
  vread(params: {
    resourceType: 'Condition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Condition>;
  vread(params: {
    resourceType: 'Consent';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Consent>;
  vread(params: {
    resourceType: 'Contract';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Contract>;
  vread(params: {
    resourceType: 'Coverage';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Coverage>;
  vread(params: {
    resourceType: 'DetectedIssue';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DetectedIssue>;
  vread(params: {
    resourceType: 'Device';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Device>;
  vread(params: {
    resourceType: 'DeviceMetric';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceMetric>;
  vread(params: {
    resourceType: 'DeviceRequest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceRequest>;
  vread(params: {
    resourceType: 'DeviceUseStatement';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceUseStatement>;
  vread(params: {
    resourceType: 'DiagnosticReport';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DiagnosticReport>;
  vread(params: {
    resourceType: 'DocumentManifest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentManifest>;
  vread(params: {
    resourceType: 'DocumentReference';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentReference>;
  vread(params: {
    resourceType: 'DomainResource';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DomainResource>;
  vread(params: {
    resourceType: 'Encounter';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Encounter>;
  vread(params: {
    resourceType: 'Endpoint';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Endpoint>;
  vread(params: {
    resourceType: 'EnrollmentRequest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentRequest>;
  vread(params: {
    resourceType: 'EnrollmentResponse';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentResponse>;
  vread(params: {
    resourceType: 'EpisodeOfCare';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EpisodeOfCare>;
  vread(params: {
    resourceType: 'ExplanationOfBenefit';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ExplanationOfBenefit>;
  vread(params: {
    resourceType: 'FamilyMemberHistory';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.FamilyMemberHistory>;
  vread(params: {
    resourceType: 'Flag';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Flag>;
  vread(params: {
    resourceType: 'Goal';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Goal>;
  vread(params: {
    resourceType: 'GraphDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GraphDefinition>;
  vread(params: {
    resourceType: 'Group';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Group>;
  vread(params: {
    resourceType: 'GuidanceResponse';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GuidanceResponse>;
  vread(params: {
    resourceType: 'HealthcareService';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.HealthcareService>;
  vread(params: {
    resourceType: 'ImagingStudy';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImagingStudy>;
  vread(params: {
    resourceType: 'Immunization';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Immunization>;
  vread(params: {
    resourceType: 'ImmunizationRecommendation';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImmunizationRecommendation>;
  vread(params: {
    resourceType: 'ImplementationGuide';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImplementationGuide>;
  vread(params: {
    resourceType: 'Library';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Library>;
  vread(params: {
    resourceType: 'Linkage';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Linkage>;
  vread(params: {
    resourceType: 'List';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.List>;
  vread(params: {
    resourceType: 'Location';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Location>;
  vread(params: {
    resourceType: 'Measure';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Measure>;
  vread(params: {
    resourceType: 'MeasureReport';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MeasureReport>;
  vread(params: {
    resourceType: 'Media';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Media>;
  vread(params: {
    resourceType: 'Medication';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Medication>;
  vread(params: {
    resourceType: 'MedicationAdministration';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationAdministration>;
  vread(params: {
    resourceType: 'MedicationDispense';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationDispense>;
  vread(params: {
    resourceType: 'MedicationRequest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationRequest>;
  vread(params: {
    resourceType: 'MedicationStatement';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationStatement>;
  vread(params: {
    resourceType: 'MessageDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageDefinition>;
  vread(params: {
    resourceType: 'MessageHeader';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageHeader>;
  vread(params: {
    resourceType: 'NamingSystem';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NamingSystem>;
  vread(params: {
    resourceType: 'NutritionOrder';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NutritionOrder>;
  vread(params: {
    resourceType: 'Observation';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Observation>;
  vread(params: {
    resourceType: 'OperationDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationDefinition>;
  vread(params: {
    resourceType: 'OperationOutcome';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationOutcome>;
  vread(params: {
    resourceType: 'Organization';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Organization>;
  vread(params: {
    resourceType: 'Parameters';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Parameters>;
  vread(params: {
    resourceType: 'Patient';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Patient>;
  vread(params: {
    resourceType: 'PaymentNotice';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentNotice>;
  vread(params: {
    resourceType: 'PaymentReconciliation';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentReconciliation>;
  vread(params: {
    resourceType: 'Person';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Person>;
  vread(params: {
    resourceType: 'PlanDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PlanDefinition>;
  vread(params: {
    resourceType: 'Practitioner';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Practitioner>;
  vread(params: {
    resourceType: 'PractitionerRole';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PractitionerRole>;
  vread(params: {
    resourceType: 'Procedure';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Procedure>;
  vread(params: {
    resourceType: 'Provenance';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Provenance>;
  vread(params: {
    resourceType: 'Questionnaire';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Questionnaire>;
  vread(params: {
    resourceType: 'QuestionnaireResponse';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.QuestionnaireResponse>;
  vread(params: {
    resourceType: 'RelatedPerson';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RelatedPerson>;
  vread(params: {
    resourceType: 'RequestGroup';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RequestGroup>;
  vread(params: {
    resourceType: 'ResearchStudy';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchStudy>;
  vread(params: {
    resourceType: 'ResearchSubject';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchSubject>;
  vread(params: {
    resourceType: 'RiskAssessment';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RiskAssessment>;
  vread(params: {
    resourceType: 'Schedule';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Schedule>;
  vread(params: {
    resourceType: 'SearchParameter';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SearchParameter>;
  vread(params: {
    resourceType: 'Slot';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Slot>;
  vread(params: {
    resourceType: 'Specimen';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Specimen>;
  vread(params: {
    resourceType: 'StructureDefinition';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureDefinition>;
  vread(params: {
    resourceType: 'StructureMap';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureMap>;
  vread(params: {
    resourceType: 'Subscription';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Subscription>;
  vread(params: {
    resourceType: 'Substance';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Substance>;
  vread(params: {
    resourceType: 'SupplyDelivery';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyDelivery>;
  vread(params: {
    resourceType: 'SupplyRequest';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyRequest>;
  vread(params: {
    resourceType: 'Task';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Task>;
  vread(params: {
    resourceType: 'TestReport';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestReport>;
  vread(params: {
    resourceType: 'TestScript';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestScript>;
  vread(params: {
    resourceType: 'ValueSet';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ValueSet>;
  vread(params: {
    resourceType: 'VisionPrescription';
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.VisionPrescription>;
  vread(params: {
    resourceType: CustomResourceType;
    id: string;
    version: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | CustomResource>;

  /**
   * Create a resource.
   *
   * @example
   * const newPatient = {
   *   resourceType: 'Patient',
   *   active: true,
   *   name: [{ use: 'official', family: ['Coleman'], given: ['Lisa', 'P.'] }],
   *   gender: 'female',
   *   birthDate: '1948-04-14',
   * }
   *
   * // Using promises
   * fhirClient.create({
   *   resourceType: 'Patient',
   *   body: newPatient,
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.create({
   *   resourceType: 'Patient',
   *   body: newPatient,
   * })
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The FHIR resource type.
   * @param {Response} params.body - The new resource data to create.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  create(params: {
    resourceType: 'Account';
    body: fhir.r4.Account;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Account>;
  create(params: {
    resourceType: 'ActivityDefinition';
    body: fhir.r4.ActivityDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ActivityDefinition>;
  create(params: {
    resourceType: 'AdverseEvent';
    body: fhir.r4.AdverseEvent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AdverseEvent>;
  create(params: {
    resourceType: 'AllergyIntolerance';
    body: fhir.r4.AllergyIntolerance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AllergyIntolerance>;
  create(params: {
    resourceType: 'Appointment';
    body: fhir.r4.Appointment;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Appointment>;
  create(params: {
    resourceType: 'AppointmentResponse';
    body: fhir.r4.AppointmentResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AppointmentResponse>;
  create(params: {
    resourceType: 'AuditEvent';
    body: fhir.r4.AuditEvent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AuditEvent>;
  create(params: {
    resourceType: 'Basic';
    body: fhir.r4.Basic;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Basic>;
  create(params: {
    resourceType: 'Binary';
    body: fhir.r4.Binary;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Binary>;
  create(params: {
    resourceType: 'Bundle';
    body: fhir.r4.Bundle;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;
  create(params: {
    resourceType: 'CapabilityStatement';
    body: fhir.r4.CapabilityStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;
  create(params: {
    resourceType: 'CarePlan';
    body: fhir.r4.CarePlan;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CarePlan>;
  create(params: {
    resourceType: 'CareTeam';
    body: fhir.r4.CareTeam;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CareTeam>;
  create(params: {
    resourceType: 'ChargeItem';
    body: fhir.r4.ChargeItem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ChargeItem>;
  create(params: {
    resourceType: 'Claim';
    body: fhir.r4.Claim;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Claim>;
  create(params: {
    resourceType: 'ClaimResponse';
    body: fhir.r4.ClaimResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClaimResponse>;
  create(params: {
    resourceType: 'ClinicalImpression';
    body: fhir.r4.ClinicalImpression;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClinicalImpression>;
  create(params: {
    resourceType: 'CodeSystem';
    body: fhir.r4.CodeSystem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CodeSystem>;
  create(params: {
    resourceType: 'Communication';
    body: fhir.r4.Communication;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Communication>;
  create(params: {
    resourceType: 'CommunicationRequest';
    body: fhir.r4.CommunicationRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CommunicationRequest>;
  create(params: {
    resourceType: 'CompartmentDefinition';
    body: fhir.r4.CompartmentDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CompartmentDefinition>;
  create(params: {
    resourceType: 'Composition';
    body: fhir.r4.Composition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Composition>;
  create(params: {
    resourceType: 'ConceptMap';
    body: fhir.r4.ConceptMap;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ConceptMap>;
  create(params: {
    resourceType: 'Condition';
    body: fhir.r4.Condition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Condition>;
  create(params: {
    resourceType: 'Consent';
    body: fhir.r4.Consent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Consent>;
  create(params: {
    resourceType: 'Contract';
    body: fhir.r4.Contract;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Contract>;
  create(params: {
    resourceType: 'Coverage';
    body: fhir.r4.Coverage;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Coverage>;
  create(params: {
    resourceType: 'DetectedIssue';
    body: fhir.r4.DetectedIssue;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DetectedIssue>;
  create(params: {
    resourceType: 'Device';
    body: fhir.r4.Device;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Device>;
  create(params: {
    resourceType: 'DeviceMetric';
    body: fhir.r4.DeviceMetric;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceMetric>;
  create(params: {
    resourceType: 'DeviceRequest';
    body: fhir.r4.DeviceRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceRequest>;
  create(params: {
    resourceType: 'DeviceUseStatement';
    body: fhir.r4.DeviceUseStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceUseStatement>;
  create(params: {
    resourceType: 'DiagnosticReport';
    body: fhir.r4.DiagnosticReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DiagnosticReport>;
  create(params: {
    resourceType: 'DocumentManifest';
    body: fhir.r4.DocumentManifest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentManifest>;
  create(params: {
    resourceType: 'DocumentReference';
    body: fhir.r4.DocumentReference;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentReference>;
  create(params: {
    resourceType: 'DomainResource';
    body: fhir.r4.DomainResource;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DomainResource>;
  create(params: {
    resourceType: 'Encounter';
    body: fhir.r4.Encounter;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Encounter>;
  create(params: {
    resourceType: 'Endpoint';
    body: fhir.r4.Endpoint;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Endpoint>;
  create(params: {
    resourceType: 'EnrollmentRequest';
    body: fhir.r4.EnrollmentRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentRequest>;
  create(params: {
    resourceType: 'EnrollmentResponse';
    body: fhir.r4.EnrollmentResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentResponse>;
  create(params: {
    resourceType: 'EpisodeOfCare';
    body: fhir.r4.EpisodeOfCare;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EpisodeOfCare>;
  create(params: {
    resourceType: 'ExplanationOfBenefit';
    body: fhir.r4.ExplanationOfBenefit;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ExplanationOfBenefit>;
  create(params: {
    resourceType: 'FamilyMemberHistory';
    body: fhir.r4.FamilyMemberHistory;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.FamilyMemberHistory>;
  create(params: {
    resourceType: 'Flag';
    body: fhir.r4.Flag;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Flag>;
  create(params: {
    resourceType: 'Goal';
    body: fhir.r4.Goal;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Goal>;
  create(params: {
    resourceType: 'GraphDefinition';
    body: fhir.r4.GraphDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GraphDefinition>;
  create(params: {
    resourceType: 'Group';
    body: fhir.r4.Group;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Group>;
  create(params: {
    resourceType: 'GuidanceResponse';
    body: fhir.r4.GuidanceResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GuidanceResponse>;
  create(params: {
    resourceType: 'HealthcareService';
    body: fhir.r4.HealthcareService;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.HealthcareService>;
  create(params: {
    resourceType: 'ImagingStudy';
    body: fhir.r4.ImagingStudy;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImagingStudy>;
  create(params: {
    resourceType: 'Immunization';
    body: fhir.r4.Immunization;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Immunization>;
  create(params: {
    resourceType: 'ImmunizationRecommendation';
    body: fhir.r4.ImmunizationRecommendation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImmunizationRecommendation>;
  create(params: {
    resourceType: 'ImplementationGuide';
    body: fhir.r4.ImplementationGuide;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImplementationGuide>;
  create(params: {
    resourceType: 'Library';
    body: fhir.r4.Library;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Library>;
  create(params: {
    resourceType: 'Linkage';
    body: fhir.r4.Linkage;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Linkage>;
  create(params: {
    resourceType: 'List';
    body: fhir.r4.List;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.List>;
  create(params: {
    resourceType: 'Location';
    body: fhir.r4.Location;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Location>;
  create(params: {
    resourceType: 'Measure';
    body: fhir.r4.Measure;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Measure>;
  create(params: {
    resourceType: 'MeasureReport';
    body: fhir.r4.MeasureReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MeasureReport>;
  create(params: {
    resourceType: 'Media';
    body: fhir.r4.Media;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Media>;
  create(params: {
    resourceType: 'Medication';
    body: fhir.r4.Medication;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Medication>;
  create(params: {
    resourceType: 'MedicationAdministration';
    body: fhir.r4.MedicationAdministration;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationAdministration>;
  create(params: {
    resourceType: 'MedicationDispense';
    body: fhir.r4.MedicationDispense;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationDispense>;
  create(params: {
    resourceType: 'MedicationRequest';
    body: fhir.r4.MedicationRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationRequest>;
  create(params: {
    resourceType: 'MedicationStatement';
    body: fhir.r4.MedicationStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationStatement>;
  create(params: {
    resourceType: 'MessageDefinition';
    body: fhir.r4.MessageDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageDefinition>;
  create(params: {
    resourceType: 'MessageHeader';
    body: fhir.r4.MessageHeader;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageHeader>;
  create(params: {
    resourceType: 'NamingSystem';
    body: fhir.r4.NamingSystem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NamingSystem>;
  create(params: {
    resourceType: 'NutritionOrder';
    body: fhir.r4.NutritionOrder;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NutritionOrder>;
  create(params: {
    resourceType: 'Observation';
    body: fhir.r4.Observation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Observation>;
  create(params: {
    resourceType: 'OperationDefinition';
    body: fhir.r4.OperationDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationDefinition>;
  create(params: {
    resourceType: 'OperationOutcome';
    body: fhir.r4.OperationOutcome;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationOutcome>;
  create(params: {
    resourceType: 'Organization';
    body: fhir.r4.Organization;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Organization>;
  create(params: {
    resourceType: 'Parameters';
    body: fhir.r4.Parameters;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Parameters>;
  create(params: {
    resourceType: 'Patient';
    body: fhir.r4.Patient;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Patient>;
  create(params: {
    resourceType: 'PaymentNotice';
    body: fhir.r4.PaymentNotice;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentNotice>;
  create(params: {
    resourceType: 'PaymentReconciliation';
    body: fhir.r4.PaymentReconciliation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentReconciliation>;
  create(params: {
    resourceType: 'Person';
    body: fhir.r4.Person;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Person>;
  create(params: {
    resourceType: 'PlanDefinition';
    body: fhir.r4.PlanDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PlanDefinition>;
  create(params: {
    resourceType: 'Practitioner';
    body: fhir.r4.Practitioner;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Practitioner>;
  create(params: {
    resourceType: 'PractitionerRole';
    body: fhir.r4.PractitionerRole;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PractitionerRole>;
  create(params: {
    resourceType: 'Procedure';
    body: fhir.r4.Procedure;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Procedure>;
  create(params: {
    resourceType: 'Provenance';
    body: fhir.r4.Provenance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Provenance>;
  create(params: {
    resourceType: 'Questionnaire';
    body: fhir.r4.Questionnaire;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Questionnaire>;
  create(params: {
    resourceType: 'QuestionnaireResponse';
    body: fhir.r4.QuestionnaireResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.QuestionnaireResponse>;
  create(params: {
    resourceType: 'RelatedPerson';
    body: fhir.r4.RelatedPerson;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RelatedPerson>;
  create(params: {
    resourceType: 'RequestGroup';
    body: fhir.r4.RequestGroup;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RequestGroup>;
  create(params: {
    resourceType: 'ResearchStudy';
    body: fhir.r4.ResearchStudy;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchStudy>;
  create(params: {
    resourceType: 'ResearchSubject';
    body: fhir.r4.ResearchSubject;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchSubject>;
  create(params: {
    resourceType: 'RiskAssessment';
    body: fhir.r4.RiskAssessment;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RiskAssessment>;
  create(params: {
    resourceType: 'Schedule';
    body: fhir.r4.Schedule;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Schedule>;
  create(params: {
    resourceType: 'SearchParameter';
    body: fhir.r4.SearchParameter;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SearchParameter>;
  create(params: {
    resourceType: 'Slot';
    body: fhir.r4.Slot;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Slot>;
  create(params: {
    resourceType: 'Specimen';
    body: fhir.r4.Specimen;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Specimen>;
  create(params: {
    resourceType: 'StructureDefinition';
    body: fhir.r4.StructureDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureDefinition>;
  create(params: {
    resourceType: 'StructureMap';
    body: fhir.r4.StructureMap;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureMap>;
  create(params: {
    resourceType: 'Subscription';
    body: fhir.r4.Subscription;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Subscription>;
  create(params: {
    resourceType: 'Substance';
    body: fhir.r4.Substance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Substance>;
  create(params: {
    resourceType: 'SupplyDelivery';
    body: fhir.r4.SupplyDelivery;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyDelivery>;
  create(params: {
    resourceType: 'SupplyRequest';
    body: fhir.r4.SupplyRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyRequest>;
  create(params: {
    resourceType: 'Task';
    body: fhir.r4.Task;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Task>;
  create(params: {
    resourceType: 'TestReport';
    body: fhir.r4.TestReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestReport>;
  create(params: {
    resourceType: 'TestScript';
    body: fhir.r4.TestScript;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestScript>;
  create(params: {
    resourceType: 'ValueSet';
    body: fhir.r4.ValueSet;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ValueSet>;
  create(params: {
    resourceType: 'VisionPrescription';
    body: fhir.r4.VisionPrescription;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.VisionPrescription>;
  create<T extends CustomResource>(params: {
    resourceType: CustomResourceType;
    body: T;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | T>;

  /**
   * Delete a resource by FHIR id.
   *
   * @example
   *
   * // Using promises
   * fhirClient.delete({
   *   resourceType: 'Patient',
   *   id: 12345,
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.delete({ resourceType: 'Patient', id: 12345 });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient", "Observation").
   * @param {String} params.id - The FHIR id for the resource.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} Operation Outcome FHIR resource
   */
  delete(params: {
    resourceType: ResourceType;
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome>;

  /**
   * Update a resource by FHIR id.
   *
   * @example
   *
   * const updatedPatient = {
   *   resourceType: 'Patient',
   *   birthDate: '1948-04-14',
   * }
   *
   * // Using promises
   * fhirClient.update({
   *   resourceType: 'Patient',
   *   id: 12345,
   *   body: updatedPatient,
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.update({
   *   resourceType: 'Patient',
   *   id: 12345,
   *   body: updatedPatient,
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {String} params.id - The FHIR id for the resource.
   * @param {String} params.body - The resource to be updated.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  update(params: {
    resourceType: 'Account';
    id: string;
    body: fhir.r4.Account;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Account>;
  update(params: {
    resourceType: 'ActivityDefinition';
    id: string;
    body: fhir.r4.ActivityDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ActivityDefinition>;
  update(params: {
    resourceType: 'AdverseEvent';
    id: string;
    body: fhir.r4.AdverseEvent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AdverseEvent>;
  update(params: {
    resourceType: 'AllergyIntolerance';
    id: string;
    body: fhir.r4.AllergyIntolerance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AllergyIntolerance>;
  update(params: {
    resourceType: 'Appointment';
    id: string;
    body: fhir.r4.Appointment;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Appointment>;
  update(params: {
    resourceType: 'AppointmentResponse';
    id: string;
    body: fhir.r4.AppointmentResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AppointmentResponse>;
  update(params: {
    resourceType: 'AuditEvent';
    id: string;
    body: fhir.r4.AuditEvent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AuditEvent>;
  update(params: {
    resourceType: 'Basic';
    id: string;
    body: fhir.r4.Basic;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Basic>;
  update(params: {
    resourceType: 'Binary';
    id: string;
    body: fhir.r4.Binary;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Binary>;
  update(params: {
    resourceType: 'Bundle';
    id: string;
    body: fhir.r4.Bundle;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;
  update(params: {
    resourceType: 'CapabilityStatement';
    id: string;
    body: fhir.r4.CapabilityStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;
  update(params: {
    resourceType: 'CarePlan';
    id: string;
    body: fhir.r4.CarePlan;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CarePlan>;
  update(params: {
    resourceType: 'CareTeam';
    id: string;
    body: fhir.r4.CareTeam;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CareTeam>;
  update(params: {
    resourceType: 'ChargeItem';
    id: string;
    body: fhir.r4.ChargeItem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ChargeItem>;
  update(params: {
    resourceType: 'Claim';
    id: string;
    body: fhir.r4.Claim;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Claim>;
  update(params: {
    resourceType: 'ClaimResponse';
    id: string;
    body: fhir.r4.ClaimResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClaimResponse>;
  update(params: {
    resourceType: 'ClinicalImpression';
    id: string;
    body: fhir.r4.ClinicalImpression;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClinicalImpression>;
  update(params: {
    resourceType: 'CodeSystem';
    id: string;
    body: fhir.r4.CodeSystem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CodeSystem>;
  update(params: {
    resourceType: 'Communication';
    id: string;
    body: fhir.r4.Communication;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Communication>;
  update(params: {
    resourceType: 'CommunicationRequest';
    id: string;
    body: fhir.r4.CommunicationRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CommunicationRequest>;
  update(params: {
    resourceType: 'CompartmentDefinition';
    id: string;
    body: fhir.r4.CompartmentDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CompartmentDefinition>;
  update(params: {
    resourceType: 'Composition';
    id: string;
    body: fhir.r4.Composition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Composition>;
  update(params: {
    resourceType: 'ConceptMap';
    id: string;
    body: fhir.r4.ConceptMap;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ConceptMap>;
  update(params: {
    resourceType: 'Condition';
    id: string;
    body: fhir.r4.Condition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Condition>;
  update(params: {
    resourceType: 'Consent';
    id: string;
    body: fhir.r4.Consent;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Consent>;
  update(params: {
    resourceType: 'Contract';
    id: string;
    body: fhir.r4.Contract;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Contract>;
  update(params: {
    resourceType: 'Coverage';
    id: string;
    body: fhir.r4.Coverage;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Coverage>;
  update(params: {
    resourceType: 'DetectedIssue';
    id: string;
    body: fhir.r4.DetectedIssue;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DetectedIssue>;
  update(params: {
    resourceType: 'Device';
    id: string;
    body: fhir.r4.Device;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Device>;
  update(params: {
    resourceType: 'DeviceMetric';
    id: string;
    body: fhir.r4.DeviceMetric;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceMetric>;
  update(params: {
    resourceType: 'DeviceRequest';
    id: string;
    body: fhir.r4.DeviceRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceRequest>;
  update(params: {
    resourceType: 'DeviceUseStatement';
    id: string;
    body: fhir.r4.DeviceUseStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceUseStatement>;
  update(params: {
    resourceType: 'DiagnosticReport';
    id: string;
    body: fhir.r4.DiagnosticReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DiagnosticReport>;
  update(params: {
    resourceType: 'DocumentManifest';
    id: string;
    body: fhir.r4.DocumentManifest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentManifest>;
  update(params: {
    resourceType: 'DocumentReference';
    id: string;
    body: fhir.r4.DocumentReference;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentReference>;
  update(params: {
    resourceType: 'DomainResource';
    id: string;
    body: fhir.r4.DomainResource;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DomainResource>;
  update(params: {
    resourceType: 'Encounter';
    id: string;
    body: fhir.r4.Encounter;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Encounter>;
  update(params: {
    resourceType: 'Endpoint';
    id: string;
    body: fhir.r4.Endpoint;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Endpoint>;
  update(params: {
    resourceType: 'EnrollmentRequest';
    id: string;
    body: fhir.r4.EnrollmentRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentRequest>;
  update(params: {
    resourceType: 'EnrollmentResponse';
    id: string;
    body: fhir.r4.EnrollmentResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentResponse>;
  update(params: {
    resourceType: 'EpisodeOfCare';
    id: string;
    body: fhir.r4.EpisodeOfCare;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EpisodeOfCare>;
  update(params: {
    resourceType: 'ExplanationOfBenefit';
    id: string;
    body: fhir.r4.ExplanationOfBenefit;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ExplanationOfBenefit>;
  update(params: {
    resourceType: 'FamilyMemberHistory';
    id: string;
    body: fhir.r4.FamilyMemberHistory;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.FamilyMemberHistory>;
  update(params: {
    resourceType: 'Flag';
    id: string;
    body: fhir.r4.Flag;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Flag>;
  update(params: {
    resourceType: 'Goal';
    id: string;
    body: fhir.r4.Goal;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Goal>;
  update(params: {
    resourceType: 'GraphDefinition';
    id: string;
    body: fhir.r4.GraphDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GraphDefinition>;
  update(params: {
    resourceType: 'Group';
    id: string;
    body: fhir.r4.Group;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Group>;
  update(params: {
    resourceType: 'GuidanceResponse';
    id: string;
    body: fhir.r4.GuidanceResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GuidanceResponse>;
  update(params: {
    resourceType: 'HealthcareService';
    id: string;
    body: fhir.r4.HealthcareService;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.HealthcareService>;
  update(params: {
    resourceType: 'ImagingStudy';
    id: string;
    body: fhir.r4.ImagingStudy;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImagingStudy>;
  update(params: {
    resourceType: 'Immunization';
    id: string;
    body: fhir.r4.Immunization;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Immunization>;
  update(params: {
    resourceType: 'ImmunizationRecommendation';
    id: string;
    body: fhir.r4.ImmunizationRecommendation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImmunizationRecommendation>;
  update(params: {
    resourceType: 'ImplementationGuide';
    id: string;
    body: fhir.r4.ImplementationGuide;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImplementationGuide>;
  update(params: {
    resourceType: 'Library';
    id: string;
    body: fhir.r4.Library;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Library>;
  update(params: {
    resourceType: 'Linkage';
    id: string;
    body: fhir.r4.Linkage;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Linkage>;
  update(params: {
    resourceType: 'List';
    id: string;
    body: fhir.r4.List;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.List>;
  update(params: {
    resourceType: 'Location';
    id: string;
    body: fhir.r4.Location;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Location>;
  update(params: {
    resourceType: 'Measure';
    id: string;
    body: fhir.r4.Measure;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Measure>;
  update(params: {
    resourceType: 'MeasureReport';
    id: string;
    body: fhir.r4.MeasureReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MeasureReport>;
  update(params: {
    resourceType: 'Media';
    id: string;
    body: fhir.r4.Media;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Media>;
  update(params: {
    resourceType: 'Medication';
    id: string;
    body: fhir.r4.Medication;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Medication>;
  update(params: {
    resourceType: 'MedicationAdministration';
    id: string;
    body: fhir.r4.MedicationAdministration;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationAdministration>;
  update(params: {
    resourceType: 'MedicationDispense';
    id: string;
    body: fhir.r4.MedicationDispense;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationDispense>;
  update(params: {
    resourceType: 'MedicationRequest';
    id: string;
    body: fhir.r4.MedicationRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationRequest>;
  update(params: {
    resourceType: 'MedicationStatement';
    id: string;
    body: fhir.r4.MedicationStatement;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationStatement>;
  update(params: {
    resourceType: 'MessageDefinition';
    id: string;
    body: fhir.r4.MessageDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageDefinition>;
  update(params: {
    resourceType: 'MessageHeader';
    id: string;
    body: fhir.r4.MessageHeader;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageHeader>;
  update(params: {
    resourceType: 'NamingSystem';
    id: string;
    body: fhir.r4.NamingSystem;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NamingSystem>;
  update(params: {
    resourceType: 'NutritionOrder';
    id: string;
    body: fhir.r4.NutritionOrder;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NutritionOrder>;
  update(params: {
    resourceType: 'Observation';
    id: string;
    body: fhir.r4.Observation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Observation>;
  update(params: {
    resourceType: 'OperationDefinition';
    id: string;
    body: fhir.r4.OperationDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationDefinition>;
  update(params: {
    resourceType: 'OperationOutcome';
    id: string;
    body: fhir.r4.OperationOutcome;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationOutcome>;
  update(params: {
    resourceType: 'Organization';
    id: string;
    body: fhir.r4.Organization;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Organization>;
  update(params: {
    resourceType: 'Parameters';
    id: string;
    body: fhir.r4.Parameters;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Parameters>;
  update(params: {
    resourceType: 'Patient';
    id: string;
    body: fhir.r4.Patient;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Patient>;
  update(params: {
    resourceType: 'PaymentNotice';
    id: string;
    body: fhir.r4.PaymentNotice;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentNotice>;
  update(params: {
    resourceType: 'PaymentReconciliation';
    id: string;
    body: fhir.r4.PaymentReconciliation;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentReconciliation>;
  update(params: {
    resourceType: 'Person';
    id: string;
    body: fhir.r4.Person;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Person>;
  update(params: {
    resourceType: 'PlanDefinition';
    id: string;
    body: fhir.r4.PlanDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PlanDefinition>;
  update(params: {
    resourceType: 'Practitioner';
    id: string;
    body: fhir.r4.Practitioner;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Practitioner>;
  update(params: {
    resourceType: 'PractitionerRole';
    id: string;
    body: fhir.r4.PractitionerRole;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PractitionerRole>;
  update(params: {
    resourceType: 'Procedure';
    id: string;
    body: fhir.r4.Procedure;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Procedure>;
  update(params: {
    resourceType: 'Provenance';
    id: string;
    body: fhir.r4.Provenance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Provenance>;
  update(params: {
    resourceType: 'Questionnaire';
    id: string;
    body: fhir.r4.Questionnaire;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Questionnaire>;
  update(params: {
    resourceType: 'QuestionnaireResponse';
    id: string;
    body: fhir.r4.QuestionnaireResponse;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.QuestionnaireResponse>;
  update(params: {
    resourceType: 'RelatedPerson';
    id: string;
    body: fhir.r4.RelatedPerson;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RelatedPerson>;
  update(params: {
    resourceType: 'RequestGroup';
    id: string;
    body: fhir.r4.RequestGroup;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RequestGroup>;
  update(params: {
    resourceType: 'ResearchStudy';
    id: string;
    body: fhir.r4.ResearchStudy;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchStudy>;
  update(params: {
    resourceType: 'ResearchSubject';
    id: string;
    body: fhir.r4.ResearchSubject;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchSubject>;
  update(params: {
    resourceType: 'RiskAssessment';
    id: string;
    body: fhir.r4.RiskAssessment;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RiskAssessment>;
  update(params: {
    resourceType: 'Schedule';
    id: string;
    body: fhir.r4.Schedule;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Schedule>;
  update(params: {
    resourceType: 'SearchParameter';
    id: string;
    body: fhir.r4.SearchParameter;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SearchParameter>;
  update(params: {
    resourceType: 'Slot';
    id: string;
    body: fhir.r4.Slot;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Slot>;
  update(params: {
    resourceType: 'Specimen';
    id: string;
    body: fhir.r4.Specimen;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Specimen>;
  update(params: {
    resourceType: 'StructureDefinition';
    id: string;
    body: fhir.r4.StructureDefinition;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureDefinition>;
  update(params: {
    resourceType: 'StructureMap';
    id: string;
    body: fhir.r4.StructureMap;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureMap>;
  update(params: {
    resourceType: 'Subscription';
    id: string;
    body: fhir.r4.Subscription;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Subscription>;
  update(params: {
    resourceType: 'Substance';
    id: string;
    body: fhir.r4.Substance;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Substance>;
  update(params: {
    resourceType: 'SupplyDelivery';
    id: string;
    body: fhir.r4.SupplyDelivery;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyDelivery>;
  update(params: {
    resourceType: 'SupplyRequest';
    id: string;
    body: fhir.r4.SupplyRequest;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyRequest>;
  update(params: {
    resourceType: 'Task';
    id: string;
    body: fhir.r4.Task;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Task>;
  update(params: {
    resourceType: 'TestReport';
    id: string;
    body: fhir.r4.TestReport;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestReport>;
  update(params: {
    resourceType: 'TestScript';
    id: string;
    body: fhir.r4.TestScript;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestScript>;
  update(params: {
    resourceType: 'ValueSet';
    id: string;
    body: fhir.r4.ValueSet;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ValueSet>;
  update(params: {
    resourceType: 'VisionPrescription';
    id: string;
    body: fhir.r4.VisionPrescription;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.VisionPrescription>;
  update<T extends CustomResource>(params: {
    resourceType: CustomResourceType;
    id: string;
    body: T;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | T>;

  /**
   * Patch a resource by FHIR id.
   *
   * From http://hl7.org/fhir/STU3/http.html#patch:
   * Content-Type is 'application/json-patch+json'
   * Expects a JSON Patch document format, see http://jsonpatch.com/
   *
   * @example
   *
   * // JSON Patch document format from http://jsonpatch.com/
   * const JSONPatch = [{ op: 'replace', path: '/gender', value: 'male' }];
   *
   * // Using promises
   * fhirClient.patch({
   *   resourceType: 'Patient',
   *   id: 12345,
   *   JSONPatch,
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.patch({
   *   resourceType: 'Patient',
   *   id: 12345,
   *   JSONPatch
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {String} params.id - The FHIR id for the resource.
   * @param {Array} params.JSONPatch - A JSON Patch document containing an array
   *   of patch operations, formatted according to http://jsonpatch.com/.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resource
   */
  patch(params: {
    resourceType: 'Account';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Account>;
  patch(params: {
    resourceType: 'ActivityDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ActivityDefinition>;
  patch(params: {
    resourceType: 'AdverseEvent';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AdverseEvent>;
  patch(params: {
    resourceType: 'AllergyIntolerance';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AllergyIntolerance>;
  patch(params: {
    resourceType: 'Appointment';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Appointment>;
  patch(params: {
    resourceType: 'AppointmentResponse';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AppointmentResponse>;
  patch(params: {
    resourceType: 'AuditEvent';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.AuditEvent>;
  patch(params: {
    resourceType: 'Basic';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Basic>;
  patch(params: {
    resourceType: 'Binary';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Binary>;
  patch(params: {
    resourceType: 'Bundle';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;
  patch(params: {
    resourceType: 'CapabilityStatement';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CapabilityStatement>;
  patch(params: {
    resourceType: 'CarePlan';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CarePlan>;
  patch(params: {
    resourceType: 'CareTeam';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CareTeam>;
  patch(params: {
    resourceType: 'ChargeItem';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ChargeItem>;
  patch(params: {
    resourceType: 'Claim';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Claim>;
  patch(params: {
    resourceType: 'ClaimResponse';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClaimResponse>;
  patch(params: {
    resourceType: 'ClinicalImpression';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ClinicalImpression>;
  patch(params: {
    resourceType: 'CodeSystem';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CodeSystem>;
  patch(params: {
    resourceType: 'Communication';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Communication>;
  patch(params: {
    resourceType: 'CommunicationRequest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CommunicationRequest>;
  patch(params: {
    resourceType: 'CompartmentDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.CompartmentDefinition>;
  patch(params: {
    resourceType: 'Composition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Composition>;
  patch(params: {
    resourceType: 'ConceptMap';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ConceptMap>;
  patch(params: {
    resourceType: 'Condition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Condition>;
  patch(params: {
    resourceType: 'Consent';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Consent>;
  patch(params: {
    resourceType: 'Contract';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Contract>;
  patch(params: {
    resourceType: 'Coverage';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Coverage>;
  patch(params: {
    resourceType: 'DetectedIssue';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DetectedIssue>;
  patch(params: {
    resourceType: 'Device';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Device>;
  patch(params: {
    resourceType: 'DeviceMetric';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceMetric>;
  patch(params: {
    resourceType: 'DeviceRequest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceRequest>;
  patch(params: {
    resourceType: 'DeviceUseStatement';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DeviceUseStatement>;
  patch(params: {
    resourceType: 'DiagnosticReport';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DiagnosticReport>;
  patch(params: {
    resourceType: 'DocumentManifest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentManifest>;
  patch(params: {
    resourceType: 'DocumentReference';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DocumentReference>;
  patch(params: {
    resourceType: 'DomainResource';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.DomainResource>;
  patch(params: {
    resourceType: 'Encounter';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Encounter>;
  patch(params: {
    resourceType: 'Endpoint';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Endpoint>;
  patch(params: {
    resourceType: 'EnrollmentRequest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentRequest>;
  patch(params: {
    resourceType: 'EnrollmentResponse';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EnrollmentResponse>;
  patch(params: {
    resourceType: 'EpisodeOfCare';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.EpisodeOfCare>;
  patch(params: {
    resourceType: 'ExplanationOfBenefit';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ExplanationOfBenefit>;
  patch(params: {
    resourceType: 'FamilyMemberHistory';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.FamilyMemberHistory>;
  patch(params: {
    resourceType: 'Flag';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Flag>;
  patch(params: {
    resourceType: 'Goal';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Goal>;
  patch(params: {
    resourceType: 'GraphDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GraphDefinition>;
  patch(params: {
    resourceType: 'Group';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Group>;
  patch(params: {
    resourceType: 'GuidanceResponse';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.GuidanceResponse>;
  patch(params: {
    resourceType: 'HealthcareService';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.HealthcareService>;
  patch(params: {
    resourceType: 'ImagingStudy';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImagingStudy>;
  patch(params: {
    resourceType: 'Immunization';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Immunization>;
  patch(params: {
    resourceType: 'ImmunizationRecommendation';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImmunizationRecommendation>;
  patch(params: {
    resourceType: 'ImplementationGuide';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ImplementationGuide>;
  patch(params: {
    resourceType: 'Library';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Library>;
  patch(params: {
    resourceType: 'Linkage';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Linkage>;
  patch(params: {
    resourceType: 'List';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.List>;
  patch(params: {
    resourceType: 'Location';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Location>;
  patch(params: {
    resourceType: 'Measure';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Measure>;
  patch(params: {
    resourceType: 'MeasureReport';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MeasureReport>;
  patch(params: {
    resourceType: 'Media';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Media>;
  patch(params: {
    resourceType: 'Medication';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Medication>;
  patch(params: {
    resourceType: 'MedicationAdministration';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationAdministration>;
  patch(params: {
    resourceType: 'MedicationDispense';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationDispense>;
  patch(params: {
    resourceType: 'MedicationRequest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationRequest>;
  patch(params: {
    resourceType: 'MedicationStatement';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MedicationStatement>;
  patch(params: {
    resourceType: 'MessageDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageDefinition>;
  patch(params: {
    resourceType: 'MessageHeader';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.MessageHeader>;
  patch(params: {
    resourceType: 'NamingSystem';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NamingSystem>;
  patch(params: {
    resourceType: 'NutritionOrder';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.NutritionOrder>;
  patch(params: {
    resourceType: 'Observation';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Observation>;
  patch(params: {
    resourceType: 'OperationDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationDefinition>;
  patch(params: {
    resourceType: 'OperationOutcome';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.OperationOutcome>;
  patch(params: {
    resourceType: 'Organization';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Organization>;
  patch(params: {
    resourceType: 'Parameters';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Parameters>;
  patch(params: {
    resourceType: 'Patient';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Patient>;
  patch(params: {
    resourceType: 'PaymentNotice';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentNotice>;
  patch(params: {
    resourceType: 'PaymentReconciliation';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PaymentReconciliation>;
  patch(params: {
    resourceType: 'Person';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Person>;
  patch(params: {
    resourceType: 'PlanDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PlanDefinition>;
  patch(params: {
    resourceType: 'Practitioner';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Practitioner>;
  patch(params: {
    resourceType: 'PractitionerRole';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.PractitionerRole>;
  patch(params: {
    resourceType: 'Procedure';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Procedure>;
  patch(params: {
    resourceType: 'Provenance';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Provenance>;
  patch(params: {
    resourceType: 'Questionnaire';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Questionnaire>;
  patch(params: {
    resourceType: 'QuestionnaireResponse';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.QuestionnaireResponse>;
  patch(params: {
    resourceType: 'RelatedPerson';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RelatedPerson>;
  patch(params: {
    resourceType: 'RequestGroup';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RequestGroup>;
  patch(params: {
    resourceType: 'ResearchStudy';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchStudy>;
  patch(params: {
    resourceType: 'ResearchSubject';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ResearchSubject>;
  patch(params: {
    resourceType: 'RiskAssessment';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.RiskAssessment>;
  patch(params: {
    resourceType: 'Schedule';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Schedule>;
  patch(params: {
    resourceType: 'SearchParameter';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SearchParameter>;
  patch(params: {
    resourceType: 'Slot';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Slot>;
  patch(params: {
    resourceType: 'Specimen';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Specimen>;
  patch(params: {
    resourceType: 'StructureDefinition';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureDefinition>;
  patch(params: {
    resourceType: 'StructureMap';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.StructureMap>;
  patch(params: {
    resourceType: 'Subscription';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Subscription>;
  patch(params: {
    resourceType: 'Substance';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Substance>;
  patch(params: {
    resourceType: 'SupplyDelivery';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyDelivery>;
  patch(params: {
    resourceType: 'SupplyRequest';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.SupplyRequest>;
  patch(params: {
    resourceType: 'Task';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Task>;
  patch(params: {
    resourceType: 'TestReport';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestReport>;
  patch(params: {
    resourceType: 'TestScript';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.TestScript>;
  patch(params: {
    resourceType: 'ValueSet';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.ValueSet>;
  patch(params: {
    resourceType: 'VisionPrescription';
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.VisionPrescription>;
  patch(params: {
    resourceType: CustomResourceType;
    id: string;
    JSONPatch: OpPatch[];
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | CustomResource>;

  /**
   * Submit a set of actions to perform independently as a batch.
   *
   * Update, create or delete a set of resources in a single interaction.
   * There should be no interdependencies between entries in the bundle.
   *
   * @example
   *
   * const request.Bundle = {
   *   'resourceType': 'fhir.r4.Bundle',
   *   'type': 'batch',
   *   'entry': [
   *    {
   *      'fullUrl': 'http://example.org/fhir/Patient/123',
   *      'resource': {
   *        'resourceType': 'Patient',
   *        'id': '123',
   *        'active': true
   *      },
   *      'request': {
   *        'method': 'PUT',
   *        'url': 'Patient/123'
   *      }
   *    },
   *     {
   *       'request': {
   *         'method': 'DELETE',
   *         'url': 'Patient/2e27c71e-30c8-4ceb-8c1c-5641e066c0a4'
   *       }
   *     },
   *     {
   *       'request': {
   *         'method': 'GET',
   *         'url': 'Patient?name=peter'
   *       }
   *     }
   *   ]
   * }
   *
   * // Using promises
   * fhirClient.batch({
   *   body: request.Bundle
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.batch({
   *   body: request.Bundle
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {string} params.body - The request body with a type of 'batch'.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  batch(params: {
    body: fhir.r4.Bundle & { type: 'batch' };
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'batch-response' })
  >;

  /**
   * Submit a set of actions to perform independently as a transaction.
   *
   * Update, create or delete a set of resources in a single interaction.
   * The entire set of changes should succeed or fail as a single entity.
   * Multiple actions on multiple resources different types may be submitted.
   * The outcome should not depend on the order of the resources loaded.
   * Order of processing actions: DELETE, POST, PUT, and GET.
   * The transaction fails if any resource overlap in DELETE, POST and PUT.
   *
   * @example
   *
   * const request.Bundle = {
   *   'resourceType': 'fhir.r4.Bundle',
   *   'type': 'transaction',
   *   'entry': [
   *    {
   *      'fullUrl': 'http://example.org/fhir/Patient/123',
   *      'resource': {
   *        'resourceType': 'Patient',
   *        'id': '123',
   *        'active': true
   *      },
   *      'request': {
   *        'method': 'PUT',
   *        'url': 'Patient/123'
   *      }
   *    },
   *     {
   *       'request': {
   *         'method': 'DELETE',
   *         'url': 'Patient/2e27c71e-30c8-4ceb-8c1c-5641e066c0a4'
   *       }
   *     },
   *     {
   *       'request': {
   *         'method': 'GET',
   *         'url': 'Patient?name=peter'
   *       }
   *     }
   *   ]
   * }
   *
   * // Using promises
   * fhirClient.transaction({
   *   body: request.Bundle
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.transaction({
   *   body: request.Bundle
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.body - The request body with a type of
   *   'transaction'.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  transaction(params: {
    body: fhir.r4.Bundle;
    headers?: Headers;
    options?: Options;
  }): Promise<fhir.r4.OperationOutcome | fhir.r4.Bundle>;

  /**
   * Return the next page of results.
   *
   * @param {Object} params - The request parameters. Passing the bundle as the
   *   first parameter is DEPRECATED
   * @param {object} params.bundle - fhir.r4.Bundle result of a FHIR search
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   * @param {Object} [headers] - DEPRECATED Optional custom headers to add to
   *   the request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  nextPage<T extends string>(
    params: { bundle: fhir.r4.Bundle & { type: T }; options?: Options },
    headers?: Headers
  ): Promise<fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: T })>;

  /**
   * Return the previous page of results.
   *
   * @param {Object} params - The request parameters. Passing the bundle as the
   *   first parameter is DEPRECATED
   * @param {object} params.bundle - fhir.r4.Bundle result of a FHIR search
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   * @param {Object} [headers] - DEPRECATED Optional custom headers to add to
   *   the request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  prevPage<T extends string>(
    params: { bundle: fhir.r4.Bundle & { type: T }; options?: Options },
    headers?: Headers
  ): Promise<fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: T })>;

  /**
   * Search for a FHIR resource, with or without compartments, or the entire
   * system
   *
   * @example
   *
   * // Using promises
   * fhirClient.search({
   *   resourceType: 'Observation',
   *   compartment: { resourceType: 'Patient', id: 123 },
   *   searchParams: { code: 'abc', _include: ['Observation:encounter', 'Observation:performer'] },
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.search({
   *   resourceType: 'Observation',
   *   compartment: { resourceType: 'Patient', id: 123 },
   *   searchParams: { code: 'abc', _include: ['Observation:encounter', 'Observation:performer'] },
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} [params.resourceType] - The resource type
   *   (e.g. "Patient", "Observation"), optional.
   * @param {Object} [params.compartment] - The search compartment, optional.
   * @param {Object} [params.searchParams] - The search parameters, optional.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   *
   * @throws {Error} if neither searchParams nor resourceType are supplied
   */
  search(params: {
    resourceType: ResourceType;
    compartment?: Compartment;
    searchParams?: SearchParams;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'searchset' })
  >;

  /**
   * Search for a FHIR resource.
   *
   * @example
   *
   * // Using promises
   * fhirClient.resourceSearch({
   *   resourceType: 'Patient',
   *   searchParams: { name: 'Smith' },
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.resourceSearch({
   *   resourceType: 'Patient',
   *   searchParams: { name: 'Smith' },
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {Object} params.searchParams - The search parameters.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  resourceSearch(params: {
    resourceType: ResourceType;
    searchParams: SearchParams;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'searchset' })
  >;

  /**
   * Search across all FHIR resource types in the system.
   * Only the parameters defined for all resources can be used.
   *
   * @example
   *
   * // Using promises
   * fhirClient.systemSearch({
   *   searchParams: { name: 'smith' }
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.systemSearch({ searchParams: { name: 'smith' } });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {Object} params.searchParams - The search parameters.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  systemSearch(params: {
    searchParams: SearchParams;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'searchset' })
  >;

  /**
   * Search for FHIR resources within a compartment.
   * The resourceType and id must be specified.
   *
   * @example
   *
   * // Using promises
   * fhirClient.compartmentSearch({
   *   resourceType: 'Observation',
   *   compartment: { resourceType: 'Patient', id: 123 },
   *   searchParams: { code: 'abc' }
   * }).then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.compartmentSearch({
   *   resourceType: 'Observation',
   *   compartment: { resourceType: 'Patient', id: 123 },
   *   searchParams: { code: 'abc' }
   * });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {String} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {Object} params.compartment - The search compartment.
   * @param {Object} [params.searchParams] - The search parameters, optional.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  compartmentSearch(params: {
    resourceType: ResourceType;
    compartment: Compartment;
    searchParams?: SearchParams;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'searchset' })
  >;

  /**
   * Retrieve the change history for a FHIR resource id, a resource type or the
   * entire system
   *
   * @example
   *
   * // Using promises
   * fhirClient.history({ resourceType: 'Patient', id: '12345' });
   *   .then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.history({ resourceType: 'Patient', id: '12345' });
   * console.log(response);
   *
   * @param {Object} [params] - The request parameters.
   * @param {string} [params.resourceType] - The resource type
   *   (e.g. "Patient", "Observation"), optional.
   * @param {string} [params.id] - The FHIR id for the resource, optional.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  history(params?: {
    resourceType?: ResourceType;
    id?: string;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'history' })
  >;

  /**
   * Retrieve the change history for a particular resource FHIR id.
   *
   * @example
   *
   * // Using promises
   * fhirClient.resourceHistory({ resourceType: 'Patient', id: '12345' });
   *           .then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.resourceHistory({ resourceType: 'Patient', id: '12345' });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {string} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {string} params.id - The FHIR id for the resource.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  resourceHistory(params: {
    resourceType: ResourceType;
    id: string;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'history' })
  >;

  /**
   * Retrieve the change history for a particular resource type.
   *
   * @example
   *
   * // Using promises
   * fhirClient.typeHistory({ resourceType: 'Patient' });
   *           .then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.typeHistory({ resourceType: 'Patient' });
   * console.log(response);
   *
   * @param {Object} params - The request parameters.
   * @param {string} params.resourceType - The resource type (e.g. "Patient",
   *   "Observation").
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  typeHistory(params: {
    resourceType: ResourceType;
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'history' })
  >;

  /**
   * Retrieve the change history for all resources.
   *
   * @example
   *
   * // Using promises
   * fhirClient.systemHistory();
   *           .then((data) => { console.log(data); });
   *
   * // Using async
   * let response = await fhirClient.systemHistory();
   * console.log(response);
   *
   * @param {Object} [params] - The request parameters.
   * @param {Object} [params.headers] - DEPRECATED Optional custom headers to
   *   add to the request
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} FHIR resources in a FHIR fhir.r4.Bundle structure.
   */
  systemHistory(params?: {
    headers?: Headers;
    options?: Options;
  }): Promise<
    fhir.r4.OperationOutcome | (fhir.r4.Bundle & { type: 'history' })
  >;

  /**
   * Run a custom FHIR operation on system, resource type or instance level.
   *
   * - To run a system-level operation, omit the resourceType and id parameters.
   * - To run a type-level operatiion, include the resourceType and omit the id parameter.
   * - To run an instance-type operation, include both the resourceType and id.
   *
   * @example
   *
   * client.operation({ resourceType: 'ConceptMap', name: '$apply' }).
   *   then(result => console.log(result).
   *   catch(e => console.error(e));
   *
   *
   * const input = {
   *  system: 'http://hl7.org/fhir/composition-status',
   *  code: 'preliminary',
   *  source: 'http://hl7.org/fhir/ValueSet/composition-status',
   *  target: 'http://hl7.org/fhir/ValueSet/v3-ActStatus'
   * };
   *
   * client.operation({resourceType: 'ConceptMap', name: 'translate', method: 'get', input}).
   *   then(result => console.log(result)).
   *   catch(e => console.error(e));
   *
   * @param {String} params.name - The name of the operation (will get
   *    prepended with $ if missing.
   * @param {String} [params.resourceType] - Optional The resource type (e.g. "Patient",
   *   "Observation")
   * @param {String} [params.id] - Optional FHIR id for the resource
   * @param {String} [params.method] - Optional The HTTP method (post or get, defaults to post)
   * @param {Object} [params.input] - Optional input object for the operation
   * @param {Object} [params.options] - Optional options object
   * @param {Object} [params.options.headers] - Optional headers to add to the
   *   request
   *
   * @return {Promise<Object>} Result of opeartion (e.g. FHIR Parameter)
   */
  operation(params: {
    name: string;
    resourceType: ResourceType;
    id?: string;
    method?: string;
    input?: any;
    options?: any;
  }): Promise<any>;
}

export = Client;
