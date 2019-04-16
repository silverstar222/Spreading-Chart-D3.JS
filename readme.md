If you want to use this chart you need to import it in your source code
and pass there css selector to chart container and data:

```spreadingChart({
     selector: '#root',
     data,
     width,
     height
   });
```

if you want to use resizable version you need to use it like

```
ResizeDetector({
    onRender: ({width, height}) => spreadingChart({
                                      selector: '#root',
                                      data,
                                      width,
                                      height
                                    }),
    selector: '#root'
})
```

Also you need to import spreading-chart.scss to your styles/web page.

For customization you can change constant variables or ask me to add config, but tell me that i'll need to customize.

If you want to use your own font-family you need to add 
```
.spreading-chart {
    font-family: 'your font'
}

```
