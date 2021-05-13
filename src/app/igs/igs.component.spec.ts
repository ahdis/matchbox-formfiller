import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgsComponent } from './igs.component';

describe('IgsComponent', () => {
  let component: IgsComponent;
  let fixture: ComponentFixture<IgsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IgsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
