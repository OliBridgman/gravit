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

    GXGridLayer.MIN_CELL_SPACE = 5;

    /** @override */
    GXGridLayer.prototype.paint = function (context) {
        var scene = this._view.getScene();
        if (scene.getProperty('gridActive')) {
            var cl = GXColor.parseCSSColor('rgba(255, 0, 0, 0.25)');

            // Calculate optical cell-size
            var scale  = this._view.getZoom();
            var szOptW = Math.ceil(scene.getProperty('gridSizeX') * scale);
            var szOptH = Math.ceil(scene.getProperty('gridSizeY') * scale);

            // Limit mininum. grid size to be optically comfortable.
            if (szOptW < GXGridLayer.MIN_CELL_SPACE) {
                szOptW *= 1. + Math.floor(GXGridLayer.MIN_CELL_SPACE / szOptW);
            }
            if (szOptH < GXGridLayer.MIN_CELL_SPACE){
                szOptH *= 1. + Math.floor(GXGridLayer.MIN_CELL_SPACE / szOptH);
            }

            var szOptWScene = szOptW / scale;
            var szOptHScene = szOptH / scale;
            var vbox = this._view.getViewBox(true);
            var tl = new GPoint(vbox.getX(), vbox.getY());
            var tlScene = this._view.getViewTransform().mapPoint(tl);
            var startXScene = Math.ceil(tlScene.getX() / szOptWScene) * szOptWScene;
            var startYScene = Math.ceil(tlScene.getY() / szOptHScene) * szOptHScene;
            var tlGridScene = new GPoint(startXScene, startYScene);
            var tlGrid = this._view.getWorldTransform().mapPoint(tlGridScene);
            var startX = Math.round(tlGrid.getX());
            var startY = Math.round(tlGrid.getY());
            // Now startX, startY, szOptW and szOptH are integer, and we can paint
            for (var x = startX; x - vbox.getX() < vbox.getWidth(); x += szOptW) {
                context.canvas.fillRect(x, vbox.getY(), 1, vbox.getHeight(), cl);
            }
            for (var y = startY; y - vbox.getY() < vbox.getHeight(); y += szOptH) {
                context.canvas.fillRect(vbox.getX(), y, vbox.getWidth(), 1, cl);
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