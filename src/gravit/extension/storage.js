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
     * Returns whether this storage can also save blobs or not (open only)
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
     * Prompt for opening a blob and open it
     * @param {GBlob} reference a reference blob to set i.e.
     * the current working directory from, defaults to null
     * @param {Array<String>} extensions array of extensions to limit
     * the selection to, can be null for all
     * @param {Function} done called with the blob for
     * restoring
     */
    GStorage.prototype.openBlobPrompt = function (reference, extensions, done) {
        throw new Error('Not supported.');
    };

    /**
     * Prompt for saving a blob
     * @param {GBlob} reference a reference blob to set i.e.
     * the current working directory from, defaults to null
     * @param {String} proposedName the proposed default name,
     * maybe null for none
     * @param {String} extension the desired extension to be
     * used for the blob resource, can be null
     * @param {Function} done called with the blob for
     * storing
     */
    GStorage.prototype.saveBlobPrompt = function (reference, proposedName, extension, done) {
        throw new Error('Not supported.');
    };

    /**
     * Open a blob from a given location
     * @param {String} location the blob-specific location
     * @param {Function} done called with the blob for
     * restoring
     */
    GStorage.prototype.openBlob = function (location, done) {
        throw new Error('Not supported.');
    };

    /**
     * Save a blob to a given location
     * @param {String} location the blob-specific location
     * @param {Function} [done] called with the blob for
     * storing
     */
    GStorage.prototype.saveBlob = function (location, done) {
        throw new Error('Not supported.');
    };

    _.GStorage = GStorage;
})(this);
