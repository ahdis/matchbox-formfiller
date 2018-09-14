/// <reference path="../../../node_modules/@types/fhir/index.d.ts" />

import { Component, OnInit } from '@angular/core';
import { FhirJsHttpService, FHIR_HTTP_CONFIG } from 'ng-fhirjs';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { query } from '@angular/animations';

@Component({
  selector: 'app-questionnaires',
  templateUrl: './questionnaires.component.html',
  styleUrls: ['./questionnaires.component.css']
})
export class QuestionnairesComponent implements OnInit {

  searched = false;
  bundle: fhir.Bundle;
  dataSource = new MatTableDataSource<fhir.BundleEntry>();

  length = 100;
  pageSize = 10;
  pageIndex = 0;

  pageSizeOptions = [this.pageSize];
  public searchTitle: FormControl;
  public searchPublisher: FormControl;
  public searchVersion: FormControl;
  public searchId: FormControl;


  selected: fhir.Questionnaire;

  query = <QueryObj>{
    type: 'Questionnaire',
    query: {
      _count: this.pageSize,
      _summary: 'true',
      _sort: 'title'
    }
  };

  queryId = <QueryObj>{
    type: 'Questionnaire',
    query: {
      _count: this.pageSize,
      _summary: 'true',
      _sort: 'title'
    }
  };

  constructor(private fhirHttpService: FhirJsHttpService) {

    this.searchTitle = new FormControl();
    this.searchTitle.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(term => {
        console.log('called with ' + term);
        if (term) {
          this.query.query.title = term;
        } else {
          if (this.query.query.title) {
            delete this.query.query.title;
          }
        }
        this.queryQuerstionnaires();
      });

      this.searchPublisher = new FormControl();
      this.searchPublisher.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(term => {
          console.log('called with ' + term);
          if (term) {
            this.query.query.publisher = { $contains: term };
          } else {
            if (this.query.query.publisher) {
              delete this.query.query.publisher;
            }
          }
          this.queryQuerstionnaires();
        });

        this.searchVersion = new FormControl();
        this.searchVersion.valueChanges
          .pipe(
            debounceTime(400),
            distinctUntilChanged()
          )
          .subscribe(term => {
            console.log('called with ' + term);
            if (term) {
              this.query.query.version = { $contains: term };
            } else {
              if (this.query.query.version) {
                delete this.query.query.version;
              }
            }
            this.queryQuerstionnaires();
          });

          this.searchId = new FormControl();
          this.searchId.valueChanges
            .pipe(
              debounceTime(400),
              distinctUntilChanged()
            )
            .subscribe(term => {
              console.log('called with ' + term);
              if (term) {
                this.queryId.query._id = term;
                this.fhirHttpService.search(this.queryId).then(response => {
                  this.pageIndex = 0;
                  this.setBundle(<fhir.Bundle>response.data);
                });
              } else {
                this.queryQuerstionnaires();
              }
            });

      // default search
      this.queryQuerstionnaires();
    }

  queryQuerstionnaires() {
    this.fhirHttpService.search(this.query).then(response => {
      this.pageIndex = 0;
      this.setBundle(<fhir.Bundle>response.data);
    });
  }

  getTitle(entry: fhir.BundleEntry): string {
    const questionnaire = (<fhir.Questionnaire>entry.resource);
    if (questionnaire.title && questionnaire.title.length) {
      return questionnaire.title;
    }
    return '';
  }

  getPublisher(entry: fhir.BundleEntry): string {
    const questionnaire = (<fhir.Questionnaire>entry.resource);
    if (questionnaire.publisher && questionnaire.publisher.length) {
      return questionnaire.publisher;
    }
    return '';
  }

  getStatus(entry: fhir.BundleEntry): string {
    const questionnaire = (<fhir.Questionnaire>entry.resource);
    if (questionnaire.status && questionnaire.status) {
      return questionnaire.status;
    }
    return '';
  }

  getDate(entry: fhir.BundleEntry): string {
    const questionnaire = (<fhir.Questionnaire>entry.resource);
    if (questionnaire.date && questionnaire.date) {
      return questionnaire.date;
    }
    return '';
  }

  getVersion(entry: fhir.BundleEntry): string {
    const questionnaire = (<fhir.Questionnaire>entry.resource);
    if (questionnaire.version && questionnaire.version) {
      return questionnaire.version;
    }
    return '';
  }

  selectRow(row: fhir.BundleEntry) {
    const selection = row.resource;
    const readObj = { type: 'Questionnaire', id: selection.id };
    this.fhirHttpService.read(readObj).then(response => {
      this.selected = <fhir.Questionnaire> response.data;
    });
  }

  goToPage(event: PageEvent) {
    if (event.pageIndex > this.pageIndex) {
      this.fhirHttpService.nextPage({ bundle: this.bundle }).then(response => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response.data);
        console.log('next page called ');
      });
    } else {
      this.fhirHttpService.prevPage({ bundle: this.bundle }).then(response => {
        this.pageIndex = event.pageIndex;
        this.setBundle(<fhir.Bundle>response.data);
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

  ngOnInit() {
  }

}
