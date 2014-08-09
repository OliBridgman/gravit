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
    GImageExporter.prototype.exportPart = function (part, size, storage, url, extension) {
        // TODO  Set pageClip to true if we export page

        size = GExporter.parseSize(size);

        var paintArea = part.getPaintBBox();

        // Calculate scale & delta offsets
        var scale = size.width;
        var deltaX = 0;
        var deltaY = 0;

        if (typeof dimension === 'number') {
            scale = dimension;
        } else {
            // TODO
        }

        // Create + Setup Paint-Canvas
        var paintCanvas = new IFPaintCanvas();
        paintCanvas.resize(paintArea.getWidth() * scale, paintArea.getHeight() * scale);

        // Create + Setup Paint Context & Configuration
        var paintContext = new IFPaintContext();
        paintContext.canvas = paintCanvas;
        var paintConfig = new IFScenePaintConfiguration();
        paintConfig.paintMode = IFScenePaintConfiguration.PaintMode;
        paintConfig.annotations = false;
        paintContext.configuration = paintConfig;
        paintConfig.clipArea = paintArea;
        paintConfig.pagesClip = part instanceof IFPage;

        // Paint
        paintCanvas.prepare();
        paintCanvas.setOrigin(new IFPoint(paintArea.getX() * scale, paintArea.getY() * scale));
        paintCanvas.setScale(scale);
        try {
            if (part instanceof IFSlice) {
                part.getScene().render(paintContext);
            } else {
                part.render(paintContext);
            }
        } finally {
            paintCanvas.finish();
        }

        // Slices may be trimmed
        if (part instanceof IFSlice && part.getProperty('trm')) {
            paintCanvas.trim();
        }

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
