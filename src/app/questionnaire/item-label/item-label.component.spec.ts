import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemLabelComponent } from './item-label.component';

describe('ItemLabelComponent', () => {
  let component: ItemLabelComponent;
  let fixture: ComponentFixture<ItemLabelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemLabelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemLabelComponent);
    component = fixture.componentInstance;
    component.item = {
      linkId: '',
      type: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
