import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagComponent } from './mag.component';

describe('MagComponent', () => {
  let component: MagComponent;
  let fixture: ComponentFixture<MagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MagComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
