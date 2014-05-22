(function() {
    function test(scene, page, view) {
        var anchorCTypes = [
            IFPathBase.AnchorPoint.Type.Asymmetric,
            IFPathBase.AnchorPoint.Type.Connector,
            IFPathBase.AnchorPoint.Type.Symmetric,
            IFPathBase.AnchorPoint.Type.Mirror,
            IFPathBase.CornerType.Rounded,
            IFPathBase.CornerType.InverseRounded,
            IFPathBase.CornerType.Bevel,
            IFPathBase.CornerType.Inset,
            IFPathBase.CornerType.Fancy
        ];
        var boxWidth = 70, boxHeight = 80, brim = 20;
        var pathWidth = 50, pathHeight = 60, pathRadiusX = 10, pathRadiusY = 10;
        var x = 10, y = 20;

        for (var rotate = 0; rotate < 360.0; rotate += 45) {
            for (var i = 0; i < anchorCTypes.length; ++i) {
                if (x + boxWidth + 5 >= page.getProperty('w') - page.getProperty('mr')) {
                    y += boxHeight;
                    x = 10;
                }

                var anchorCType = anchorCTypes[i];

                var path = new IFPath();

                var ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'hrx', 'hry', 'tp', 'cl', 'cr'],
                    [brim, brim, brim + pathWidth / 2, 0, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'hlx', 'hly', 'hrx', 'hry', 'tp', 'cl', 'cr'],
                    [brim + pathWidth, brim, brim + pathWidth / 3 * 2, brim + 10,
                        brim + pathWidth, boxHeight / 2, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'],
                    [pathWidth, pathHeight, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'],
                    [brim / 2, pathHeight, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                path.setProperty('closed', true);

               var transform = new GTransform(1.0, 0.0, 0.0, 1.0, -boxWidth / 2, -boxHeight / 2);
                transform = transform.rotated(gMath.toRadians(rotate));
                transform = transform.translated(
                    page.getProperty('ml') + x + boxWidth / 2,
                    page.getProperty('mt') + y + boxHeight / 2);
                path.transform(transform);

                var editor = IFEditor.getEditor(scene);
                path.getAttributes().appendChild(new IFStrokeAttribute());
                page.appendChild(path);

                x += boxWidth + 5;
            }
        }
    }

    gDevelopment.tests.push({
        title: 'Create Curved Pathes',
        category: 'Path',
        test: test
    });

})();