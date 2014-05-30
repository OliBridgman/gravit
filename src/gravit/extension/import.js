(function (_) {
    /**
     * The base for an import filter
     * @class GImport
     * @constructor
     */
    function GImport() {
    };

    /**
     * The name of the import-filter
     * @return {String|IFLocale.Key}
     */
    GImport.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extensions this filter supports like ['pdf', 'ps']
     * @return {Array<String>} array of extensions
     */
    GImport.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called when this importer should import a given file
     * @param {Blob} blob the blob the import data should be read from
     * @param {IFScene} scene the target scene to put results into
     * @param {Function} done the callback function called with the
     * boolean result of the import (true/false)
     */
    GImport.prototype.import = function (blob, scene, done) {
        throw new Error('Not Supported.');
    };

    _.GImport = GImport;
})(this);
