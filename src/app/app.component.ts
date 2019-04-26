import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular on fhir';

  constructor(
    private fhirHttpService: FhirJsHttpService,
    private router: Router
  ) {}

  getTitle(): string {
    switch (this.router.url) {
      case '/fhirpath':
        return this.title + ' - ' + 'FHIRPath';
      case '/mappinglanguage':
        return this.title + ' - ' + 'FHIR Mapping Language';
      case '/patients':
        return this.title + ' - ' + 'Search patients';
      case '/questionnaires':
        return this.title + ' - ' + 'Search questionnaires';
      case '/CapabilityStatement':
        return this.title + ' - ' + 'CapabilityStatement';
      case '/settings':
        return this.title + ' - ' + 'Settings';
    }
    return this.title;
  }
}
