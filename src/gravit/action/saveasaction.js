(function (_) {

    /**
     * Action saving a document filed under a name
     * @param {GStorage} storage
     * @param {Boolean} isDefault whether this is the default storage or not
     * @class EXSaveAsAction
     * @extends GUIAction
     * @constructor
     */
    function EXSaveAsAction(storage, isDefault) {
        this._storage = storage;
        this._default = isDefault;
    };
    GObject.inherit(EXSaveAsAction, GUIAction);

    EXSaveAsAction.ID = 'file.save-as';
    EXSaveAsAction.TITLE = new GLocale.Key(EXSaveAsAction, "title");

    /**
     * @override
     */
    EXSaveAsAction.prototype.getId = function () {
        return EXSaveAsAction.ID + '.' + this._storage.getProtocol();
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.getTitle = function () {
        return gLocale.get(EXSaveAsAction.TITLE).replace('%name%', gLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE_SAVEAS;
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.getGroup = function () {
        return "file/saveas_storage";
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.getShortcut = function () {
        return this._default ? [GUIKey.Constant.SHIFT, GUIKey.Constant.META, 'S'] : null;
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    EXSaveAsAction.prototype.execute = function () {
        var document = gApp.isEnabled();

        // TODO : Set first parameter 'reference'
        this._storage.saveBlobPrompt(null, document.getTitle(), 'gxd', function (blob) {
            document.setBlob(blob);
            document.save();
        });
    };

    /** @override */
    EXSaveAsAction.prototype.toString = function () {
        return "[Object EXSaveAsAction]";
    };

    _.EXSaveAsAction = EXSaveAsAction;
})(this);