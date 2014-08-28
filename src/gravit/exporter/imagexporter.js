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
        var size = GExporter.parseSize(size);
        var bitmap = part.toBitmap(size.width, size.height ? size.height : size.width, 2);
        if (bitmap) {
            // Store bitmap now
            bitmap.toImageBuffer(this._getImageTypeByExt(extension), function (buffer) {
                storage.save(url, buffer, true);
            });
        }
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
