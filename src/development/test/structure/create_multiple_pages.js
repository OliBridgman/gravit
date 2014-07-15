(function () {
    function test(scene, page, view) {
        scene.removeChild(page);

        for (var i = 0; i < 10; ++i) {
            var insertPos = scene.getPageInsertPosition();
            var insertSize = new GPoint(800, 600);

            var page = new IFPage();

            page.setProperties([
                'name',
                'x',
                'y',
                'w',
                'h'
            ], [
                'Page-' + i,
                insertPos.getX(),
                insertPos.getY(),
                insertSize.getX(),
                insertSize.getY()
            ]);

            var text = new IFText();
            text.fromHtml('<p style="font-size:72px">Page Number ' + i + '</p>');

            var style = new IFInlineStyle();
            text.getStyleSet().appendChild(style);
            style.appendChild(new IFFillPaint());

            var textPaintBBox = text.getPaintBBox();
            text.setProperties(['trf'], [new GTransform(1, 0, 0, 1,
                insertPos.getX() + (insertSize.getX() - textPaintBBox.getWidth()) / 2,
                insertPos.getY() + (insertSize.getY() - textPaintBBox.getHeight()) / 2)]);
            page.appendChild(text);

            scene.appendChild(page);

            if (i === 0) {
                page.setFlag(IFNode.Flag.Active);
            }
        }
    }

    gDevelopment.tests.push({
        title: 'Create Multiple Pages',
        category: 'Structure',
        test: test
    });
})();
