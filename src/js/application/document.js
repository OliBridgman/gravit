(function (_) {
    /**
     * An instance of an opened document
     * @class GDocument
     * @extends GEventTarget
     * @constructor
     */
    function GDocument(scene, url, title) {
        this.setUrl(url);
        this._scene = scene;
        this._editor = new GEditor(scene);
        this._windows = [];
        this._activeWindow = null;
        // TODO : I18N
        this._title = title;

        // Provide an url resolver to our scene
        this._scene.addEventListener(GScene.ResolveUrlEvent, this._resolveUrl, this);

        // Provide a listener for dropping resources on editor
        this._editor.addEventListener(GEditor.FileDropEvent, this._dropFile, this);
    };
    GObject.inherit(GDocument, GEventTarget);

    /**
     * The underlying scene
     * @type {GScene}
     * @private
     */
    GDocument.prototype._scene = null;

    /**
     * The underlying url, may be null
     * @type {String}
     * @private
     */
    GDocument.prototype._url = null;

    /**
     * The underlying editor working on the document
     * @type {GSceneEditor}
     * @private
     */
    GDocument.prototype._editor = null;

    /**
     * The windows attached to the document
     * @type {Array<GWindow>}
     * @private
     */
    GDocument.prototype._windows = null;

    /**
     * The currently active window of this document
     * @type {GWindow}
     * @private
     */
    GDocument.prototype._activeWindow = null;

    /**
     * The title of the document
     * @type {String}
     * @private
     */
    GDocument.prototype._title = null;

    /**
     * Returns the project this document is working on
     * @returns {GScene}
     */
    GDocument.prototype.getProject = function () {
        return this._scene.getWorkspace();
    };

    /**
     * Returns the scene this document is working on
     * @returns {GScene}
     */
    GDocument.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Return the underlying storage if any
     * @returns {GStorage}
     */
    GDocument.prototype.getStorage = function () {
        return this._storage;
    };

    /**
     * Returns the url this document is working on if any
     * @returns {String}
     */
    GDocument.prototype.getUrl = function () {
        return this._url;
    };

    /**
     * Assigns an url this document is working on
     * @param {String} url
     */
    GDocument.prototype.setUrl = function (url) {
        if (url !== this._url) {
            if (this._storage) {
                this._storage.releaseUrl(this._url);
            }

            this._url = url;
            this._storage = url ? gApp.getStorage(url) : null;
        }
    };

    /**
     * Return the underlying editor
     * @returns {GSceneEditor}
     */
    GDocument.prototype.getEditor = function () {
        return this._editor;
    };

    /**
     * Returns a list of all windows attached to this document
     * @return {Array<GWindow>}
     */
    GDocument.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Returns the currently active window of this document
     * @return {GWindow}
     */
    GDocument.prototype.getActiveWindow = function () {
        return this._activeWindow;
    };

    /**
     * Returns the title for the document
     * @return {String}
     */
    GDocument.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * Returns whether this document is saveable which
     * is the case if it has an underyling, valid url
     * and when it's internal editor's undo list has
     * modifications.
     * @return {Boolean}
     */
    GDocument.prototype.isSaveable = function () {
        return !!this._storage;
    };

    /**
     * Saves the document if it has an underlying url
     */
    GDocument.prototype.save = function () {
        // TODO : Reset undo list/set save point
        if (this._url) {
            var input = GNode.serialize(this._scene);
            var output = pako.gzip(input, {level: 9});
            this._storage.save(this._url, output.buffer, true, function (name) {
                this._title = name;
            }.bind(this));
        }
    };

    /**
     * Import a file into the current document
     * @param {File} file
     * @private
     */
    GDocument.prototype.importFile = function (file, callback) {
        var name = file.name;
        if (name && name.lastIndexOf('.') > 0) {
            name = name.substr(0, name.lastIndexOf('.'));
        }

        if (file.type.match(/image.*/)) {
            var addAsImage = function () {
                var reader = new FileReader();
                reader.onload = function (event) {
                    var image = new GImage();
                    image.setProperties(['name', 'url'], [name, event.target.result]);
                    this._editor.insertElements([image]);
                    callback(image);
                }.bind(this)
                reader.readAsDataURL(file);
            }.bind(this);

            // If svg image then prompt whether to convert to vector
            // or keep as an image
            if (file.type === 'image/svg+xml') {
                vex.dialog.confirm({
                    // TODO : I18N
                    message: 'Convert the image to vectors?',
                    callback: function (value) {
                        if (value) {
                            var page = this._scene.getActivePage();
                            var layer = this._scene.getActiveLayer();
                            GIO.read('image/svg+xml', file, function (node) {
                                if (node) {
                                    layer.appendChild(node);
                                    callback(node);
                                }
                            }, {
                                baseWidth: page.getProperty('w'),
                                baseHeight: page.getProperty('h')
                            });
                        } else {
                            addAsImage();
                        }
                    }.bind(this)
                });
            } else {
                addAsImage();
            }
        }
    };

    /**
     * Create and returns a new page
     * @param {Boolean} [noUndo] if set, no undo takes place for adding the page
     * @return {GPage}
     */
    GDocument.prototype.createNewPage = function (noUndo) {
        var scene = this._scene;
        var insertPos = this._scene.getPageInsertPosition();

        // Create page
        var page = new GPage();
        page.setProperties([
            'name',
            'x',
            'y',
            'w',
            'h',
            'bck'
        ], [
            'Page ' + (scene.queryCount('> page') + 1).toString(),
            insertPos.getX(),
            insertPos.getY(),
            800,
            600,
            GRGBColor.WHITE
        ]);

        // Add default layer
        var layer = new GLayer();
        // TODO : I18N
        layer.setProperties(['name'], ['Background']);
        page.appendChild(layer);

        var addPageFunc = function () {
            scene.appendChild(page);
            scene.setActiveLayer(layer);
        }

        if (!noUndo) {
            // TODO : I18N
            GEditor.tryRunTransaction(scene, addPageFunc, 'Add new Page');
        } else {
            addPageFunc();
        }

        return page;
    };

    /**
     * Called before this document gets activated
     */
    GDocument.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called before this document gets deactivated
     */
    GDocument.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this document gets released
     */
    GDocument.prototype.release = function () {
        this._editor.release();

        this._scene.removeEventListener(GScene.ResolveUrlEvent, this._resolveUrl, this);
        this._editor.removeEventListener(GEditor.FileDropEvent, this._dropFile, this);

        if (this._storage) {
            this._storage.releaseUrl(this._url);
        }
    };

    /**
     * @param {GScene.ResolveUrlEvent} evt
     * @private
     */
    GDocument.prototype._resolveUrl = function (evt) {
        var uri = new URI(evt.url);
        if (uri.protocol().length === 0) {
            // make absolute to ourself first
            uri = uri.absoluteTo(this._url);
        }

        if (uri.protocol().length > 0) {
            if (uri.protocol() === "http" || uri.protocol() === "https") {
                evt.resolved(evt.url);
            }

            var storage = gApp.getStorage(uri.protocol() + ':');
            if (storage) {
                storage.resolveUrl(uri.toString(), evt.resolved);
            }
        }
    };

    /**
     * @param {GEditor.FileDropEvent} evt
     * @private
     */
    GDocument.prototype._dropFile = function (evt) {
        this.importFile(evt.file, function (result) {
            // Translate result if any and if element
            if (result instanceof GElement && result.hasMixin(GElement.Transform)) {
                result.transform(new GTransform(1, 0, 0, 1, evt.position.getX(), evt.position.getY()));
            }
        });
    };

    _.GDocument = GDocument;
})(this);
