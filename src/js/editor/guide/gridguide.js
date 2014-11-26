(function (_) {
    /**
     * The grid guide
     * @param {GGuides} guides
     * @class GGridGuide
     * @extends GGuide
     * @mixes GGuide.Visual
     * @mixes GGuide.Map
     * @constructor
     */
    function GGridGuide(guides) {
        GGuide.call(this, guides);
    }

    GObject.inheritAndMix(GGridGuide, GGuide, [GGuide.Visual, GGuide.Map, GGuide.DetailMap]);

    GGridGuide.MIN_CELL_SPACE = 10;

    /** @override */
    GGridGuide.prototype.paint = function (transform, context) {
        if (this._scene.getProperty('gridActive') && context.configuration.gridVisible) {
            // Calculate optical cell-size
            var scale  = transform.getScaleFactor();
            var szWScene = this._scene.getProperty('gridSizeX');
            var szHScene = this._scene.getProperty('gridSizeY');
            var szW = szWScene * scale;
            var szH = szHScene * scale;

            // Limit mininum. grid size to be optically comfortable.
            if (szW < GGridGuide.MIN_CELL_SPACE) {
                szW *= 1. + Math.floor(GGridGuide.MIN_CELL_SPACE / szW);
            }
            if (szH < GGridGuide.MIN_CELL_SPACE){
                szH *= 1. + Math.floor(GGridGuide.MIN_CELL_SPACE / szH);
            }

            szWScene = szW / scale;
            szHScene = szH / scale;

            var rects = context.dirtyMatcher.getDirtyRectangles();
            for (var i = 0; i < rects.length; ++i) {
                var rect = rects[i];
                var tl = new GPoint(rect.getX(), rect.getY());
                var tlScene = transform.inverted().mapPoint(tl);
                var startXScene = Math.ceil(tlScene.getX() / szWScene) * szWScene;
                var startYScene = Math.ceil(tlScene.getY() / szHScene) * szHScene;
                var tlGridScene = new GPoint(startXScene, startYScene);
                var tlGrid = transform.mapPoint(tlGridScene);
                for (var x = tlGrid.getX(); x - rect.getX() < rect.getWidth(); x += szW) {
                    context.canvas.fillRect(Math.round(x), rect.getY(), 1, rect.getHeight(), GRGBColor.BLACK, 0.125);
                }
                for (var y = tlGrid.getY(); y - rect.getY() < rect.getHeight(); y += szH) {
                    context.canvas.fillRect(rect.getX(), Math.round(y), rect.getWidth(), 1, GRGBColor.BLACK, 0.125);
                }
            }
        }
    };

    /** @override */
    GGridGuide.prototype.map = function (x, y) {
        var result = null;

        if (this._scene.getProperty('gridActive')) {
            var gsx = this._scene.getProperty('gridSizeX');
            var gsy = this._scene.getProperty('gridSizeY');
            var valueX = Math.round(x / gsx) * gsx;
            var valueY = Math.round(y / gsy) * gsy;
            result = {
                x: {value: valueX, guide: null, delta: Math.abs(x - valueX)},
                y: {value: valueY, guide: null, delta: Math.abs(y - valueY)}};
        }

        return result;
    };

    /** @override */
    GGridGuide.prototype.isMappingAllowed = function (detail) {
        return GGuide.Map.prototype.isMappingAllowed.call(this, detail) && !ifPlatform.modifiers.metaKey;
    };

    /** @override */
    GGridGuide.prototype.toString = function () {
        return "[Object GGridGuide]";
    };

    _.GGridGuide = GGridGuide;
})(this);