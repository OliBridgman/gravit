(function() {
    function test(scene, page, view) {
        var anchorCTypes = [
            IFPathBase.CornerType.Rounded,
            IFPathBase.CornerType.InverseRounded,
            IFPathBase.CornerType.Bevel,
            IFPathBase.CornerType.Inset,
            IFPathBase.CornerType.Fancy
        ];
        var pathWidth = 50, pathHeight = 60, pathRadiusX = 10, pathRadiusY = 10;
        var x = 20, y = 20;

        for (var rotate = 0; rotate < 360.0; rotate += 45) {
            for (var i = 0; i < anchorCTypes.length; ++i) {
                if (x + pathWidth + 20 >= page.getProperty('w') - page.getProperty('mr')) {
                    y += pathHeight + 20;
                    x = 20;
                }

                var anchorCType = anchorCTypes[i];

                var path = new IFPath();
                var ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'], [0, 0, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'], [pathWidth, 0, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'], [pathWidth, pathHeight, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                ap = new IFPathBase.AnchorPoint();
                ap.setProperties(['x', 'y', 'tp', 'cl', 'cr'], [0, pathHeight, anchorCType, pathRadiusX, pathRadiusY]);
                path.getAnchorPoints().appendChild(ap);

                path.setProperty('closed', true);

                var transform = new GTransform(1.0, 0.0, 0.0, 1.0, -pathWidth / 2, -pathHeight / 2);
                transform = transform.rotated(ifMath.toRadians(rotate));
                transform = transform.translated(
                    page.getProperty('ml') + x + pathWidth / 2,
                    page.getProperty('mt')+ y + pathHeight / 2);
                path.transform(transform);

                var editor = IFEditor.getEditor(scene);
                path.getStyleSet().appendChild(new IFStrokePaint());
                page.appendChild(path);

                x += pathWidth + 20;
            }
        }
    }

    gDevelopment.tests.push({
        title: 'Create Edged Pathes',
        category: 'Path',
        test: test
    });

})();