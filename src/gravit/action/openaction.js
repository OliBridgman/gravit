(function (_) {

    /**
     * Action opening a document on a specific storage
     * @param {GStorage} storage
     * @param {Boolean} isDefault whether this is the default storage or not
     * @class EXOpenAction
     * @extends GUIAction
     * @constructor
     */
    function EXOpenAction(storage, isDefault) {
        this._storage = storage;
        this._default = isDefault;
    };
    GObject.inherit(EXOpenAction, GUIAction);

    EXOpenAction.ID = 'file.open';
    EXOpenAction.TITLE = new GLocale.Key(EXOpenAction, "title");

    /**
     * @override
     */
    EXOpenAction.prototype.getId = function () {
        return EXOpenAction.ID + '.' + this._storage.getProtocol();
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getTitle = function () {
        return gLocale.get(EXOpenAction.TITLE).replace('%name%', gLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_FILE_OPEN;
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getGroup = function () {
        return "file/open_storage";
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getShortcut = function () {
        return this._default ? [GUIKey.Constant.META, 'O'] : null;
    };

    /**
     * @override
     */
    EXOpenAction.prototype.execute = function () {
        // TODO : Set first parameter 'reference'
        this._storage.openBlobPrompt(null, ['gxd'], function (blob) {
            gApp.addDocument(blob);
        });
    };

    /** @override */
    EXOpenAction.prototype.toString = function () {
        return "[Object EXOpenAction]";
    };

    _.EXOpenAction = EXOpenAction;
})(this);