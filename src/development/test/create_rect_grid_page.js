(function () {
    gDevelopment.tests.push({
        title: 'Create Rectangular Grid on Page',
        test: function test() {
            var RECT_SIZE = 50;
            var RECT_SPACE = 10;

            gApp.executeAction(GNewAction.ID);
            var document = gApp.getActiveDocument();
            var scene = document.getScene();
            var page = scene.getActivePage();
            var layer = scene.getActiveLayer();

            var start = new Date().getTime();

            var numberOfRects = 0;
            for (var x = 0; x + RECT_SIZE < page.getProperty('w'); x += RECT_SIZE + RECT_SPACE) {
                for (var y = 0; y + RECT_SIZE < page.getProperty('h'); y += RECT_SIZE + RECT_SPACE) {
                    var rectangle = new IFRectangle();
                    rectangle.setProperty('trf', new IFTransform(RECT_SIZE / 2, 0, 0, RECT_SIZE / 2, x + RECT_SIZE / 2, y + RECT_SIZE / 2));

                    layer.appendChild(rectangle);

                    numberOfRects++;
                }
            }

            var end = new Date().getTime() - start;
            alert('Created ' + numberOfRects.toString() + ' Rectangles in ' + (end > 1000 ? ((end / 1000).toString() + 'sec') : (end.toString() + 'ms')));
        }
    });
})();
