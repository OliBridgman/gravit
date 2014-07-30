(function (_) {
    /**
     * The base for an importer
     * @class GImporter
     * @constructor
     */
    function GImporter() {
    };

    /**
     * The name of the importer
     * @return {String|IFLocale.Key}
     */
    GImporter.prototype.getName = function () {
        throw new Error('Not Supported.');
    };

    /**
     * The group of the importer
     * @return {String}
     */
    GImporter.prototype.getGroup = function () {
        return null;
    };

    /**
     * The extensions this importer  supports like ['pdf', 'ps']
     * @return {Array<String>} array of extensions
     */
    GImporter.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Specifies whether this importer is currently available
     * (i.e. if it requires an active document) or not
     * @return {Boolean}
     */
    GImporter.prototype.isAvailable = function () {
        return true;
    };

    /**
     * Called when this importer should import a given url. In this stage,
     * the importer may show an additional options dialog and create new
     * documents or push something into the active document, it is all
     * up to the importer.
     * @param {String} url the url the import data should be read from
     * @param {Function} done the callback function called with the
     * boolean result of the import (true/false)
     */
    GImporter.prototype.import = function (url, done) {
        throw new Error('Not Supported.');
    };

    _.GImporter = GImporter;
})(this);
