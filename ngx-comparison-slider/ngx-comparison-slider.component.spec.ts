import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxComparisonSliderComponent } from './ngx-comparison-slider.component';

describe('NgxComparisonSliderComponent', () => {
  let component: NgxComparisonSliderComponent;
  let fixture: ComponentFixture<NgxComparisonSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NgxComparisonSliderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxComparisonSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
