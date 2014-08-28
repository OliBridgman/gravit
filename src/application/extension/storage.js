(function (_) {
    /**
     * The storage base class
     * @constructor
     */
    function GStorage() {
    };

    /**
     * Returns whether this storage is available at all or not
     * @return {Boolean}
     */
    GStorage.prototype.isAvailable = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns whether this storage can also save urls or not (load only)
     * @return {Boolean}
     */
    GStorage.prototype.isSaving = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns whether this storage supports prompting
     * @return {Boolean}
     */
    GStorage.prototype.isPrompting = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns whether this storage supports directories
     * @return {Boolean}
     */
    GStorage.prototype.isDirectory = function () {
        throw new Error('Not supported.');
    };

    /**
     * Get the unique protocol of this storage
     * @return {String}
     */
    GStorage.prototype.getProtocol = function () {
        throw new Error('Not supported.');
    };

    /**
     * The extensions this storage  supports like ['pdf', 'ps'].
     * Return null or empty array to support all. Ensure to always
     * return extensions in lower-case only!
     * @return {Array<String>} array of extensions
     */
    GStorage.prototype.getExtensions = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Get the human readable name of this storage
     * @return {String|IFLocale.Key}
     */
    GStorage.prototype.getName = function () {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for opening a resource
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {Array<String>} extensions array of extensions to limit
     * the selection to, can be null for all
     * @param {Function} done called with the resource url
     */
    GStorage.prototype.openResourcePrompt = function (reference, extensions, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for saving to a resources
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {String} proposedName the proposed default name,
     * maybe null for none
     * @param {String} extension the desired extension to be
     * used for the url resource, can be null
     * @param {Function} done called with the resource url
     */
    GStorage.prototype.saveResourcePrompt = function (reference, proposedName, extension, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for opening a directory
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {Function} done called with the directory url
     */
    GStorage.prototype.openDirectoryPrompt = function (reference, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for saving to a directory
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {Function} done called with the directory url
     */
    GStorage.prototype.saveDirectoryPrompt = function (reference, done) {
        throw new Error('Not supported.');
    };

    /**
     * Load from an url
     * @param {String} url the url to load from
     * @param {Boolean} binary if true, the data is read as binary,
     * otherwise it is read as String
     * @param {Function} callback called with the data restored which
     * is either an ArrayBuffer for binary or a String and the name
     * @return {String}
     */
    GStorage.prototype.load = function (url, binary, done) {
        throw new Error('Not Supported.');
    };

    /**
     * Save data to an url
     * @param {String} url the url to save to
     * @param {ArrayBuffer|String} data the data to store. If
     * binary is set to true, an ArrayBuffer is expected, otherwise a string
     * @param {Boolean} binary whether the data is binary or not
     * @param {Function} callback called when data was stored with the name
     */
    GStorage.prototype.save = function (url, data, binary, done) {
        throw new Error('Not Supported.');
    };

    /**
     * Release an url that has previously been gathered via open- or
     * save-prompt. After this call, neither load nor save should be
     * used on the url any longer.
     * @param {String} url the url to be released
     */
    GStorage.prototype.releaseUrl = function (url) {
        // NO-OP by default
    };

    /**
     * Resolve an url in the format of this storage in a real-world
     * url that is understandable and reachable. If the url may require
     * some authentication this can be done here and when done, the
     * callback function should be fired.
     * @param {String} url the url in this storage format to resolve
     * @param {Function} resolved callback retrieving the final url
     */
    GStorage.prototype.resolveUrl = function (url, resolved) {
        throw new Error('Not Supported.');
    };

    _.GStorage = GStorage;
})(this);
