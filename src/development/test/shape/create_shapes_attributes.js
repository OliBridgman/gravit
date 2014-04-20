(function () {
    function test(scene, page, layer, view) {

        //
        // Round rectangle with contents
        //
        rect = new GXRectangle();
        fill = new GXFillAttributes();
        fill.setColor(GXColor.parseCSSColor('yellow'));
        rect.getAttributes().appendChild(fill);
        rect.setProperties(['tl_sx', 'trf'], [50, new GTransform(100, 0, 0, 50, 110, 180)]);

        var subRect = new GXRectangle();
        fill = new GXFillAttributes();
        fill.setColor(GXColor.parseCSSColor('blue'));
        subRect.getAttributes().appendChild(fill);
        subRect.setProperty('trf', new GTransform(100, 0, 0, 50, 75, 200));
        rect.appendChild(subRect);

        rect.getAttributes().appendChild(new GXContentsAttributes());

        page.appendChild(rect);


        //
        // Blurred Rectangle
        //
        var rect = new GXRectangle();
        var filter = new GXBlurAttributes();
        rect.getAttributes().appendChild(filter);

        var fill = new GXFillAttributes();
        fill.setColor(GXColor.parseCSSColor('rgba(255, 0, 0, 1)'));
        filter.appendChild(fill);

        var stroke = new GXStrokeAttributes();
        stroke.setColor(GXColor.parseCSSColor('black'));
        stroke.setProperty('sw', '4');
        filter.appendChild(stroke);

        rect.setProperty('trf', new GTransform(100, 0, 0, 50, 110, 60));
        page.appendChild(rect);

/*
        rect = new GXRectangle();
        stroke = new GXStrokeAttributes();
        stroke.setColor(GXColor.parseCSSColor('black'));
        stroke.setProperty('sw', '1');
        rect.getAttributes().appendChild(stroke);
        rect.setProperty('trf', new GTransform(100, 0, 0, 50, 110, 60));
        page.appendChild(rect);
*/


        //page.appendChild(subRect);
        //
        // Text
        //
    }

    gDevelopment.tests.push({
        title: 'Create Shapes with Attributes',
        category: 'Shape',
        test: test
    });

})();