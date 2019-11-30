# ngx-comparison-slider
Image comparison slider component for Angular

# How to use it
1. Copy the component (4 files) to the appropriate location in your angular +2 application.
2. Update your 'app.module.ts'. Import the component and add it to the declarations. 
3. Add slider component to webpage as shown below

```HTML
<app-ngx-comparison-slider
  [preImageUrl]="'http://lorempixel.com/600/400/sports/1'"
  [postImageUrl]="'http://lorempixel.com/600/400/sports/2'"
  [sliderPosPct]="80"
>
</app-ngx-comparison-slider>
```

Optional parameters
 - sliderPosPct
 - gripLineWidth
 - gripLineColor
