import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemHintComponent } from './item-hint.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ItemHintComponent', () => {
  let component: ItemHintComponent;
  let fixture: ComponentFixture<ItemHintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemHintComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
