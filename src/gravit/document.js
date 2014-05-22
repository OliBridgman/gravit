(function (_) {
    /**
     * An instance of an opened document
     * @class EXDocument
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function EXDocument(scene, blob, temporaryTitle) {
        this._blob = blob;
        this._scene = scene;
        this._editor = new IFEditor(scene);
        this._windows = [];
        this._activeWindow = null;
        // TODO : I18N
        this._temporaryTitle = temporaryTitle;
    };
    IFObject.inherit(EXDocument, GEventTarget);

    /**
     * The underlying scene
     * @type {IFScene}
     * @private
     */
    EXDocument.prototype._scene = null;

    /**
     * The underlying blob, may be null
     * @type {IFBlob}
     * @private
     */
    EXDocument.prototype._blob = null;

    /**
     * The underlying editor working on the document
     * @type {IFSceneEditor}
     * @private
     */
    EXDocument.prototype._editor = null;

    /**
     * The windows attached to the document
     * @type {Array<EXWindow>}
     * @private
     */
    EXDocument.prototype._windows = null;

    /**
     * The currently active window of this document
     * @type {EXWindow}
     * @private
     */
    EXDocument.prototype._activeWindow = null;

    /**
     * The temporary title of no blob is assigned
     * @type {String}
     * @private
     */
    EXDocument.prototype._temporaryTitle = null;

    /**
     * Returns the scene this document is working on
     * @returns {IFScene}
     */
    EXDocument.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Returns the blob this document is working on if any
     * @returns {IFBlob}
     */
    EXDocument.prototype.getBlob = function () {
        return this._blob;
    };

    /**
     * Assigns a blob this document is working on
     * @param {IFBlob} blob
     */
    EXDocument.prototype.setBlob = function (blob) {
        if (blob && blob !== this.blob) {
            this._blob = blob;

            // TODO : Trigger update event here
        }
    };

    /**
     * Return the underlying editor
     * @returns {IFSceneEditor}
     */
    EXDocument.prototype.getEditor = function () {
        return this._editor;
    };

    /**
     * Returns a list of all windows attached to this document
     * @return {Array<EXWindow>}
     */
    EXDocument.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Returns the currently active window of this document
     * @return {EXWindow}
     */
    EXDocument.prototype.getActiveWindow = function () {
        return this._activeWindow;
    };

    /**
     * Returns the title for the document
     * @return {String}
     */
    EXDocument.prototype.getTitle = function () {
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
    EXDocument.prototype.isSaveable = function () {
        return !!this._blob;
    };

    /**
     * Saves the document if it has an underlying blob
     */
    EXDocument.prototype.save = function () {
        // TODO : Reset undo list/set save point
        if (this._blob) {
            this._blob.store(IFNode.serialize(this._scene), false, 'binary', function () {
                // NO-OP
            });
        }
    };

    /**
     * Called before this document gets activated
     */
    EXDocument.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called before this document gets deactivated
     */
    EXDocument.prototype.deactivate = function () {
        // NO-OP
    };

    _.EXDocument = EXDocument;
})(this);
