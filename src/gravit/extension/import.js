(function (_) {
    /**
     * The base for an import filter
     * @class IFImport
     * @constructor
     */
    function IFImport() {
    };

    /**
     * The name of the import-filter
     * @return {String|IFLocale.Key}
     */
    IFImport.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The extensions this filter supports like ['pdf', 'ps']
     * @return {Array<String>} array of extensions
     */
    IFImport.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Called when this importer should import a given file
     * @param {Blob} blob the blob the import data should be read from
     * @param {IFScene} scene the target scene to put results into
     * @param {Function} done the callback function called with the
     * boolean result of the import (true/false)
     */
    IFImport.prototype.import = function (blob, scene, done) {
        throw new Error('Not Supported.');
    };

    _.IFImport = IFImport;
})(this);
