import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagingStudyTableComponent } from './imaging-study-table.component';

describe('ImagingStudyTableComponent', () => {
  let component: ImagingStudyTableComponent;
  let fixture: ComponentFixture<ImagingStudyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagingStudyTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagingStudyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
