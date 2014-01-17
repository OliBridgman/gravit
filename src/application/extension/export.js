(function (_) {
    /**
     * The base for an export filter
     * @class GXExport
     * @constructor
     */
    function GXExport() {
    };

    /**
     * The name of the export-filter
     */
    GXExport.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extension this export filter produces like 'pdf'
     * @return {String} the extension
     */
    GXExport.prototype.getExtension = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called when this exporter should export to a blob
     * @param {GXScene} scene The scene to export from
     * @param {Function} done the callback to be called for
     * success or failure with the blob (for success) as parameter
     */
    GXExport.prototype.export = function (scene, done) {
        throw new Error('Not Supported.');
    };

    _.GXExport = GXExport;
})(this);
