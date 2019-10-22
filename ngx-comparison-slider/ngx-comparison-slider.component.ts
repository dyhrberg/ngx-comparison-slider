import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { of, fromEvent, merge } from 'rxjs';
import { mapTo, mergeMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ngx-comparison-slider',
  templateUrl: './ngx-comparison-slider.component.html',
  styleUrls: ['./ngx-comparison-slider.component.css']
})
export class NgxComparisonSliderComponent implements OnInit, AfterViewInit {

  @Input() preImageUrl: string;
  @Input() postImageUrl: string;

  @ViewChild('preImg', { static: true }) preImage: ElementRef;
  @ViewChild('postImg', { static: true }) postImage: ElementRef;

  slider: HTMLElement;
  img: number = 0;
  clicked: number = 0;
  componentWidth: number = 0;
  componentHeight: number = 0;
  sliderHeight: number = 0;
  sliderWidth: number = 0;

  sliderActive$;
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() { }

  ngAfterViewInit() { }

}
