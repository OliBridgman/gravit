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
                        this._fileInputCallback(this.getProtocol() + ':' + location);
                    } else if (this._fileInputMode === 'save') {
                        var extension = this._fileInput.attr('data-extension');
                        if (extension && !location.match("\\." + extension + "$")) {
                            location += "." + extension;
                        }
                        this._fileInputCallback(this.getProtocol() + ':' + location);
                    }
                }
            }.bind(this))
            .appendTo($('body'));
    };
    IFObject.inherit(GNativeStorage, GStorage);

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
    GNativeStorage.prototype.openPrompt = function (reference, extensions, done) {
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
    GNativeStorage.prototype.savePrompt = function (reference, proposedName, extension, done) {
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
    GNativeStorage.prototype.load = function (url, binary, done) {
        var location = url.substr(this.getProtocol().length + 1);
        var buffer = fs.readFileSync(location, binary ? null : 'utf8');

        if (buffer) {
            if (binary) {
                var ab = new ArrayBuffer(buffer.length);
                var view = new Uint8Array(ab);
                for (var i = 0; i < buffer.length; ++i) {
                    view[i] = buffer[i];
                }
                buffer = ab;
            }

            done(buffer, this._extractFileName(location));
        }
    };

    /** @override */
    GNativeStorage.prototype.save = function (url, data, binary, done) {
        var location = url.substr(this.getProtocol().length + 1);

        if (binary) {
            data = new Buffer(new Uint8Array(data));
        }

        fs.writeFileSync(location, data, binary ? null : 'utf8');

        if (done) {
            done(this._extractFileName(location));
        }
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
