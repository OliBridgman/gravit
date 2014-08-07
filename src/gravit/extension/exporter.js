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

    _.GExporter = GExporter;
})(this);
