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

    /** @override */
    GXGridLayer.prototype.paint = function (context) {
        var scene = this._view.getScene();
        if (scene.getProperty('gridActive')) {
            var cl = GXColor.parseCSSColor('rgba(255, 0, 0, 0.25)');
            var szx = Math.ceil(scene.getProperty('gridSizeX') * this._view.getZoom());
            var szy = Math.ceil(scene.getProperty('gridSizeY') * this._view.getZoom());
            var vbox = this._view.getViewBox(true);
            for (var x = vbox.getX(); x - vbox.getX() < vbox.getWidth(); x += szx) {
                context.canvas.fillRect(x, vbox.getY(), 1, vbox.getHeight(), cl);
            }
            for (var y = vbox.getY(); y - vbox.getY() < vbox.getHeight(); y += szy) {
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