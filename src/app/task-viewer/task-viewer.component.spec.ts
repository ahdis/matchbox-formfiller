import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskViewerComponent } from './task-viewer.component';

describe('TaskViewerComponent', () => {
  let component: TaskViewerComponent;
  let fixture: ComponentFixture<TaskViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaskViewerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
