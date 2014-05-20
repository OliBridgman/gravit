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
        fill.setColor(GXColor.parseCSSColor('black'));
        text.getAttributes().appendChild(fill);



        var p1 = new GXText.Paragraph();
        p1.setProperties(['cc', 'cg', 'lh', 'al'], [2, 40, 1.3, GXText.Paragraph.Alignment.Left]);
        var sp1 = new GXText.Span('Aq');
        var sp2 = new GXText.Span(' xWg');
        sp2.setProperty('fs', '72');
        var sp3 = new GXText.Span(' Works :) --> In olden times when wishing still helped one, there lived a king whose daughters were all beautiful; and the youngest was so beautiful that the sun itself, which has seen so much, was astonished whenever it shone in her face. Close by the kings castle lay a great dark forest, and under an old lime-tree in the forest was a well, and when the day was very warm, the kings child went out to the forest and sat down by the fountain; and when she was bored she took a golden ball, and threw it up on high and caught it; and this ball was her favorite plaything.');
        p1.appendChild(sp1);
        p1.appendChild(sp2);
        p1.appendChild(sp3);

        var p2 = new GXText.Paragraph();
        //p2.setProperties(['cc', 'cg', 'lh', 'al'], [1, 40, 1.3, GXText.Paragraph.Alignment.Justify]);
        p2.appendChild(new GXText.Span(' Works :) --> In olden times when wishing still helped one, there lived a king whose daughters were all beautiful; and the youngest was so beautiful that the sun itself, which has seen so much, was astonished whenever it shone in her face. Close by the kings castle lay a great dark forest, and under an old lime-tree in the forest was a well, and when the day was very warm, the kings child went out to the forest and sat down by the fountain; and when she was bored she took a golden ball, and threw it up on high and caught it; and this ball was her favorite plaything.'));

        text.getContent().setProperties(['lh'], [2]);
        text.getContent().appendChild(p1);
        text.getContent().appendChild(p2);

        text.setProperties(['fw', 'trf'], [true, new GTransform(500, 0, 0, 1, 0, 0)]);

        page.appendChild(text);
    }

    gDevelopment.tests.push({
        title: 'Create Shapes with Attributes',
        category: 'Shape',
        test: test
    });

})();