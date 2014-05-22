(function() {
    function test(scene, page, view) {
        var anchorCTypes = [
            IFPathBase.AnchorPoint.Type.Asymmetric,
            IFPathBase.AnchorPoint.Type.Connector,
            IFPathBase.AnchorPoint.Type.Symmetric,
            IFPathBase.AnchorPoint.Type.Mirror,
            IFPathBase.CornerType.Inset
        ];
        var boxWidth = 70, boxHeight = 80, brim = 20;
        var pathWidth = 50, pathHeight = 60, pathRadiusX = 10, pathRadiusY = 10;
        var x = 10, y = 10;

        for (var rotate = 0; rotate < 360.0; rotate += 60) {
            for (var i = 0; i < anchorCTypes.length; ++i) {
                if (x + boxWidth + 20 >= page.getProperty('w') - page.getProperty('mr')) {
                    y += boxHeight * 2 + 20;
                    x = boxHeight - 40;
                }

                var anchorCType = anchorCTypes[i];

                var path = new IFPath();

                path.setProperty('closed', true);

                var ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'hrx', 'hry', 'tp', 'cl', 'cr', 'ah'],
                    [brim, brim, brim + pathWidth / 2, 0, anchorCType, pathRadiusX, pathRadiusY, true]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'hlx', 'hly', 'hrx', 'hry', 'tp', 'cl', 'cr', 'ah'],
                    [brim + pathWidth, brim, brim + pathWidth / 3 * 2, brim + 10,
                        brim + pathWidth, boxHeight / 2, anchorCType, pathRadiusX, pathRadiusY, true]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr', 'ah'],
                    [pathWidth, pathHeight, anchorCType, pathRadiusX, pathRadiusY, true]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr', 'ah'],
                    [brim / 2, pathHeight, anchorCType, pathRadiusX, pathRadiusY, true]);
                path.getAnchorPoints().appendChild(ap);

                var transform = new GTransform(0.3, 1.0, 0.0, 1.5, -boxWidth / 2, -boxHeight);
                transform = transform.rotated(gMath.toRadians(rotate));
                transform = transform.translated(
                    page.getProperty('ml') + x + boxWidth / 2,
                    page.getProperty('mt') + y + boxHeight);
                path.transform(transform);

                var editor = IFEditor.getEditor(scene);
                path.getAttributes().appendChild(new IFStrokeAttribute());
                page.appendChild(path);

                x += boxWidth + 20;
            }
        }
    }

    gDevelopment.tests.push({
        title: 'Create Auto Pathes',
        category: 'Path',
        test: test
    });

})();