(function (_) {
    var fs = require('fs');

    /**
     * The native storage class using the host for storing
     * @constructor
     */
    function GNativeStorage() {
        this._fileInput = $('<input/>')
            .css('display', 'none')
            .attr('type', 'file')
            .on('change', function (evt) {
                var files = this._fileInput[0].files;
                if (files && files.length > 0) {
                    var file = this._fileInput[0].files[0];
                    var location = file.path;

                    if (this._fileInputMode === 'open') {
                        this.openBlob(location, this._fileInputCallback);
                    } else if (this._fileInputMode === 'save') {
                        var extension = this._fileInput.attr('data-extension');
                        if (extension && !location.match("\\." + extension + "$")) {
                            location += "." + extension;
                        }
                        this.saveBlob(location, this._fileInputCallback);
                    }
                }
            }.bind(this))
            .appendTo($('body'));
    };
    IFObject.inherit(GNativeStorage, GStorage);

    // -----------------------------------------------------------------------------------------------------------------
    // GNativeStorage._Blob Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GNativeStorage._Blob
     * @extends GBlob
     * @private
     */
    GNativeStorage._Blob = function (storage, location, name) {
        GBlob.call(this, storage, location, name);
    };
    IFObject.inherit(GNativeStorage._Blob, GBlob);

    /** @override */
    GNativeStorage._Blob.prototype.restore = function (binary, done) {
        var buffer = fs.readFileSync(this._location, binary ? null : 'utf8');

        if (buffer) {
            if (binary) {
                var ab = new ArrayBuffer(buffer.length);
                var view = new Uint8Array(ab);
                for (var i = 0; i < buffer.length; ++i) {
                    view[i] = buffer[i];
                }
                buffer = ab;
            }

            done(buffer);
        }
    };

    /** @override */
    GNativeStorage._Blob.prototype.store = function (data, binary, done) {
        if (binary) {
            data = new Buffer(new Uint8Array(data));
        }

        fs.writeFileSync(this._location, data, binary ? null : 'utf8');

        if (done) {
            done();
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNativeStorage Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {String}
     * @private
     */
    GNativeStorage.prototype._fileInputMode = null;

    /**
     * @type {Function}
     * @private
     */
    GNativeStorage.prototype._fileInputCallback = null;

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
                    filter += ",";
                }
                filter += "." + extensions[i];
            }
        }

        this._fileInputMode = 'open';
        this._fileInputCallback = done;
        this._fileInput
            .attr('accept', filter ? filter : '')
            .removeAttr('nwsaveas')
            .removeAttr('data-extension')
            .val('')
            .trigger('click');
    };

    /** @override */
    GNativeStorage.prototype.saveBlobPrompt = function (reference, proposedName, extension, done) {
        this._fileInputMode = 'save';
        this._fileInputCallback = done;
        this._fileInput
            .attr('accept', extension ? '.' + extension : '')
            .attr('nwsaveas', proposedName ? proposedName + (extension ? '.' + extension : '') : '')
            .attr('data-extension', extension)
            .val('')
            .trigger('click');
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
            if (lastDot > 0) {
                return path.substr(lastSlash + 1, lastDot - lastSlash - 1);
            } else {
                return path.substr(lastSlash + 1);
            }
        }
    };

    _.GNativeStorage = GNativeStorage;
})(this);
