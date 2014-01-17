(function (_) {
    /**
     * The file storage class
     * @constructor
     * @version 1.0
     */
    function GFileStorage() {
    };
    GObject.inherit(GFileStorage, GStorage);

    // -----------------------------------------------------------------------------------------------------------------
    // GFileStorage._Blob Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GFileStorage._Blob
     * @extends GBlob
     * @private
     */
    GFileStorage._Blob = function (storage, location) {
        GBlob.call(this, storage, location);
    };
    GObject.inherit(GFileStorage._Blob, GBlob);

    /** @override */
    GFileStorage._Blob.prototype.restore = function (done) {
        appshell.fs.readFile(this._location.toString(), 'utf8', function (err, data) {
            if (err === appshell.fs.NO_ERROR && data) {
                done(data);
            }
        });
    };

    /** @override */
    GFileStorage._Blob.prototype.store = function (data, compress, done) {
        /** TODO : Compression support
         if (compress) {
            alert('compress');
            var cpr = new GCompress();
            cpr.setMode(GCompress.Mode.GZip);
            data = cpr.compressToString(data);
            alert('compressed_data: ' + data);
        }
         */
        appshell.fs.writeFile(this._location.toString(), data, 'utf8', function (err) {
            alert('write_file_err: ' + err);
            if (err === appshell.fs.NO_ERROR) {
                done();
            }
        });
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GFileStorage Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    GFileStorage.prototype.isAvailable = function () {
        return window.appshell && window.appshell.fs;
    };

    /** @override */
    GFileStorage.prototype.isSaving = function () {
        return true;
    };

    /** @override */
    GFileStorage.prototype.isPrompting = function () {
        return true;
    };

    /** @override */
    GFileStorage.prototype.isNamedData = function () {
        return false;
    };

    /** @override */
    GFileStorage.prototype.getProtocol = function () {
        return 'file';
    };

    /** @override */
    GFileStorage.prototype.getMimeTypes = function () {
        return null;
    };

    /** @override */
    GFileStorage.prototype.getName = function () {
        // TODO : I18N
        return 'File';
    };

    /** @override */
    GFileStorage.prototype.openBlobPrompt = function (reference, extensions, done) {
        // TODO : Support reference
        appshell.fs.showOpenDialog(false, false, null, null, extensions, function (err, selection) {
            if (err === appshell.fs.NO_ERROR && selection) {
                this.openBlob(selection, done);
            }
        }.bind(this));
    };

    /** @override */
    GFileStorage.prototype.saveBlobPrompt = function (reference, proposedName, extension, done) {
        // TODO : Support reference
        appshell.fs.showSaveDialog(null, null, proposedName, function (err, savepath) {
            if (err === appshell.fs.NO_ERROR && savepath) {
                if (extension && !savepath.match("\\\\." + extension + "$")) {
                    savepath += "." + extension;
                }

                this.saveBlob(savepath, done);
            }
        }.bind(this));
    };

    /** @override */
    GFileStorage.prototype.openBlob = function (location, done) {
        // TODO : Check if location exists
        done(new GFileStorage._Blob(this, location, this._extractFileName(location)));
    };

    /** @override */
    GFileStorage.prototype.saveBlob = function (location, done) {
        // TODO : Check if location is writeable
        done(new GFileStorage._Blob(this, location, this._extractFileName(location)));
    };

    /**
     * @private
     */
    GFileStorage.prototype._extractFileName = function (path) {
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

    _.GFileStorage = GFileStorage;
})(this);
