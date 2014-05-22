(function (_) {
    /**
     * The blob base class
     * @param {IFStorage} storage the owner storage
     * @param {String} location the location
     * @param {String} name the name
     * @constructor
     * @version 1.0
     */
    function IFBlob(storage, location, name) {
        this._storage = storage;
        this._location = location;
    };

    /**
     * @type {IFStorage}
     * @private
     */
    IFBlob.prototype._storage = null;

    /**
     * @type {String}
     * @private
     */
    IFBlob.prototype._location = null;

    /**
     * @type {String}
     * @private
     */
    IFBlob.prototype._name = null;

    /**
     * Get the underlying storage
     * @returns {IFStorage}
     */
    IFBlob.prototype.getStorage = function () {
        return this._storage;
    };

    /**
     * Get the underlying location
     * @returns {String}
     */
    IFBlob.prototype.getLocation = function () {
        return this._location;
    };

    /**
     * Get the underlying name
     * @returns {String}
     */
    IFBlob.prototype.getName = function () {
        return this._name;
    };

    /**
     * Restore the data from the blob
     * @param {Boolean} binary whether the data is binary or not
     * @param {String} encoding the encoding, supported are 'binary'
     * and 'utf8'
     * @param {Function} callback called with the data restored
     * @return {String}
     */
    IFBlob.prototype.restore = function (binary, encoding, done) {
        throw new Error('Not Supported.');
    };

    /**
     * Store data into the blob
     * @param {String} data the data to store. If binary is
     * set to true, this should be a base64-encoded string
     * @param {Boolean} binary whether the data is binary or not
     * @param {String} encoding the encoding, supported are 'binary'
     * and 'utf8'
     * @param {Function} callback called when data was stored
     */
    IFBlob.prototype.store = function (data, binary, encoding, done) {
        throw new Error('Not Supported.');
    };

    _.IFBlob = IFBlob;
})(this);
