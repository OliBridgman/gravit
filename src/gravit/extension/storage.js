(function (_) {
    /**
     * The storage base class
     * @constructor
     * @version 1.0
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
     * Get the unique protocol of this storage
     * @return {String}
     */
    GStorage.prototype.getProtocol = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns an array of supported mime-types or null
     * if this storage supports any kind of mime-type
     * @return {Array<String>} list of mime-types supported
     * or null for all
     */
    GStorage.prototype.getMimeTypes = function () {
        throw new Error('Not supported.');
    };

    /**
     * Get the human readable name of this storage
     * @return {String|IFLocale.Key}
     */
    GStorage.prototype.getName = function () {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for opening an url
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {Array<String>} extensions array of extensions to limit
     * the selection to, can be null for all
     * @param {Function} done called with the url
     */
    GStorage.prototype.openPrompt = function (reference, extensions, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for saving to an url
     * @param {String} reference a reference url to set i.e.
     * the current working directory from, defaults to null
     * @param {String} proposedName the proposed default name,
     * maybe null for none
     * @param {String} extension the desired extension to be
     * used for the url resource, can be null
     * @param {Function} done called with the url
     */
    GStorage.prototype.savePrompt = function (reference, proposedName, extension, done) {
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

    _.GStorage = GStorage;
})(this);
