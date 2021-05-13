import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import FhirClient from 'fhir-kit-client';
import SearchParams from 'fhir-kit-client';
import { FhirConfigService } from '../fhirConfig.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-questionnaires',
  templateUrl: './questionnaires.component.html',
  styleUrls: ['./questionnaires.component.scss'],
})
export class QuestionnairesComponent implements OnInit {
  searched = false;
  bundle: fhir.Bundle;
  dataSource = new MatTableDataSource<fhir.BundleEntry>();

  length = 100;
  pageSize = 10;
  pageIndex = 0;

  subscription: Subscription;
  config = { baseUrl: 'https://test.ahdis.ch/r4' };
  client: FhirClient;

  pageSizeOptions = [this.pageSize];
  public searchTitle: FormControl;
  public searchPublisher: FormControl;
  public searchVersion: FormControl;
  public searchId: FormControl;

  selected: fhir.Questionnaire;

  query = {
    _count: this.pageSize,
    _summary: 'true',
    _sort: 'title',
    _id: 'title',
    title: '',
    'version:contains': '',
    'publisher:contains': '',
  };

  constructor(private data: FhirConfigService) {
    this.config.baseUrl = data.getFhirMicroService();
    this.client = new FhirClient(this.config);
    delete this.query.title;
    delete this.query._id;
    delete this.query['publisher:contains'];
    delete this.query['version:contains'];

    this.searchTitle = new FormControl();
    this.searchTitle.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        console.log('called with ' + term);
        if (term) {
          this.query = { ...this.query, title: term };
        } else {
          if (this.query.title) {
            delete this.query.title;
          }
        }
        this.queryQuestionnaires();
      });

    this.searchPublisher = new FormControl();
    this.searchPublisher.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        console.log('called with ' + term);
        if (term) {
          this.query = { ...this.query, 'publisher:contains': term };
        } else {
          if (this.query['publisher:contains']) {
            delete this.query['publisher:contains'];
          }
        }
        this.queryQuestionnaires();
      });

    this.searchVersion = new FormControl();
    this.searchVersion.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        console.log('called with ' + term);
        if (term) {
          this.query = { ...this.query, 'version:contains': term };
        } else {
          if (this.query['version:contains']) {
            delete this.query['version:contains'];
          }
        }
        this.queryQuestionnaires();
      });

    this.searchId = new FormControl();
    this.searchId.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        console.log('called with ' + term);
        if (term) {
          this.query = { ...this.query, _id: term };
        } else {
          if (this.query._id) {
            delete this.query._id;
          }
        }
        this.queryQuestionnaires();
      });

    // default search
    this.queryQuestionnaires();
  }

  queryQuestionnaires() {
    this.client
      .search({ resourceType: 'Questionnaire', searchParams: this.query })
      .then((response) => {
        this.pageIndex = 0;
        this.setBundle(<fhir.Bundle>response);
        return response;
      });
  }

  getTitle(entry: fhir.BundleEntry): string {
    const questionnaire = <fhir.Questionnaire>entry.resource;
    if (questionnaire.title && questionnaire.title.length) {
      return questionnaire.title;
    }
    return '';
  }

  getPublisher(entry: fhir.BundleEntry): string {
    const questionnaire = <fhir.Questionnaire>entry.resource;
    if (questionnaire.publisher && questionnaire.publisher.length) {
      return questionnaire.publisher;
    }
    return '';
  }

  getStatus(entry: fhir.BundleEntry): string {
    const questionnaire = <fhir.Questionnaire>entry.resource;
    if (questionnaire.status && questionnaire.status) {
      return questionnaire.status;
    }
    return '';
  }

  getDate(entry: fhir.BundleEntry): string {
    const questionnaire = <fhir.Questionnaire>entry.resource;
    if (questionnaire.date && questionnaire.date) {
      return questionnaire.date;
    }
    return '';
  }

  getVersion(entry: fhir.BundleEntry): string {
    const questionnaire = <fhir.Questionnaire>entry.resource;
    if (questionnaire.version && questionnaire.version) {
      return questionnaire.version;
    }
    return '';
  }

  selectRow(row: fhir.BundleEntry) {
    const selection = row.resource;
    const readObj = { resourceType: 'Questionnaire', id: selection.id };
    this.client.read(readObj).then((response) => {
      this.selected = <fhir.Questionnaire>response;
    });
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.pageIndex) {
      this.client.nextPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response);
        console.log('next page called ');
      });
    } else {
      this.client.prevPage({ bundle: this.bundle }).then((response) => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response);
        console.log('previous page called ');
      });
    }
  }

  setBundle(bundle: fhir.Bundle) {
    this.bundle = <fhir.Bundle>bundle;
    this.length = this.bundle.total;
    this.dataSource.data = this.bundle.entry;
    this.selected = undefined;
  }

  ngOnInit() {}
}
