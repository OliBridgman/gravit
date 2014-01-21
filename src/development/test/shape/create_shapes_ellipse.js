(function () {
    function getRandom(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(getRandom(min, max));
    }

    var ellipseType = [
        GXEllipse.Type.Pie,
        GXEllipse.Type.Chord,
        GXEllipse.Type.Arc
    ];

    function test(scene, page, layer, view) {
        var size = 40;
        var spaceX = 15, spaceY = 15;
        var x = spaceX, y = spaceY;

        while (y < page.getProperty('h')) {
            if (x + size + spaceX > page.getProperty('w')) {
                y += size + spaceY;
                x = spaceX;
            }

            var width = getRandomInt(size / 3, size);
            var height = getRandomInt(size / 3, size);

            var ellipse = new GXEllipse();
            ellipse.setProperties(['sa', 'ea', 'tp', 'transform'],
                [gMath.toRadians(getRandomInt(0, 360)), gMath.toRadians(getRandomInt(0, 360)), ellipseType[getRandomInt(0, ellipseType.length-1)], new GTransform(width, 0.0, 0.0, height, x, y)]);

            ellipse.transform(new GTransform(1.0, 0.0, 0.0, 1.0, -(x + width/2), -(y + height/2))
                .rotated(gMath.toRadians(getRandomInt(0, 360)))
                .translated(+(x + width/2), + (y + height/2)));

            layer.appendChild(ellipse);

            x += width + spaceX;
        }
    }

    gDevelopment.tests.push({
        title: 'Create Ellipses',
        category: 'Shape',
        test: test
    });

})();