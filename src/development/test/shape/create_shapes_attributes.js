(function () {
    function test(scene, page, layer, view) {

        //
        // Round rectangle with contents
        //
        rect = new GXRectangle();
        var shadow = new IFShadowAttribute();
        fill = new IFFillAttribute();
        fill.setColor(GXColor.parseCSSColor('yellow'));
        rect.getAttributes().appendChild(shadow);
        shadow.appendChild(fill);
        rect.setProperties(['tl_sx', 'trf'], [50, new GTransform(100, 0, 0, 50, 110, 180)]);

        var subRect = new GXRectangle();
        fill = new IFFillAttribute();
        fill.setColor(GXColor.parseCSSColor('blue'));
        subRect.getAttributes().appendChild(fill);
        subRect.setProperty('trf', new GTransform(100, 0, 0, 50, 75, 200));
        rect.appendChild(subRect);

        rect.getAttributes().appendChild(new IFContentAttribute());

        page.appendChild(rect);


        //
        // Blurred Rectangle
        //
        var rect = new GXRectangle();
        var filter = new IFBlurAttribute();
        rect.getAttributes().appendChild(filter);

        var fill = new IFFillAttribute();
        fill.setColor(GXColor.parseCSSColor('rgba(255, 0, 0, 1)'));
        filter.appendChild(fill);

        var stroke = new IFStrokeAttribute();
        stroke.setColor(GXColor.parseCSSColor('black'));
        stroke.setProperty('sw', '4');
        filter.appendChild(stroke);

        rect.setProperty('trf', new GTransform(100, 0, 0, 50, 110, 60));
        page.appendChild(rect);

        //
        // Text
        //
        var text = new GXText();
        fill = new IFFillAttribute();
        fill.setColor(GXColor.parseCSSColor('gray'));
        text.getAttributes().appendChild(fill);
        page.appendChild(text);
    }

    gDevelopment.tests.push({
        title: 'Create Shapes with Attributes',
        category: 'Shape',
        test: test
    });

})();