import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';

const modulesToExport = [
  CommonModule,
  BrowserModule,
  BrowserAnimationsModule,
  FormsModule,
  ReactiveFormsModule,
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatMenuModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatTableModule,
  MatToolbarModule,
  MatTabsModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatRadioModule,
];

const components = [];

@NgModule({
  imports: modulesToExport,
  declarations: components,
  exports: [...modulesToExport, ...components],
})
export class SharedModule {}
