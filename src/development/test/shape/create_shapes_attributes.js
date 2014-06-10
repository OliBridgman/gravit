(function () {
    function test(scene, page, layer, view) {
        var sharedStyle_1 = new IFSharedStyle();
        var stroke = new IFStrokePaint();
        stroke.setProperties(['sw', 'sa'], [15, IFStrokePaint.Alignment.Inside]);
        sharedStyle_1.appendChild(stroke);

        var sharedStyle_2 = new IFSharedStyle();
        var stroke = new IFStrokePaint();
        stroke.setProperties(['sw', 'sa'], [10, IFStrokePaint.Alignment.Outside]);
        sharedStyle_2.appendChild(stroke);
        sharedStyle_2.appendChild(new IFOffsetVEffect());
        sharedStyle_2.appendChild(new IFShadowEffect());

        var sharedStyle_3 = new IFSharedStyle();
        var fill = new IFFillPaint();
        fill.setProperty('pat', IFColor.parseCSSColor('red'));
        sharedStyle_3.appendChild(fill);

        scene.getStyleCollection().appendChild(sharedStyle_1);
        scene.getStyleCollection().appendChild(sharedStyle_2);
        scene.getStyleCollection().appendChild(sharedStyle_3);

        var rectWidth = 200;
        var rectHeight = 100;
        var y = 20;
        var x = 20;

        for (var i = 0; i < 3; ++i) {
            var rect = new IFRectangle();
            rect.setProperties(['tl_sx', 'trf'], [50, new GTransform(rectWidth / 2, 0, 0, rectHeight / 2,
                x + rectWidth / 2, y + rectHeight / 2)]);

            var style = new IFInlineStyle();
            style.setProperty('opc', 0.25);
            var stroke = new IFStrokePaint();
            stroke.setProperties(['sw', 'sa'], [15, IFStrokePaint.Alignment.Inside]);
            style.appendChild(stroke);

            rect.getStyleSet().appendChild(style);

            style = new IFInlineStyle();
            style.setProperty('opc', 0.5);
            var stroke = new IFStrokePaint();
            stroke.setProperties(['sw', 'sa'], [10, IFStrokePaint.Alignment.Outside]);
            style.appendChild(stroke);
            style.appendChild(new IFOffsetVEffect());
            style.appendChild(new IFShadowEffect());
            rect.getStyleSet().appendChild(style);

            var rect2 = new IFRectangle();
            rect2.setProperties(['trf'], [new GTransform(rectWidth / 2, 0, 0, rectHeight / 2,
                x + 20 + rectWidth / 2, y + rectHeight / 2)]);
            var style = new IFInlineStyle();
            var fill = new IFFillPaint();
            fill.setProperty('pat', IFColor.parseCSSColor('red'));
            style.appendChild(fill);
            rect2.getStyleSet().appendChild(style);
            rect.appendChild(rect2);

            page.appendChild(rect);

            y += rectHeight + 50;
        }

        y = 20;
        x += rectWidth + 50;

        for (var i = 0; i < 3; ++i) {
            var rect = new IFRectangle();
            rect.setProperties(['tl_sx', 'trf'], [50, new GTransform(rectWidth / 2, 0, 0, rectHeight / 2,
                x + rectWidth / 2, y + rectHeight / 2)]);

            var style = new IFLinkedStyle();
            style.setProperty('opc', 0.25);
            style.setProperty('ref', sharedStyle_1.getReferenceId());
            rect.getStyleSet().appendChild(style);

            style = new IFLinkedStyle();
            style.setProperty('opc', 0.5);
            style.setProperty('ref', sharedStyle_2.getReferenceId());
            rect.getStyleSet().appendChild(style);

            var rect2 = new IFRectangle();
            rect2.setProperties(['trf'], [new GTransform(rectWidth / 2, 0, 0, rectHeight / 2,
                x + 20 + rectWidth / 2, y + rectHeight / 2)]);
            var style = new IFLinkedStyle();
            style.setProperty('ref', sharedStyle_3.getReferenceId());
            rect2.getStyleSet().appendChild(style);
            rect.appendChild(rect2);

            page.appendChild(rect);

            y += rectHeight + 50;
        }
    }

    gDevelopment.tests.push({
        title: 'Create Shapes with Attributes',
        category: 'Shape',
        test: test
    });

})();