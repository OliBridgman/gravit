(function (_) {
    /**
     * The native storage class using the host for storing
     * @constructor
     */
    function GNativeStorage() {
    };
    IFObject.inherit(GNativeStorage, IFStorage);

    // -----------------------------------------------------------------------------------------------------------------
    // GNativeStorage._Blob Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GNativeStorage._Blob
     * @extends IFBlob
     * @private
     */
    GNativeStorage._Blob = function (storage, location) {
        IFBlob.call(this, storage, location);
    };
    IFObject.inherit(GNativeStorage._Blob, IFBlob);

    /** @override */
    GNativeStorage._Blob.prototype.restore = function (binary, encoding, done) {
        var result = gHost.readFile(this._location.toString(), binary, encoding);
        if (result) {
            done(result);
        }
    };

    /** @override */
    GNativeStorage._Blob.prototype.store = function (data, binary, encoding, done) {
        if (gHost.writeFile(this._location.toString(), data, binary, encoding)) {
            done();
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNativeStorage Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GNativeStorage.prototype.isAvailable = function () {
        return true;
    };

    /** @override */
    GNativeStorage.prototype.isSaving = function () {
        return true;
    };

    /** @override */
    GNativeStorage.prototype.isPrompting = function () {
        return true;
    };

    /** @override */
    GNativeStorage.prototype.getProtocol = function () {
        return 'file';
    };

    /** @override */
    GNativeStorage.prototype.getMimeTypes = function () {
        return null;
    };

    /** @override */
    GNativeStorage.prototype.getName = function () {
        // TODO : I18N
        return 'File';
    };

    /** @override */
    GNativeStorage.prototype.openBlobPrompt = function (reference, extensions, done) {
        var filter = "*.*";
        if (extensions) {
            filter = "";
            for (var i = 0; i < extensions.length; ++i) {
                if (i > 0) {
                    filter += ";;";
                }
                filter += "*." + extensions[i];
            }
        }

        var result = gHost.openFilePrompt(filter, "");
        if (result && result !== "") {
            this.openBlob(result, done);
        }
    };

    /** @override */
    GNativeStorage.prototype.saveBlobPrompt = function (reference, proposedName, extension, done) {
        var result = gHost.saveFilePrompt(extension, proposedName);
        if (result && result !== "") {
            if (extension && !result.match("\\\\." + extension + "$")) {
                result += "." + extension;
            }

            this.saveBlob(result, done);
        }
    };

    /** @override */
    GNativeStorage.prototype.openBlob = function (location, done) {
        // TODO : Check if location exists
        done(new GNativeStorage._Blob(this, location, this._extractFileName(location)));
    };

    /** @override */
    GNativeStorage.prototype.saveBlob = function (location, done) {
        // TODO : Check if location is writeable
        done(new GNativeStorage._Blob(this, location, this._extractFileName(location)));
    };

    /**
     * @private
     */
    GNativeStorage.prototype._extractFileName = function (path) {
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash < 0) {
            lastSlash = path.lastIndexOf('\\');
        }
        if (lastSlash >= 0) {
            var lastDot = path.lastIndexOf('.');
            if (lastDot < 0) {
                return path.substr(lastSlash, lastDot - lastSlash);
            } else {
                return path.substr(lastSlash);
            }
        }
    };

    _.GNativeStorage = GNativeStorage;
})(this);
