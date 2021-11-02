import { Component, OnInit, setTestabilityGetter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { ImagingStudyTableComponent } from '../imaging-study-table/imaging-study-table.component';

@Component({
  selector: 'app-task-viewer',
  templateUrl: './task-viewer.component.html',
  styleUrls: ['./task-viewer.component.scss'],
})
export class TaskViewerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  task: fhir.r4.Task;

  inputImagingStudyReferences: fhir.r4.Reference[];

  inputImagingStudies: fhir.r4.ImagingStudy[];
  outputImagingStudies: fhir.r4.ImagingStudy[];
  outputDocumentReferences: fhir.r4.DocumentReference[];

  constructor(
    private route: ActivatedRoute,
    private fhirConfigService: FhirConfigService,
    private router: Router
  ) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  substractResource(resource: string, reference: string): string {
    return reference.startsWith(resource + '/')
      ? reference.substring(resource.length + 1)
      : reference;
  }

  // getImagingStudyStatus(): string {
  //   return this.study?.status;
  // }
  // setTask(task: fhir.r4.Task | fhir.r4.OperationOutcome) {
  //   this.task = task as fhir.r4.Task;
  //   this.inputImagingStudyReferences = this.task.input?.filter((input) => ('ImagingStudy' === input.type?.text)).map((input) => ({ "reference": this.substractResource('ImagingStudy', input.valueReference.reference), "display": input.valueReference.display }));
  //   this.outputImagingStudyReferences = this.task.output?.filter((input) => ('ImagingStudy' === input.type?.text)).map((input) => ({ "reference": this.substractResource('ImagingStudy', input.valueReference.reference), "display": input.valueReference.display }));
  //   this.outputDocumentRefReferences = this.task.output?.filter((input) => ('DocumentReference' === input.type?.text)).map((input) => ({ "reference": this.substractResource('DocumentReference', input.valueReference.reference), "display": input.valueReference.display }));
  //   if (this.inputImagingStudyReferences.length > 0) {
  //     this.inputImagingStudies = new Array<fhir.r4.ImagingStudy>(this.inputImagingStudyReferences.length);
  //     for (var i = 0; i < this.inputImagingStudyReferences.length; ++i) {
  //         this.fhirKitClient.read({
  //         resourceType: 'ImagingStudy',
  //         id: this.inputImagingStudyReferences[i].reference
  //       }).then(res => this.inputImagingStudies[i] = res as fhir.r4.ImagingStudy)
  //     }
  //   }
  // if (this.outputImagingStudyReferences.length > 0) {
  //   for (var i = 0; i < this.outputImagingStudyReferences.length; ++i) {
  //     this.fhirKitClient.read({
  //       resourceType: 'ImagingStudy',
  //       id: this.outputImagingStudyReferences[i].reference
  //     }).then(res => this.outputImagingStudies[i] = res as fhir.r4.ImagingStudy)
  //   }
  // }
  // if (this.outputDocumentRefReferences.length > 0) {
  //   for (var i = 0; i < this.outputDocumentRefReferences.length; ++i) {
  //     this.fhirKitClient.read({
  //       resourceType: 'DocumentReference',
  //       id: this.outputDocumentRefReferences[i].reference
  //     }).then(res => this.outputDocumentReferences[i] = res as fhir.r4.DocumentReference)
  //   }
  // }
  //  }

  ngOnInit() {
    const fetchTask = async (id: string): Promise<fhir.r4.Task> => {
      const response = await this.fhirKitClient.read({
        resourceType: 'Task',
        id,
      });
      return response as fhir.r4.Task;
    };

    const fetchImagingStudy = async (
      id: string
    ): Promise<fhir.r4.ImagingStudy> => {
      const response = await this.fhirKitClient.read({
        resourceType: 'ImagingStudy',
        id,
      });
      return response as fhir.r4.ImagingStudy;
    };

    const fetchDocumentReference = async (
      id: string
    ): Promise<fhir.r4.DocumentReference> => {
      const response = await this.fhirKitClient.read({
        resourceType: 'DocumentReference',
        id,
      });
      return response as fhir.r4.DocumentReference;
    };

    const runAsyncFunctions = async (taskId) => {
      try {
        const task = await fetchTask(taskId);
        const inputImagingStudyReferences = task.input
          ?.filter((input) => 'ImagingStudy' === input.type?.text)
          .map((input) => ({
            reference: this.substractResource(
              'ImagingStudy',
              input.valueReference.reference
            ),
            display: input.valueReference.display,
          }));
        const outputImagingStudyReferences = task.output
          ?.filter((input) => 'ImagingStudy' === input.type?.text)
          .map((input) => ({
            reference: this.substractResource(
              'ImagingStudy',
              input.valueReference.reference
            ),
            display: input.valueReference.display,
          }));
        const outputDocumentRefReferences = task.output
          ?.filter((input) => 'DocumentReference' === input.type?.text)
          .map((input) => ({
            reference: this.substractResource(
              'DocumentReference',
              input.valueReference.reference
            ),
            display: input.valueReference.display,
          }));

        if (inputImagingStudyReferences) {
          const imagingStudies = await Promise.all(
            inputImagingStudyReferences.map(async (reference) => {
              const imagingStudy = await fetchImagingStudy(reference.reference);
              return imagingStudy;
            })
          );
          this.inputImagingStudies = imagingStudies;
        }
        if (outputImagingStudyReferences) {
          const outputImagingStudies = await Promise.all(
            outputImagingStudyReferences.map(async (reference) => {
              const imagingStudy = await fetchImagingStudy(reference.reference);
              return imagingStudy;
            })
          );
          this.outputImagingStudies = outputImagingStudies;
        }

        if (outputDocumentRefReferences) {
          const outputDocumentReferences = await Promise.all(
            outputDocumentRefReferences.map(async (reference) => {
              const imagingStudy = await fetchDocumentReference(
                reference.reference
              );
              return imagingStudy;
            })
          );
          this.outputDocumentReferences = outputDocumentReferences;
        }

        this.task = task;
      } catch (error) {
        console.log(error);
      }
    };

    this.route.paramMap.subscribe((params) => {
      const taskId = params.get('taskId');
      console.log(taskId);
      runAsyncFunctions(taskId);
    });
  }

  getJson(): string {
    return JSON.stringify(this.task, null, 2);
  }

  onShowOrder() {
    this.router.navigate([
      'bundle',
      this.substractResource('Bundle', this.task.focus.reference),
    ]);
  }

  downloadPdf(base64String, fileName) {
    const source = `data:application/pdf;base64,${base64String}`;
    const link = document.createElement('a');
    link.href = source;
    link.download = `${fileName}.pdf`;
    link.click();
  }

  onPdf(docRef: fhir.r4.DocumentReference) {
    this.downloadPdf(docRef.content[0].attachment?.data, docRef.description);
  }

  getDescription(): string {
    return '';
  }
}
