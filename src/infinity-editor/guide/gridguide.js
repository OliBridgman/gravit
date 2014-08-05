(function (_) {
    /**
     * The grid guide
     * @param {IFGuides} guides
     * @class IFGridGuide
     * @extends IFGuide
     * @mixes IFGuide.Visual
     * @mixes IFGuide.Map
     * @constructor
     */
    function IFGridGuide(guides) {
        IFGuide.call(this, guides);
    }

    IFObject.inheritAndMix(IFGridGuide, IFGuide, [IFGuide.Visual, IFGuide.Map]);

    IFGridGuide.MIN_CELL_SPACE = 10;

    /** @override */
    IFGridGuide.prototype.paint = function (transform, context) {
        if (this._scene.getProperty('gridActive') && context.configuration.gridVisible) {
            var cl = IFColor.parseCSSColor('rgba(0, 0, 0, 0.125)');

            // Calculate optical cell-size
            var scale  = transform.getScaleFactor();
            var szWScene = this._scene.getProperty('gridSizeX');
            var szHScene = this._scene.getProperty('gridSizeY');
            var szW = szWScene * scale;
            var szH = szHScene * scale;

            // Limit mininum. grid size to be optically comfortable.
            if (szW < IFGridGuide.MIN_CELL_SPACE) {
                szW *= 1. + Math.floor(IFGridGuide.MIN_CELL_SPACE / szW);
            }
            if (szH < IFGridGuide.MIN_CELL_SPACE){
                szH *= 1. + Math.floor(IFGridGuide.MIN_CELL_SPACE / szH);
            }

            szWScene = szW / scale;
            szHScene = szH / scale;

            var rects = context.dirtyMatcher.getDirtyRectangles();
            for (var i = 0; i < rects.length; ++i) {
                var rect = rects[i];
                var tl = new IFPoint(rect.getX(), rect.getY());
                var tlScene = transform.inverted().mapPoint(tl);
                var startXScene = Math.ceil(tlScene.getX() / szWScene) * szWScene;
                var startYScene = Math.ceil(tlScene.getY() / szHScene) * szHScene;
                var tlGridScene = new IFPoint(startXScene, startYScene);
                var tlGrid = transform.mapPoint(tlGridScene);
                for (var x = tlGrid.getX(); x - rect.getX() < rect.getWidth(); x += szW) {
                    context.canvas.fillRect(Math.round(x), rect.getY(), 1, rect.getHeight(), cl);
                }
                for (var y = tlGrid.getY(); y - rect.getY() < rect.getHeight(); y += szH) {
                    context.canvas.fillRect(rect.getX(), Math.round(y), rect.getWidth(), 1, cl);
                }
            }
        }
    };

    /** @override */
    IFGridGuide.prototype.map = function (x, y) {
        var result = null;

        if (this._scene.getProperty('gridActive')) {
            var gsx = this._scene.getProperty('gridSizeX');
            var gsy = this._scene.getProperty('gridSizeY');
            result = {
                x: {value: Math.round(x / gsx) * gsx, guide: null},
                y: {value: Math.round(y / gsy) * gsy, guide: null}};
        }

        return result;
    };

    /** @override */
    IFGridGuide.prototype.toString = function () {
        return "[Object IFGridGuide]";
    };

    _.IFGridGuide = IFGridGuide;
})(this);