import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FhirConfigService } from '../fhirConfig.service';
import Client from 'fhir-kit-client';
import { fromPromise } from 'rxjs/internal/observable/fromPromise';
import { QuestionnaireWithResponse } from '../questionnaire-item/types';
import { extractQuestionnaireWithResponseFromBundle } from '../util/bundle-transform';

@Component({
  selector: 'app-bundle-viewer',
  templateUrl: './bundle-viewer.component.html',
  styleUrls: ['./bundle-viewer.component.scss'],
})
export class BundleViewerComponent implements OnInit {
  private readonly fhirKitClient: Client;

  questionnaireWithResponse$: Observable<QuestionnaireWithResponse | undefined>;

  constructor(
    private route: ActivatedRoute,
    private fhirConfigService: FhirConfigService
  ) {
    this.fhirKitClient = fhirConfigService.getFhirClient();
  }

  ngOnInit() {
    this.questionnaireWithResponse$ = this.route.paramMap.pipe(
      map((params) => params.get('bundleId')),
      switchMap((id) =>
        fromPromise<fhir.r4.Bundle>(
          this.fhirKitClient.read({
            resourceType: 'Bundle',
            id,
          })
        )
      ),
      map(extractQuestionnaireWithResponseFromBundle),
      map(({ questionnaire, questionnaireResponse }) =>
        questionnaire && questionnaireResponse
          ? { questionnaire, questionnaireResponse }
          : undefined
      )
    );
  }
}
