(function (_) {
    /**
     * A stage for rendering the editor foreground
     * @param {IFView} view
     * @class IFEditorFrontStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorFrontStage(view) {
        IFStage.call(this, view);
        view.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);
    }
    IFObject.inherit(IFEditorFrontStage, IFStage);

    IFEditorFrontStage.MIN_CELL_SPACE = 10;

    /** @override */
    IFEditorFrontStage.prototype.paint = function (context) {
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
            if (szW < IFEditorFrontStage.MIN_CELL_SPACE) {
                szW *= 1. + Math.floor(IFEditorFrontStage.MIN_CELL_SPACE / szW);
            }
            if (szH < IFEditorFrontStage.MIN_CELL_SPACE){
                szH *= 1. + Math.floor(IFEditorFrontStage.MIN_CELL_SPACE / szH);
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

    IFEditorFrontStage.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
        }
    };

    /** @override */
    IFEditorFrontStage.prototype.toString = function () {
        return "[Object IFEditorFrontStage]";
    };

    _.IFEditorFrontStage = IFEditorFrontStage;
})(this);