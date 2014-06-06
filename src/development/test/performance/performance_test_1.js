(function () {
    function test(scene, page, view) {
        var start = new Date().getTime();

        var rectWidth = 5, rectHeight = 5;
        var spaceX = 5, spaceY = 5;
        var x = spaceX, y = spaceY, rotate = 0.0;

        var numberOfRects = 0;

        page.beginUpdate();
        while (y < page.getProperty('h')) {
            if (x + rectWidth + spaceX > page.getProperty('w')) {
                y += rectHeight + spaceY;
                x = spaceX;
            }

            var rect = new IFRectangle();
            rect.setProperties(['trf'], [new GTransform(rectWidth, 0.0, 0.0, rectHeight, x, y)]);

            rect.transform(new GTransform(1.0, 0.0, 0.0, 1.0, -(x + rectWidth/2), -(y + rectHeight/2))
                .rotated(ifMath.toRadians(rotate))
                .translated(+(x + rectWidth/2), + (y + rectHeight/2)));

            var editor = IFEditor.getEditor(scene);
            rect.getStyleSet().appendChild(new IFStrokePaint());
            page.appendChild(rect);

            x += rectWidth + spaceX;

            rotate = rotate >= 360.0 ? 0.0 : rotate + 0.5;

            numberOfRects++;
        }
        page.endUpdate();

        var end = new Date().getTime() - start;
        alert('Created ' + numberOfRects.toString() + ' Rectangles in ' + (end > 1000 ? ((end / 1000).toString() + 'sec') : (end.toString() + 'ms')));
    }

    gDevelopment.tests.push({
        title: 'Performance Test #1',
        category: 'Performance',
        test: test
    });

})();