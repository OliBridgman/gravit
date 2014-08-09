(function (_) {
    /**
     * The image exporter
     * @class GImageExporter
     * @extends GExporter
     * @constructor
     */
    function GImageExporter() {
        GExporter.call(this);
    };
    IFObject.inherit(GImageExporter, GExporter);

    /** @override */
    GImageExporter.prototype.isStandalone = function () {
        return false;
    };

    /** @override */
    GImageExporter.prototype.getName = function () {
        return 'Raster Image';
    };

    /** @override */
    GImageExporter.prototype.getExtensions = function () {
        return ['png', 'jpg'];
    };

    /** @override */
    GImageExporter.prototype.exportPart = function (part, scale, storage, url, extension) {
        scale = 2;

        var paintArea = part.getPaintBBox();

        // Create + Setup Paint-Canvas
        var paintCanvas = new IFPaintCanvas();
        paintCanvas.resize(paintArea.getWidth() * scale, paintArea.getHeight() * scale);

        // Create + Setup Paint Context & Configuration
        var paintContext = new IFPaintContext();
        paintContext.canvas = paintCanvas;
        var paintConfig = new IFScenePaintConfiguration();
        paintContext.configuration = paintConfig;

        // Paint
        paintCanvas.prepare();
        paintCanvas.setOrigin(new IFPoint(paintArea.getX() * scale, paintArea.getY() * scale));
        paintCanvas.setScale(scale);
        part.render(paintContext);
        paintCanvas.finish();

        // Store
        var callback = function (buffer) {
            storage.save(url, buffer, true);
        };

        if (extension === 'png') {
            paintCanvas.asPNGImageBuffer(callback);
        } else if (extension === 'jpg') {
            // TODO : Read quality from size?
            paintCanvas.asJPEGImage(callback);
        }
    };

    _.GImageExporter = GImageExporter;
})(this);
