(function () {
    function getRandom(min, max) {
        return Math.random() * (max - min + 1) + min;
    }

    function getRandomInt(min, max) {
        return Math.floor(getRandom(min, max));
    }

    var anchorCTypes = [
        IFPathBase.CornerType.Rounded,
        IFPathBase.CornerType.InverseRounded,
        IFPathBase.CornerType.Bevel,
        IFPathBase.CornerType.Inset,
        IFPathBase.CornerType.Fancy
    ];

    function test(scene, page, layer, view) {
        var rectSize = 40;
        var spaceX = 15, spaceY = 15;
        var x = spaceX, y = spaceY;

        while (y < page.getProperty('h')) {
            if (x + rectSize + spaceX > page.getProperty('w')) {
                y += rectSize + spaceY;
                x = spaceX;
            }

            var cornerRadius = getRandomInt(0, rectSize / 3);

            var rect = new IFRectangle();
            rect.setProperties(['tl_ct', 'tl_sx', 'trf'],
                [anchorCTypes[getRandomInt(0, anchorCTypes.length-1)], cornerRadius, new IFTransform(rectSize, 0.0, 0.0, rectSize, x, y)]);

            rect.transform(new IFTransform(1.0, 0.0, 0.0, 1.0, -(x + rectSize/2), -(y + rectSize/2))
                .rotated(ifMath.toRadians(getRandomInt(0, 360)))
                .translated(+(x + rectSize/2), + (y + rectSize/2)));

            var editor = IFEditor.getEditor(scene);

            rect.getStyleSet().appendChild(new IFStrokePaint());

            page.appendChild(rect);

            x += rectSize + spaceX;
        }
    }

    gDevelopment.tests.push({
        title: 'Create Rectangles',
        category: 'Shape',
        test: test
    });

})();