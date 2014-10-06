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

            rectangle.setProperties(['_bpt', '_fpt', '_bop', '_bw', '_sfop'], [new IFBackground(), new IFLinearGradient([{position:0,color:IFRGBColor.BLACK}, {position: 100, color: IFRGBColor.WHITE}], IFMath.toRadians(90)), 1, 10, 1]);

            /*
            var blur = new IFBlurEffect();
            blur.setProperties(['vs', 'ly'], [true, IFStylable.Layer.Foreground]);
            //rectangle.getEffects().appendChild(blur);

            var sh = new IFDropShadowEffect();
            sh.setProperties(['x', 'y', 'ly'], [0, 0, IFStylable.Layer.Foreground]);
            //rectangle.getEffects().appendChild(sh);

            var overlay = new IFOverlayEffect();
            overlay.setProperties(['opc', 'pat'], [0.5, IFRGBColor.parseCSSColor('blue')]);

            //rectangle.getEffects().appendChild(overlay);

            var fi = new IFInnerShadowEffect();
            //fi.setProperty('ly', IFStylable.Layer.Background);
            //rectangle.getEffects().appendChild(fi);
*/
            /*
            $.ajax({
                url: 'acv/1977.acv',
                async: false,
                dataType: 'arraybuffer',
                success: function(data) {
                    var fl = new IFColorGradingEffect();
                    fl.setProperty('cp', IFColorGradingFilter.parseACV(data));
                    rectangle.getEffects().appendChild(fl);
                }
            });
            */
/*
            var clMtx = new IFColorMatrixEffect();
            clMtx.setProperty('cm', IFColorMatrixFilter.COLOR_MATRIX_INVERT);
            //rectangle.getEffects().appendChild(clMtx);

            var bl = new IFBlurEffect();
            bl.setProperty('r', 7);
            bl.setProperty('ly', IFStylable.Layer.Foreground);
            rectangle.getEffects().appendChild(bl);
*/

            layer.appendChild(rectangle);
        }
    });
})();
