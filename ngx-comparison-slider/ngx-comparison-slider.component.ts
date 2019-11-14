import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, Self, HostListener } from '@angular/core';
import { of, fromEvent, merge, Observable } from 'rxjs';
import { mapTo, mergeMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-ngx-comparison-slider',
  templateUrl: './ngx-comparison-slider.component.html',
  styleUrls: ['./ngx-comparison-slider.component.css']
})
export class NgxComparisonSliderComponent implements OnInit, AfterViewInit {
  @Input() preImageUrl: string;
  @Input() postImageUrl: string;
  @Input() startPosPct: number; // Not implemented
  @Input() minPosPct: number; // Not implemented
  @Input() maxPosPct: number; // Not implemented

  @ViewChild('slider', { static: true }) slider: ElementRef;
  @ViewChild('preImg', { static: true }) preImage: ElementRef;
  @ViewChild('postImg', { static: true }) postImage: ElementRef;
  @ViewChild('resizer', { static: true }) resizer: ElementRef;
  @ViewChild('grip', { static: false }) grip: ElementRef;

  sliderActive$: Observable<Event>;

  componentHeight = 0;
  componentWidth = 0;

  sliderWidth = 0;
  sliderHeight = 0;

  sliderPositionPct = 0;

  constructor(@Self() private self: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Setting the initial size of the postImage
    this.matchImageSizeToComponent();

    this.setupDraggingEventStream();

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
      this.sliderPositionPct = gripPosition / this.componentWidth;
      // console.log(this.sliderPositionPct);

      // this.sliderPositionPct = this.startPosPct;

      // Change size of resizer, according to the grip
      this.resize(this.sliderPositionPct);
    });
  }

  @HostListener('window:resize', ['$event.target'])
  onResize() {
    this.matchImageSizeToComponent();
    this.resize(this.sliderPositionPct);
  }

  setupDraggingEventStream() {
    // Setting up 'down events'
    const mouseDown$ = fromEvent(this.grip.nativeElement, 'mousedown');
    const touchDown$ = fromEvent(this.grip.nativeElement, 'touchstart');
    const down$ = merge(mouseDown$, touchDown$).pipe(
      tap((event: MouseEvent) => {
        event.stopPropagation(); // Prevent dragging the images (not sure if this is appropriate or even works)
        this.grip.nativeElement.classList.add('draggable');
        this.resizer.nativeElement.classList.add('resizable');
        // this.renderer.setAttribute(this.grip.nativeElement, 'class', 'draggable');
        // this.renderer.setAttribute(this.resizer.nativeElement, 'class', 'resizable');
      })
    );

    // Setting up 'up events'
    const mouseUp$ = fromEvent(window, 'mouseup');
    const touchUp$ = fromEvent(window, 'touchstop touchend touchcancel');
    const touchEnd$ = fromEvent(window, 'touchend');
    const touchCancel$ = fromEvent(window, 'touchcancel');
    const up$ = merge(mouseUp$, touchUp$, touchEnd$, touchCancel$).pipe(
      tap(() => {
        this.grip.nativeElement.classList.remove('draggable');
        this.resizer.nativeElement.classList.remove('resizable');
        // this.renderer.removeAttribute(this.grip.nativeElement, 'class', 'draggable');
        // this.renderer.removeAttribute(this.resizer.nativeElement, 'class', 'resizable');
      })
    );

    const mouseMove$ = fromEvent(window, 'mousemove');
    const touchMove$ = fromEvent(window, 'touchmove');
    const move$ = merge(mouseMove$, touchMove$);
    // touchMove$.subscribe((result: TouchEvent) => console.log(result.touches[0].screenX));

    this.sliderActive$ = down$.pipe(mergeMap(down => move$.pipe(takeUntil(up$))));
  }

  matchImageSizeToComponent() {
    // Persist slider component width (after view init)
    this.componentWidth = this.slider.nativeElement.offsetWidth;

    // Set width of postImage to same size as slider component
    this.renderer.setStyle(this.postImage.nativeElement, 'width', this.componentWidth + 'px');
  }

  getCursorPos(event): number {
    // Standard way of saying "if the parameter was not passed, default it
    // to whatever's after the ||". In this case, if the event parameter is not
    // passed, then it looks for the global variable.
    event = event || window.event;

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

  resize(sliderPositionPct: number) {
    // Recalculate position from pct to px
    const resizePosition = this.componentWidth * sliderPositionPct;
    // Resize the image by changing the size of the resizer
    this.renderer.setStyle(this.resizer.nativeElement, 'width', resizePosition + 'px');
    // Position the grip
    this.renderer.setStyle(this.grip.nativeElement, 'left', resizePosition - this.sliderWidth / 4 + 'px');
  }
}
