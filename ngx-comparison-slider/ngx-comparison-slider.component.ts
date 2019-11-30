import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, Self, HostListener } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ngx-comparison-slider',
  templateUrl: './ngx-comparison-slider.component.html',
  styleUrls: ['./ngx-comparison-slider.component.css']
})
export class NgxComparisonSliderComponent implements OnInit, AfterViewInit {
  @Input() sliderPosPct = 50; // Default position middle of picture
  @Input() preImageUrl: string;
  @Input() postImageUrl: string;
  @Input() gripLineWidth = 1; // Width of line seperating pre and post image
  @Input() gripLineColor = 'lightgray'; // Color of line seperating pre and post image
  @Input() gripRingWidth = 30; // Width of ring seperating pre and post image
  @Input() gripRingColor = 'pink'; // Color of ring seperating pre and post image
  @Input() minPosPct = 0; // Not implemented
  @Input() maxPosPct = 100; // Not implemented

  @ViewChild('slider', { static: true }) slider: ElementRef;
  @ViewChild('preImg', { static: true }) preImage: ElementRef;
  @ViewChild('postImg', { static: true }) postImage: ElementRef;
  @ViewChild('resizer', { static: true }) resizer: ElementRef;
  @ViewChild('grip', { static: false }) gripLine: ElementRef;
  // @ViewChild('grip:after', { static: false }) grip: ElementRef;

  sliderActive$: Observable<Event>;

  componentHeight = 0;
  componentWidth = 0;

  sliderHeight = 0;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Override styles with optional setting
    this.renderer.setStyle(this.gripLine.nativeElement, 'width', this.gripLineWidth + 'px');
    this.renderer.setStyle(this.gripLine.nativeElement, 'margin-left', -this.gripLineWidth / 2 + 'px');
    this.renderer.setStyle(this.gripLine.nativeElement, 'background', this.gripLineColor);
    // this.renderer.setStyle(this.grip.nativeElement, 'border', this.gripRingWidth + 'px');
    // this.renderer.setStyle(this.grip.nativeElement, 'border-color', this.gripRingColor);

    // Setting the initial size of the postImage
    this.adjustImageSizeToComponent();
    this.setupDraggingEventStream();

    // Setting the slider at the correct start position
    this.slide(this.sliderPosPct);

    console.log(this.gripLine);
  }

  @HostListener('window:resize', ['$event.target'])
  onResize() {
    this.adjustImageSizeToComponent();
    this.slide(this.sliderPosPct);
  }

  setupDraggingEventStream() {
    // Setting up 'down events'
    const mouseDown$ = fromEvent(this.gripLine.nativeElement, 'mousedown');
    const touchDown$ = fromEvent(this.gripLine.nativeElement, 'touchstart');
    const down$ = merge(mouseDown$, touchDown$).pipe(
      tap((event: MouseEvent) => {
        event.stopPropagation(); // Prevent dragging the images (not sure if this is appropriate or even works)
        this.renderer.addClass(this.gripLine.nativeElement, 'draggable');
        this.renderer.addClass(this.resizer.nativeElement, 'resizable');
      })
    );

    // Setting up 'up events'
    const mouseUp$ = fromEvent(window, 'mouseup');
    const touchUp$ = fromEvent(window, 'touchstop');
    const touchEnd$ = fromEvent(window, 'touchend');
    const touchCancel$ = fromEvent(window, 'touchcancel');
    const up$ = merge(mouseUp$, touchUp$, touchEnd$, touchCancel$).pipe(
      tap(event => {
        event.preventDefault();
        this.renderer.removeClass(this.gripLine.nativeElement, 'draggable');
        this.renderer.removeClass(this.resizer.nativeElement, 'resizable');
      })
    );

    const mouseMove$ = fromEvent(window, 'mousemove');
    const touchMove$ = fromEvent(window, 'touchmove');
    const move$ = merge(mouseMove$, touchMove$).pipe(tap(event => event.preventDefault()));
    // touchMove$.subscribe((result: TouchEvent) => console.log(result.touches[0].screenX));

    this.sliderActive$ = down$.pipe(mergeMap(down => move$.pipe(takeUntil(up$))));

    this.sliderActive$.subscribe(movement => {
      // Get the cursor's x position
      let gripPosition = this.getCursorPos(movement);

      // Prevent the slider from being positioned outside the image
      if (gripPosition < 0) {
        gripPosition = 0;
      }

      if (gripPosition > this.componentWidth) {
        gripPosition = this.componentWidth;
      }

      // Persising position as pct to recalculate position during resize
      this.sliderPosPct = (gripPosition / this.componentWidth) * 100;

      // Change size of resizer, according to the grip
      this.slide(this.sliderPosPct);
    });
  }

  adjustImageSizeToComponent() {
    // Persist slider component width (after view init)
    this.componentWidth = this.slider.nativeElement.offsetWidth;

    // Set width of postImage to same size as slider component
    this.renderer.setStyle(this.postImage.nativeElement, 'width', this.componentWidth + 'px');
  }

  getCursorPos(event: any): number {
    // Attempt to stop dragging images. But seems not to work
    event.stopPropagation();

    // Get the rect position of the image
    const elementRect = this.postImage.nativeElement.getBoundingClientRect();

    // Get the right value for curser position. Differnt for touch and mouse
    const cursorX = event.pageX ? event.pageX : event.touches[0].pageX;

    // Calculate the cursor's x coordinate, relative to the image
    let imgRelativePosX = cursorX - elementRect.left;

    // Consider any page scrolling
    imgRelativePosX = imgRelativePosX - window.pageXOffset;

    return imgRelativePosX;
  }

  slide(sliderPositionPct: number) {
    // Recalculate position from pct to px
    const resizePosition = this.componentWidth * (sliderPositionPct / 100);

    // Resize the image by changing the size of the resizer
    this.renderer.setStyle(this.resizer.nativeElement, 'width', resizePosition + 'px');

    // Position the grip
    this.renderer.setStyle(this.gripLine.nativeElement, 'left', resizePosition - this.gripLineWidth / 4 + 'px');
  }
}
