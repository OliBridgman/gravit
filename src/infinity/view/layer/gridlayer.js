(function (_) {
    /**
     * A layer for rendering a grid if any
     * @param {GXView} view
     * @class GXGridLayer
     * @extends GXViewLayer
     * @constructor
     */
    function GXGridLayer(view) {
        GXViewLayer.call(this, view);
        view.getScene().addEventListener(GXNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
    }
    GObject.inherit(GXGridLayer, GXViewLayer);

    GXGridLayer.MIN_CELL_SPACE = 10;

    /** @override */
    GXGridLayer.prototype.paint = function (context) {
        var scene = this._view.getScene();
        if (scene.getProperty('gridActive')) {
            var cl = GXColor.parseCSSColor('rgba(0, 0, 0, 0.125)');

            // Calculate optical cell-size
            var scale  = this._view.getZoom();
            var szWScene = scene.getProperty('gridSizeX');
            var szHScene = scene.getProperty('gridSizeY');
            var szW = szWScene * scale;
            var szH = szHScene * scale;

            // Limit mininum. grid size to be optically comfortable.
            if (szW < GXGridLayer.MIN_CELL_SPACE) {
                szW *= 1. + Math.floor(GXGridLayer.MIN_CELL_SPACE / szW);
            }
            if (szH < GXGridLayer.MIN_CELL_SPACE){
                szH *= 1. + Math.floor(GXGridLayer.MIN_CELL_SPACE / szH);
            }

            szWScene = szW / scale;
            szHScene = szH / scale;
            var vbox = this._view.getViewBox(true);
            var tl = new GPoint(vbox.getX(), vbox.getY());
            var tlScene = this._view.getViewTransform().mapPoint(tl);
            var startXScene = Math.ceil(tlScene.getX() / szWScene) * szWScene;
            var startYScene = Math.ceil(tlScene.getY() / szHScene) * szHScene;
            var tlGridScene = new GPoint(startXScene, startYScene);
            var tlGrid = this._view.getWorldTransform().mapPoint(tlGridScene);
            for (var x = tlGrid.getX(); x - vbox.getX() < vbox.getWidth(); x += szW) {
                context.canvas.fillRect(Math.round(x), vbox.getY(), 1, vbox.getHeight(), cl);
            }
            for (var y = tlGrid.getY(); y - vbox.getY() < vbox.getHeight(); y += szH) {
                context.canvas.fillRect(vbox.getX(), Math.round(y), vbox.getWidth(), 1, cl);
            }
        }
    };

    GXGridLayer.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
        }
    };

    /** @override */
    GXGridLayer.prototype.toString = function () {
        return "[Object GXGridLayer]";
    };

    _.GXGridLayer = GXGridLayer;
})(this);