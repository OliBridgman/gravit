(function () {
    function getRandom(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(getRandom(min, max));
    }

    function test(scene, page, view) {
        var polySize = 100;
        var spaceX = 5, spaceY = 5;
        var x = spaceX, y = spaceY;

        while (y < page.getProperty('h')) {
            if (x + polySize + spaceX > page.getProperty('w')) {
                y += polySize + spaceY;
                x = spaceX;
            }

            var segments = getRandomInt(3, 9);
            var innerRadius = getRandomInt(polySize / 10, polySize / 2);
            var outerRadius = getRandomInt(polySize / 10, polySize / 2);
            var startAngle = getRandom(0, Math.PI * 2);
            var endAngle = startAngle + getRandom(startAngle, Math.PI * 2 + startAngle);
            var innerRoundness = getRandomInt(0, polySize / 3);
            var outerRoundness = getRandomInt(0, polySize / 3);

            var polygon = new GXPolygon();
            polygon.setProperties(['pts', 'cx', 'cy', 'ir', 'or', 'ia', 'oa', 'icr', 'ocr'],
                [segments, x + polySize / 2, y + polySize / 2, innerRadius, outerRadius, startAngle, endAngle, innerRoundness, outerRoundness])

            var editor = GXEditor.getEditor(scene);
            editor.insertElements([polygon]);

            x += polySize + spaceX;
        }
    }

    gDevelopment.tests.push({
        title: 'Create Polygons',
        category: 'Shape',
        test: test
    });

})();