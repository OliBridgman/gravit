(function (_) {
    /**
     * The blob base class
     * @param {GStorage} storage the owner storage
     * @param {String} location the location
     * @param {String} name the name
     * @constructor
     * @version 1.0
     */
    function GBlob(storage, location, name) {
        this._storage = storage;
        this._location = location;
    };

    /**
     * @type {GStorage}
     * @private
     */
    GBlob.prototype._storage = null;

    /**
     * @type {String}
     * @private
     */
    GBlob.prototype._location = null;

    /**
     * @type {String}
     * @private
     */
    GBlob.prototype._name = null;

    /**
     * Get the underlying storage
     * @returns {GStorage}
     */
    GBlob.prototype.getStorage = function () {
        return this._storage;
    };

    /**
     * Get the underlying location
     * @returns {String}
     */
    GBlob.prototype.getLocation = function () {
        return this._location;
    };

    /**
     * Get the underlying name
     * @returns {String}
     */
    GBlob.prototype.getName = function () {
        return this._name;
    };

    /**
     * Restore the data from the blob. Take care on the
     * returned data as it might be a hash depending on
     * whether the storage supportes named data or not
     * @param {Function} callback called with the data restored
     * @return {*}
     */
    GBlob.prototype.restore = function (done) {
        throw new Error('Not Supported.');
    };

    /**
     * Store data into the blob. Take care on the
     * data as it might require a hash depending on
     * whether the storage supportes named data or not
     * @param {*} data the data to store
     * @param {boolean} compress if true, the data should
     * be compressed, defaults to false
     * @param {Function} callback called when data was stored
     */
    GBlob.prototype.store = function (data, compress, done) {
        throw new Error('Not Supported.');
    };

    _.GBlob = GBlob;
})(this);
