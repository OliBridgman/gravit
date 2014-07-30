(function (_) {
    /**
     * An instance of an opened document
     * @class GDocument
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GDocument(scene, blob, temporaryTitle) {
        this._blob = blob;
        this._scene = scene;
        this._editor = new IFEditor(scene);
        this._windows = [];
        this._activeWindow = null;
        // TODO : I18N
        this._temporaryTitle = temporaryTitle;

        // Provide an url resolver to our scene
        this._scene.addEventListener(IFScene.ResolveUrlEvent, function (evt) {
            console.log('RESOLVE_URL: ' + evt.url);
        });
    };
    IFObject.inherit(GDocument, GEventTarget);

    /**
     * The underlying scene
     * @type {IFScene}
     * @private
     */
    GDocument.prototype._scene = null;

    /**
     * The underlying blob, may be null
     * @type {GBlob}
     * @private
     */
    GDocument.prototype._blob = null;

    /**
     * The underlying editor working on the document
     * @type {IFSceneEditor}
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
     * The temporary title of no blob is assigned
     * @type {String}
     * @private
     */
    GDocument.prototype._temporaryTitle = null;

    /**
     * Returns the scene this document is working on
     * @returns {IFScene}
     */
    GDocument.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Returns the blob this document is working on if any
     * @returns {GBlob}
     */
    GDocument.prototype.getBlob = function () {
        return this._blob;
    };

    /**
     * Assigns a blob this document is working on
     * @param {GBlob} blob
     */
    GDocument.prototype.setBlob = function (blob) {
        if (blob && blob !== this.blob) {
            this._blob = blob;
        }
    };

    /**
     * Return the underlying editor
     * @returns {IFSceneEditor}
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
        if (this._blob) {
            return this._blob.getName();
        } else {
            return this._temporaryTitle;
        }
    };

    /**
     * Returns whether this document is saveable which
     * is the case if it has an underyling, valid blob
     * and when it's internal editor's undo list has
     * modifications.
     * @return {Boolean}
     */
    GDocument.prototype.isSaveable = function () {
        return !!this._blob;
    };

    /**
     * Saves the document if it has an underlying blob
     */
    GDocument.prototype.save = function () {
        // TODO : Reset undo list/set save point
        if (this._blob) {
            var input = IFNode.serialize(this._scene);
            var output = pako.deflate(input);
            this._blob.store(output.buffer, true, function () {
                // NO-OP
            });
        }
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

    _.GDocument = GDocument;
})(this);
