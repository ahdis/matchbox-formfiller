import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import debug from 'debug';
import { Observable, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { getExtensionOfElement } from '../questionnaire-item/store/transform-initial-state';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { QuestionnaireWithResponse } from '../questionnaire-item/types';
import { FhirPathService } from 'ng-fhirjs';

@Component({
  selector: 'app-questionnaire-form-filler',
  templateUrl: './questionnaire-form-filler.component.html',
  styleUrls: ['./questionnaire-form-filler.component.scss'],
})
export class QuestionnaireFormFillerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  questionnaireWithResponse$: Observable<QuestionnaireWithResponse | undefined>;
  questionnaireResponse: fhir.r4.QuestionnaireResponse;

  log = debug('app:');

  constructor(
    private route: ActivatedRoute,
    private fhirConfigService: FhirConfigService,
    private router: Router,
    private fhirPathService: FhirPathService
  ) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  ngOnInit() {
    this.questionnaireWithResponse$ = zip(
      this.route.paramMap.pipe(
        map((params) => params.get('questionnaireId')),
        switchMap((id) =>
          fromPromise<fhir.r4.Questionnaire>(
            this.fhirKitClient.read({
              resourceType: 'Questionnaire',
              id,
            })
          )
        )
      ),
      this.route.queryParamMap.pipe(
        map((params) => params.get('questionnaireResponseId')),
        switchMap((id) =>
          id
            ? fromPromise<fhir.r4.QuestionnaireResponse>(
                this.fhirKitClient.read({
                  resourceType: 'QuestionnaireResponse',
                  id,
                })
              )
            : of(undefined)
        )
      )
    ).pipe(
      map(([questionnaire, questionnaireResponse]) =>
        questionnaire?.resourceType === 'Questionnaire'
          ? {
              questionnaire,
              questionnaireResponse:
                questionnaireResponse?.resourceType === 'QuestionnaireResponse'
                  ? questionnaireResponse
                  : undefined,
            }
          : undefined
      )
    );
  }

  onChangeQuestionnaireResponse(response: fhir.r4.QuestionnaireResponse) {
    this.questionnaireResponse = response;
  }

  getResourceFromBundleByType(
    bundle: fhir.r4.Bundle,
    resourceType: string
  ): fhir.r4.Resource {
    if (resourceType?.length > 0) {
      let resources = this.fhirPathService.evaluate(
        bundle,
        "entry.resource.where(resourceType='" + resourceType + "')"
      ) as fhir.r4.Resource[];
      if (resources?.length > 0) {
        return resources[0];
      } else {
        console.log(
          'entry with resourceType not found in bundle with ' +
            resourceType +
            ' in Bundle ' +
            bundle.id
        );
        return null;
      }
    }
    console.log('resourceType not specified for search in Bundle ' + bundle.id);
    return null;
  }

  getResourceFromBundle(
    bundle: fhir.r4.Bundle,
    fullUrl: string
  ): fhir.r4.Resource {
    if (fullUrl?.length > 0) {
      let resources = this.fhirPathService.evaluate(
        bundle,
        "entry.where(fullUrl='" + fullUrl + "').resource"
      ) as fhir.r4.Resource[];
      if (resources?.length > 0) {
        return resources[0];
      } else {
        console.log(
          'entry with fullUrl not found in bundle with' +
            fullUrl +
            ' in Bundle ' +
            bundle.id
        );
        return null;
      }
    }
    console.log('fullUrl not specified for search in Bundle ' + bundle.id);
    return null;
  }

  getOrganizationFromBundle(
    bundle: fhir.r4.Bundle,
    fullUrl: string
  ): fhir.r4.Organization {
    return this.getResourceFromBundle(bundle, fullUrl) as fhir.r4.Organization;
  }

  getOrganizationFromPractitionerRoleInBundle(
    bundle: fhir.r4.Bundle,
    fullUrlPractitionerRole: string
  ): fhir.r4.Organization {
    let refOrganizationFullUrl = this.fhirPathService.evaluateToString(
      bundle,
      "entry.where(fullUrl='" +
        fullUrlPractitionerRole +
        "').resource.organization.reference"
    );
    if (refOrganizationFullUrl) {
      return this.getOrganizationFromBundle(
        bundle,
        refOrganizationFullUrl
      ) as fhir.r4.Organization;
    } else {
      console.log(
        'organization not found in bundle with practitionerRoleId ' +
          fullUrlPractitionerRole +
          ' in Bundle ' +
          bundle.id
      );
    }
    return null;
  }

  async createTask(bundle: fhir.r4.Bundle): Promise<fhir.r4.Task> {
    let composition = bundle.entry[0].resource as fhir.r4.Composition;

    let refPractitionerRoleReceiver = this.fhirPathService.evaluateToString(
      composition,
      "extension.where(url='http://fhir.ch/ig/ch-orf/StructureDefinition/ch-orf-receiver').valueReference.reference"
    );
    let refPractitionerRoleSender = this.fhirPathService.evaluateToString(
      composition,
      'author.reference'
    );

    let organizationReceiver = this.getOrganizationFromPractitionerRoleInBundle(
      bundle,
      refPractitionerRoleReceiver
    );
    let organizationSender = this.getOrganizationFromPractitionerRoleInBundle(
      bundle,
      refPractitionerRoleSender
    );

    let serviceRequest = this.getResourceFromBundleByType(
      bundle,
      'ServiceRequest'
    ) as fhir.r4.ServiceRequest;

    organizationSender.id = '1';
    organizationReceiver.id = '2';

    let task: fhir.r4.Task = {
      resourceType: 'Task',
      contained: [
        {
          ...organizationSender,
        },
        {
          ...organizationReceiver,
        },
      ],
      identifier: [
        {
          ...serviceRequest.identifier[0],
        },
      ],
      status: 'in-progress',
      intent: 'order',
      description: 'Order ' + serviceRequest.identifier[0].value,
      focus: {
        reference: 'Bundle/' + bundle.id,
      },
      authoredOn: bundle.timestamp,
      lastModified: bundle.timestamp,
      requester: {
        reference: '#1',
        display: organizationSender?.name,
      },
      restriction: {
        recipient: [
          {
            reference: '#2',
            display: organizationReceiver?.name,
          },
        ],
      },
    };
    // extract all ImagingStudy
    const imagingStudiesFromBundle = bundle.entry
      ?.filter((input) => 'ImagingStudy' === input.resource.resourceType)
      .map((input) => input.resource) as fhir.r4.ImagingStudy[];
    const imagingStudies = await Promise.all(
      imagingStudiesFromBundle.map(async (study) => {
        const imagingStudy = await this.fhirKitClient.create({
          resourceType: 'ImagingStudy',
          body: study,
        });
        return imagingStudy;
      })
    );
    if (imagingStudies && imagingStudies.length > 0) {
      task = { ...task, input: [] };
      for (let entry of imagingStudies) {
        task.input.push({
          type: {
            text: 'ImagingStudy',
          },
          valueReference: {
            reference: 'ImagingStudy/' + entry.id,
          },
        });
      }
    }
    return this.fhirKitClient.create({
      resourceType: task.resourceType,
      body: task,
    }) as Promise<fhir.r4.Task>;
  }

  async onSubmit({
    questionnaire,
    questionnaireResponse,
  }: QuestionnaireWithResponse) {
    this.log('submit questionnaire response', this.questionnaireResponse);
    if (
      getExtensionOfElement(
        'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap'
      )(questionnaire)
    ) {
      const resource = (await this.fhirKitClient.operation({
        name: 'extract',
        resourceType: 'QuestionnaireResponse',
        input: this.questionnaireResponse,
      })) as fhir.r4.Resource;
      if (!('OperationOutcome' === resource.resourceType)) {
        let createdResource = await this.fhirKitClient.create({
          resourceType: resource.resourceType,
          body: resource,
        });
        if (
          questionnaire.derivedFrom &&
          questionnaire.derivedFrom.includes(
            'http://fhir.ch/ig/ch-orf/StructureDefinition/ch-orf-questionnaire'
          )
        ) {
          let task = await this.createTask(createdResource as fhir.r4.Bundle);
          await this.router.navigate(['task', task.id]);
          return;
        }
      } else {
        console.log(
          'Error performing extract operation ' +
            JSON.stringify(resource, null, 2)
        );
        // TODO create an error message
        return;
      }
    }
    await this.saveQuestionnaireResponse(questionnaireResponse, 'completed');
    await this.router.navigateByUrl('/');
  }

  onSaveAsDraft(initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse) {
    return this.saveQuestionnaireResponse(
      initialQuestionnaireResponse
    ).then(() => this.router.navigateByUrl('/'));
  }

  onDeleteQuestionnaireResponse(
    initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse
  ) {
    return this.deleteQuestionnaireResponse(
      initialQuestionnaireResponse
    ).then(() => this.router.navigateByUrl('/'));
  }

  onCancel() {
    return this.router.navigateByUrl('/');
  }

  private async deleteQuestionnaireResponse(
    initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse
  ) {
    const questionnaireResponseId = initialQuestionnaireResponse?.id;
    if (questionnaireResponseId) {
      return this.fhirKitClient.delete({
        id: questionnaireResponseId,
        resourceType: 'QuestionnaireResponse',
      });
    }
  }

  private async saveQuestionnaireResponse(
    initialQuestionnaireResponse?: fhir.r4.QuestionnaireResponse,
    status: 'in-progress' | 'completed' = 'in-progress'
  ) {
    const questionnaireResponseId = initialQuestionnaireResponse?.id;
    if (questionnaireResponseId) {
      return this.fhirKitClient.update({
        id: questionnaireResponseId,
        resourceType: 'QuestionnaireResponse',
        body: {
          ...initialQuestionnaireResponse,
          ...this.questionnaireResponse,
          status,
        },
      });
    } else {
      return this.fhirKitClient.create({
        resourceType: 'QuestionnaireResponse',
        body: this.questionnaireResponse,
        status,
      });
    }
  }
}
