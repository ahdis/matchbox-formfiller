import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { Router } from '@angular/router';
import * as R from 'ramda';
import { QuestionnaireTableEntry } from '../questionnaires-table/questionnaires-table.component';

interface QuestionnaireWithResponse {
  readonly questionnaire: fhir.r4.Questionnaire;
  readonly questionnaireResponse: fhir.r4.QuestionnaireResponse;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  newOrderDataSource = new MatTableDataSource<
    QuestionnaireTableEntry<fhir.r4.Questionnaire>
  >();
  openOrderDataSource = new MatTableDataSource<
    QuestionnaireTableEntry<QuestionnaireWithResponse>
  >();
  outgoingOrderDataSource = new MatTableDataSource<
    QuestionnaireTableEntry<QuestionnaireWithResponse>
  >();
  incomingOrderDataSource = new MatTableDataSource<
    QuestionnaireTableEntry<QuestionnaireWithResponse>
  >();
  client: Client;

  constructor(fhirConfigService: FhirConfigService, private router: Router) {
    this.client = fhirConfigService.getFhirClient();
  }

  async ngOnInit() {
    await Promise.all([
      this.loadQuestionnaires(),
      this.loadQuestionnaireResponses(),
      this.loadOutgoingBundles(),
    ]);
  }

  async loadQuestionnaires() {
    const questionnaires: fhir.r4.Questionnaire[] = await this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          _sort: 'title',
        },
      })
      .then(extractResourcesFromSearchBundle);
    this.newOrderDataSource.data = questionnaires.map((questionnaire) => ({
      title: questionnaire.title,
      status: questionnaire.status,
      date: questionnaire.date,
      publisher: questionnaire.publisher,
      version: questionnaire.version,
      entry: questionnaire,
    }));
  }

  async loadQuestionnaireResponses() {
    const questionnaireResponses: fhir.r4.QuestionnaireResponse[] = await this.client
      .search({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          _summary: 'true',
          _sort: '-_lastUpdated',
        },
      })
      .then(extractResourcesFromSearchBundle);

    if (!questionnaireResponses.length) {
      return;
    }

    // load related Questionnaires
    const questionnaireUrls = R.uniq(
      questionnaireResponses.map(
        (questionnaireResponse) => questionnaireResponse.questionnaire
      )
    ).join(',');
    const linkedQuestionnaires: fhir.r4.Questionnaire[] = await this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          url: questionnaireUrls,
        },
      })
      .then(extractResourcesFromSearchBundle);
    this.openOrderDataSource.data = questionnaireResponses.map(
      (questionnaireResponse) => {
        const questionnaire = linkedQuestionnaires.find(
          ({ url }) => questionnaireResponse.questionnaire === url
        );
        return {
          title: questionnaire.title,
          status: questionnaireResponse.status,
          date: questionnaireResponse.meta?.lastUpdated,
          publisher: questionnaire.publisher,
          version: questionnaireResponse.meta?.versionId,
          entry: {
            questionnaire,
            questionnaireResponse,
          },
        };
      }
    );
  }

  async loadOutgoingBundles() {
    const placerCoding: fhir.r4.Coding = {
      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
      code: 'PLAC',
    };
    const outgoingPlacerOrderIdentifier: fhir.r4.Identifier = await this.client
      .search({
        resourceType: 'Basic',
        searchParams: {
          code: `${placerCoding.system}|${placerCoding.code}`,
        },
      })
      .then((bundle) => bundle?.entry?.[0]?.resource?.identifier?.[0]);
    if (!outgoingPlacerOrderIdentifier) {
      console.error(
        'Cannot partition between incoming and outgoing bundles as no Basic resource defining the placerOrderIdentifier could be found.'
      );
    }
    const bundles: fhir.r4.Bundle[] = await this.client
      .search({
        resourceType: 'Bundle',
      })
      .then(extractResourcesFromSearchBundle);

    const [outgoingEntries, incomingEntries] = R.map(
      R.map((bundle: fhir.r4.Bundle) => {
        const questionnaire: fhir.r4.Questionnaire = findResourceByType(
          bundle,
          'Questionnaire'
        ) as any;
        const questionnaireResponse: fhir.r4.QuestionnaireResponse = findResourceByType(
          bundle,
          'QuestionnaireResponse'
        ) as any;
        return {
          title: questionnaire?.title,
          status: questionnaireResponse?.status,
          date: bundle.meta?.lastUpdated,
          publisher: questionnaire?.publisher,
          version: bundle.meta?.versionId,
          entry: {
            questionnaire,
            questionnaireResponse,
          },
        };
      }),
      R.partition((bundle) => {
        const serviceRequest: fhir.r4.ServiceRequest = findResourceByType(
          bundle,
          'ServiceRequest'
        ) as any;
        const placerIdentifier = R.find(
          (identifier) =>
            R.any(
              (coding) =>
                coding?.system === placerCoding.system &&
                coding?.code === placerCoding.code,
              identifier?.type?.coding ?? []
            ),
          serviceRequest?.identifier ?? []
        );
        return (
          outgoingPlacerOrderIdentifier.system === placerIdentifier.system &&
          outgoingPlacerOrderIdentifier.value === placerIdentifier.value
        );
      }, bundles)
    );
    this.outgoingOrderDataSource.data = outgoingEntries;
    this.incomingOrderDataSource.data = incomingEntries;
  }

  openQuestionnaire(entry: fhir.r4.Questionnaire) {
    this.router.navigate(['questionnaire', entry.id]);
  }

  openQuestionnaireResponse({
    questionnaire,
    questionnaireResponse,
  }: QuestionnaireWithResponse) {
    this.router.navigate(['questionnaire', questionnaire.id], {
      queryParams: { questionnaireResponseId: questionnaireResponse.id },
    });
  }
}

const extractResourcesFromSearchBundle = (
  bundle: fhir.r4.Bundle
): Promise<fhir.r4.Resource[]> =>
  bundle.resourceType !== 'Bundle'
    ? Promise.reject('Search failed')
    : Promise.resolve(bundle?.entry?.map(({ resource }) => resource) ?? []);

const findResourceByType = (
  bundle: fhir.r4.Bundle,
  resourceType: string
): fhir.r4.Resource | undefined =>
  bundle?.entry?.find((entry) => entry?.resource?.resourceType === resourceType)
    ?.resource;
