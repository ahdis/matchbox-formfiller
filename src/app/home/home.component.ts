import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { Router } from '@angular/router';
import * as R from 'ramda';
import { QuestionnaireTableEntry } from '../questionnaires-table/questionnaires-table.component';
import { QuestionnaireWithResponse } from '../questionnaire-item/types';
import { extractQuestionnaireWithResponseFromBundle } from '../util/bundle-transform';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';
import { TaskTableEntry } from '../tasks-table/tasks-table.component';

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
  taskDataSource = new MatTableDataSource<TaskTableEntry<fhir.r4.Task>>();

  client: Client;

  constructor(fhirConfigService: FhirConfigService, private router: Router) {
    this.client = fhirConfigService.getFhirClient();
  }

  update(index): void {
    switch (index) {
      case 0:
        this.loadQuestionnaires();
        break;
      case 1:
        this.loadQuestionnaireResponses();
        break;
      case 2:
        this.loadTasks();
        break;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    this.update(tabChangeEvent.index);
  }

  async ngOnInit() {
    this.update(0);
  }

  async loadQuestionnaires() {
    const questionnaires: fhir.r4.Questionnaire[] = (await this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          _sort: 'title',
        },
      })
      .then(extractResourcesFromSearchBundle)) as fhir.r4.Questionnaire[];
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
    const questionnaireResponses: fhir.r4.QuestionnaireResponse[] = (await this.client
      .search({
        resourceType: 'QuestionnaireResponse',
        searchParams: {
          _summary: 'true',
          _sort: '-_lastUpdated',
        },
      })
      .then(
        extractResourcesFromSearchBundle
      )) as fhir.r4.QuestionnaireResponse[];

    if (!questionnaireResponses.length) {
      return;
    }

    // load related Questionnaires
    const questionnaireUrls = R.uniq(
      questionnaireResponses.map(
        (questionnaireResponse) => questionnaireResponse.questionnaire
      )
    ).join(',');
    const linkedQuestionnaires: fhir.r4.Questionnaire[] = (await this.client
      .search({
        resourceType: 'Questionnaire',
        searchParams: {
          _summary: 'true',
          url: questionnaireUrls,
        },
      })
      .then(extractResourcesFromSearchBundle)) as fhir.r4.Questionnaire[];

    this.openOrderDataSource.data = questionnaireResponses.map(
      (questionnaireResponse) => {
        const questionnaire = linkedQuestionnaires.find(
          ({ url }) => questionnaireResponse.questionnaire === url
        );
        return {
          title: questionnaire.title + ' ' + questionnaireResponse.id,
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

  async loadTasks() {
    const tasks: fhir.r4.Resource[] = await this.client
      .search({
        resourceType: 'Task',
        searchParams: {
          _sort: '-authored-on',
        },
      })
      .then(extractResourcesFromSearchBundle);

    this.taskDataSource.data = tasks.map((task: fhir.r4.Task) => ({
      title: task?.description ? task?.description : task.id,
      status: task?.status,
      authoredOn: task?.authoredOn,
      lastModified: task?.lastModified,
      requester: task?.requester?.display,
      owner: task?.owner?.display,
      entry: task,
    }));

    console.log('task entries' + this.taskDataSource.data.length);
  }

  //   async loadOutgoingBundles() {
  //   const placerCoding: fhir.r4.Coding = {
  //     system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
  //     code: 'PLAC',
  //   };
  //   const outgoingPlacerOrderIdentifier: fhir.r4.Identifier = await this.client
  //     .search({
  //       resourceType: 'Basic',
  //       searchParams: {
  //         code: `${placerCoding.system}|${placerCoding.code}`,
  //       },
  //     })
  //     .then((bundle) => bundle?.entry?.[0]?.resource?.identifier?.[0]);
  //   if (!outgoingPlacerOrderIdentifier) {
  //     console.error(
  //       'Cannot partition between incoming and outgoing bundles as no Basic resource defining the placerOrderIdentifier could be found.'
  //     );
  //   }

  //   const [outgoingEntries, incomingEntries] = await Promise.all([
  //     this.loadBundles(outgoingPlacerOrderIdentifier, false),
  //     this.loadBundles(outgoingPlacerOrderIdentifier, true),
  //   ]);
  //   this.outgoingOrderDataSource.data = outgoingEntries;
  //   this.incomingOrderDataSource.data = incomingEntries;
  // }

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

  openBundle(bundleId: string) {
    this.router.navigate(['bundle', bundleId]);
  }

  openTask(taskId: fhir.r4.Task) {
    this.router.navigate(['task', taskId.id]);
  }

  // private loadBundles(
  //   outgoingPlacerOrderIdentifier: fhir.r4.Identifier,
  //   incoming: boolean) {
  //   return this.client
  //     .search({
  //       resourceType: 'Bundle',
  //       searchParams: {
  //         [`placer${incoming ? ':not' : ''
  //           }`]: `${outgoingPlacerOrderIdentifier.system}|`,
  //         _sort: '-_lastUpdated',
  //       },
  //     })
  //     .then(extractResourcesFromSearchBundle)
  //     .then(
  //       R.map((bundle: fhir.r4.Bundle) => {
  //         const {
  //           questionnaire,
  //           questionnaireResponse,
  //         } = extractQuestionnaireWithResponseFromBundle(bundle);
  //         return {
  //           title: questionnaire?.title + ' ' + bundle.id,
  //           status: questionnaireResponse?.status,
  //           date: bundle.meta?.lastUpdated,
  //           publisher: questionnaire?.publisher,
  //           version: bundle.meta?.versionId,
  //           entry: bundle.id,
  //         };
  //       })
  //     );
  // }
}

const extractResourcesFromSearchBundle = (
  bundle: fhir.r4.OperationOutcome | fhir.r4.Bundle
): Promise<fhir.r4.Resource[]> =>
  bundle.resourceType !== 'Bundle'
    ? Promise.reject('Search failed')
    : Promise.resolve(
        (bundle as fhir.r4.Bundle)?.entry?.map(({ resource }) => resource) ?? []
      );
