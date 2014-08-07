(function (_) {
    /**
     * The file storage class for chrome
     * @constructor
     */
    function GFileStorage() {
        this._urlEntryMap = {};
    };
    IFObject.inherit(GFileStorage, GStorage);

    /**
     * @type {*}
     * @private
     */
    GFileStorage.prototype._urlEntryMap = null;

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
    GFileStorage.prototype.openPrompt = function (reference, extensions, done) {
        chrome.fileSystem.chooseEntry(
            {
                type: 'openWritableFile',
                acceptsAllTypes: !extensions,
                accepts: [
                    {
                        extensions: extensions
                    },
                ]
            },
            function (entry) {
                if (entry) {
                    this._addEntryMapping(entry, done);
                }
            }.bind(this));
    };

    /** @override */
    GFileStorage.prototype.savePrompt = function (reference, proposedName, extension, done) {
        chrome.fileSystem.chooseEntry(
            {
                type: 'saveFile',
                suggestedName: proposedName,
                acceptsAllTypes: !extension,
                accepts: [
                    {
                        extensions: [extension]
                    },
                ]
            },
            function (entry) {
                if (entry) {
                    this._addEntryMapping(entry, done);
                }
            }.bind(this));
    };

    /** @override */
    GFileStorage.prototype.load = function (url, binary, done) {
        if (!this._urlEntryMap.hasOwnProperty(url)) {
            throw new Error('No file-entry for url ' + url);
        }

        var entry = this._urlEntryMap[url].entry;
        var name = this._extractFileName(url);

        entry.file(function (file) {
            var reader = new FileReader();

            reader.onerror = function (e) {
                console.log('read_error on ' + url);
                console.log(e);
            }
            reader.onloadend = function (e) {
                done(e.target.result, name);
            };

            if (binary) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    /** @override */
    GFileStorage.prototype.save = function (url, data, binary, done) {
        if (!this._urlEntryMap.hasOwnProperty(url)) {
            throw new Error('No file-entry for url ' + url);
        }

        var entry = this._urlEntryMap[url].entry;
        var name = this._extractFileName(url);

        entry.createWriter(function (writer) {
            writer.onerror = function (e) {
                console.log('write_error on ' + url);
                console.log(e);
            }
            writer.onwriteend = function (e) {
                if (done) {
                    done(name);
                }
            };
            writer.write(new Blob([data], {type: binary ? 'text/plain' : 'text/plain'}));
        }, function (e) {
            console.log('create_writer_error on ' + url);
        });
    };

    /** @override */
    GFileStorage.prototype.releaseUrl = function (url) {
        if (this._urlEntryMap.hasOwnProperty(url)) {
            if (--this._urlEntryMap[url].usage === 0) {
                delete this._urlEntryMap[url];
            }
        }
    };

    /** @override */
    GFileStorage.prototype.resolveUrl = function (url, resolved) {
        // Our file:/// protocol is understandable by the browser
        // so just use the source url
        resolved(url);
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

    /** @private */
    GFileStorage.prototype._addEntryMapping = function (entry, done) {
        chrome.fileSystem.getDisplayPath(entry, function (path) {
            var url = this.getProtocol() + '://' + ifUtil.replaceAll(path, '\\', '/');

            if (!this._urlEntryMap.hasOwnProperty(url)) {
                this._urlEntryMap[url] = {
                    usage: 1,
                    entry: entry
                };
            } else {
                this._urlEntryMap[url].usage++;
            }

            done(url);
        }.bind(this));
    };

    _.GFileStorage = GFileStorage;
})(this);
