(function (_) {
    /**
     * The image exporter
     * @class GImageExporter
     * @constructor
     */
    function GImageExporter() {
    };

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
        return ['PNG', 'JPG'];
    };

    _.GImageExporter = GImageExporter;
})(this);
