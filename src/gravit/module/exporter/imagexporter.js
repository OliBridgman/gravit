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

        // Gather our bitmap
        var bitmap = paintCanvas.getBitmap();

        // Slices may be trimmed
        if (part instanceof IFSlice && part.getProperty('trm')) {
            bitmap.trim();
        }

        // Store bitmap now
        var callback = function (buffer) {
            storage.save(url, buffer, true);
        };

        bitmap.toImageBuffer(this._getImageTypeByExt(extension), callback);
    };

    /**
     * @param {String} ext
     * @returns {IFBitmap.ImageType}
     * @private
     */
    GImageExporter.prototype._getImageTypeByExt = function (extension) {
        if (extension === 'png') {
            return IFBitmap.ImageType.PNG;
        } else if (extension === 'jpg') {
            return IFBitmap.ImageType.JPEG;
        } else {
            throw new Error('Unknown image extension - ' + extension);
        }
    };

    _.GImageExporter = GImageExporter;
})(this);
