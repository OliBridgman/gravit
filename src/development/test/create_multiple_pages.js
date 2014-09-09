(function () {
    gDevelopment.tests.push({
        title: 'Create Multiple Pages',
        test: function () {
            gApp.executeAction(GNewAction.ID);
            var document = gApp.getActiveDocument();
            var scene = document.getScene();
            scene.removeChild(scene.getActivePage());

            var masterPage = new IFPage();
            var insertPos = scene.getPageInsertPosition();
            var insertSize = new IFPoint(800, 600);

            masterPage.setProperties([
                'name',
                'x',
                'y',
                'w',
                'h'
            ], [
                'Master-Page',
                insertPos.getX() + 100,
                insertPos.getY() + 100,
                insertSize.getX(),
                insertSize.getY()
            ]);

            var layer = new IFLayer();
            layer.setFlag(IFNode.Flag.Active);
            masterPage.appendChild(layer);

            var rectangle = new IFRectangle();
            rectangle.setProperty('trf', new IFTransform(insertSize.getX() / 2, 0, 0, 50, 100 + insertSize.getX() / 2, 100 + 50));
            layer.appendChild(rectangle);


            var slice = new IFSlice();
            slice.setProperty('trf', new IFTransform(50, 0, 0, 50, 100 + 50 / 2, 100 + 50));
            layer.appendChild(slice);

            scene.appendChild(masterPage);

            for (var i = 0; i < 10; ++i) {
                var page = new IFPage();
                insertPos = scene.getPageInsertPosition();

                page.setProperties([
                    'name',
                    'x',
                    'y',
                    'w',
                    'h',
                    'msref'
                ], [
                    'Page-' + i,
                    insertPos.getX(),
                    insertPos.getY(),
                    insertSize.getX(),
                    insertSize.getY(),
                    masterPage.getReferenceId()
                ]);

                var text = new IFText();
                text.fromHtml('<p style="font-size:72px">Page Number ' + i + '</p>');

                var textPaintBBox = text.getPaintBBox();
                text.setProperties(['trf'], [new IFTransform(1, 0, 0, 1,
                    insertPos.getX() + (insertSize.getX() - textPaintBBox.getWidth()) / 2,
                    insertPos.getY() + (insertSize.getY() - textPaintBBox.getHeight()) / 2)]);

                var layer = new IFLayer();
                layer.setFlag(IFNode.Flag.Active);
                layer.appendChild(text);

                page.appendChild(layer);

                scene.appendChild(page);

                if (i === 0) {
                    page.setFlag(IFNode.Flag.Active);
                }
            }
        }
    });
})();
