(function () {
    function getRandom(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(getRandom(min, max));
    }

    function test(scene, page, view) {
        var polySize = 300;
        var spaceX = 5, spaceY = 5;
        var x = spaceX, y = spaceY;

        while (y + polySize + spaceY < page.getProperty('h')) {
            var segments = getRandomInt(3, 7);
            var innerRadius = getRandomInt(polySize / 10, polySize / 2);
            var outerRadius = getRandomInt(polySize / 10, polySize / 2);
            var startAngle = getRandom(0, Math.PI * 2);
            var endAngle = startAngle + getRandom(startAngle, Math.PI * 2 + startAngle);
            var innerRoundness = getRandomInt(0, polySize / 3);
            var outerRoundness = getRandomInt(0, polySize / 3);
            var cx = x + polySize / 2;
            var cy = y + polySize / 2;

            var polygon = new IFPolygon();
            polygon.setProperties(['pts', 'cx', 'cy', 'ir', 'or', 'ia', 'oa', 'icr', 'ocr'],
                [segments, cx, cy, innerRadius, outerRadius, startAngle, endAngle, innerRoundness, outerRoundness]);

            var editor = IFEditor.getEditor(scene);
            polygon.getStyleSet().appendChild(new IFStrokePaint());
            page.appendChild(polygon);

            var bbox = null;

            polygon.iterateSegments(function (point, inside, angle) {
                var newBBox = new IFRect(point.getX(), point.getY(), 1, 1);
                if (bbox) {
                    bbox = bbox.united(newBBox);
                } else {
                    bbox = newBBox;
                }
            }, true);

            var tl = bbox.getSide(IFRect.Side.TOP_LEFT);
            var width = bbox.getWidth();
            var height = bbox.getHeight();
            var num = width * height / 100 + 100;

            for (var j=0; j < num; ++j) {
                var xPt = Math.random() * width + cx - width/2;
                var yPt = Math.random() * height + cy - height/2;
                var hitTestRes = new IFVertexInfo.HitResult();
                var res = ifVertexInfo.hitTest(xPt, yPt, polygon, 2, true, hitTestRes);
                if (res && !hitTestRes.outline) {
                    var path = new IFPath();
                    var ap1 = new IFPathBase.AnchorPoint();
                    ap1.setProperties(['x', 'y'], [xPt, yPt]);
                    var ap2 = new IFPathBase.AnchorPoint();
                    ap2.setProperties(['x', 'y'], [xPt, yPt + 1]);
                    path.getAnchorPoints().appendChild(ap1);
                    path.getAnchorPoints().appendChild(ap2);
                    path.getStyleSet().appendChild(new IFStrokePaint());
                    page.appendChild(path);
                }
            }

            x += polySize + spaceX;
            if (x + polySize + spaceX > page.getProperty('w')) {
                y += polySize + spaceY;
                x = spaceX;
            }
        }
    }

    gDevelopment.tests.push({
        title: 'Path Inside Test 2',
        category: 'Path',
        test: test
    });

})();