import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingLanguageComponent } from './mapping-language.component';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MappingLanguageComponent', () => {
  let component: MappingLanguageComponent;
  let fixture: ComponentFixture<MappingLanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MappingLanguageComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
