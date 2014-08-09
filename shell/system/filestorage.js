(function (_) {
    var fs = require('fs');

    /**
     * The file storage class for the system
     * @constructor
     */
    function GFileStorage() {
        this._fileInput = $('<input/>')
            .css('display', 'none')
            .attr('type', 'file')
            .on('change', function (evt) {
                var files = this._fileInput[0].files;
                if (files && files.length > 0) {
                    var file = this._fileInput[0].files[0];
                    var location = ifUtil.replaceAll(file.path, '\\', '/');

                    if (this._fileInputMode === 'open_resource') {
                        this._fileInputCallback(this.getProtocol() + '://' + location);
                    } else if (this._fileInputMode === 'save_resource') {
                        var extension = this._fileInput.attr('data-extension');
                        if (extension && !location.match("\\." + extension + "$")) {
                            location += "." + extension;
                        }
                        this._fileInputCallback(this.getProtocol() + '://' + location);
                    } else if (this._fileInputMode === 'open_directory' || this._fileInputMode === 'save_directory') {
                        // Make sure location ends with a slash
                        if (location.charAt(location.length - 1) !== '/') {
                            location += '/';
                        }
                        this._fileInputCallback(this.getProtocol() + '://' + location);
                    }
                }
            }.bind(this))
            .appendTo($('body'));
    };
    IFObject.inherit(GFileStorage, GStorage);

    /**
     * @type {String}
     * @private
     */
    GFileStorage.prototype._fileInputMode = null;

    /**
     * @type {Function}
     * @private
     */
    GFileStorage.prototype._fileInputCallback = null;

    /** @override */
    GFileStorage.prototype.isAvailable = function () {
        return true;
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
    GFileStorage.prototype.isDirectory = function () {
        return true;
    };

    /** @override */
    GFileStorage.prototype.getProtocol = function () {
        return 'file';
    };

    /** @override */
    GFileStorage.prototype.getExtensions = function () {
        return null;
    };

    /** @override */
    GFileStorage.prototype.getName = function () {
        // TODO : I18N
        return 'File';
    };

    /** @override */
    GFileStorage.prototype.openResourcePrompt = function (reference, extensions, done) {
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

        this._fileInputMode = 'open_resource';
        this._fileInputCallback = done;
        this._prepareInput(reference);
        this._fileInput
            .attr('accept', filter ? filter : '')
            .trigger('click');
    };

    /** @override */
    GFileStorage.prototype.saveResourcePrompt = function (reference, proposedName, extension, done) {
        this._fileInputMode = 'save_resource';
        this._fileInputCallback = done;
        this._prepareInput(reference);
        this._fileInput
            .attr('accept', extension ? '.' + extension : '')
            .attr('nwsaveas', proposedName ? proposedName + (extension ? '.' + extension : '') : '')
            .attr('data-extension', extension)
            .trigger('click');
    };

    /** @override */
    GFileStorage.prototype.openDirectoryPrompt = function (reference, done) {
        this._fileInputMode = 'open_directory';
        this._fileInputCallback = done;
        this._prepareInput(reference);
        this._fileInput
            .attr('nwdirectory', '')
            .trigger('click');
    };

    /** @override */
    GFileStorage.prototype.saveDirectoryPrompt = function (reference, done) {
        this._fileInputMode = 'save_directory';
        this._fileInputCallback = done;
        this._prepareInput(reference);
        this._fileInput
            .attr('nwdirectory', '')
            .trigger('click');
    };

    /** @override */
    GFileStorage.prototype.load = function (url, binary, done) {
        var location = new URI(url).path();
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
    GFileStorage.prototype.save = function (url, data, binary, done) {
        var location = new URI(url).path();

        if (binary) {
            data = new Buffer(new Uint8Array(data));
        }

        fs.writeFileSync(location, data, binary ? null : 'utf8');

        if (done) {
            done(this._extractFileName(location));
        }
    };

    /** @override */
    GFileStorage.prototype.resolveUrl = function (url, resolved) {
        // Our file:/// protocol is understandable by the browser
        // so just use the source url
        resolved(url);
    };

    /** @private */
    GFileStorage.prototype._prepareInput = function (reference) {
        var workingDir = null;
        if (reference && reference !== '') {
            var directory = new URI(reference).directory();
            if (directory && directory !== '') {
                if (ifSystem.operatingSystem === IFSystem.OperatingSystem.Windows) {
                    directory = ifUtil.replaceAll(directory, '/', '\\');
                }
                workingDir = directory;
            }
        }

        this._fileInput
            .removeAttr('accept')
            .removeAttr('nwsaveas')
            .removeAttr('nwdirectory')
            .removeAttr('nwworkingdir')
            .removeAttr('data-extension')
            .val('');

        if (workingDir && workingDir !== '') {
            this._fileInput
                .attr('nwworkingdir', workingDir);
        } else {
            this._fileInput
                .removeAttr('nwworkingdir');
        }
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
            if (lastDot > 0) {
                return path.substr(lastSlash + 1, lastDot - lastSlash - 1);
            } else {
                return path.substr(lastSlash + 1);
            }
        }
    };

    _.GFileStorage = GFileStorage;
})(this);
