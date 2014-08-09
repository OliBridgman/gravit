(function (_) {
    /**
     * The base for an exporter
     * @class GExporter
     * @constructor
     */
    function GExporter() {
    };

    /**
     * Returns whether this exporter only exports a whole scene
     * or can also export individual parts of it
     */
    GExporter.prototype.isStandalone = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The name of the exporter
     */
    GExporter.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extensions this export filter produces like ['png', 'jpg']
     * @return {Array<String>} the extension
     */
    GExporter.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called to let the exporter export a part. This will never be
     * called when the exporter is standalone only
     * @param {IFElement} part the part to be exported
     * @param {Number} scale the scale to export with
     * @param {GStorage} storage the storage to be used for storing
     * @param {String} url the url to store the part within the storage
     * @param {String} extension the extension to be used, this is one
     * of the extensions supplied by this exporter
     */
    GExporter.prototype.export = function (part, scale, storage, url, extension) {
        throw new Error('Not Supported.');
    };

    _.GExporter = GExporter;
})(this);
