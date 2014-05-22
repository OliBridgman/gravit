(function (_) {
    /**
     * The storage base class
     * @constructor
     * @version 1.0
     */
    function IFStorage() {
    };

    /**
     * Returns whether this storage is available at all or not
     * @return {Boolean}
     */
    IFStorage.prototype.isAvailable = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns whether this storage can also save blobs or not (open only)
     * @return {Boolean}
     */
    IFStorage.prototype.isSaving = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns whether this storage supports prompting
     * @return {Boolean}
     */
    IFStorage.prototype.isPrompting = function () {
        throw new Error('Not supported.');
    };

    /**
     * Get the unique protocol of this storage
     * @return {String}
     */
    IFStorage.prototype.getProtocol = function () {
        throw new Error('Not supported.');
    };

    /**
     * Returns an array of supported mime-types or null
     * if this storage supports any kind of mime-type
     * @return {Array<String>} list of mime-types supported
     * or null for all
     */
    IFStorage.prototype.getMimeTypes = function () {
        throw new Error('Not supported.');
    };

    /**
     * Get the human readable name of this storage
     * @return {String|IFLocale.Key}
     */
    IFStorage.prototype.getName = function () {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for opening a blob and open it
     * @param {IFBlob} reference a reference blob to set i.e.
     * the current working directory from, defaults to null
     * @param {Array<String>} extensions array of extensions to limit
     * the selection to, can be null for all
     * @param {Function} done called with the blob for
     * restoring
     */
    IFStorage.prototype.openBlobPrompt = function (reference, extensions, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for saving a blob
     * @param {IFBlob} reference a reference blob to set i.e.
     * the current working directory from, defaults to null
     * @param {String} proposedName the proposed default name,
     * maybe null for none
     * @param {String} extension the desired extension to be
     * used for the blob resource, can be null
     * @param {Function} done called with the blob for
     * storing
     */
    IFStorage.prototype.saveBlobPrompt = function (reference, proposedName, extension, done) {
        throw new Error('Not supported.');
    };

    /**
     * Open a blob from a given location
     * @param {String} location the blob-specific location
     * @param {Function} done called with the blob for
     * restoring
     */
    IFStorage.prototype.openBlob = function (location, done) {
        throw new Error('Not supported.');
    };

    /**
     * Save a blob to a given location
     * @param {String} location the blob-specific location
     * @param {Function} [done] called with the blob for
     * storing
     */
    IFStorage.prototype.saveBlob = function (location, done) {
        throw new Error('Not supported.');
    };

    _.IFStorage = IFStorage;
})(this);
