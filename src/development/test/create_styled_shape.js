(function () {
    gDevelopment.tests.push({
        title: 'Create Styled Shape',
        test: function test() {
            gApp.executeAction(GNewAction.ID);
            var document = gApp.getActiveDocument();
            var scene = document.getScene();
            var page = scene.getActivePage();
            var layer = scene.getActiveLayer();

            var x = 20;
            var y = 20;
            var w = page.getProperty('w') - x * 2;
            var h = page.getProperty('h') - y * 2;

            var rectangle = new IFRectangle();
            rectangle.setProperty('trf', new IFTransform(w / 2, 0, 0, h / 2, x + w / 2, y + h / 2));

            rectangle.setProperty('_bpt', IFColor.BLACK);
            rectangle.setProperty('_bw', 10);

            layer.appendChild(rectangle);
        }
    });
})();
