(function (_) {
    /**
     * A layer for rendering a grid if any
     * @param {IFView} view
     * @class IFGridLayer
     * @extends IFViewLayer
     * @constructor
     */
    function IFGridLayer(view) {
        IFViewLayer.call(this, view);
        view.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
    }
    IFObject.inherit(IFGridLayer, IFViewLayer);

    IFGridLayer.MIN_CELL_SPACE = 10;

    /** @override */
    IFGridLayer.prototype.paint = function (context) {
        this._view.getEditor().getGuides().paint(this._view.getWorldTransform(), context);

        var scene = this._view.getScene();
        if (scene.getProperty('gridActive')) {
            var cl = IFColor.parseCSSColor('rgba(0, 0, 0, 0.125)');

            // Calculate optical cell-size
            var scale  = this._view.getZoom();
            var szWScene = scene.getProperty('gridSizeX');
            var szHScene = scene.getProperty('gridSizeY');
            var szW = szWScene * scale;
            var szH = szHScene * scale;

            // Limit mininum. grid size to be optically comfortable.
            if (szW < IFGridLayer.MIN_CELL_SPACE) {
                szW *= 1. + Math.floor(IFGridLayer.MIN_CELL_SPACE / szW);
            }
            if (szH < IFGridLayer.MIN_CELL_SPACE){
                szH *= 1. + Math.floor(IFGridLayer.MIN_CELL_SPACE / szH);
            }

            szWScene = szW / scale;
            szHScene = szH / scale;
            var vbox = this._view.getViewBox(true);
            var tl = new IFPoint(vbox.getX(), vbox.getY());
            var tlScene = this._view.getViewTransform().mapPoint(tl);
            var startXScene = Math.ceil(tlScene.getX() / szWScene) * szWScene;
            var startYScene = Math.ceil(tlScene.getY() / szHScene) * szHScene;
            var tlGridScene = new IFPoint(startXScene, startYScene);
            var tlGrid = this._view.getWorldTransform().mapPoint(tlGridScene);
            for (var x = tlGrid.getX(); x - vbox.getX() < vbox.getWidth(); x += szW) {
                context.canvas.fillRect(Math.round(x), vbox.getY(), 1, vbox.getHeight(), cl);
            }
            for (var y = tlGrid.getY(); y - vbox.getY() < vbox.getHeight(); y += szH) {
                context.canvas.fillRect(vbox.getX(), Math.round(y), vbox.getWidth(), 1, cl);
            }
        }
    };

    IFGridLayer.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
        }
    };

    /** @override */
    IFGridLayer.prototype.toString = function () {
        return "[Object IFGridLayer]";
    };

    _.IFGridLayer = IFGridLayer;
})(this);