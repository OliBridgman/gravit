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
    EXOpenAction.TITLE_DEFAULT = new GLocale.Key(EXOpenAction, "title-default");

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
        return this._default ?
            gLocale.get(EXOpenAction.TITLE_DEFAULT) :
        gLocale.get(EXOpenAction.TITLE).replace('%name%', gLocale.get(this._storage.getName()));
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getCategory = function () {
        return this._default ? EXApplication.CATEGORY_FILE : EXApplication.CATEGORY_FILE_OPEN;
    };

    /**
     * @override
     */
    EXOpenAction.prototype.getGroup = function () {
        return this._default ? "file" : "file/open_storage";
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
        this._storage.openBlobPrompt(null, ['gravit'], function (blob) {
            gApp.addDocument(blob);
        });
    };

    /** @override */
    EXOpenAction.prototype.toString = function () {
        return "[Object EXOpenAction]";
    };

    _.EXOpenAction = EXOpenAction;
})(this);