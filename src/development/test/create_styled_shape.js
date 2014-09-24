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

            rectangle.setProperties(['_bpt', '_fpt', '_bw', '_sfop'], [IFColor.BLACK, IFColor.BLACK, 10, 0]);

            var blur = new IFBlurEffect();
            blur.setProperties(['vs', 'ly'], [true, IFStylable.Layer.Foreground]);
            //rectangle.getEffects().appendChild(blur);

            var sh = new IFDropShadowEffect();
            sh.setProperties(['x', 'y', 'ly'], [0, 0, IFStylable.Layer.Foreground]);
            //rectangle.getEffects().appendChild(sh);

            var overlay = new IFOverlayEffect();
            overlay.setProperties(['opc', 'pat'], [0.5, IFColor.parseCSSColor('blue')]);

            //rectangle.getEffects().appendChild(overlay);

            var fi = new IFInnerShadowEffect();
            //fi.setProperty('ly', IFStylable.Layer.Background);
            rectangle.getEffects().appendChild(fi);


            layer.appendChild(rectangle);
        }
    });
})();
