import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingLanguageComponent } from './mapping-language.component';

describe('MappingLanguageComponent', () => {
  let component: MappingLanguageComponent;
  let fixture: ComponentFixture<MappingLanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MappingLanguageComponent ]
    })
    .compileComponents();
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
