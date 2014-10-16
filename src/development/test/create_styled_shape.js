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
            var w = 500;// page.getProperty('w') - x * 2;
            var h = 500;//page.getProperty('h') - y * 2;

            var rectangle = new IFRectangle();
            rectangle.setProperty('trf', new IFTransform(w / 2, 0, 0, h / 2, x + w / 2, y + h / 2));

            var fillPatternTr = new IFTransform()
                .translated(0.25, 0);

            rectangle.setProperties(['_bpt', '_fpt', '_fpx', '_bop', '_bw', '_sfop'], [new IFBackground(), new IFRadialGradient(null, 1, IFMath.toRadians(45)), fillPatternTr, 1, 10, 1]);

            layer.appendChild(rectangle);
        }
    });
})();
