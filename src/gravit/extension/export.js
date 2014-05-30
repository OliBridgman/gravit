(function (_) {
    /**
     * The base for an export filter
     * @class GExport
     * @constructor
     */
    function GExport() {
    };

    /**
     * The name of the export-filter
     */
    GExport.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extension this export filter produces like 'pdf'
     * @return {String} the extension
     */
    GExport.prototype.getExtension = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called when this exporter should export to a blob
     * @param {IFScene} scene The scene to export from
     * @param {Function} done the callback to be called for
     * success or failure with the blob (for success) as parameter
     */
    GExport.prototype.export = function (scene, done) {
        throw new Error('Not Supported.');
    };

    _.GExport = GExport;
})(this);
